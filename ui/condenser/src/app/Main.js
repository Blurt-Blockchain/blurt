import 'babel-core/register'
import 'babel-polyfill'
import 'whatwg-fetch'
import store from 'store'
import { VIEW_MODE_WHISTLE, PARAM_VIEW_MODE } from 'shared/constants'
import './assets/stylesheets/app.scss'
import plugins from 'app/utils/JsPlugins'
import Iso from 'iso'
import { clientRender } from 'shared/UniversalRender'
import ConsoleExports from './utils/ConsoleExports'
import { serverApiRecordEvent } from 'app/utils/ServerApiClient'
import * as blurtjs from '@blurtfoundation/blurtjs'
import { determineViewMode } from 'app/utils/Links'
import frontendLogger from 'app/utils/FrontendLogger'
import ReactGA from 'react-ga'
import 'https://cdn.jsdelivr.net/npm/ipfs/dist/index.min.js'

window.addEventListener('error', frontendLogger)

const CMD_LOG_T = 'log-t'
const CMD_LOG_TOGGLE = 'log-toggle'
const CMD_LOG_O = 'log-on'

try {
  if (process.env.NODE_ENV === 'development') {
    // Adds some object refs to the global window object
    ConsoleExports.init(window)
  }
} catch (e) {
  console.error(e)
}

// IPFS STUFF HERE
// this bundle maybe non ES-module, but it can import to load as `window.Ipfs`
// Chat example on js-libp2p in js-ipfs (>= 0.41)
// import "https://cdn.jsdelivr.net/npm/ipfs@0.44.0/dist/index.min.js";
console.log(window.Ipfs)

// util1: duplex-stream source from ES iterator
const iterableSource = async function * (iter) {
  return yield * iter
}

const promisify = (func) =>
  function (...args) {
    return new Promise((f, e) =>
      func.call(this, ...args, (err, value) => (err ? e(err) : f(value)))
    )
  }

const main = async () => {
  const node = (window.node = await Ipfs.create({
    repo: `ipfs-${Math.random()}`,
    relay: { enabled: true, hop: { enabled: true, active: true } }
  }))
  await node.ready

  console.log('IPFS version:', (await node.version()).version)
  console.log('Peer ID:', (await node.id()).id)

  const myid = node.libp2p.peerInfo.id.toB58String()
  console.log('libp2p ID:', myid)

  // receive
  const protocolId = 'chat-example-proto'
  node.libp2p.handle(protocolId, async ({ connection, stream, protocol }) => {
    // Connection: https://github.com/libp2p/js-libp2p-interfaces/tree/master/src/connection
    console.log(connection)
    const id = connection.remotePeer.toB58String() // PeerId instance
    // console.log(id);
    console.log(connection.remoteAddr.toString()) // Multiaddr as "/p2p/Qm..."

    // duplex-stream: https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9#duplex-it
    // console.log(stream);
    const msg = []
    for await (const bl of stream.source) {
      // bl: BufferList; see https://github.com/rvagg/bl
      // console.log(bl);
      // console.log(bl.slice()); // as Uint8Array
      msg.push(new TextDecoder().decode(bl.slice()))
    }
    document.querySelector('#log').prepend(`${id}: ${''.concat(msg)}\n`)
  })

  // Make it an arrray
  const validIp1 = new Multiaddr(
    '/ip4/95.217.193.163/tcp/4001/12D3KooWL9ckZMUHGfv9Uw1KQKRddKA4AC9zmyZv9aZsqUTCwsda'
  )
  const validIp2 = new Multiaddr(
    '/ip4/95.217.193.163/udp/4001/quic/12D3KooWL9ckZMUHGfv9Uw1KQKRddKA4AC9zmyZv9aZsqUTCwsda'
  )
  const validIp3 = new Multiaddr(
    '/ip6/2a01:4f9:4a:509c::2/tcp/4001/12D3KooWL9ckZMUHGfv9Uw1KQKRddKA4AC9zmyZv9aZsqUTCwsda'
  )
  const validIp4 = new Multiaddr(
    '/ip6/2a01:4f9:4a:509c::2/udp/4001/quic/12D3KooWL9ckZMUHGfv9Uw1KQKRddKA4AC9zmyZv9aZsqUTCwsda'
  )

  ipfs.bootstrap.add(validIp1)
  ipfs.bootstrap.add(validIp2)
  ipfs.bootstrap.add(validIp3)
  ipfs.bootstrap.add(validIp4)

  // from js-ipfs-0.41.0, swarm.connect() to p2pid with explicit relay required
  const connect = async (node, id) => {
    // swarm connect with relay
    const addrs = new Set((await node.swarm.addrs()).map(({ id }) => id))
    // console.log(addrs);
    if (addrs.has(id)) return

    let relaid = false
    for (const relay of addrs) {
      const relayid = `/p2p/${relay}/p2p-circuit/p2p/${id}`
      console.log('relayid', relayid)
      try {
        await node.swarm.connect(relayid)
        relaid = true
        break
      } catch (error) {
        // console.log(error);
      }
    }
    if (!relaid) throw Error(`could not relay to ${id}`)
  }

  // send
  document.querySelector('#send').addEventListener('click', (ev) => {
    (async () => {
      const id = document.querySelector('#to').value
      const msg = document.querySelector('#msg').value
      const p2pid = `/p2p/${id}`
      console.log('p2pid', p2pid)

      await connect(node, id)

      // p2pid can avaialbe after dialed from the id
      const { stream, protocol } = await node.libp2p.dialProtocol(
        p2pid,
        protocolId
      )
      stream.sink(iterableSource([new TextEncoder().encode(msg)]))
      console.log(`dialed to ${p2pid}`)

      document.querySelector('#msg').value = ''
      document.querySelector('#log').prepend(`${myid}: ${msg}\n`)
    })().catch(console.error)
  })

  document.querySelector('#myid').textContent = myid
}

