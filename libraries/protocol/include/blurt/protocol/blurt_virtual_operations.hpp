#pragma once
#include <blurt/protocol/asset.hpp>
#include <blurt/protocol/base.hpp>
#include <blurt/protocol/block_header.hpp>

#include <fc/utf8.hpp>

namespace blurt {
namespace protocol {

struct author_reward_operation : public virtual_operation {
  author_reward_operation() {}
  author_reward_operation(const account_name_type &a, const string &p,
                          const asset &st, const asset &v)
      : author(a), permlink(p), blurt_payout(st), vesting_payout(v) {}

  account_name_type author;
  string permlink;
  asset blurt_payout;
  asset vesting_payout;
};

struct curation_reward_operation : public virtual_operation {
  curation_reward_operation() {}
  curation_reward_operation(const string &c, const asset &r, const string &a,
                            const string &p)
      : curator(c), reward(r), comment_author(a), comment_permlink(p) {}

  account_name_type curator;
  asset reward;
  account_name_type comment_author;
  string comment_permlink;
};

struct comment_reward_operation : public virtual_operation {
  comment_reward_operation() {}
  comment_reward_operation(const account_name_type &a, const string &pl,
                           const asset &p)
      : author(a), permlink(pl), payout(p) {}

  account_name_type author;
  string permlink;
  asset payout;
};

struct fill_vesting_withdraw_operation : public virtual_operation {
  fill_vesting_withdraw_operation() {}
  fill_vesting_withdraw_operation(const string &f, const string &t,
                                  const asset &w, const asset &d)
      : from_account(f), to_account(t), withdrawn(w), deposited(d) {}

  account_name_type from_account;
  account_name_type to_account;
  asset withdrawn;
  asset deposited;
};

struct shutdown_witness_operation : public virtual_operation {
  shutdown_witness_operation() {}
  shutdown_witness_operation(const string &o) : owner(o) {}

  account_name_type owner;
};

struct fill_transfer_from_savings_operation : public virtual_operation {
  fill_transfer_from_savings_operation() {}
  fill_transfer_from_savings_operation(const account_name_type &f,
                                       const account_name_type &t,
                                       const asset &a, const uint32_t r,
                                       const string &m)
      : from(f), to(t), amount(a), request_id(r), memo(m) {}

  account_name_type from;
  account_name_type to;
  asset amount;
  uint32_t request_id = 0;
  string memo;
};

struct hardfork_operation : public virtual_operation {
  hardfork_operation() {}
  hardfork_operation(uint32_t hf_id) : hardfork_id(hf_id) {}

  uint32_t hardfork_id = 0;
};

struct comment_payout_update_operation : public virtual_operation {
  comment_payout_update_operation() {}
  comment_payout_update_operation(const account_name_type &a, const string &p)
      : author(a), permlink(p) {}

  account_name_type author;
  string permlink;
};

struct return_vesting_delegation_operation : public virtual_operation {
  return_vesting_delegation_operation() {}
  return_vesting_delegation_operation(const account_name_type &a,
                                      const asset &v)
      : account(a), vesting_shares(v) {}

  account_name_type account;
  asset vesting_shares;
};

struct comment_benefactor_reward_operation : public virtual_operation {
  comment_benefactor_reward_operation() {}
  comment_benefactor_reward_operation(const account_name_type &b,
                                      const account_name_type &a,
                                      const string &p, const asset &st,
                                      const asset &v)
      : benefactor(b), author(a), permlink(p), blurt_payout(st),
        vesting_payout(v) {}

  account_name_type benefactor;
  account_name_type author;
  string permlink;
  asset blurt_payout;
  asset vesting_payout;
};

struct producer_reward_operation : public virtual_operation {
  producer_reward_operation() {}
  producer_reward_operation(const string &p, const asset &v)
      : producer(p), vesting_shares(v) {}

  account_name_type producer;
  asset vesting_shares;
};

struct clear_null_account_balance_operation : public virtual_operation {
  vector<asset> total_cleared;
};

struct sps_fund_operation : public virtual_operation {
  sps_fund_operation() {}
  sps_fund_operation(const asset &v) : additional_funds(v) {}

  asset additional_funds;
};

} // namespace protocol
} // namespace blurt

FC_REFLECT(blurt::protocol::author_reward_operation,
           (author)(permlink)(blurt_payout)(vesting_payout))
FC_REFLECT(blurt::protocol::curation_reward_operation,
           (curator)(reward)(comment_author)(comment_permlink))
FC_REFLECT(blurt::protocol::comment_reward_operation,
           (author)(permlink)(payout))
FC_REFLECT(blurt::protocol::fill_vesting_withdraw_operation,
           (from_account)(to_account)(withdrawn)(deposited))
FC_REFLECT(blurt::protocol::shutdown_witness_operation, (owner))
FC_REFLECT(blurt::protocol::fill_transfer_from_savings_operation,
           (from)(to)(amount)(request_id)(memo))
FC_REFLECT(blurt::protocol::hardfork_operation, (hardfork_id))
FC_REFLECT(blurt::protocol::comment_payout_update_operation, (author)(permlink))
FC_REFLECT(blurt::protocol::return_vesting_delegation_operation,
           (account)(vesting_shares))
FC_REFLECT(blurt::protocol::comment_benefactor_reward_operation,
           (benefactor)(author)(permlink)(blurt_payout)(vesting_payout))
FC_REFLECT(blurt::protocol::producer_reward_operation,
           (producer)(vesting_shares))
FC_REFLECT(blurt::protocol::clear_null_account_balance_operation,
           (total_cleared))
FC_REFLECT(blurt::protocol::sps_fund_operation, (additional_funds))
