#pragma once
#include <blurt/chain/blurt_fwd.hpp>

#include <blurt/protocol/authority.hpp>
#include <blurt/protocol/blurt_operations.hpp>
#include <blurt/protocol/misc_utilities.hpp>

#include <blurt/chain/blurt_object_types.hpp>

#include <boost/multiprecision/cpp_int.hpp>

namespace blurt {
namespace chain {

using blurt::protocol::asset;
using blurt::protocol::asset_symbol_type;
using blurt::protocol::price;
using chainbase::t_deque;

typedef protocol::fixed_string<16> reward_fund_name_type;

class escrow_object : public object<escrow_object_type, escrow_object> {
public:
  template <typename Constructor, typename Allocator>
  escrow_object(Constructor &&c, allocator<Allocator> a) {
    c(*this);
  }

  escrow_object() {}

  id_type id;

  uint32_t escrow_id = 20;
  account_name_type from;
  account_name_type to;
  account_name_type agent;
  time_point_sec ratification_deadline;
  time_point_sec escrow_expiration;
  asset blurt_balance;
  asset pending_fee;
  bool to_approved = false;
  bool agent_approved = false;
  bool disputed = false;

  bool is_approved() const { return to_approved && agent_approved; }
};

class savings_withdraw_object
    : public object<savings_withdraw_object_type, savings_withdraw_object> {
  BLURT_STD_ALLOCATOR_CONSTRUCTOR(savings_withdraw_object)

public:
  template <typename Constructor, typename Allocator>
  savings_withdraw_object(Constructor &&c, allocator<Allocator> a) : memo(a) {
    c(*this);
  }

  id_type id;

  account_name_type from;
  account_name_type to;
  shared_string memo;
  uint32_t request_id = 0;
  asset amount;
  time_point_sec complete;
};

/**
 * @breif a route to send withdrawn vesting shares.
 */
class withdraw_vesting_route_object
    : public object<withdraw_vesting_route_object_type,
                    withdraw_vesting_route_object> {
public:
  template <typename Constructor, typename Allocator>
  withdraw_vesting_route_object(Constructor &&c, allocator<Allocator> a) {
    c(*this);
  }

  withdraw_vesting_route_object() {}

  id_type id;

  account_name_type from_account;
  account_name_type to_account;
  uint16_t percent = 0;
  bool auto_vest = false;
};

class decline_voting_rights_request_object
    : public object<decline_voting_rights_request_object_type,
                    decline_voting_rights_request_object> {
public:
  template <typename Constructor, typename Allocator>
  decline_voting_rights_request_object(Constructor &&c,
                                       allocator<Allocator> a) {
    c(*this);
  }

  decline_voting_rights_request_object() {}

  id_type id;

  account_name_type account;
  time_point_sec effective_date;
};

class reward_fund_object
    : public object<reward_fund_object_type, reward_fund_object> {
public:
  template <typename Constructor, typename Allocator>
  reward_fund_object(Constructor &&c, allocator<Allocator> a) {
    c(*this);
  }

  reward_fund_object() {}

  reward_fund_id_type id;
  reward_fund_name_type name;
  asset reward_balance = asset(0, BLURT_SYMBOL);
  fc::uint128_t recent_claims = 0;
  time_point_sec last_update;
  uint128_t content_constant = 0;
  uint16_t percent_curation_rewards = 0;
  uint16_t percent_content_rewards = 0;
  protocol::curve_id author_reward_curve;
  protocol::curve_id curation_reward_curve;
};

struct by_withdraw_route;
struct by_destination;
typedef multi_index_container<
    withdraw_vesting_route_object,
    indexed_by<
        ordered_unique<tag<by_id>, member<withdraw_vesting_route_object,
                                          withdraw_vesting_route_id_type,
                                          &withdraw_vesting_route_object::id>>,
        ordered_unique<
            tag<by_withdraw_route>,
            composite_key<
                withdraw_vesting_route_object,
                member<withdraw_vesting_route_object, account_name_type,
                       &withdraw_vesting_route_object::from_account>,
                member<withdraw_vesting_route_object, account_name_type,
                       &withdraw_vesting_route_object::to_account>>,
            composite_key_compare<std::less<account_name_type>,
                                  std::less<account_name_type>>>,
        ordered_unique<
            tag<by_destination>,
            composite_key<
                withdraw_vesting_route_object,
                member<withdraw_vesting_route_object, account_name_type,
                       &withdraw_vesting_route_object::to_account>,
                member<withdraw_vesting_route_object,
                       withdraw_vesting_route_id_type,
                       &withdraw_vesting_route_object::id>>>>,
    allocator<withdraw_vesting_route_object>>
    withdraw_vesting_route_index;

struct by_from_id;
struct by_ratification_deadline;
typedef multi_index_container<
    escrow_object,
    indexed_by<
        ordered_unique<tag<by_id>, member<escrow_object, escrow_id_type,
                                          &escrow_object::id>>,
        ordered_unique<
            tag<by_from_id>,
            composite_key<
                escrow_object,
                member<escrow_object, account_name_type, &escrow_object::from>,
                member<escrow_object, uint32_t, &escrow_object::escrow_id>>>,
        ordered_unique<
            tag<by_ratification_deadline>,
            composite_key<
                escrow_object,
                const_mem_fun<escrow_object, bool, &escrow_object::is_approved>,
                member<escrow_object, time_point_sec,
                       &escrow_object::ratification_deadline>,
                member<escrow_object, escrow_id_type, &escrow_object::id>>,
            composite_key_compare<std::less<bool>, std::less<time_point_sec>,
                                  std::less<escrow_id_type>>>>,
    allocator<escrow_object>>
    escrow_index;

struct by_from_rid;
struct by_to_complete;
struct by_complete_from_rid;
typedef multi_index_container<
    savings_withdraw_object,
    indexed_by<
        ordered_unique<tag<by_id>,
                       member<savings_withdraw_object, savings_withdraw_id_type,
                              &savings_withdraw_object::id>>,
        ordered_unique<
            tag<by_from_rid>,
            composite_key<savings_withdraw_object,
                          member<savings_withdraw_object, account_name_type,
                                 &savings_withdraw_object::from>,
                          member<savings_withdraw_object, uint32_t,
                                 &savings_withdraw_object::request_id>>>,
        ordered_unique<
            tag<by_complete_from_rid>,
            composite_key<savings_withdraw_object,
                          member<savings_withdraw_object, time_point_sec,
                                 &savings_withdraw_object::complete>,
                          member<savings_withdraw_object, account_name_type,
                                 &savings_withdraw_object::from>,
                          member<savings_withdraw_object, uint32_t,
                                 &savings_withdraw_object::request_id>>>,
        ordered_unique<
            tag<by_to_complete>,
            composite_key<
                savings_withdraw_object,
                member<savings_withdraw_object, account_name_type,
                       &savings_withdraw_object::to>,
                member<savings_withdraw_object, time_point_sec,
                       &savings_withdraw_object::complete>,
                member<savings_withdraw_object, savings_withdraw_id_type,
                       &savings_withdraw_object::id>>>>,
    allocator<savings_withdraw_object>>
    savings_withdraw_index;

struct by_account;
struct by_effective_date;
typedef multi_index_container<
    decline_voting_rights_request_object,
    indexed_by<
        ordered_unique<tag<by_id>,
                       member<decline_voting_rights_request_object,
                              decline_voting_rights_request_id_type,
                              &decline_voting_rights_request_object::id>>,
        ordered_unique<
            tag<by_account>,
            member<decline_voting_rights_request_object, account_name_type,
                   &decline_voting_rights_request_object::account>>,
        ordered_unique<
            tag<by_effective_date>,
            composite_key<
                decline_voting_rights_request_object,
                member<decline_voting_rights_request_object, time_point_sec,
                       &decline_voting_rights_request_object::effective_date>,
                member<decline_voting_rights_request_object, account_name_type,
                       &decline_voting_rights_request_object::account>>,
            composite_key_compare<std::less<time_point_sec>,
                                  std::less<account_name_type>>>>,
    allocator<decline_voting_rights_request_object>>
    decline_voting_rights_request_index;

typedef multi_index_container<
    reward_fund_object,
    indexed_by<ordered_unique<tag<by_id>,
                              member<reward_fund_object, reward_fund_id_type,
                                     &reward_fund_object::id>>,
               ordered_unique<tag<by_name>,
                              member<reward_fund_object, reward_fund_name_type,
                                     &reward_fund_object::name>>>,
    allocator<reward_fund_object>>
    reward_fund_index;

} // namespace chain
} // namespace blurt

