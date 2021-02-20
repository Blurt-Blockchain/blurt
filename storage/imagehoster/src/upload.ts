/** Uploads file to blob store. */

import * as Busboy from 'busboy'
import * as config from 'config'
import {createHash} from 'crypto'
import {Client, Signature} from '@hiveio/dhive'
import * as http from 'http'
import * as multihash from 'multihashes'
import * as RateLimiter from 'ratelimiter'
import {URL} from 'url'
import * as hivesigner from 'hivesigner'

import {accountBlacklist} from './blacklist'
import {KoaContext, redisClient, rpcClient, uploadStore} from './common'
import {APIError} from './error'
import {readStream, storeExists, storeWrite} from './utils'

const SERVICE_URL = new URL(config.get('service_url'))
const MAX_IMAGE_SIZE = Number.parseInt(config.get('max_image_size'))
if (!Number.isFinite(MAX_IMAGE_SIZE)) {
    throw new Error('Invalid max image size')
}
const UPLOAD_LIMITS = config.get('upload_limits') as any

if (new URL('http://blä.se').toString() !== 'http://xn--bl-wia.se/') {
    throw new Error('Incompatible node.js version, must be compiled with ICU support')
}

/**
 * Parse multi-part request and return first file found.
 */
async function parseMultipart(request: http.IncomingMessage) {
    return new Promise<{stream: NodeJS.ReadableStream, mime: string, name: string}>((resolve, reject) => {
        const form = new Busboy({
            headers: request.headers,
            limits: {
                files: 1,
                fileSize: MAX_IMAGE_SIZE,
            }
        })
        form.on('file', (field, stream, name, encoding, mime) => {
            resolve({stream, mime, name})
        })
        form.on('error', reject)
        form.on('finish', () => {
            reject(new APIError({code: APIError.Code.FileMissing}))
        })
        request.pipe(form)
    })
}

interface RateLimit {
    remaining: number
    reset: number
    total: number
}

/**
 * Get ratelimit info for account name.
 */
