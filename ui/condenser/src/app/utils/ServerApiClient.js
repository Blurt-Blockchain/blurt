import { api } from '@blurtfoundation/blurtjs'

const request_base = {
  method: 'post',
  mode: 'no-cors',
  credentials: 'same-origin',
  headers: {
    Accept: 'application/json',
    'Content-type': 'application/json'
  }
}

export function serverApiLogin (account, signatures) {
  if (!process.env.BROWSER || window.$STM_ServerBusy) return
  const request = Object.assign({}, request_base, {
    body: JSON.stringify({ account, signatures, csrf: $STM_csrf })
  })
  return fetch('/api/v1/login_account', request)
}

export function serverApiLogout () {
  if (!process.env.BROWSER || window.$STM_ServerBusy) return
  const request = Object.assign({}, request_base, {
    body: JSON.stringify({ csrf: $STM_csrf })
  })
  return fetch('/api/v1/logout_account', request)
}

let last_call
export function serverApiRecordEvent (type, val, rate_limit_ms = 5000) {
  if (!process.env.BROWSER || window.$STM_ServerBusy) return
  if (last_call && new Date() - last_call < rate_limit_ms) return
  last_call = new Date()
  const value = val && val.stack ? `${val.toString()} | ${val.stack}` : val
  // api.call(
  //     'overseer.collect',
  //     { collection: 'event', metadata: { type, value } },
  //     error => {
  //         // if (error) console.warn('overseer error', error, error.data);
  //     }
  // );
}

export function saveCords (x, y) {
  const request = Object.assign({}, request_base, {
    body: JSON.stringify({ csrf: $STM_csrf, x: x, y: y })
  })
  fetch('/api/v1/save_cords', request)
}

export function setUserPreferences (payload) {
  if (!process.env.BROWSER || window.$STM_ServerBusy) {
    return Promise.resolve()
  }
  const request = Object.assign({}, request_base, {
    body: JSON.stringify({ csrf: window.$STM_csrf, payload })
  })
  return fetch('/api/v1/setUserPreferences', request)
}

export function isTosAccepted () {
  const request = Object.assign({}, request_base, {
    body: JSON.stringify({ csrf: window.$STM_csrf })
  })
  return fetch('/api/v1/isTosAccepted', request).then((res) => res.json())
}

export function acceptTos () {
  const request = Object.assign({}, request_base, {
    body: JSON.stringify({ csrf: window.$STM_csrf })
  })
  return fetch('/api/v1/acceptTos', request)
}

// No more counter, it cannot be decentralized, so it should not exist.
// export function recordPageView(page) {
//    if (!process.env.BROWSER || window.$STM_ServerBusy)
//        return Promise.resolve(null);
//    const request = Object.assign({}, request_base, {
//        body: JSON.stringify({ csrf: $STM_csrf, page })
//    });
//    console.log('-- recordPageView -->', request);
//    return fetch(`https://blurturl.herokuapp.com/api/v1/countview/` + page, {
//        method: 'POST',
//        headers: {
//            'Content-Type': 'application/json'
//        },
//        body: JSON.stringify({ url: page })
//    })
//        .then(r => r.json())
//        .then(res => {
//            return res.url;
//        });
// }
