/*
 * Copyright (c) 2016 Steemit, Inc., and contributors.
 */
#pragma once
#include <blurt/protocol/hardfork.hpp>

// WARNING!
// Every symbol defined here needs to be handled appropriately in get_config.cpp
// This is checked by get_config_check.sh called from Dockerfile

// https://developers.steem.io/tutorials-recipes/understanding-configuration-values

#ifdef IS_TEST_NET
#define BLURT_BLOCKCHAIN_VERSION (version(0, 3, 0))

#define BLURT_INIT_PRIVATE_KEY                                                 \
  (fc::ecc::private_key::regenerate(fc::sha256::hash(std::string("init_"       \
                                                                 "key"))))
#define BLURT_INIT_PUBLIC_KEY_STR                                              \
  (std::string(blurt::protocol::public_key_type(                               \
      BLURT_INIT_PRIVATE_KEY.get_public_key())))
#define BLURT_CHAIN_ID (fc::sha256::hash("testnet"))
#define BLURT_ADDRESS_PREFIX "TST"

#define BLURT_GENESIS_TIME (fc::time_point_sec(1591025652))
#define BLURT_CASHOUT_WINDOW_SECONDS (60 * 60)          /// 1 hr
#define BLURT_MAX_CASHOUT_WINDOW_SECONDS (60 * 60 * 24) /// 1 day
#define BLURT_UPVOTE_LOCKOUT_SECONDS (60 * 5)           /// 5 minutes
#define BLURT_UPVOTE_LOCKOUT_HF17 (fc::minutes(5))

#define BLURT_MIN_ACCOUNT_CREATION_FEE 0
#define BLURT_MAX_ACCOUNT_CREATION_FEE int64_t(1000000000)

#define BLURT_OWNER_AUTH_RECOVERY_PERIOD fc::seconds(60)
#define BLURT_ACCOUNT_RECOVERY_REQUEST_EXPIRATION_PERIOD fc::seconds(12)
#define BLURT_OWNER_UPDATE_LIMIT fc::seconds(0)

#define BLURT_VOTE_DUST_THRESHOLD (0)

#define BLURT_INIT_MINER_NAME "initminer"

#else // IS LIVE BLURT NETWORK

#define BLURT_BLOCKCHAIN_VERSION (version(0, 2, 0))

#define BLURT_INIT_PUBLIC_KEY_STR                                              \
  "BLT5QRsKZp7TFNQdTj7VbpGHWxNL3Eq4zmfER4vJPBpK5VMbrprn8"
#define BLURT_CHAIN_ID                                                         \
  (fc::sha256::hash(                                                           \
      "blurt")) /// cd8d90f29ae273abec3eaa7731e25934c63eb654d55080caff2ebb7f5df6381f
#define BLURT_ADDRESS_PREFIX "BLT"

#define BLURT_GENESIS_TIME                                                     \
  (fc::time_point_sec(1593820800)) /// 2020-07-04T00:00:00.000Z
#define BLURT_CASHOUT_WINDOW_SECONDS (60 * 60 * 24 * 7)      /// 7 days
#define BLURT_MAX_CASHOUT_WINDOW_SECONDS (60 * 60 * 24 * 14) /// 2 weeks
#define BLURT_UPVOTE_LOCKOUT_SECONDS (60 * 60 * 12)          /// 12 hours
#define BLURT_UPVOTE_LOCKOUT_HF17 (fc::hours(12))

#define BLURT_MIN_ACCOUNT_CREATION_FEE 1
#define BLURT_MAX_ACCOUNT_CREATION_FEE int64_t(1000000000)

#define BLURT_OWNER_AUTH_RECOVERY_PERIOD fc::days(30)
#define BLURT_ACCOUNT_RECOVERY_REQUEST_EXPIRATION_PERIOD fc::days(1)
#define BLURT_OWNER_UPDATE_LIMIT fc::minutes(60)

#define BLURT_VOTE_DUST_THRESHOLD (50000000)

#define BLURT_INIT_MINER_NAME "initblurt"

#endif

#define BLURT_INIT_SUPPLY int64_t(388031775139)

#define VESTS_SYMBOL                                                           \
  (blurt::protocol::asset_symbol_type::from_asset_num(BLURT_ASSET_NUM_VESTS))
#define BLURT_SYMBOL                                                           \
  (blurt::protocol::asset_symbol_type::from_asset_num(BLURT_ASSET_NUM_BLURT))

#define BLURT_BLOCKCHAIN_HARDFORK_VERSION                                      \
  (hardfork_version(BLURT_BLOCKCHAIN_VERSION))

#define BLURT_100_PERCENT 10000
#define BLURT_1_PERCENT (BLURT_100_PERCENT / 100)

