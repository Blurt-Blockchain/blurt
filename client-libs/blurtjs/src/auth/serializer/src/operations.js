// This file is merge updated from steemd's js_operation_serializer program.
/*

./js_operation_serializer |
sed 's/void/future_extensions/g'|
sed 's/steemit_protocol:://g'|
sed 's/14static_variantIJNS_12fixed_stringINSt3__14pairIyyEEEEEEE/string/g'|
sed 's/steemit_future_extensions/future_extensions/g'|
sed 's/steemit_protocol_//g' > tmp.coffee

*/
// coffee tmp.coffee # fix errors until you see: `ChainTypes is not defined`

// npm i -g decaffeinate
// decaffeinate tmp.coffee

// Merge tmp.js - See "Generated code follows" below

import types from "./types";
import SerializerImpl from "./serializer";

const {
  // id_type,
  // varint32, uint8, int64, fixed_array, object_id_type, vote_id, address,
  uint8,
  uint16,
  int16,
  uint32,
  uint64,
  int64,
  uint128,
  string,
  string_binary,
  bytes,
  bool,
  array,
  // protocol_id_type,
  static_variant,
  map,
  set,
  public_key,
  time_point_sec,
  optional,
  asset,
  asset_symbol,
} = types;

const future_extensions = types.void;
const hardfork_version_vote = types.void;
const version = types.void;
const required_automated_actions = types.void;
const optional_automated_actions = types.void;

// Place-holder, their are dependencies on "operation" .. The final list of
// operations is not avialble until the very end of the generated code.
// See: operation.st_operations = ...
const operation = static_variant();
module.exports.operation = operation;

// For module.exports
const Serializer = function (operation_name, serilization_types_object) {
  const s = new SerializerImpl(operation_name, serilization_types_object);
  return (module.exports[operation_name] = s);
};

const beneficiaries = new Serializer("beneficiaries", {
  account: string,
  weight: uint16,
});

const comment_payout_beneficiaries = new Serializer(0, {
  beneficiaries: set(beneficiaries),
});

const votable_asset_options = new Serializer("votable_asset_options", {
  max_accepted_payout: int64,
  allow_curation_rewards: bool,
  beneficiaries: comment_payout_beneficiaries,
});

const allowed_vote_assets = new Serializer(1, {
  votable_assets: map(asset_symbol, votable_asset_options),
});

// Custom-types after Generated code

// ##  Generated code follows
// -------------------------------
/*
When updating generated code (fix closing notation)
Replace:  var operation = static_variant([
with:     operation.st_operations = [

Delete (these are custom types instead):
let public_key = new Serializer(
    "public_key",
    {key_data: bytes(33)}
);

let asset = new Serializer(
    "asset",
    {amount: int64,
    symbol: uint64}
);

Replace: authority.prototype.account_authority_map
With: map((string), (uint16))
*/
const signed_transaction = new Serializer("signed_transaction", {
  ref_block_num: uint16,
  ref_block_prefix: uint32,
  expiration: time_point_sec,
  operations: array(operation),
  extensions: set(future_extensions),
  signatures: array(bytes(65)),
});

const signed_block = new Serializer("signed_block", {
  previous: bytes(20),
  timestamp: time_point_sec,
  witness: string,
  transaction_merkle_root: bytes(20),
  extensions: set(
    static_variant([
      future_extensions,
      version,
      hardfork_version_vote,
      required_automated_actions,
      optional_automated_actions,
    ])
  ),
  witness_signature: bytes(65),
  transactions: array(signed_transaction),
});

const block_header = new Serializer("block_header", {
  previous: bytes(20),
  timestamp: time_point_sec,
  witness: string,
  transaction_merkle_root: bytes(20),
  extensions: set(
    static_variant([future_extensions, version, hardfork_version_vote])
  ),
});

const signed_block_header = new Serializer("signed_block_header", {
  previous: bytes(20),
  timestamp: time_point_sec,
  witness: string,
  transaction_merkle_root: bytes(20),
  extensions: set(
    static_variant([
      future_extensions,
      version,
      hardfork_version_vote,
      required_automated_actions,
      optional_automated_actions,
    ])
  ),
  witness_signature: bytes(65),
});

const vote = new Serializer("vote", {
  voter: string,
  author: string,
  permlink: string,
  weight: int16,
});

const comment = new Serializer("comment", {
  parent_author: string,
  parent_permlink: string,
  author: string,
  permlink: string,
  title: string,
  body: string,
  json_metadata: string,
});

const transfer = new Serializer("transfer", {
  from: string,
  to: string,
  amount: asset,
  memo: string,
});

