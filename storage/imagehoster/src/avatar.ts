/** Serve user avatars. */

import * as config from "config";
import { base58Enc } from "./utils";

import { Account } from "dblurt";
import { KoaContext, rpcClient } from "./common";
import { APIError } from "./error";

const DefaultAvatar = config.get("default_avatar") as string;
const AvatarSizes: { [size: string]: number } = {
  small: 64,
  medium: 128,
  large: 512,
};

export async function avatarHandler(ctx: KoaContext) {
  ctx.tag({ handler: "avatar" });

  APIError.assert(ctx.method === "GET", APIError.Code.InvalidMethod);
  APIError.assertParams(ctx.params, ["username"]);

  const username = ctx.params["username"];
  const size = AvatarSizes[ctx.params["size"]] || AvatarSizes.medium;

  interface ExtendedAccount extends Account {
    posting_json_metadata?: string;
  }

  const [account]: ExtendedAccount[] = await rpcClient.database.getAccounts([
    username,
  ]);

  APIError.assert(account, APIError.Code.NoSuchAccount);

  let metadata;

  // read from `posting_json_metadata` if version flag is set
  if (account.posting_json_metadata) {
    try {
      metadata = JSON.parse(account.posting_json_metadata);
      if (!metadata.profile || !metadata.profile.version) {
        metadata = {};
      }
    } catch (error) {
      ctx.log.debug(
        error,
        "unable to parse json_metadata for %s",
        account.name
      );
      metadata = {};
    }
  }

  // otherwise, fall back to reading from `json_metadata`
  if (!metadata || !metadata.profile) {
    try {
      metadata = JSON.parse(account.json_metadata);
    } catch (error) {
      ctx.log.debug(
        error,
        "unable to parse json_metadata for %s",
        account.name
      );
      metadata = {};
    }
  }

  let avatarUrl: string = DefaultAvatar;
  if (
    metadata.profile &&
    metadata.profile.profile_image &&
    metadata.profile.profile_image.match(/^https?:\/\//)
  ) {
    avatarUrl = metadata.profile.profile_image;
  }

  ctx.set("Cache-Control", "public,max-age=600");
  ctx.redirect(`/p/${base58Enc(avatarUrl)}?width=${size}&height=${size}`);
}