#define BLURT_BLOCK_INTERVAL 3
#define BLURT_BLOCKS_PER_YEAR (365 * 24 * 60 * 60 / BLURT_BLOCK_INTERVAL)
#define BLURT_BLOCKS_PER_DAY (24 * 60 * 60 / BLURT_BLOCK_INTERVAL)

#define BLURT_MAX_WITNESSES 21
#define BLURT_MAX_VOTED_WITNESSES_HF17 20
#define BLURT_MAX_RUNNER_WITNESSES_HF17 1

#define BLURT_HARDFORK_REQUIRED_WITNESSES                                      \
  17 // 17 of the 21 dpos witnesses (20 elected and 1 virtual time) required for
     // hardfork. This guarantees 75% participation on all subsequent rounds.
#define BLURT_MAX_TIME_UNTIL_EXPIRATION (60 * 60) // seconds,  aka: 1 hour
#define BLURT_MAX_MEMO_SIZE 2048
#define BLURT_MAX_PROXY_RECURSION_DEPTH 4
#define BLURT_VESTING_WITHDRAW_INTERVALS 13
#define BLURT_VESTING_WITHDRAW_INTERVAL_SECONDS                                \
  (60 * 60 * 24 * 7) /// 1 week per interval
#define BLURT_MAX_WITHDRAW_ROUTES 10
#define BLURT_SAVINGS_WITHDRAW_TIME (fc::days(3))
#define BLURT_SAVINGS_WITHDRAW_REQUEST_LIMIT 100
#define BLURT_VOTING_MANA_REGENERATION_SECONDS (5 * 60 * 60 * 24) // 5 day
#define BLURT_MAX_VOTE_CHANGES 5
#define BLURT_REVERSE_AUCTION_WINDOW_SECONDS_HF21 (60 * 5) /// 5 minutes
#define BLURT_MIN_VOTE_INTERVAL_SEC 3

#define BLURT_MIN_ROOT_COMMENT_INTERVAL (fc::seconds(60 * 5)) // 5 minutes
#define BLURT_MIN_REPLY_INTERVAL_HF20 (fc::seconds(3))        // 3 seconds
#define BLURT_MIN_COMMENT_EDIT_INTERVAL (fc::seconds(3))      // 3 seconds

#define BLURT_MAX_ACCOUNT_WITNESS_VOTES 30

#define BLURT_INFLATION_RATE_START_PERCENT                                     \
  (978)                                        // Fixes block 7,000,000 to 9.5%
#define BLURT_INFLATION_RATE_STOP_PERCENT (95) // 0.95%
#define BLURT_INFLATION_NARROWING_PERIOD                                       \
  (250000) // Narrow 0.01% every 250k blocks
#define BLURT_VESTING_FUND_PERCENT_HF16                                        \
  (15 * BLURT_1_PERCENT) // 15% of inflation, 1.425% inflation
#define BLURT_CONTENT_REWARD_PERCENT_HF21 (65 * BLURT_1_PERCENT)
#define BLURT_PROPOSAL_FUND_PERCENT_HF21 (10 * BLURT_1_PERCENT)

#define BLURT_HF21_CONVERGENT_LINEAR_RECENT_CLAIMS                             \
  (fc::uint128_t(0, 305178654659033363ull))
#define BLURT_CONTENT_CONSTANT_HF21 (fc::uint128_t(0, 2000000000000ull))

#define BLURT_BANDWIDTH_AVERAGE_WINDOW_SECONDS (60 * 60 * 24 * 7) ///< 1 week
#define BLURT_BANDWIDTH_PRECISION (uint64_t(1000000))             ///< 1 million
#define BLURT_MAX_COMMENT_DEPTH 0xffff                            // 64k
#define BLURT_SOFT_MAX_COMMENT_DEPTH 0xff                         // 255

#define BLURT_MIN_CONTENT_REWARD asset(1000, BLURT_SYMBOL)
#define BLURT_MIN_CURATE_REWARD asset(1000, BLURT_SYMBOL)
#define BLURT_MIN_PRODUCER_REWARD asset(1000, BLURT_SYMBOL)

#define BLURT_ACTIVE_CHALLENGE_FEE asset(2000, BLURT_SYMBOL)
#define BLURT_OWNER_CHALLENGE_FEE asset(30000, BLURT_SYMBOL)
#define BLURT_ACTIVE_CHALLENGE_COOLDOWN fc::days(1)
#define BLURT_OWNER_CHALLENGE_COOLDOWN fc::days(1)

#define BLURT_POST_REWARD_FUND_NAME ("post")
#define BLURT_RECENT_RSHARES_DECAY_TIME_HF19 (fc::days(15))
// note, if redefining these constants make sure calculate_claims doesn't
// overflow