const transfer_to_vesting = new Serializer("transfer_to_vesting", {
  from: string,
  to: string,
  amount: asset,
});

const withdraw_vesting = new Serializer("withdraw_vesting", {
  account: string,
  vesting_shares: asset,
});

const price = new Serializer("price", {
  base: asset,
  quote: asset,
});

const authority = new Serializer("authority", {
  weight_threshold: uint32,
  account_auths: map(string, uint16),
  key_auths: map(public_key, uint16),
});

const account_create = new Serializer("account_create", {
  fee: asset,
  creator: string,
  new_account_name: string,
  owner: authority,
  active: authority,
  posting: authority,
  memo_key: public_key,
  json_metadata: string,
});

const account_update = new Serializer("account_update", {
  account: string,
  owner: optional(authority),
  active: optional(authority),
  posting: optional(authority),
  memo_key: optional(public_key),
  json_metadata: string,
  posting_json_metadata: string,
  extensions: set(future_extensions),
});

const chain_properties = new Serializer("chain_properties", {
  account_creation_fee: asset,
  maximum_block_size: uint32,
});

const witness_update = new Serializer("witness_update", {
  owner: string,
  url: string,
  block_signing_key: public_key,
  props: chain_properties,
  fee: asset,
});

const account_witness_vote = new Serializer("account_witness_vote", {
  account: string,
  witness: string,
  approve: bool,
});

const account_witness_proxy = new Serializer("account_witness_proxy", {
  account: string,
  proxy: string,
});

const custom = new Serializer("custom", {
  required_auths: set(string),
  id: uint16,
  data: bytes(),
});

const delete_comment = new Serializer("delete_comment", {
  author: string,
  permlink: string,
});

const custom_json = new Serializer("custom_json", {
  required_auths: set(string),
  required_posting_auths: set(string),
  id: string,
  json: string,
});

const comment_options = new Serializer("comment_options", {
  author: string,
  permlink: string,
  max_accepted_payout: asset,
  allow_votes: bool,
  allow_curation_rewards: bool,
  extensions: set(
    static_variant([comment_payout_beneficiaries, allowed_vote_assets])
  ),
});

const set_withdraw_vesting_route = new Serializer(
  "set_withdraw_vesting_route",
  {
    from_account: string,
    to_account: string,
    percent: uint16,
    auto_vest: bool,
  }
);

const claim_account = new Serializer("claim_account", {
  creator: string,
  fee: asset,
  extensions: set(future_extensions),
});

const create_claimed_account = new Serializer("create_claimed_account", {
  creator: string,
  new_account_name: string,
  owner: authority,
  active: authority,
  posting: authority,
  memo_key: public_key,
  json_metadata: string,
  extensions: set(future_extensions),
});

const request_account_recovery = new Serializer("request_account_recovery", {
  recovery_account: string,
  account_to_recover: string,
  new_owner_authority: authority,
  extensions: set(future_extensions),
});

const recover_account = new Serializer("recover_account", {
  account_to_recover: string,
  new_owner_authority: authority,
  recent_owner_authority: authority,
  extensions: set(future_extensions),
});

const change_recovery_account = new Serializer("change_recovery_account", {
  account_to_recover: string,
  new_recovery_account: string,
  extensions: set(future_extensions),
});

const escrow_transfer = new Serializer("escrow_transfer", {
  from: string,
  to: string,
  agent: string,
  escrow_id: uint32,
  blurt_amount: asset,
  fee: asset,
  ratification_deadline: time_point_sec,
  escrow_expiration: time_point_sec,
  json_meta: string,
});

const escrow_dispute = new Serializer("escrow_dispute", {
  from: string,
  to: string,
  agent: string,
  who: string,
  escrow_id: uint32,
});

const escrow_release = new Serializer("escrow_release", {
  from: string,
  to: string,
  agent: string,
  who: string,
  receiver: string,
  escrow_id: uint32,
  blurt_amount: asset,
});

const escrow_approve = new Serializer("escrow_approve", {
  from: string,
  to: string,
  agent: string,
  who: string,
  escrow_id: uint32,
  approve: bool,
});

const transfer_to_savings = new Serializer("transfer_to_savings", {
  from: string,
  to: string,
  amount: asset,
  memo: string,
});

const transfer_from_savings = new Serializer("transfer_from_savings", {
  from: string,
  request_id: uint32,
  to: string,
  amount: asset,
  memo: string,
});

const cancel_transfer_from_savings = new Serializer(
  "cancel_transfer_from_savings",
  {
    from: string,
    request_id: uint32,
  }
);

