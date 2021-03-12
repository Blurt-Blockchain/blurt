const EXCLUDE_PERMLINKS = [
  'followed',
  'followers',
  'notifications',
  'recent-replies',
  'comments',
  'curation-rewards',
  'author-rewards',
  'transfers',
  'delegations',
  'permissions',
  'password',
  'settings',
];

// e.g https://blurt.world/.../@letsblurt/let-s-blurt-mobile-app-simple-welcome- screen"
const parseCatAuthorPermlink = (url: string) => {
  const postRegex = /^https?:\/\/(.*)\/(.*)\/(@[\w.\d-]+)\/(.*)/i;
  const postMatch = url.match(postRegex);

  if (!postMatch) return null;
  console.log('[parseCatAuthorPermlink] postMatch', postMatch);
  if (EXCLUDE_PERMLINKS.includes(postMatch[4])) {
    return null;
  }

  if (postMatch && postMatch.length === 5) {
    return {
      author: postMatch[3].replace('@', ''),
      permlink: postMatch[4],
    };
  }
  const authorRegex = /^https?:\/\/(.*)\/(.*)\/(@[\w.\d-]+)/i;
  const authorMatch = url.match(authorRegex);
  if (authorMatch && authorMatch.length === 4) {
    return {
      author: authorMatch[3].replace('@', ''),
      permlink: null,
    };
  }
  const r = /^https?:\/\/(.*)\/(@[\w.\d-]+)\/(.*)/i;
  const match = url.match(r);

  if (match && match.length === 4) {
    return {
      author: match[2].replace('@', ''),
      permlink: match[3],
    };
  }
  return null;
};

export {parseCatAuthorPermlink};
