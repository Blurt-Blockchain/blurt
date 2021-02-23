import xmldom from 'xmldom';

// import sanitize from 'sanitize-html';

import proxifyImageSrc from './proxify-image-src';

import {makeEntryCacheKey, whiteList} from './helper';

import {cacheGet, cacheSet} from './cache';

const xss = require('xss');

const imgRegex = /(https?:\/\/.*\.(?:tiff?|jpe?g|gif|png|svg|ico))(.*)/gim;
const ipfsRegex = /^https?:\/\/[^/]+\/(ip[fn]s)\/([^/?#]+)/gim;
const postRegex = /^https?:\/\/(.*)\/(.*)\/(@[\w.\d-]+)\/(.*)/i;
const mentionRegex = /^https?:\/\/(.*)\/(@[\w.\d-]+)$/i;
const copiedPostRegex = /\/(.*)\/(@[\w.\d-]+)\/(.*)/i;
const youTubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^& \n<]+)(?:[^ \n<]+)?/g;
const vimeoRegex = /(https?:\/\/)?(www\.)?(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
const dTubeRegex = /(https?:\/\/d.tube.#!\/v\/)(\w+)\/(\w+)/g;
const twitchRegex = /https?:\/\/(?:www.)?twitch.tv\/(?:(videos)\/)?([a-zA-Z0-9][\w]{3,24})/i;
// eslint-disable-next-line no-useless-escape
const speakRegex = /(?:https?:\/\/(?:3speak.online\/watch\?v=)|(?:3speak.online\/embed\?v=))([A-Za-z0-9\_\-\/]+)(&.*)?/i;

const Remarkable = require('remarkable');
const md = new Remarkable({
  html: true,
  breaks: true,
  typographer: false,
  linkify: true,
});
//import {Remarkable} from 'remarkable';
//import {linkify} from 'remarkable/linkify';
//const md = new Remarkable('full', {
//  html: true,
//  breaks: true,
//});
//md.use(linkify);

const noop = () => {};

const DOMParser = new xmldom.DOMParser({
  errorHandler: {warning: noop, error: noop},
});

const XMLSerializer = new xmldom.XMLSerializer();

const innerHTML = (node) => {
  if (node.childNodes[0]) {
    return XMLSerializer.serializeToString(node.childNodes[0]);
  }

  return '';
};

const removeChildNodes = (node) => {
  [...Array(node.childNodes.length).keys()].forEach((x) => {
    node.removeChild(node.childNodes[x]);
  });
};

export const sanitizeHtml = (_html) => {
  /* const allowedTags = [
    'a',
    'strong',
    'b',
    'i',
    'em',
    'code',
    'pre',
    'blockquote',
    'sup',
    'sub',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'div',
    'p',
    'iframe',
    'center',
    'ul',
    'ol',
    'li',
    'table',
    'thead',
    'tbody',
    'tr',
    'td',
    'th',
    'hr',
    'br',
    'img',
    'del',
    'ins',
    'span'
  ]; */

  const allowedAttributes = {
    a: [
      'href',
      'target',
      'rel',
      'data-permlink',
      'data-tag',
      'data-author',
      'data-href',
      'data-embed-src',
      'data-video-href',
      'data-proposal',
      'class',
      'title',
    ],
    img: ['src', 'alt', 'class'],
    span: ['class'],
    iframe: [
      'src',
      'frameborder',
      'allowfullscreen',
      'webkitallowfullscreen',
      'mozallowfullscreen',
    ],
    div: ['class'],
    strong: [],
    b: [],
    i: [],
    strike: [],
    em: [],
    code: [],
    pre: [],
    blockquote: [],
    sup: [],
    sub: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    p: [],
    center: [],
    ul: [],
    ol: [],
    li: [],
    table: [],
    thead: [],
    tbody: [],
    tr: [],
    td: [],
    th: [],
    hr: [],
    br: [],
    del: [],
    ins: [],
  };

  /* const transformTags = {
    span: (tagName, attribs) => {
      if (attribs.class === 'wr') {
        return {tagName: '', attribs: {}};
      }

      return {tagName, attribs};
    },
    img: (tagName, attribs) => {
      if (attribs.src && !/^https?:\/\//.test(attribs.src)) {
        attribs.src = '';
      }

      return {tagName, attribs};
    },
    script: () => (
      {tagName: 'span', attribs: {}}
    ),
    '*': (tagName, attribs) => {
      // for compatibility
      Object.keys(attribs).forEach(e => {
        if (attribs[e].toLowerCase().indexOf(`${'java'}${'script:'}`) !== -1) {
          attribs[e] = '';
        }
      });
      return {tagName, attribs};
    }
  }; */
  const _options = {
    whiteList: allowedAttributes,
    stripIgnoreTag: false, // filter out all HTML not in the whitelist
    css: true,
    stripIgnoreTagBody: ['style'],
    onTagAttr: (tag, name, value) => {
      if (tag === 'span' && name === 'class' && value === 'wr') {
        return '';
      }
      if (tag === 'img' && name === 'src' && !/^https?:\/\//.test(value)) {
        return '';
      }
    },
  };
  return xss(_html, _options);
  // return sanitize(html, {allowedTags, allowedAttributes, transformTags});
};

const traverse = (node, forApp, depth = 0, webp = false) => {
  if (!node || !node.childNodes) return;

  const childNodes = [];

  [...Array(node.childNodes.length).keys()].forEach((i) => {
    childNodes.push(node.childNodes[i]);
  });

  childNodes.forEach((child) => {
    if (child.nodeName.toLowerCase() === 'a') a(child, forApp, webp);
    if (child.nodeName.toLowerCase() === 'iframe') iframe(child);
    if (child.nodeName === '#text') text(child, forApp, webp);
    if (child.nodeName.toLowerCase() === 'img') img(child, webp);

    traverse(child, forApp, depth + 1, webp);
  });
};

const a = (el, forApp, webp) => {
  let href = el.getAttribute('href');

  // Continue if href has no value
  if (!href) {
    return;
  }

  const className = el.getAttribute('class');

  // Don't touch user and hashtag links
  if (['markdown-author-link', 'markdown-tag-link'].indexOf(className) !== -1) {
    return;
  }

  // Do not allow js hrefs
  if (href.startsWith('javascript')) {
    el.removeAttribute('href');
    return;
  }

  // if href is an image url and innerHTML same with href then mark it as image
  // & => &amp; can break equality
  if (
    href.match(imgRegex) &&
    href.trim().replace(/&amp;/g, '&') ===
      innerHTML(el).trim().replace(/&amp;/g, '&')
  ) {
    if (forApp) {
      el.setAttribute('data-href', href);
      el.removeAttribute('href');
    }

    el.setAttribute('class', 'markdown-img-link');

    removeChildNodes(el);

    const img = el.ownerDocument.createElement('img');
    img.setAttribute('src', href);
    el.appendChild(img);

    return;
  }

  if (
    href.match(ipfsRegex) &&
    href.trim().replace(/&amp;/g, '&') ===
      innerHTML(el).trim().replace(/&amp;/g, '&')
  ) {
    if (forApp) {
      el.setAttribute('data-href', href);
      el.removeAttribute('href');
    }

    el.setAttribute('class', 'markdown-img-link');

    removeChildNodes(el);

    const img = el.ownerDocument.createElement('img');
    img.setAttribute('src', href);
    el.appendChild(img);

    return;
  }

  // TODO: handle blurt post inside the app
  // If a hive post
  // const postMatch = href.match(postRegex);
  // if (postMatch && whiteList.includes(postMatch[1])) {
  //   el.setAttribute('class', 'markdown-post-link');

  //   const tag = postMatch[2];
  //   const author = postMatch[3].replace('@', '');
  //   const permlink = postMatch[4];
  //   if (el.textContent === href) {
  //     el.textContent = `@${author}/${permlink}`;
  //   }
  //   if (forApp) {
  //     el.removeAttribute('href');

  //     el.setAttribute('data-tag', tag);
  //     el.setAttribute('data-author', author);
  //     el.setAttribute('data-permlink', permlink);
  //   } else {
  //     const h = `/${tag}/@${author}/${permlink}`;
  //     el.setAttribute('href', h);
  //   }
  //   return;
  // }

  // If a steem user with url
  const mentionMatch = href.match(mentionRegex);
  if (
    mentionMatch &&
    whiteList.includes(mentionMatch[1]) &&
    mentionMatch.length === 3
  ) {
    el.setAttribute('class', 'markdown-author-link');
    const author = mentionMatch[2].replace('@', '').toLowerCase();
    if (el.textContent === href) {
      el.textContent = `@${author}`;
    }
    if (forApp) {
      el.removeAttribute('href');

      el.setAttribute('data-author', author);
    } else {
      const h = `/@${author}`;
      el.setAttribute('href', h);
    }
    return;
  }

  // If a copied post link
  const cpostMatch = href.match(copiedPostRegex);
  if (
    (cpostMatch && whiteList.includes(cpostMatch[1].substring(1))) ||
    (cpostMatch && cpostMatch.length === 4 && cpostMatch[1].indexOf('/') !== 0)
  ) {
    el.setAttribute('class', 'markdown-post-link');

    let tag = 'post';
    if (!whiteList.includes(cpostMatch[1].substring(1))) {
      [, tag] = cpostMatch;
    }

    const author = cpostMatch[2].replace('@', '');
    const permlink = cpostMatch[3];
    if (el.textContent === href) {
      el.textContent = `@${author}/${permlink}`;
    }
    if (forApp) {
      el.removeAttribute('href');
      el.setAttribute('data-tag', tag);
      el.setAttribute('data-author', author);
      el.setAttribute('data-permlink', permlink);
    } else {
      const h = `/${tag}/@${author}/${permlink}`;
      el.setAttribute('href', h);
    }

    return;
  }

  // If a youtube video
  let match = href.match(youTubeRegex);
  if (match && el.textContent.trim() === href) {
    const e = youTubeRegex.exec(href);
    if (e[1]) {
      el.setAttribute(
        'class',
        'markdown-video-link markdown-video-link-youtube',
      );
      el.removeAttribute('href');

      const vid = e[1];
      const thumbnail = proxifyImageSrc(
        `https://img.youtube.com/vi/${vid.split('?')[0]}/hqdefault.jpg`,
        0,
        0,
        webp ? 'webp' : 'match',
      );
      const embedSrc = `https://www.youtube.com/embed/${vid}?autoplay=1`;

      el.textContent = '';

      el.setAttribute('data-embed-src', embedSrc);

      const thumbImg = el.ownerDocument.createElement('img');
      thumbImg.setAttribute('class', 'no-replace video-thumbnail');
      thumbImg.setAttribute('src', thumbnail);

      const play = el.ownerDocument.createElement('span');
      play.setAttribute('class', 'markdown-video-play');

      el.appendChild(thumbImg);
      el.appendChild(play);

      return;
    }
  }

  // If vimeo video
  match = href.match(vimeoRegex);
  if (match && href === el.textContent) {
    const e = vimeoRegex.exec(href);
    if (e[3]) {
      el.setAttribute('class', 'markdown-video-link markdown-video-link-vimeo');
      el.removeAttribute('href');

      const embedSrc = `https://player.vimeo.com/video/${e[3]}`;

      el.textContent = '';

      const ifr = el.ownerDocument.createElement('iframe');
      ifr.setAttribute('frameborder', '0');
      ifr.setAttribute('allowfullscreen', 'true');
      ifr.setAttribute('src', embedSrc);
      el.appendChild(ifr);

      return;
    }
  }

  // If twitch video
  match = href.match(twitchRegex);
  if (match && href === el.textContent) {
    const e = twitchRegex.exec(href);
    if (e[2]) {
      el.setAttribute(
        'class',
        'markdown-video-link markdown-video-link-twitch',
      );
      el.removeAttribute('href');

      let embedSrc = '';

      if (e[1] === undefined) {
        embedSrc = `https://player.twitch.tv/?channel=${e[2]}`;
      } else {
        embedSrc = `https://player.twitch.tv/?video=${e[1]}`;
      }

      el.textContent = '';

      const ifr = el.ownerDocument.createElement('iframe');
      ifr.setAttribute('frameborder', '0');
      ifr.setAttribute('allowfullscreen', 'true');
      ifr.setAttribute('src', embedSrc);
      el.appendChild(ifr);

      return;
    }
  }

  // If a d.tube video
  match = href.match(dTubeRegex);
  if (match) {
    // Only d.tube links contains an image
    const imgEls = el.getElementsByTagName('img');

    if (imgEls.length === 1) {
      const e = dTubeRegex.exec(href);
      // e[2] = username, e[3] object id
      if (e[2] && e[3]) {
        el.setAttribute(
          'class',
          'markdown-video-link markdown-video-link-dtube',
        );
        el.removeAttribute('href');

        const thumbnail = proxifyImageSrc(
          imgEls[0].getAttribute('src').replace(/\s+/g, ''),
          0,
          0,
          webp ? 'webp' : 'match',
        );
        const videoHref = `https://emb.d.tube/#!/${e[2]}/${e[3]}`;

        // el.setAttribute('data-video-href', videoHref);
        el.setAttribute('data-embed-src', videoHref);

        const thumbImg = el.ownerDocument.createElement('img');
        thumbImg.setAttribute('class', 'no-replace video-thumbnail');
        thumbImg.setAttribute('itemprop', 'image');
        thumbImg.setAttribute('src', thumbnail);

        const play = el.ownerDocument.createElement('span');
        play.setAttribute('class', 'markdown-video-play');

        el.appendChild(thumbImg);
        el.appendChild(play);

        // Remove image.
        el.removeChild(imgEls[0]);

        return;
      }
    }
  }

  // Detect 3Speak
  match = href.match(speakRegex);
  if (match) {
    const imgEls = el.getElementsByTagName('img');

    if (imgEls.length === 1) {
      const e = speakRegex.exec(href);
      // e[2] = username, e[3] object id
      if (e[1]) {
        el.setAttribute(
          'class',
          'markdown-video-link markdown-video-link-speak',
        );
        el.removeAttribute('href');

        const thumbnail = proxifyImageSrc(
          imgEls[0].getAttribute('src').replace(/\s+/g, ''),
          0,
          0,
          webp ? 'webp' : 'match',
        );
        const videoHref = `https://3speak.online/embed?v=${e[1]}`;

        // el.setAttribute('data-video-href', videoHref);
        el.setAttribute('data-embed-src', videoHref);

        const thumbImg = el.ownerDocument.createElement('img');
        thumbImg.setAttribute('class', 'no-replace video-thumbnail');
        thumbImg.setAttribute('itemprop', 'image');
        thumbImg.setAttribute('src', thumbnail);

        el.appendChild(thumbImg);

        // Remove image.
        el.removeChild(imgEls[0]);

        return;
      }
    }
  }

  if (
    href.indexOf(
      'https://hivesigner.com/sign/account-witness-vote?witness=',
    ) === 0
  ) {
    if (forApp) {
      el.setAttribute('class', 'markdown-witnesses-link');
      el.setAttribute('data-href', href);
      el.removeAttribute('href');
      return;
    }
  }

  if (
    href.indexOf('hivesigner.com/sign/update-proposal-votes?proposal_ids') > 0
  ) {
    if (forApp) {
      const m = decodeURI(href).match(/proposal_ids=\[(\d+)]/);
      if (m) {
        el.setAttribute('class', 'markdown-proposal-link');
        el.setAttribute('data-href', href);
        el.setAttribute('data-proposal', m[1]);
        el.removeAttribute('href');
        return;
      }
    }
  }

  // If nothing matched element as external link so it will be opened in external window
  el.setAttribute('class', 'markdown-external-link');

  // Prepend https if no scheme provided
  if (!/^((#)|(mailto:)|(\/(?!\/))|(((steem|https?):)?\/\/))/.test(href)) {
    href = `https://${href}`;
  }

  if (forApp) {
    el.setAttribute('data-href', href);
    el.removeAttribute('href');
  } else {
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  }
};

const iframe = (el) => {
  const src = el.getAttribute('src');
  if (!src) {
    el.parentNode.removeChild(el);
    return;
  }

  // Youtube
  if (src.match(/^(https?:)?\/\/www.youtube.com\/embed\/.*/i)) {
    const s = src.replace(/\?.+$/, ''); // strip query string (yt: autoplay=1,controls=0,showinfo=0, etc)
    el.setAttribute('src', s);
    return;
  }

  // Vimeo
  const m = src.match(/https:\/\/player\.vimeo\.com\/video\/([0-9]+)/);
  if (m && m.length === 2) {
    const s = `https://player.vimeo.com/video/${m[1]}`;
    el.setAttribute('src', s);
    return;
  }

  // Twitch
  if (src.match(/^(https?:)?\/\/player.twitch.tv\/.*/i)) {
    let parentDomain = 'steemit.com';
    if (typeof window !== 'undefined') {
      parentDomain = window.location.hostname;
    }
    const s = `${src}&parent=${parentDomain}&autoplay=false`;
    el.setAttribute('src', s);
    return;
  }

  // 3Speak
  if (src.match(/^(https?:)?\/\/3speak.online\/embed\?.*/i)) {
    const s = `${src}&autoplay=true`;
    el.setAttribute('src', s);
    return;
  }

  // Soundcloud
  if (src.match(/^https:\/\/w.soundcloud.com\/player\/.*/i)) {
    const match = src.match(/url=(.+?)&/);
    if (match && match.length === 2) {
      const s = `https://w.soundcloud.com/player/?url=${match[1]}&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&visual=true`;
      el.setAttribute('src', s);
      return;
    }
  }

  const replaceNode = el.ownerDocument.createElement('div');
  replaceNode.setAttribute('class', 'unsupported-iframe');
  replaceNode.textContent = `(Unsupported ${src})`;
  el.parentNode.insertBefore(replaceNode, el);
  el.parentNode.removeChild(el);
};

const img = (node, webp) => {
  node.removeAttribute('width');
  node.removeAttribute('height');

  let src = node.getAttribute('src');
  if (src.startsWith('javascript')) {
    src = '';
  }
  node.setAttribute('itemprop', 'image');

  if (node.getAttribute('class').indexOf('no-replace') === -1) {
    node.setAttribute(
      'src',
      proxifyImageSrc(src, 0, 0, webp ? 'webp' : 'match'),
    );
  }
};

const text = (node, forApp, webp) => {
  if (['a', 'code'].includes(node.parentNode.nodeName)) return;

  const linkified = linkify2(node.nodeValue, forApp);
  if (linkified !== node.nodeValue) {
    const replaceNode = DOMParser.parseFromString(
      `<span class="wr">${linkified}</span>`,
    );

    node.parentNode.insertBefore(replaceNode, node);
    node.parentNode.removeChild(node);
    return;
  }

  if (node.nodeValue.match(imgRegex)) {
    const attrs = forApp
      ? `data-href="${node.nodeValue}"`
      : `href="${node.nodeValue}"`;
    const replaceNode = DOMParser.parseFromString(
      `<a ${attrs} class="markdown-img-link"><img src="${proxifyImageSrc(
        node.nodeValue,
        0,
        0,
        webp ? 'webp' : 'match',
      )}"></a>`,
    );

    node.parentNode.replaceChild(replaceNode, node);
  }
  // If a youtube video
  if (node.nodeValue.match(youTubeRegex)) {
    const e = youTubeRegex.exec(node.nodeValue);
    if (e[1]) {
      const vid = e[1];
      const thumbnail = proxifyImageSrc(
        `https://img.youtube.com/vi/${vid.split('?')[0]}/hqdefault.jpg`,
        0,
        0,
        webp ? 'webp' : 'match',
      );
      const embedSrc = `https://www.youtube.com/embed/${vid}?autoplay=1`;

      const attrs = `class="markdown-video-link markdown-video-link-youtube" data-embed-src="${embedSrc}"`;

      const thumbImg = node.ownerDocument.createElement('img');
      thumbImg.setAttribute('class', 'no-replace video-thumbnail');
      thumbImg.setAttribute('src', thumbnail);

      const play = node.ownerDocument.createElement('span');
      play.setAttribute('class', 'markdown-video-play');

      const replaceNode = DOMParser.parseFromString(
        `<p><a ${attrs}>${thumbImg}${play}</a></p>`,
      );
      node.parentNode.replaceChild(replaceNode, node);
    }
  }
};

const cleanReply = (s) =>
  s
    .split('\n')
    .filter((item) => item.includes('Posted using [Partiko') === false)
    .filter((item) => item.includes('Posted using [Dapplr') === false)
    .filter((item) => item.includes('Posted Using [LeoFinance') === false)
    .join('\n');

export const linkify2 = (content, forApp) => {
  // Tags
  content = content.replace(/(^|\s|>)(#[-a-z\d]+)/gi, (tag) => {
    if (/#[\d]+$/.test(tag)) return tag; // do not allow only numbers (like #1)
    const preceding = /^\s|>/.test(tag) ? tag[0] : ''; // space or closing tag (>)
    tag = tag.replace('>', ''); // remove closing tag
    const tag2 = tag.trim().substring(1);
    const tagLower = tag2.toLowerCase();

    const attrs = forApp
      ? `data-tag="${tagLower}"`
      : `href="/trending/${tagLower}"`;
    return `${preceding}<a class="markdown-tag-link" ${attrs}>${tag.trim()}</a>`;
  });

  // User mentions
  content = content.replace(
    /(^|[^a-zA-Z0-9_!#$%&*@＠/]|(^|[^a-zA-Z0-9_+~.-/]))[@＠]([a-z][-.a-z\d]+[a-z\d])/gi,
    (match, preceeding1, preceeding2, user) => {
      const userLower = user.toLowerCase();
      const preceedings = (preceeding1 || '') + (preceeding2 || '');

      const attrs = forApp
        ? `data-author="${userLower}"`
        : `href="/@${userLower}"`;
      return `${preceedings}<a class="markdown-author-link" ${attrs}>@${user}</a>`;
    },
  );

  return content;
};

const markdown2html = (input, forApp, webp) => {
  if (!input) {
    return '';
  }

  let output;

  try {
    output = md.render(input);
    const doc = DOMParser.parseFromString(
      `<body id="root">${output}</body>`,
      'text/html',
    );

    traverse(doc, forApp, 0, webp);

    output = XMLSerializer.serializeToString(doc);
  } catch (error) {
    output = '';
  }

  output = output
    .replace(/ xmlns="http:\/\/www.w3.org\/1999\/xhtml"/g, '')
    .replace('<body id="root">', '')
    .replace('</body>', '')
    .trim();

  return sanitizeHtml(output);
};

export default (body, forApp = true, webp = false) => {
  // console.log('[markdown2html] export default obj', obj);
  // if (typeof obj === 'string') {
  //   obj = cleanReply(obj);
  //   return markdown2html(obj, forApp, webp);
  // }

  // caching the content
  /*
  const key = `${makeEntryCacheKey(obj)}-md${webp ? '-webp' : ''}`;

  const item = cacheGet(key);
  
  if (item) {
    console.log('[markdown2html] export default key, item', key, item);

    return item;
  }
*/
  //  obj.body = cleanReply(obj.body);

  const res = markdown2html(body, forApp, webp);

  //  cacheSet(key, res);

  return res;
};