// 5ccc e802 de5f
// int(expm1( log1p( 1 ) / BLOCKS_PER_YEAR ) *
// 2**BLURT_APR_PERCENT_SHIFT_PER_BLOCK / 100000 + 0.5) we use 100000 here
// instead of 10000 because we end up creating an additional 9x for vesting
#define BLURT_APR_PERCENT_MULTIPLY_PER_BLOCK                                   \
  ((uint64_t(0x5ccc) << 0x20) | (uint64_t(0xe802) << 0x10) | (uint64_t(0xde5f)))
// chosen to be the maximal value such that BLURT_APR_PERCENT_MULTIPLY_PER_BLOCK
// * 2**64 * 100000 < 2**128
#define BLURT_APR_PERCENT_SHIFT_PER_BLOCK 87

#define BLURT_APR_PERCENT_MULTIPLY_PER_ROUND                                   \
  ((uint64_t(0x79cc) << 0x20) | (uint64_t(0xf5c7) << 0x10) | (uint64_t(0x3480)))

#define BLURT_APR_PERCENT_SHIFT_PER_ROUND 83

// We have different constants for hourly rewards
// i.e. hex(int(math.expm1( math.log1p( 1 ) / HOURS_PER_YEAR ) *
// 2**BLURT_APR_PERCENT_SHIFT_PER_HOUR / 100000 + 0.5))
#define BLURT_APR_PERCENT_MULTIPLY_PER_HOUR                                    \
  ((uint64_t(0x6cc1) << 0x20) | (uint64_t(0x39a1) << 0x10) | (uint64_t(0x5cbd)))

// chosen to be the maximal value such that BLURT_APR_PERCENT_MULTIPLY_PER_HOUR
// * 2**64 * 100000 < 2**128
#define BLURT_APR_PERCENT_SHIFT_PER_HOUR 77

#define BLURT_MIN_PAYOUT (asset(20, BLURT_SYMBOL))

#define BLURT_MIN_ACCOUNT_NAME_LENGTH 3
#define BLURT_MAX_ACCOUNT_NAME_LENGTH 16

#define BLURT_MIN_PERMLINK_LENGTH 0
#define BLURT_MAX_PERMLINK_LENGTH 256
#define BLURT_MAX_WITNESS_URL_LENGTH 2048

#define BLURT_MAX_SHARE_SUPPLY int64_t(1000000000000000ll)
#define BLURT_MAX_SATOSHIS int64_t(4611686018427387903ll)
#define BLURT_MAX_SIG_CHECK_DEPTH 2
#define BLURT_MAX_SIG_CHECK_ACCOUNTS 125

#define BLURT_MIN_TRANSACTION_SIZE_LIMIT 1024
#define BLURT_SECONDS_PER_YEAR (uint64_t(60 * 60 * 24 * 365ll))

#define BLURT_MAX_TRANSACTION_SIZE (1024 * 64)
#define BLURT_MIN_BLOCK_SIZE_LIMIT (BLURT_MAX_TRANSACTION_SIZE)
#define BLURT_MAX_BLOCK_SIZE                                                   \
  (BLURT_MAX_TRANSACTION_SIZE * BLURT_BLOCK_INTERVAL * 2000)
#define BLURT_SOFT_MAX_BLOCK_SIZE (2 * 1024 * 1024)
#define BLURT_MIN_BLOCK_SIZE 115
#define BLURT_BLOCKS_PER_HOUR (60 * 60 / BLURT_BLOCK_INTERVAL)

#define BLURT_MIN_UNDO_HISTORY 10
#define BLURT_MAX_UNDO_HISTORY 10000

#define BLURT_MIN_TRANSACTION_EXPIRATION_LIMIT                                 \
  (BLURT_BLOCK_INTERVAL * 5) // 5 transactions per block
#define BLURT_BLOCKCHAIN_PRECISION uint64_t(1000)

#define BLURT_BLOCKCHAIN_PRECISION_DIGITS 3
#define BLURT_MAX_INSTANCE_ID (uint64_t(-1) >> 16)
/** NOTE: making this a power of 2 (say 2^15) would greatly accelerate fee calcs
 */
#define BLURT_MAX_AUTHORITY_MEMBERSHIP 40
#define BLURT_MAX_ASSET_WHITELIST_AUTHORITIES 10
#define BLURT_MAX_URL_LENGTH 127

#define BLURT_IRREVERSIBLE_THRESHOLD (75 * BLURT_1_PERCENT)

#define BLURT_VIRTUAL_SCHEDULE_LAP_LENGTH2 (fc::uint128::max_value())

#define BLURT_REDUCED_VOTE_POWER_RATE (10)

#define BLURT_DELEGATION_RETURN_PERIOD_HF20                                    \
  (BLURT_VOTING_MANA_REGENERATION_SECONDS)

