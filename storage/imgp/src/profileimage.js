const config = require('config.json')('./config.json');
const express = require('express');
const path = require('path');
const chainLib = require('@blurtfoundation/blurtjs');
const sharp = require('sharp');
import { normalize } from './uri_normalize';
import { getJsonRpcUri, request_remote_image, accepted_content_types } from './utils';

let router = express.Router();

const get_image_url = async (accountname) => {
  let url = null;

  try {
    let [acc] = await getJsonRpcUri("condenser_api", "get_accounts", [[accountname]]);

    if (acc) {
      let json_metadata = acc.json_metadata;
      let md = JSON.parse(json_metadata);

      if (md.profile.profile_image) {
        url = md.profile.profile_image;
      }

      // console.log("url=" + url);
      if ((typeof url === 'undefined') || (url === null)) {
        url = null;
      }
    }
  } catch (e) {
    // console.log(e.message);
    url = null;
  }

  return url;
};

router.get('/:accountname/:size?', async function (req, res) {
  try {
    let img_size = 64; // default is 64
    const {accountname, size} = req.params;

    let isValidUsername = chainLib.utils.validateAccountName(accountname);
    if (isValidUsername) {
      throw new Error(isValidUsername);
    }

    let url = await get_image_url(accountname);

    if ((typeof url === 'undefined') || (url === null)) {
      throw new Error(`no profile image for ${accountname}`);
    }

    url = normalize(url);
    if (!url) {
      throw new Error("invalid url");
    }

    const img_res = await request_remote_image(url);
    if (img_res.statusCode !== 200) {
      throw new Error(`error on remote response (${img_res.statusCode})`);
    }

    const content_length = img_res.headers['content-length'];
    if (content_length > config.max_size) {
      throw new Error(`Resource size exceeds limit (${content_length})`);
    }

    let img = img_res.body;

    if (size === "32x32") {
      img_size = 32;
    } else if (size === "48x48") {
      img_size = 48;
    } else if (size === "64x64") {
      img_size = 64;
    } else if (size === "96x96") {
      img_size = 96;
    } else if (size === "128x128") {
      img_size = 128;
    } else if (size === "256x256") {
      img_size = 256;
    } else if (size === "512x512") {
      img_size = 512;
    }

    img = await sharp(img, {failOnError: true})
      .resize(img_size, img_size)
      .toBuffer();

    const content_type = img_res.headers["content-type"];
    if (!accepted_content_types.includes(content_type)) {
      throw new Error(`Unsupported content-type (${content_type})`);
    }

    res.set('content-type', content_type);
    res.set('Cache-Control', 'public,max-age=86400,immutable');

    res.end(img, 'binary');
  } catch (e) {
    console.log(e.message);

    res.set('content-type', 'image/png');
    res.set('Cache-Control', 'public,max-age=600,immutable'); // cache 10 min
    res.sendFile('user.png', { root: path.join(__dirname, '../assets') });
  }
});

module.exports = router;