const custom_binary = new Serializer("custom_binary", {
  required_owner_auths: set(string),
  required_active_auths: set(string),
  required_posting_auths: set(string),
  required_auths: array(authority),
  id: string,
  data: bytes(),
});

const decline_voting_rights = new Serializer("decline_voting_rights", {
  account: string,
  decline: bool,
});

const reset_account = new Serializer("reset_account", {
  reset_account: string,
  account_to_reset: string,
  new_owner_authority: authority,
});

const set_reset_account = new Serializer("set_reset_account", {
  account: string,
  current_reset_account: string,
  reset_account: string,
});

const claim_reward_balance = new Serializer("claim_reward_balance", {
  account: string,
  reward_blurt: asset,
  reward_vests: asset,
});

const delegate_vesting_shares = new Serializer("delegate_vesting_shares", {
  delegator: string,
  delegatee: string,
  vesting_shares: asset,
});

const witness_set_properties = new Serializer("witness_set_properties", {
  owner: string,
  props: string,
  extensions: set(future_extensions),
});

const create_proposal = new Serializer("create_proposal", {
  creator: string,
  receiver: string,
  start_date: time_point_sec,
  end_date: time_point_sec,
  daily_pay: asset,
  subject: string,
  permlink: string,
  extensions: set(future_extensions),
});

const remove_proposal = new Serializer("remove_proposal", {
  proposal_owner: string,
  proposal_ids: array(uint64),
  extensions: set(future_extensions),
});

const update_proposal_votes = new Serializer("update_proposal_votes", {
  voter: string,
  proposal_ids: array(uint64),
  approve: bool,
  extensions: set(future_extensions),
});

const author_reward = new Serializer("author_reward", {
  author: string,
  permlink: string,
  blurt_payout: asset,
  vesting_payout: asset,
});

const curation_reward = new Serializer("curation_reward", {
  curator: string,
  reward: asset,
  comment_author: string,
  comment_permlink: string,
});

const comment_reward = new Serializer("comment_reward", {
  author: string,
  permlink: string,
  payout: asset,
});

const fill_vesting_withdraw = new Serializer("fill_vesting_withdraw", {
  from_account: string,
  to_account: string,
  withdrawn: asset,
  deposited: asset,
});

const shutdown_witness = new Serializer("shutdown_witness", { owner: string });

const fill_transfer_from_savings = new Serializer(
  "fill_transfer_from_savings",
  {
    from: string,
    to: string,
    amount: asset,
    request_id: uint32,
    memo: string,
  }
);

const hardfork = new Serializer("hardfork", { hardfork_id: uint32 });

const comment_payout_update = new Serializer("comment_payout_update", {
  author: string,
  permlink: string,
});

const return_vesting_delegation = new Serializer("return_vesting_delegation", {
  account: string,
  vesting_shares: asset,
});

const comment_benefactor_reward = new Serializer("comment_benefactor_reward", {
  benefactor: string,
  author: string,
  permlink: string,
  reward: asset,
});

operation.st_operations = [
  vote,
  comment,
  transfer,
  transfer_to_vesting,
  withdraw_vesting,
  account_create,
  account_update,
  witness_update,
  account_witness_vote,
  account_witness_proxy,
  custom,
  delete_comment,
  custom_json,
  comment_options,
  set_withdraw_vesting_route,
  claim_account,
  create_claimed_account,
  request_account_recovery,
  recover_account,
  change_recovery_account,
  escrow_transfer,
  escrow_dispute,
  escrow_release,
  escrow_approve,
  transfer_to_savings,
  transfer_from_savings,
  cancel_transfer_from_savings,
  custom_binary,
  decline_voting_rights,
  reset_account,
  set_reset_account,
  claim_reward_balance,
  delegate_vesting_shares,
  witness_set_properties,
  create_proposal,
  update_proposal_votes,
  remove_proposal,
  author_reward,
  curation_reward,
  comment_reward,
  fill_vesting_withdraw,
  shutdown_witness,
  fill_transfer_from_savings,
  hardfork,
  comment_payout_update,
  return_vesting_delegation,
  comment_benefactor_reward,
];

const transaction = new Serializer("transaction", {
  ref_block_num: uint16,
  ref_block_prefix: uint32,
  expiration: time_point_sec,
  operations: array(operation),
  extensions: set(future_extensions),
});

// # -------------------------------
// #  Generated code end  S T O P
// # -------------------------------

// Custom Types (do not over-write)

const encrypted_memo = new Serializer("encrypted_memo", {
  from: public_key,
  to: public_key,
  nonce: uint64,
  check: uint32,
  encrypted: string_binary,
});
/*

// Make sure all tests pass

npm test

*/
