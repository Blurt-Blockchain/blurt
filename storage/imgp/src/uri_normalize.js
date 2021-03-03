const config = require('config.json')('./config.json')
// const { URL } = require('url');
const normalizeUrl = require('normalize-url')

const BASE_URL = config.base_url

export const normalize = (uri_str) => {
  let result_url = uri_str
  const opts = {
    stripWWW: false
  }

  try {
    if (uri_str.length > 256) {
      throw new Error('invalid url')
    }

    const idx_of_http = uri_str.lastIndexOf('http://')
    const idx_of_https = uri_str.lastIndexOf('https://')

    const idx = Math.max(idx_of_http, idx_of_https)
    if (idx === -1) {
      throw new Error('invalid url')
    }
    const uri = uri_str.slice(idx)

    result_url = normalizeUrl(uri, opts)

    if (result_url.startsWith(BASE_URL)) {
      throw new Error('invalid url')
    }
  } catch (e) {
    result_url = null
  }

  // console.log(`before: ${uri_str}`);
  // console.log(`after : ${result_url}`);

  return result_url
}

const test_normalize = () => {
  normalize('https://www.x/y/http://a.com/b/d//e/g?b=1&a=2')
  normalize('http://a.com/https://base.com/imageproxy/b/d//e/g?b=1&a=2')
}

// test_normalize();

// export default normalize;
