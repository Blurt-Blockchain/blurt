import xmldom from 'xmldom';

export const createDoc = (html) => {
  if (html.trim() === '') {
    return null;
  }

  const noop = () => {};

  const parser = new xmldom.DOMParser({
    errorHandler: {warning: noop, error: noop},
  });

  const doc = parser.parseFromString(html, 'text/html');

  return doc;
};

export const domSerializer = () => new xmldom.XMLSerializer();

export const makeEntryCacheKey = (entry) =>
  `${entry.author}-${entry.permlink}-${entry.last_update}`;

export const whiteList = [
  'blurt.world',
  'ecency.com',
  'hive.blog',
  'peakd.com',
  'busy.org',
  'steemit.com',
  'esteem.app',
  'steempeak.com',
  'partiko.app',
  'chainbb.com',
  'utopian.io',
  'steemkr.com',
  'strimi.pl',
  'steemhunt.com',
  'travelfeed.io',
  'ulogs.org',
  'hede.io',
  'weedcash.network',
];
