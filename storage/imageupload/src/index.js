require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const chainLib = require("@blurtfoundation/blurtjs");
const {
  PrivateKey,
  PublicKey,
  Signature,
} = require("@blurtfoundation/blurtjs/lib/auth/ecc");
const RIPEMD160 = require("ripemd160");
const AWS = require("aws-sdk");
const { RateLimiterMemory } = require("rate-limiter-flexible");
const IpfsHttpClient = require("ipfs-http-client");
const { globSource } = IpfsHttpClient;
const ipfs = IpfsHttpClient();

chainLib.api.setOptions({
  url: process.env.JSONRPC_URL,
  retry: true,
  useAppbaseApi: true,
});

const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  signatureVersion: "v4",
});

const rate_limit_opts = {
  points: process.env.RATE_LIMIT_POINTS, // 3 images
  duration: 3600, // per hour
};
const rateLimiter = new RateLimiterMemory(rate_limit_opts);

const app = express();

const port = process.env.PORT || 7070; // set our port

hdl_upload_s3 = async (req, res) => {
  try {
    const { username, sig } = req.params;

    // const username = this.session.a;
    if (username === undefined || username === null) {
      throw new Error("invalid user");
    }

    const jsonBody = req.body;
    // console.log(`jsonBody.data.length=${jsonBody.data.length}`);
    if (jsonBody.data.length > process.env.MAX_JSON_BODY_IN_BYTES) {
      throw new Error("File size too big!");
    }

    // data:image/jpeg;base64,
    let indexData = 0;
    if (jsonBody.data[23] === ",") {
      indexData = 23;
    } else if (jsonBody.data[22] === ",") {
      indexData = 22;
    } else if (jsonBody.data[21] === ",") {
      indexData = 21;
    } else {
      throw new Error("could not find index of [,]");
    }

    const prefix_data = jsonBody.data.substring(0, indexData);
    const base64_data = jsonBody.data.substring(indexData);

    // extract content type
    let file_ext = null;
    if (prefix_data.startsWith("data:image/jpeg;")) file_ext = "jpeg";
    else if (prefix_data.startsWith("data:image/jpg;")) file_ext = "jpg";
    else if (prefix_data.startsWith("data:image/png;")) file_ext = "png";
    else if (prefix_data.startsWith("data:image/gif;")) file_ext = "gif";
    else if (prefix_data.startsWith("data:image/webp;")) file_ext = "webp";
    else throw new Error("invalid content type");

    const content_type = `image/${file_ext}`;

    const buffer = new Buffer(base64_data, "base64");
    // console.log(`buffer.length=${buffer.length}`);
    if (buffer.length > process.env.MAX_IMAGE_SIZE_IN_BYTES) {
      throw new Error("File size too big!");
    }

    const hash_buffer = new RIPEMD160().update(buffer).digest("hex");
    const s3_file_path = `${username}/${hash_buffer}.${file_ext}`;

    {
      // verifying sig
      const isValidUsername = chainLib.utils.validateAccountName(username);
      if (isValidUsername) {
        throw new Error("Invalid username");
      }

      const existingAccs = await chainLib.api.getAccountsAsync([username]);
      if (existingAccs.length !== 1) {
        throw new Error("Invalid username.");
      }

      const sign_data = Signature.fromBuffer(new Buffer(sig, "hex"));
      const sigPubKey = sign_data.recoverPublicKeyFromBuffer(buffer).toString();

      const postingPubKey = existingAccs[0].posting.key_auths[0][0];
      const activePubKey = existingAccs[0].active.key_auths[0][0];
      const ownerPubKey = existingAccs[0].owner.key_auths[0][0];

      switch (sigPubKey) {
        case postingPubKey:
        case activePubKey:
        case ownerPubKey:
          // key matched, do nothing
          break;
        default:
          throw new Error("Invalid key.");
      }

      const is_verified = sign_data.verifyBuffer(
        buffer,
        PublicKey.fromString(sigPubKey)
      );
      if (!is_verified) {
        throw new Error("Invalid signature.");
      }
    }

    await rateLimiter.consume(username, 1);

    const { cid } = await client.add(buffer);

    await s3
      .putObject({
        ACL: "public-read",
        Bucket: process.env.S3_BUCKET,
        Key: s3_file_path,
        Body: buffer,
        ContentType: content_type,
      })
      .promise();

    const img_full_path = `${process.env.PREFIX_URL}${process.env.S3_BUCKET}/${s3_file_path}`;
    const ipfs_full_path = `https://cloudflare-ipfs.com/ipfs/${cid}`;
    // this.body = JSON.stringify({status: 'ok', message: 'success', data: img_full_path});
    res.json({ status: "ok", message: "success", data: ipfs_full_path });
  } catch (e) {
    // console.error('Error in /imageupload api call', this.session.uid, error);
    res.json({ status: "error", message: e.message, data: e });
  }
};

// serverStart starts an express http server
serverStart = () => {
  app.use(bodyParser.json({ type: "application/json", limit: "10mb" }));

  const router = express.Router();
  router.post("/:username/:sig", hdl_upload_s3);
  router.get("/test_cors", async (req, res) => {
    res.json({ status: "ok", message: "success", data: null });
  });
  router.get("/", async (req, res) => {
    res.json("ipfs powered image hosting");
  });

  app.use("/", router);

  app.listen(port);
  console.log(`serverStart on port ${port}`);
};

serverStart();

module.exports = app;
