const config = require('config.json')('./config.json')
const needle = require('needle')

export const getJsonRpcUri = async (api, method, params) => {
  const jsonrpc = {
    jsonrpc: '2.0',
    method: `${api}.${method}`,
    params: params,
    id: 1
  }
  const api_res = await needle('post', config.rpc_url, jsonrpc, { json: true })
  const { body } = api_res
  return body.result
}

export const request_remote_image = (url) => {
  console.log(`url: ${url}`)

  const options = {
    open_timeout: 15 * 1000,
    response_timeout: 45 * 1000,
    read_timeout: 60 * 1000,
    compressed: true,
    parse_response: false
    // follow_max: 5,
  }

  return new Promise((resolve, reject) => {
    needle.get(url, options, (error, response) => {
      if (error) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}

export const accepted_content_types = [
  'image/gif',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]
