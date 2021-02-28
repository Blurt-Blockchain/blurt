import multihash from 'multihashes';
import querystring from 'querystring';
import {BLURT_IMAGE_SERVERS} from '~/constants';

let proxyBase = BLURT_IMAGE_SERVERS[0];

export const setProxyBase = (p) => {
  proxyBase = p;
};

export const extractPHash = (url) => {
  if (url.startsWith(`${proxyBase}/p/`)) {
    const [hash] = url.split('/p/')[1].split('?');
    return hash;
  }
  return null;
};

export const getLatestUrl = (str) => {
  const [last] = [
    ...str
      .replace(/https?:\/\//g, '\n$&')
      .trim()
      .split('\n'),
  ].reverse();
  return last;
};

export default (url, width = 0, height = 0, format = 'match') => {
  if (!url) {
    return '';
  }

  // skip images already proxified with images.hive.blog
  if (url.indexOf('https://images.hive.blog/') === 0) {
    if (url.indexOf('https://images.hive.blog/D') !== 0) {
      return url.replace('https://images.hive.blog', proxyBase);
    }
  }

  const realUrl = getLatestUrl(url);
  const pHash = extractPHash(realUrl);

  const options = {
    format,
    mode: 'fit',
  };

  if (width > 0) {
    options.width = width;
  }

  if (height > 0) {
    options.height = height;
  }

  const qs = querystring.stringify(options);

  if (pHash) {
    return `${proxyBase}/p/${pHash}?${qs}`;
  }

  const b58url = multihash.toB58String(Buffer.from(realUrl.toString()));

  return `${proxyBase}/p/${b58url}?${qs}`;
};