#ifdef ENABLE_MIRA
namespace mira {

template <>
struct is_static_length<blurt::chain::escrow_object> : public boost::true_type {
};
template <>
struct is_static_length<blurt::chain::withdraw_vesting_route_object>
    : public boost::true_type {};
template <>
struct is_static_length<blurt::chain::decline_voting_rights_request_object>
    : public boost::true_type {};
template <>
struct is_static_length<blurt::chain::reward_fund_object>
    : public boost::true_type {};

} // namespace mira
#endif

#include <blurt/chain/account_object.hpp>
#include <blurt/chain/comment_object.hpp>

FC_REFLECT(blurt::chain::withdraw_vesting_route_object,
           (id)(from_account)(to_account)(percent)(auto_vest))
CHAINBASE_SET_INDEX_TYPE(blurt::chain::withdraw_vesting_route_object,
                         blurt::chain::withdraw_vesting_route_index)

FC_REFLECT(blurt::chain::savings_withdraw_object,
           (id)(from)(to)(memo)(request_id)(amount)(complete))
CHAINBASE_SET_INDEX_TYPE(blurt::chain::savings_withdraw_object,
                         blurt::chain::savings_withdraw_index)

FC_REFLECT(
    blurt::chain::escrow_object,
    (id)(escrow_id)(from)(to)(agent)(ratification_deadline)(escrow_expiration)(
        blurt_balance)(pending_fee)(to_approved)(agent_approved)(disputed))
CHAINBASE_SET_INDEX_TYPE(blurt::chain::escrow_object,
                         blurt::chain::escrow_index)

FC_REFLECT(blurt::chain::decline_voting_rights_request_object,
           (id)(account)(effective_date))
CHAINBASE_SET_INDEX_TYPE(blurt::chain::decline_voting_rights_request_object,
                         blurt::chain::decline_voting_rights_request_index)

FC_REFLECT(
    blurt::chain::reward_fund_object,
    (id)(name)(reward_balance)(recent_claims)(last_update)(content_constant)(
        percent_curation_rewards)(percent_content_rewards)(author_reward_curve)(
        curation_reward_curve))
CHAINBASE_SET_INDEX_TYPE(blurt::chain::reward_fund_object,
                         blurt::chain::reward_fund_index)
