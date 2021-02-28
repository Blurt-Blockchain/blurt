import { normalize } from "./uri_normalize";
import { request_remote_image, accepted_content_types } from "./utils";
const config = require("config.json")("./config.json");
const express = require("express");
const path = require("path");
const sharp = require("sharp");
const needle = require("needle");
const queryString = require("query-string");

require("tls").DEFAULT_ECDH_CURVE = "auto";

const router = express.Router();

// http://sharp.dimens.io/en/stable/api-utility/#cache
sharp.cache(false);
sharp.concurrency(1);

router.get("/:width(\\d+)x:height(\\d+)/*?", async (req, res, next) => {
  try {
    let { width, height } = req.params;
    let url = req.params[0];

    if (width) {
      width = parseInt(width);
      if (width === 0) {
        width = null;
      }
      if (width > 1024) {
        width = 1024;
      }
    }

    if (height) {
      height = parseInt(height);
      if (height === 0) {
        height = null;
      }
      if (height > 2048) {
        height = 2048;
      }
    }

    /**
     * fix for protocol-relative URL, eg.,
     * //futuristictoday.com/wp-content/uploads/2017/12/Robots-to-revolutionize-farming-ease-labor-woes.jpg
     */
    if (url.startsWith("//")) {
      url = `https:${url}`;
    }

    // fix to get query string
    const query_str = queryString.stringify(req.query);
    if (query_str.length > 0) {
      url = `${url}?${query_str}`;
    }

    url = normalize(url);
    if (!url) {
      throw new Error("invalid url");
    }

    let img_res = await request_remote_image(url);

    let status_code = Math.floor(img_res.statusCode / 100);

    // handle redirecting
    if (status_code === 3) {
      url = img_res.headers.location;
      url = normalize(url);
      if (!url) {
        throw new Error("invalid url");
      }

      img_res = await request_remote_image(url);
      status_code = Math.floor(img_res.statusCode / 100);
    }

    if (status_code !== 2) {
      throw new Error(`error on remote response (${img_res.statusCode})`);
    }

    const content_length = img_res.headers["content-length"];
    if (content_length > config.max_size) {
      throw new Error(
        `Resource content_length exceeds limit (${content_length})`
      );
    }

    let img = img_res.body;

    if (width || height) {
      img = await sharp(img, { failOnError: true })
        .rotate()
        .resize(width, height)
        .toBuffer();
    }

    /// ///////
    const content_type = img_res.headers["content-type"];
    if (!accepted_content_types.includes(content_type.toLowerCase())) {
      throw new Error(`Unsupported content-type (${content_type})`);
    }
    if (content_type) {
      res.set("content-type", content_type);
    }
    res.set("Cache-Control", "public,max-age=29030400,immutable");

    res.end(img, "binary");
  } catch (e) {
    console.log(e.message);

    res.set("content-type", "image/png");
    res.set("Cache-Control", "public,max-age=600,immutable"); // cache 10 min
    res.sendFile("error.png", { root: path.join(__dirname, "../assets") });
  } finally {
    // debug_sharp();
  }
});

const debug_sharp = () => {
  const stats = sharp.cache();
  const threads = sharp.concurrency();
  const counters = sharp.counters();
  const simd = sharp.simd();

  console.log(JSON.stringify({ stats, threads, counters, simd }));
};

module.exports = router;