main().catch(console.error)

ReactGA.initialize('UA-179023138-1', {
  titleCase: false,
  gaOptions: {
    siteSpeedSampleRate: 100
  }
})
ReactGA.pageview(window.location.pathname + window.location.search)

function runApp (initial_state) {
  console.log('Initial state', initial_state)

  const konami = {
    code: 'xyzzy',
    enabled: false
  }
  const buff = konami.code.split('')
  const cmd = (command) => {
    console.log('got command:' + command)
    switch (command) {
      case CMD_LOG_O:
        konami.enabled = false
      case CMD_LOG_TOGGLE:
      case CMD_LOG_T:
        konami.enabled = !konami.enabled
        if (konami.enabled) {
          blurtjs.api.setOptions({ logger: console })
        } else {
          blurtjs.api.setOptions({ logger: false })
        }
        return 'api logging ' + konami.enabled
      default:
        return 'That command is not supported.'
    }
    // return 'done';
  }

  const enableKonami = () => {
    if (!window.s) {
      console.log('The cupie doll is yours.')
      window.s = (command) => {
        return cmd.call(this, command)
      }
    }
  }

  window.document.body.onkeypress = (e) => {
    buff.shift()
    buff.push(e.key)
    if (buff.join('') === konami.code) {
      enableKonami()
      cmd(CMD_LOG_T)
    }
  }

  if (window.location.hash.indexOf('#' + konami.code) === 0) {
    enableKonami()
    cmd(CMD_LOG_O)
  }

  const config = initial_state.offchain.config
  const alternativeApiEndpoints = config.alternative_api_endpoints

  const currentApiEndpoint =
        localStorage.getItem('user_preferred_api_endpoint') === null
          ? config.blurtd_connection_client
          : localStorage.getItem('user_preferred_api_endpoint')
  blurtjs.api.setOptions({
    url: currentApiEndpoint,
    retry: true,
    useAppbaseApi: !!config.blurtd_use_appbase,
    alternative_api_endpoints: alternativeApiEndpoints,
    failover_threshold: config.failover_threshold
  })
  blurtjs.config.set('address_prefix', config.address_prefix)
  blurtjs.config.set('chain_id', config.chain_id)
  window.$STM_Config = config
  plugins(config)
  if (initial_state.offchain.serverBusy) {
    window.$STM_ServerBusy = true
  }
  if (initial_state.offchain.csrf) {
    window.$STM_csrf = initial_state.offchain.csrf
    delete initial_state.offchain.csrf
  }

  initial_state.app.viewMode = determineViewMode(window.location.search)

  const locale = store.get('language')
  if (locale) initial_state.user.locale = locale
  initial_state.user.maybeLoggedIn = !!store.get('autopost2')
  if (initial_state.user.maybeLoggedIn) {
    const username = new Buffer(store.get('autopost2'), 'hex')
      .toString()
      .split('\t')[0]
    initial_state.user.current = {
      username
    }
  }

  const location = `${window.location.pathname}${window.location.search}${window.location.hash}`

  try {
    clientRender(initial_state)
  } catch (error) {
    console.error(error)
    serverApiRecordEvent('client_error', error)
  }
}

if (!window.Intl) {
  require.ensure(
    ['intl/dist/Intl'],
    (require) => {
      window.IntlPolyfill = window.Intl = require('intl/dist/Intl')
      require('intl/locale-data/jsonp/en-US.js')
      require('intl/locale-data/jsonp/es.js')
      require('intl/locale-data/jsonp/ru.js')
      require('intl/locale-data/jsonp/fr.js')
      require('intl/locale-data/jsonp/it.js')
      require('intl/locale-data/jsonp/ko.js')
      require('intl/locale-data/jsonp/ja.js')
      Iso.bootstrap(runApp)
    },
    'IntlBundle'
  )
} else {
  Iso.bootstrap(runApp)
}