async function getRatelimit(account: string) {
    return new Promise<RateLimit>((resolve, reject) => {
        if (!redisClient) {
            throw new Error('Redis not configured')
        }
        const limit = new RateLimiter({
            db: redisClient,
            duration: UPLOAD_LIMITS.duration,
            id: account,
            max: UPLOAD_LIMITS.max,
        })
        limit.get((error, result) => {
            if (error) {
                reject(error)
            } else {
                resolve(result)
            }
        })
    })
}
const b64uLookup = {
    '/': '_', _: '/', '+': '-', '-': '+', '=': '.', '.': '=',
}
function b64uToB64 (str: string) {
    const tt = str.replace(/(-|_|\.)/g, function(m) { return b64uLookup[m]})
    return tt
}
export async function uploadHsHandler(ctx: KoaContext) {
    ctx.tag({handler: 'hsupload'})
    let validSignature = false

    APIError.assert(ctx.method === 'POST', {code: APIError.Code.InvalidMethod})
    APIError.assertParams(ctx.params, ['accesstoken'])
    APIError.assert(ctx.get('content-type').includes('multipart/form-data'),
                    {message: 'Only multipart uploads are supported'})
    const contentLength = Number.parseInt(ctx.get('content-length'))

    APIError.assert(Number.isFinite(contentLength),
                    APIError.Code.LengthRequired)

    APIError.assert(contentLength <= MAX_IMAGE_SIZE,
                    APIError.Code.PayloadTooLarge)

    const file = await parseMultipart(ctx.req)
    const data = await readStream(file.stream)

    // extra check if client manges to lie about the content-length
    APIError.assert((file.stream as any).truncated !== true,
                    APIError.Code.PayloadTooLarge)

    const imageHash = createHash('sha256')
        .update('ImageSigningChallenge')
        .update(data)
        .digest()
            
    const token = ctx.params['accesstoken']
    const decoded = Buffer.from(b64uToB64(token), 'base64').toString()
    const tokenObj = JSON.parse(decoded)
    const signedMessage = tokenObj.signed_message
    if (
        tokenObj.authors
        && tokenObj.authors[0]
        && tokenObj.signatures
        && tokenObj.signatures[0]
        && signedMessage
        && signedMessage.type
        && ['login', 'posting', 'offline', 'code', 'refresh']
        .includes(signedMessage.type)
        && signedMessage.app
    ) {

        const username = tokenObj.authors[0]

        let account = {
            name: '',
            reputation: 0,
        }
        const cl = new hivesigner.Client({
            app: UPLOAD_LIMITS.app_account,
            accessToken: token,
        })

        await cl.me(function (err: any, res: any) {
            if (!err && res) {
                account = res.account
                APIError.assert(account, APIError.Code.NoSuchAccount)

                ctx.log.warn('uploading app %s', signedMessage.app)
                APIError.assert(username === account.name, APIError.Code.InvalidSignature)
                APIError.assert(signedMessage.app === UPLOAD_LIMITS.app_account, APIError.Code.InvalidSignature)
                APIError.assert(res.scope.includes('comment'), APIError.Code.InvalidSignature)

                if (account && account.name) {
                    ['posting', 'active', 'owner'].forEach((type) => {
                      account[type].account_auths.forEach((key: string[]) => {
                        if (
                          !validSignature
                          && key[0] === UPLOAD_LIMITS.app_account
                        ) {
                          validSignature = true;
                        }
                      });
                    });
                }
            }
        });

        APIError.assert(validSignature, APIError.Code.InvalidSignature)
        APIError.assert(!accountBlacklist.includes(account.name), APIError.Code.Blacklisted)

        let limit: RateLimit = {total: 0, remaining: Infinity, reset: 0}
        try {
            limit = await getRatelimit(account.name)
        } catch (error) {
            ctx.log.warn(error, 'unable to enforce upload rate limits')
        }

        APIError.assert(limit.remaining > 0, APIError.Code.QoutaExceeded)

        APIError.assert(repLog10(account.reputation) >= UPLOAD_LIMITS.reputation, APIError.Code.Deplorable)

        const key = 'D' + multihash.toB58String(multihash.encode(imageHash, 'sha2-256'))
        const url = new URL(`${ key }/${ file.name }`, SERVICE_URL)

        if (!(await storeExists(uploadStore, key))) {
            await storeWrite(uploadStore, key, data)
        } else {
            ctx.log.debug('key %s already exists in store', key)
        }

        ctx.log.info({uploader: account.name, size: data.byteLength}, 'image uploaded')

        ctx.status = 200
        ctx.body = {url}
    }
}
export async function uploadHandler(ctx: KoaContext) {
    ctx.tag({handler: 'upload'})

    APIError.assert(ctx.method === 'POST', {code: APIError.Code.InvalidMethod})
    APIError.assertParams(ctx.params, ['username', 'signature'])

    let signature: Signature
    try {
        signature = Signature.fromString(ctx.params['signature'])
    } catch (cause) {
        throw new APIError({code: APIError.Code.InvalidSignature, cause})
    }

    APIError.assert(ctx.get('content-type').includes('multipart/form-data'),
                    {message: 'Only multipart uploads are supported'})

    const contentLength = Number.parseInt(ctx.get('content-length'))

    APIError.assert(Number.isFinite(contentLength),
                    APIError.Code.LengthRequired)

    APIError.assert(contentLength <= MAX_IMAGE_SIZE,
                    APIError.Code.PayloadTooLarge)

    const file = await parseMultipart(ctx.req)
    const data = await readStream(file.stream)

    // extra check if client manges to lie about the content-length
    APIError.assert((file.stream as any).truncated !== true,
                    APIError.Code.PayloadTooLarge)

    const imageHash = createHash('sha256')
        .update('ImageSigningChallenge')
        .update(data)
        .digest()

    const [account] = await rpcClient.database.getAccounts([ctx.params['username']])
    APIError.assert(account, APIError.Code.NoSuchAccount)

    let validSignature = false
    let publicKey
    try {
         publicKey = signature.recover(imageHash).toString().replace(/^.{3}/g,'BLT')
    } catch (cause) {
        throw new APIError({code: APIError.Code.InvalidSignature, cause})
    }

    const thresholdPosting = account.posting.weight_threshold
    for (const auth of account.posting.key_auths) {
        if (auth[0] === publicKey && auth[1] >= thresholdPosting) {
            validSignature = true
            break
        }
    }

    const thresholdActive = account.active.weight_threshold
    for (const auth of account.active.key_auths) {
        if (auth[0] === publicKey && auth[1] >= thresholdActive) {
            validSignature = true
            break
        }
    }

    APIError.assert(validSignature, APIError.Code.InvalidSignature)
    APIError.assert(!accountBlacklist.includes(account.name), APIError.Code.Blacklisted)

    let limit: RateLimit = {total: 0, remaining: Infinity, reset: 0}
    try {
        limit = await getRatelimit(account.name)
    } catch (error) {
        ctx.log.warn(error, 'unable to enforce upload rate limits')
    }

    APIError.assert(limit.remaining > 0, APIError.Code.QoutaExceeded)

    // APIError.assert(repLog10(account.reputation) >= UPLOAD_LIMITS.reputation, APIError.Code.Deplorable)

    const key = 'D' + multihash.toB58String(multihash.encode(imageHash, 'sha2-256'))
    const url = new URL(`${ key }/${ file.name }`, SERVICE_URL)

    if (!(await storeExists(uploadStore, key))) {
        await storeWrite(uploadStore, key, data)
    } else {
        ctx.log.debug('key %s already exists in store', key)
    }

    ctx.log.info({uploader: account.name, size: data.byteLength}, 'image uploaded')

    ctx.status = 200
    ctx.body = {url}
}

/**
 * Calculate reputation for user, from old codebase.
 * HERE BE DRAGONS
 */
function repLog10(rep2: any) {
    if (rep2 == null) { return rep2 } // tslint:disable-line:triple-equals
    let rep = String(rep2)
    const neg = rep.charAt(0) === '-'
    rep = neg ? rep.substring(1) : rep

    let out = log10(rep)
    if (isNaN(out)) { out = 0 }
    out = Math.max(out - 9, 0) // @ -9, $0.50 earned is approx magnitude 1
    out = (neg ? -1 : 1) * out
    out = (out * 9) + 25 // 9 points per magnitude. center at 25
    // base-line 0 to darken and < 0 to auto hide (grep rephide)
    out = parseInt(out + '') // tslint:disable-line:radix
    return out
}

/**
 * This is a rough approximation of log10 that works with huge digit-strings.
 * Warning: Math.log10(0) === NaN
 */
function log10(str: string) {
    const leadingDigits = parseInt(str.substring(0, 4)) // tslint:disable-line:radix
    const log = Math.log(leadingDigits) / Math.log(10)
    const n = str.length - 1
    return n + (log - parseInt(log + '')) // tslint:disable-line:radix
}
