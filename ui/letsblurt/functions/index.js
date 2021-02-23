const functions = require('firebase-functions');
const axios = require('axios');
const dblurt = require('./dblurt');

const MAINNET_OFFICIAL = [
  'https://rpc.blurt.world',
  'https://rpc.blurt.buzz',
  'https://api.blurt.blog',
  'https://blurtd.privex.io',
];
const client = new dblurt.Client(MAINNET_OFFICIAL, {
  timeout: 5000,
  addressPrefix: 'BLT',
  chainId: 'cd8d90f29ae273abec3eaa7731e25934c63eb654d55080caff2ebb7f5df6381f',
});

// proxy for google custom search
exports.searchRequest = functions.https.onCall(async (data, res) => {
  //  console.log('input data', data);
  const {query, startAt = 1, num = 10, sort = ''} = data;

  const key = functions.config().search.key;
  const cx = functions.config().search.cx;
  const search = `https://www.googleapis.com/customsearch/v1?key=${key}&cx=${cx}&q=${query}&num=${num}&start=${startAt}&sort=${sort}`;

  //    const response = await axios.get(search);
  let result = null;
  await axios
    .get(search)
    .then((response) => {
      result = response.data;
      //      console.log('response result', result);
    })
    .catch((error) => console.log('failed to search', error));

  return result;
});

// proxy for getting supported languages for google translation
exports.getTranslationLanguagesRequest = functions.https.onCall(async () => {
  const key = functions.config().translation.key;
  const url = `https://translation.googleapis.com/language/translate/v2/languages?key=${key}`;

  let result = null;
  await axios
    .get(url)
    .then((response) => {
      result = response.data.data.languages;
    })
    .catch((error) => console.log('failed to get supported translate', error));

  return result;
});

// proxy for google translation v3
exports.translationRequest = functions.https.onCall(async (data, context) => {
  //  console.log('input data', data);
  const {text, targetLang, format} = data;

  const options = {
    target: targetLang,
    q: text,
    format,
  };

  const key = functions.config().translation.key;
  const url = `https://translation.googleapis.com/language/translate/v2?key=${key}`;

  let result = null;
  await axios
    .post(url, options)
    .then((response) => {
      result = response.data;
      //      console.log('response result', result);
    })
    .catch((error) => console.log('failed to translate', error));

  return result;
});

// proxy for creating blurt account
exports.createAccountRequest = functions.https.onCall(async (data, context) => {
  const {username, password, creationFee} = data;

  // get creator account
  const creator = functions.config().creator.account;
  const creatorWif = functions.config().creator.wif;
  const welcomeBlurt = functions.config().creator.welcome_blurt;

  // private active key of creator account
  const creatorKey = dblurt.PrivateKey.fromString(creatorWif);
  // create keys
  const ownerKey = dblurt.PrivateKey.fromLogin(username, password, 'owner');
  const activeKey = dblurt.PrivateKey.fromLogin(username, password, 'active');
  const postingKey = dblurt.PrivateKey.fromLogin(username, password, 'posting');
  const memoKey = dblurt.PrivateKey.fromLogin(
    username,
    password,
    'memo',
  ).createPublic(client.addressPrefix);

  const ownerAuth = {
    weight_threshold: 1,
    account_auths: [],
    key_auths: [[ownerKey.createPublic(client.addressPrefix), 1]],
  };
  const activeAuth = {
    weight_threshold: 1,
    account_auths: [],
    key_auths: [[activeKey.createPublic(client.addressPrefix), 1]],
  };
  const postingAuth = {
    weight_threshold: 1,
    account_auths: [],
    key_auths: [[postingKey.createPublic(client.addressPrefix), 1]],
  };

  //// send creation operation
  // operations
  let operations = [];
  //create operation to transmit
  const create_op = [
    'account_create',
    {
      fee: creationFee,
      creator: creator,
      new_account_name: username,
      owner: ownerAuth,
      active: activeAuth,
      posting: postingAuth,
      memo_key: memoKey,
      json_metadata: '',
      extensions: [],
    },
  ];
  console.log(create_op);
  // push the creation operation
  operations.push(create_op);
  try {
    const result = await client.broadcast.sendOperations(
      operations,
      creatorKey,
    );
    console.log('create account, result', result);

    //// if successful, transfer 3 blurt to the account
    if (result) {
      // get privake key from creator active wif
      const privateKey = dblurt.PrivateKey.from(creatorWif);
      // transfer
      if (privateKey) {
        const args = {
          from: creator,
          to: username,
          amount: welcomeBlurt,
          memo: 'Welcome Gift. Enjoy Blurt',
        };
        const resultTransfer = await client.broadcast.transfer(
          args,
          privateKey,
        );
        console.log('transfer result', resultTransfer);
        return resultTransfer;
      }
      return null;
    }
    return null;
  } catch (error) {
    console.log('failed to create account', error);
    return null;
  }
});
