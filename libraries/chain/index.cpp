
#include <blurt/chain/blurt_object_types.hpp>

#include <blurt/chain/index.hpp>

#include <blurt/chain/block_summary_object.hpp>
#include <blurt/chain/blurt_objects.hpp>
#include <blurt/chain/history_object.hpp>
#include <blurt/chain/sps_objects.hpp>
#include <blurt/chain/transaction_object.hpp>
#include <blurt/chain/witness_schedule.hpp>

namespace blurt {
namespace chain {

void initialize_core_indexes(database &db) {
  BLURT_ADD_CORE_INDEX(db, dynamic_global_property_index);
  BLURT_ADD_CORE_INDEX(db, account_index);
  BLURT_ADD_CORE_INDEX(db, account_metadata_index);
  BLURT_ADD_CORE_INDEX(db, account_authority_index);
  BLURT_ADD_CORE_INDEX(db, witness_index);
  BLURT_ADD_CORE_INDEX(db, transaction_index);
  BLURT_ADD_CORE_INDEX(db, block_summary_index);
  BLURT_ADD_CORE_INDEX(db, witness_schedule_index);
  BLURT_ADD_CORE_INDEX(db, comment_index);
  BLURT_ADD_CORE_INDEX(db, comment_content_index);
  BLURT_ADD_CORE_INDEX(db, comment_vote_index);
  BLURT_ADD_CORE_INDEX(db, witness_vote_index);
  BLURT_ADD_CORE_INDEX(db, operation_index);
  BLURT_ADD_CORE_INDEX(db, account_history_index);
  BLURT_ADD_CORE_INDEX(db, hardfork_property_index);
  BLURT_ADD_CORE_INDEX(db, withdraw_vesting_route_index);
  BLURT_ADD_CORE_INDEX(db, owner_authority_history_index);
  BLURT_ADD_CORE_INDEX(db, account_recovery_request_index);
  BLURT_ADD_CORE_INDEX(db, change_recovery_account_request_index);
  BLURT_ADD_CORE_INDEX(db, escrow_index);
  BLURT_ADD_CORE_INDEX(db, savings_withdraw_index);
  BLURT_ADD_CORE_INDEX(db, decline_voting_rights_request_index);
  BLURT_ADD_CORE_INDEX(db, reward_fund_index);
  BLURT_ADD_CORE_INDEX(db, vesting_delegation_index);
  BLURT_ADD_CORE_INDEX(db, vesting_delegation_expiration_index);
  BLURT_ADD_CORE_INDEX(db, proposal_index);
  BLURT_ADD_CORE_INDEX(db, proposal_vote_index);
}

index_info::index_info() {}
index_info::~index_info() {}

} // namespace chain
} // namespace blurt
