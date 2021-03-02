#pragma once

#include <blurt/protocol/blurt_operations.hpp>

#include <blurt/chain/evaluator.hpp>

namespace blurt { namespace chain {

using namespace blurt::protocol;

BLURT_DEFINE_EVALUATOR( account_create )
BLURT_DEFINE_EVALUATOR( account_update )
BLURT_DEFINE_EVALUATOR( transfer )
BLURT_DEFINE_EVALUATOR( transfer_to_vesting )
BLURT_DEFINE_EVALUATOR( witness_update )
BLURT_DEFINE_EVALUATOR( account_witness_vote )
BLURT_DEFINE_EVALUATOR( account_witness_weight_vote )
BLURT_DEFINE_EVALUATOR( account_witness_proxy )
BLURT_DEFINE_EVALUATOR( withdraw_vesting )
BLURT_DEFINE_EVALUATOR( set_withdraw_vesting_route )
BLURT_DEFINE_EVALUATOR( comment )
BLURT_DEFINE_EVALUATOR( comment_options )
BLURT_DEFINE_EVALUATOR( delete_comment )
BLURT_DEFINE_EVALUATOR( vote )
BLURT_DEFINE_EVALUATOR( custom )
BLURT_DEFINE_EVALUATOR( custom_json )
BLURT_DEFINE_EVALUATOR( custom_binary )
BLURT_DEFINE_EVALUATOR( escrow_transfer )
BLURT_DEFINE_EVALUATOR( escrow_approve )
BLURT_DEFINE_EVALUATOR( escrow_dispute )
BLURT_DEFINE_EVALUATOR( escrow_release )
BLURT_DEFINE_EVALUATOR( claim_account )
BLURT_DEFINE_EVALUATOR( create_claimed_account )
BLURT_DEFINE_EVALUATOR( request_account_recovery )
BLURT_DEFINE_EVALUATOR( recover_account )
BLURT_DEFINE_EVALUATOR( change_recovery_account )
BLURT_DEFINE_EVALUATOR( transfer_to_savings )
BLURT_DEFINE_EVALUATOR( transfer_from_savings )
BLURT_DEFINE_EVALUATOR( cancel_transfer_from_savings )
BLURT_DEFINE_EVALUATOR( decline_voting_rights )
BLURT_DEFINE_EVALUATOR( reset_account )
BLURT_DEFINE_EVALUATOR( set_reset_account )
BLURT_DEFINE_EVALUATOR( claim_reward_balance )
BLURT_DEFINE_EVALUATOR( delegate_vesting_shares )
BLURT_DEFINE_EVALUATOR( witness_set_properties )
BLURT_DEFINE_EVALUATOR( create_proposal )
BLURT_DEFINE_EVALUATOR( update_proposal_votes )
BLURT_DEFINE_EVALUATOR( remove_proposal )
BLURT_DEFINE_EVALUATOR( moderator_update )
BLURT_DEFINE_EVALUATOR( moderator_resign )
BLURT_DEFINE_EVALUATOR( account_moderator_weight_vote )
BLURT_DEFINE_EVALUATOR( account_moderator_proxy )
BLURT_DEFINE_EVALUATOR( moderator_complaint )

} } // blurt::chain
