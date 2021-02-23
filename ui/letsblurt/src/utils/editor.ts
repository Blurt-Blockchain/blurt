import getSlug from 'speakingurl';
import {diff_match_patch as diffMatchPatch} from 'diff-match-patch';
import VersionNumber from 'react-native-version-number';
import {TARGET_APP} from '~/constants/blockchain';

export const getWordsCount = (text) =>
  text && typeof text === 'string'
    ? text.replace(/^\s+|\s+$/g, '').split(/\s+/).length
    : 0;

const permlinkRnd = () => (Math.random() + 1).toString(16).substring(2);

export const generatePermlink = (title, random = false) => {
  if (!title) {
    return '';
  }

  const slug = getSlug(title);
  let perm = slug && slug.toString();

  if (title) {
    if (random) {
      const rnd = (Math.random() + 1).toString(16).substring(2);
      perm = `${slug.toString()}${rnd}est`;
    }

    // STEEMIT_MAX_PERMLINK_LENGTH
    if (perm.length > 255) {
      perm = perm.substring(perm.length - 255, perm.length);
    }

    // only letters numbers and dashes
    perm = perm.toLowerCase().replace(/[^a-z0-9-]+/g, '');

    if (perm.length === 0) {
      return permlinkRnd();
    }
  }

  return perm;
};

export const generateCommentPermlink = (toAuthor) => {
  if (!toAuthor) {
    return '';
  }

  const t = new Date(Date.now());

  const timeFormat = `${t.getFullYear().toString()}${(
    t.getMonth() + 1
  ).toString()}${t
    .getDate()
    .toString()}t${t
    .getHours()
    .toString()}${t
    .getMinutes()
    .toString()}${t.getSeconds().toString()}${t.getMilliseconds().toString()}z`;

  return `re-${toAuthor.replace(/\./g, '')}-${timeFormat}`;
};

export const addPostingOptions = (
  author: string,
  permlink: string,
  operationType: string,
  beneficiaries: any[],
) => {
  if (!author || !permlink) {
    return {};
  }

  console.log('[addPostingOptions] beneficiaries', beneficiaries);
  // need to sort beneficiaries (if not, error: Benficiaries must be specified in sorted order (account ascending))
  const sortedBeneficiaries = beneficiaries.sort((a, b) =>
    a.account > b.account ? 1 : a.account < b.account ? -1 : 0,
  );

  console.log('[addPostingOptions] sorted beneficiaries', sortedBeneficiaries);

  // beneficiaries
  // "extensions": [
  //   [
  //     0,
  //     {
  //       "beneficiaries": [
  //         {"account": "david", "weight": 500},
  //         {"account": "erin", "weight": 500},
  //         {"account": "faythe", "weight": 1000},
  //         {"account": "frank", "weight": 500}
  //       ]
  //     }
  //   ]
  // ]

  const options = {
    author,
    permlink,
    max_accepted_payout: '1000000.000 BLURT',
    allow_votes: true,
    allow_curation_rewards: true,
    //extensions: [[0, {beneficiaries: [{account: 'letsblurt', weight: 500}]}]], // 5%
    extensions: [[0, {beneficiaries: sortedBeneficiaries}]], // 5%
  };

  switch (operationType) {
    case 'powerup':
      options.max_accepted_payout = '1000000.000 BLURT';
      break;

    case 'decline':
      options.max_accepted_payout = '0.000 BLURT';
      break;

    default:
      options.max_accepted_payout = '1000000.000 BLURT';
      break;
  }

  return options;
};

export const makeJsonMetadataComment = (tags) => ({
  tags,
  app: `${TARGET_APP}/${VersionNumber.appVersion}-mobile`,
  format: 'markdown+html',
});

export const makeJsonMetadata = (meta, tags) =>
  Object.assign({}, meta, {
    tags,
    app: `${TARGET_APP}/${VersionNumber.appVersion}-mobile`,
    format: 'markdown+html',
  });

export const makeJsonMetadataForUpdate = (oldJson, meta, tags) => {
  const {meta: oldMeta} = oldJson;
  const mergedMeta = Object.assign({}, oldMeta, meta);

  return Object.assign({}, oldJson, mergedMeta, {tags});
};

export const extractMetadata = (body: string) => {
  const urlReg = /(\b(https?|ftp):\/\/[A-Z0-9+&@#/%?=~_|!:,.;-]*[-A-Z0-9+&@#/%=~_|])/gim;
  const userReg = /(^|\s)(@[a-z][-.a-z\d]+[a-z\d])/gim;
  const imgReg = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/gim;

  const out = {
    links: [],
    image: [],
    users: [],
  };

  const mUrls = body && body.match(urlReg);
  const mUsers = body && body.match(userReg);

  const matchedImages = [];
  const matchedLinks = [];
  const matchedUsers = [];

  if (mUrls) {
    for (let i = 0; i < mUrls.length; i++) {
      const ind = mUrls[i].match(imgReg);
      if (ind) {
        matchedImages.push(mUrls[i]);
      } else {
        matchedLinks.push(mUrls[i]);
      }
    }
  }

  if (matchedLinks.length) {
    out.links = matchedLinks;
  }
  if (matchedImages.length) {
    out.image = matchedImages;
  }

  if (mUsers) {
    for (let i = 0; i < mUsers.length; i++) {
      matchedUsers.push(mUsers[i].trim().substring(1));
    }
  }

  if (matchedUsers.length) {
    out.users = matchedUsers;
  }

  return out;
};

export const createPatch = (text1, text2) => {
  if (!text1 && text1 === '') {
    return undefined;
  }

  const dmp = new diffMatchPatch();
  const patches = dmp.patch_make(text1, text2);
  const patch = dmp.patch_toText(patches);

  return patch;
};