#define BLURT_RD_MIN_DECAY_BITS 6
#define BLURT_RD_MAX_DECAY_BITS 32
#define BLURT_RD_DECAY_DENOM_SHIFT 36
#define BLURT_RD_MAX_POOL_BITS 64
#define BLURT_RD_MAX_BUDGET_1                                                  \
  ((uint64_t(1) << (BLURT_RD_MAX_POOL_BITS + BLURT_RD_MIN_DECAY_BITS -         \
                    BLURT_RD_DECAY_DENOM_SHIFT)) -                             \
   1)
#define BLURT_RD_MAX_BUDGET_2                                                  \
  ((uint64_t(1) << (64 - BLURT_RD_DECAY_DENOM_SHIFT)) - 1)
#define BLURT_RD_MAX_BUDGET_3 (uint64_t(std::numeric_limits<int32_t>::max()))
#define BLURT_RD_MAX_BUDGET                                                    \
  (int32_t(std::min(                                                           \
      {BLURT_RD_MAX_BUDGET_1, BLURT_RD_MAX_BUDGET_2, BLURT_RD_MAX_BUDGET_3})))
#define BLURT_RD_MIN_DECAY (uint32_t(1) << BLURT_RD_MIN_DECAY_BITS)
#define BLURT_RD_MIN_BUDGET 1
#define BLURT_RD_MAX_DECAY (uint32_t(0xFFFFFFFF))

#define BLURT_ACCOUNT_SUBSIDY_PRECISION (BLURT_100_PERCENT)

// We want the global subsidy to run out first in normal (Poisson)
// conditions, so we boost the per-witness subsidy a little.
#define BLURT_WITNESS_SUBSIDY_BUDGET_PERCENT (125 * BLURT_1_PERCENT)

// Since witness decay only procs once per round, multiplying the decay
// constant by the number of witnesses means the per-witness pools have
// the same effective decay rate in real-time terms.
#define BLURT_WITNESS_SUBSIDY_DECAY_PERCENT                                    \
  (BLURT_MAX_WITNESSES * BLURT_100_PERCENT)

// 347321 corresponds to a 5-day halflife
#define BLURT_DEFAULT_ACCOUNT_SUBSIDY_DECAY (347321)
// Default rate is 0.5 accounts per block
#define BLURT_DEFAULT_ACCOUNT_SUBSIDY_BUDGET (797)
#define BLURT_DECAY_BACKSTOP_PERCENT (90 * BLURT_1_PERCENT)

#define BLURT_BLOCK_GENERATION_POSTPONED_TX_LIMIT 5
#define BLURT_PENDING_TRANSACTION_EXECUTION_LIMIT fc::milliseconds(200)

#define BLURT_CUSTOM_OP_ID_MAX_LENGTH (32)
#define BLURT_CUSTOM_OP_DATA_MAX_LENGTH (8192)
#define BLURT_BENEFICIARY_LIMIT (128)
#define BLURT_COMMENT_TITLE_LIMIT (256)

/**
 *  Reserved Account IDs with special meaning
 */
///@{
/// Represents the current witnesses
#define BLURT_MINER_ACCOUNT "miners"
/// Represents the canonical account with NO authority (nobody can access funds
/// in null account)
#define BLURT_NULL_ACCOUNT "null"
/// Represents the canonical account with WILDCARD authority (anybody can access
/// funds in temp account)
#define BLURT_TEMP_ACCOUNT "temp"
/// Represents the canonical account for specifying you will vote for directly
/// (as opposed to a proxy)
#define BLURT_PROXY_TO_SELF_ACCOUNT ""
/// Represents the canonical root post parent account
#define BLURT_ROOT_POST_PARENT (account_name_type())
/// Represents the account with NO authority which holds resources for payouts
/// according to given proposals
#define BLURT_TREASURY_ACCOUNT "blurt.dao"
/// This regent account is given vote weight to choose witnesses for the first
/// two years, and loses weight each month for those two year
#define BLURT_REGENT_ACCOUNT "blurt.regent"
///@}

/// BLURT PROPOSAL SYSTEM support

#define BLURT_TREASURY_FEE (10 * BLURT_BLOCKCHAIN_PRECISION)
#define BLURT_PROPOSAL_MAINTENANCE_PERIOD 3600
#define BLURT_PROPOSAL_MAINTENANCE_CLEANUP (60 * 60 * 24 * 1) /// 1 day
#define BLURT_PROPOSAL_SUBJECT_MAX_LENGTH 80
/// Max number of IDs passed at once to the update_proposal_voter_operation or
/// remove_proposal_operation.
#define BLURT_PROPOSAL_MAX_IDS_NUMBER 5

#define BLURT_INIT_POST_REWARD_BALANCE int64_t(923210316)