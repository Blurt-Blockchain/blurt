/** API routes. */

import * as Router from "koa-router";

import { avatarHandler } from "./avatar";
import { KoaContext } from "./common";
import { legacyProxyHandler } from "./legacy-proxy";
import { proxyHandler } from "./proxy";
import { serveHandler } from "./serve";
import { uploadHandler, uploadHsHandler } from "./upload";

const version = require("./version");
const router = new Router();

async function healthcheck(ctx: KoaContext) {
  const ok = true;
  const date = new Date();
  ctx.set("Cache-Control", "no-cache");
  ctx.body = { ok, version, date };
}

router.get("/", healthcheck as any);
router.get("/.well-known/healthcheck.json", healthcheck as any);
router.get("/u/:username/avatar/:size?", avatarHandler as any);
router.post("/hs/:accesstoken", uploadHsHandler as any);
router.post("/:username/:signature", uploadHandler as any);
router.get("/:width(\\d+)x:height(\\d+)/:url(.*)", legacyProxyHandler as any);
router.get("/p/:url", proxyHandler as any);
router.get("/:hash/:filename?", serveHandler as any);

export const routes = router.routes();
