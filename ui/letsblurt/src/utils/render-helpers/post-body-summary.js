import he from 'he';
import {makeEntryCacheKey} from './helper';
import {cacheGet, cacheSet} from './cache';
import {sliceByByte} from '~/utils/strings';
import Remarkable from 'remarkable';
const md = new Remarkable({html: true, breaks: true, linkify: false});

// import {Remarkable} from 'remarkable';
// import {linkify} from 'remarkable/linkify';
// const md = new Remarkable('full', {
//   html: true,
//   breaks: true,
// });
// md.use(linkify);

const postBodySummary = (entryBody, length) => {
  if (!entryBody) {
    return '';
  }

  // Convert markdown to html
  let text = md.render(entryBody);

  text = text
    .replace(/(<([^>]+)>)/gi, '') // Remove html tags
    .replace(/\r?\n|\r/g, ' ') // Remove new lines
    .replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') // Remove urls
    .trim()
    .replace(/ +(?= )/g, ''); // Remove all multiple spaces

  if (length) {
    // Truncate
    //text = text.substring(0, length);
    // this still causes json parse error:
    // expected another unicode escape ofr second half of surrogate pair
    text = sliceByByte(text, length);
  }

  text = he.decode(text); // decode html entities

  return text;
};

export default (obj, length) => {
  if (typeof obj === 'string') {
    return postBodySummary(obj, length);
  }

  const key = `${makeEntryCacheKey(obj)}-sum-${length}`;

  const item = cacheGet(key);
  if (item) {
    return item;
  }

  const res = postBodySummary(obj.body, length);
  cacheSet(key, res);

  return res;
};
