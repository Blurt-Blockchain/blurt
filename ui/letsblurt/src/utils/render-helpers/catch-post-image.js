import proxifyImageSrc from './proxify-image-src';
import markdown2html from './markdown-2-html';
import {createDoc, makeEntryCacheKey} from './helper';
import {cacheGet, cacheSet} from './cache';

const image = (entry, width = 0, height = 0, format = 'match') => {
  // return from json metadata if exists
  let meta;

  if (typeof entry.json_metadata === 'object') {
    meta = entry.json_metadata;
  } else {
    try {
      meta = JSON.parse(entry.json_metadata);
    } catch (e) {
      meta = null;
    }
  }

  if (meta && meta.image && meta.image.length > 0) {
    if (meta.image[0]) {
      return proxifyImageSrc(meta.image[0], width, height, format);
    }
  }

  // try to find first image from post body
  const html = markdown2html(entry);
  const doc = createDoc(html);
  if (!doc) {
    return null;
  }

  const imgEls = doc.getElementsByTagName('img');
  if (imgEls.length >= 1) {
    const src = imgEls[0].getAttribute('src');
    return proxifyImageSrc(src, width, height, format);
  }

  return null;
};

export default (obj, width = 0, height = 0, format = 'match') => {
  if (typeof obj === 'string') {
    return image(obj, width, height, format);
  }
  const key = `${makeEntryCacheKey(obj)}-${width}x${height}-${format}`;

  const item = cacheGet(key);
  if (item) {
    return item;
  }

  const res = image(obj, width, height, format);
  cacheSet(key, res);

  return res;
};
