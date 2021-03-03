let ChainTypes

module.exports = ChainTypes = {}

ChainTypes.reserved_spaces = {
  relative_protocol_ids: 0,
  protocol_ids: 1,
  implementation_ids: 2
}

ChainTypes.operations = {
  vote: 0,
  comment: 1,
  transfer: 2,
  transfer_to_vesting: 3,
  withdraw_vesting: 4,
  account_create: 5,
  account_update: 6,
  witness_update: 7,
  account_witness_vote: 8,
  account_witness_proxy: 9,
  custom: 10,
  delete_comment: 11,
  custom_json: 12,
  comment_options: 13,
  set_withdraw_vesting_route: 14,
  claim_account: 15,
  create_claimed_account: 16,
  request_account_recovery: 17,
  recover_account: 18,
  change_recovery_account: 19,
  escrow_transfer: 20,
  escrow_dispute: 21,
  escrow_release: 22,
  escrow_approve: 23,
  transfer_to_savings: 24,
  transfer_from_savings: 25,
  cancel_transfer_from_savings: 26,
  custom_binary: 27,
  decline_voting_rights: 28,
  reset_account: 29,
  set_reset_account: 30,
  claim_reward_balance: 31,
  delegate_vesting_shares: 32,
  witness_set_properties: 33,
  create_proposal: 34,
  update_proposal_votes: 35,
  remove_proposal: 36,
  author_reward: 37,
  curation_reward: 38,
  comment_reward: 39,
  fill_vesting_withdraw: 40,
  shutdown_witness: 41,
  fill_transfer_from_savings: 42,
  hardfork: 43,
  comment_payout_update: 44,
  return_vesting_delegation: 45,
  comment_benefactor_reward: 46
}

// types.hpp
ChainTypes.object_type = {
  null: 0,
  base: 1
}
