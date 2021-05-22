#pragma once
#include <blurt/chain/blurt_fwd.hpp>

#include <blurt/protocol/operations.hpp>
#include <blurt/protocol/sps_operations.hpp>

#include <blurt/chain/witness_objects.hpp>

#include <blurt/plugins/condenser_api/condenser_api_legacy_asset.hpp>

namespace blurt { namespace plugins { namespace condenser_api {

   template< typename T >
   struct convert_to_legacy_static_variant
   {
      convert_to_legacy_static_variant( T& l_sv ) :
         legacy_sv( l_sv ) {}

      T& legacy_sv;

      typedef void result_type;

      template< typename V >
      void operator()( const V& v ) const
      {
         legacy_sv = v;
      }
   };

   typedef static_variant<
            protocol::comment_payout_beneficiaries,
            protocol::comment_payout_blurt
         > legacy_comment_options_extensions;

   typedef vector< legacy_comment_options_extensions > legacy_comment_options_extensions_type;

   using namespace blurt::protocol;

   typedef account_update_operation               legacy_account_update_operation;
   typedef comment_operation                      legacy_comment_operation;
   typedef create_claimed_account_operation       legacy_create_claimed_account_operation;
   typedef delete_comment_operation               legacy_delete_comment_operation;
   typedef vote_operation                         legacy_vote_operation;
   typedef escrow_approve_operation               legacy_escrow_approve_operation;
   typedef escrow_dispute_operation               legacy_escrow_dispute_operation;
   typedef set_withdraw_vesting_route_operation   legacy_set_withdraw_vesting_route_operation;
   typedef witness_set_properties_operation       legacy_witness_set_properties_operation;
   typedef account_witness_vote_operation         legacy_account_witness_vote_operation;
   typedef account_witness_proxy_operation        legacy_account_witness_proxy_operation;
   typedef custom_operation                       legacy_custom_operation;
   typedef custom_json_operation                  legacy_custom_json_operation;
   typedef custom_binary_operation                legacy_custom_binary_operation;
   typedef request_account_recovery_operation     legacy_request_account_recovery_operation;
   typedef recover_account_operation              legacy_recover_account_operation;
   typedef reset_account_operation                legacy_reset_account_operation;
   typedef set_reset_account_operation            legacy_set_reset_account_operation;
   typedef change_recovery_account_operation      legacy_change_recovery_account_operation;
   typedef cancel_transfer_from_savings_operation legacy_cancel_transfer_from_savings_operation;
   typedef decline_voting_rights_operation        legacy_decline_voting_rights_operation;
   typedef shutdown_witness_operation             legacy_shutdown_witness_operation;
   typedef hardfork_operation                     legacy_hardfork_operation;
   typedef comment_payout_update_operation        legacy_comment_payout_update_operation;
   typedef update_proposal_votes_operation        legacy_update_proposal_votes_operation;
   typedef remove_proposal_operation              legacy_remove_proposal_operation;
   typedef clear_null_account_balance_operation   legacy_clear_null_account_balance_operation;

   struct legacy_price
   {
      legacy_price() {}
      legacy_price( const protocol::price& p ) :
         base( legacy_asset::from_asset( p.base ) ),
         quote( legacy_asset::from_asset( p.quote ) )
      {}

      operator price()const { return price( base, quote ); }

      legacy_asset base;
      legacy_asset quote;
   };

   struct api_chain_properties
   {
      api_chain_properties() {}
      api_chain_properties( const chain::chain_properties& c ) :
         account_creation_fee( legacy_asset::from_asset( c.account_creation_fee ) ),
         maximum_block_size( c.maximum_block_size ),
         account_subsidy_budget( c.account_subsidy_budget ),
         account_subsidy_decay( c.account_subsidy_decay ),
         operation_flat_fee( legacy_asset::from_asset( c.operation_flat_fee ) ),
         bandwidth_kbytes_fee( legacy_asset::from_asset( c.bandwidth_kbytes_fee ) )
      {}

      operator legacy_chain_properties() const
      {
         legacy_chain_properties props;
         props.account_creation_fee = legacy_blurt_asset::from_asset( asset( account_creation_fee ) );
         props.maximum_block_size = maximum_block_size;
         return props;
      }

      legacy_asset   account_creation_fee;
      uint32_t       maximum_block_size = BLURT_MIN_BLOCK_SIZE_LIMIT * 2;
      int32_t        account_subsidy_budget = BLURT_DEFAULT_ACCOUNT_SUBSIDY_BUDGET;
      uint32_t       account_subsidy_decay = BLURT_DEFAULT_ACCOUNT_SUBSIDY_DECAY;
      legacy_asset   operation_flat_fee = legacy_asset::from_asset( asset( 50, BLURT_SYMBOL ) );
      legacy_asset   bandwidth_kbytes_fee = legacy_asset::from_asset( asset( 10, BLURT_SYMBOL ) );
   };

   struct legacy_account_create_operation
   {
      legacy_account_create_operation() {}
      legacy_account_create_operation( const account_create_operation& op ) :
         fee( legacy_asset::from_asset( op.fee ) ),
         creator( op.creator ),
         new_account_name( op.new_account_name ),
         owner( op.owner ),
         active( op.active ),
         posting( op.posting ),
         memo_key( op.memo_key ),
         json_metadata( op.json_metadata )
      {}

      operator account_create_operation()const
      {
         account_create_operation op;
         op.fee = fee;
         op.creator = creator;
         op.new_account_name = new_account_name;
         op.owner = owner;
         op.active = active;
         op.posting = posting;
         op.memo_key = memo_key;
         op.json_metadata = json_metadata;
         return op;
      }

      legacy_asset      fee;
      account_name_type creator;
      account_name_type new_account_name;
      authority         owner;
      authority         active;
      authority         posting;
      public_key_type   memo_key;
      string            json_metadata;
   };

   struct legacy_comment_options_operation
   {
      legacy_comment_options_operation() {}
      legacy_comment_options_operation( const comment_options_operation& op ) :
         author( op.author ),
         permlink( op.permlink ),
         max_accepted_payout( legacy_asset::from_asset( op.max_accepted_payout ) ),
         allow_votes( op.allow_votes ),
         allow_curation_rewards( op.allow_curation_rewards )
      {
         for( const auto& e : op.extensions )
         {
            legacy_comment_options_extensions ext;
            e.visit( convert_to_legacy_static_variant< legacy_comment_options_extensions >( ext ) );
            extensions.push_back( e );
         }
      }

      operator comment_options_operation()const
      {
         comment_options_operation op;
         op.author = author;
         op.permlink = permlink;
         op.max_accepted_payout = max_accepted_payout;
         op.allow_curation_rewards = allow_curation_rewards;
         op.extensions.insert( extensions.begin(), extensions.end() );
         return op;
      }

      account_name_type author;
      string            permlink;

      legacy_asset      max_accepted_payout;
      bool              allow_votes;
      bool              allow_curation_rewards;
      legacy_comment_options_extensions_type extensions;
   };


   struct legacy_transfer_operation
   {
      legacy_transfer_operation() {}
      legacy_transfer_operation( const transfer_operation& op ) :
         from( op.from ),
         to( op.to ),
         amount( legacy_asset::from_asset( op.amount ) ),
         memo( op.memo )
      {}

      operator transfer_operation()const
      {
         transfer_operation op;
         op.from = from;
         op.to = to;
         op.amount = amount;
         op.memo = memo;
         return op;
      }

      account_name_type from;
      account_name_type to;
      legacy_asset      amount;
      string            memo;
   };

   struct legacy_escrow_transfer_operation
   {
      legacy_escrow_transfer_operation() {}
      legacy_escrow_transfer_operation( const escrow_transfer_operation& op ) :
         from( op.from ),
         to( op.to ),
         agent( op.agent ),
         escrow_id( op.escrow_id ),
         blurt_amount( legacy_asset::from_asset( op.blurt_amount ) ),
         fee( legacy_asset::from_asset( op.fee ) ),
         ratification_deadline( op.ratification_deadline ),
         escrow_expiration( op.escrow_expiration ),
         json_meta( op.json_meta )
      {}

      operator escrow_transfer_operation()const
      {
         escrow_transfer_operation op;
         op.from = from;
         op.to = to;
         op.agent = agent;
         op.escrow_id = escrow_id;
         op.blurt_amount = blurt_amount;
         op.fee = fee;
         op.ratification_deadline = ratification_deadline;
         op.escrow_expiration = escrow_expiration;
         op.json_meta = json_meta;
         return op;
      }

      account_name_type from;
      account_name_type to;
      account_name_type agent;
      uint32_t          escrow_id;

      legacy_asset      blurt_amount;
      legacy_asset      fee;

      time_point_sec    ratification_deadline;
      time_point_sec    escrow_expiration;

      string            json_meta;
   };

   struct legacy_escrow_release_operation
   {
      legacy_escrow_release_operation() {}
      legacy_escrow_release_operation( const escrow_release_operation& op ) :
         from( op.from ),
         to( op.to ),
         agent( op.agent ),
         who( op.who ),
         receiver( op.receiver ),
         escrow_id( op.escrow_id ),
         blurt_amount( legacy_asset::from_asset( op.blurt_amount ) )
      {}

      operator escrow_release_operation()const
      {
         escrow_release_operation op;
         op.from = from;
         op.to = to;
         op.agent = agent;
         op.who = who;
         op.receiver = receiver;
         op.escrow_id = escrow_id;
         op.blurt_amount = blurt_amount;
         return op;
      }

      account_name_type from;
      account_name_type to;
      account_name_type agent;
      account_name_type who;
      account_name_type receiver;

      uint32_t          escrow_id;
      legacy_asset      blurt_amount;
   };

   struct legacy_transfer_to_vesting_operation
   {
      legacy_transfer_to_vesting_operation() {}
      legacy_transfer_to_vesting_operation( const transfer_to_vesting_operation& op ) :
         from( op.from ),
         to( op.to ),
         amount( legacy_asset::from_asset( op.amount ) )
      {}

      operator transfer_to_vesting_operation()const
      {
         transfer_to_vesting_operation op;
         op.from = from;
         op.to = to;
         op.amount = amount;
         return op;
      }

      account_name_type from;
      account_name_type to;
      legacy_asset      amount;
   };

   struct legacy_create_proposal_operation
   {
      legacy_create_proposal_operation() {}
      legacy_create_proposal_operation( const create_proposal_operation& op ) :
         creator( op.creator ),
         receiver( op.receiver ),
         start_date( op.start_date ),
         end_date( op.end_date ),
         daily_pay( legacy_asset::from_asset( op.daily_pay ) ),
         subject( op.subject ),
         permlink( op.permlink)
      {}

      operator create_proposal_operation()const
      {
         create_proposal_operation op;
         op.creator = creator;
         op.receiver = receiver;
         op.start_date = start_date;
         op.end_date = end_date;
         op.daily_pay = daily_pay;
         op.subject = subject;
         op.permlink = permlink;
         return op;
      }

      account_name_type creator;
      account_name_type receiver;
      time_point_sec start_date;
      time_point_sec end_date;
      legacy_asset daily_pay;
      string subject;
      string permlink;
   };

   struct legacy_withdraw_vesting_operation
   {
      legacy_withdraw_vesting_operation() {}
      legacy_withdraw_vesting_operation( const withdraw_vesting_operation& op ) :
         account( op.account ),
         vesting_shares( legacy_asset::from_asset( op.vesting_shares) )
      {}

      operator withdraw_vesting_operation()const
      {
         withdraw_vesting_operation op;
         op.account = account;
         op.vesting_shares = vesting_shares;
         return op;
      }

      account_name_type account;
      legacy_asset      vesting_shares;
   };

   struct legacy_witness_update_operation
   {
      legacy_witness_update_operation() {}
      legacy_witness_update_operation( const witness_update_operation& op ) :
         owner( op.owner ),
         url( op.url ),
         block_signing_key( op.block_signing_key ),
         fee( legacy_asset::from_asset( op.fee ) )
      {
         props.account_creation_fee = legacy_asset::from_asset( op.props.account_creation_fee.to_asset< false >() );
         props.maximum_block_size = op.props.maximum_block_size;
      }

      operator witness_update_operation()const
      {
         witness_update_operation op;
         op.owner = owner;
         op.url = url;
         op.block_signing_key = block_signing_key;
         op.props.account_creation_fee = legacy_blurt_asset::from_asset( asset( props.account_creation_fee ) );
         op.props.maximum_block_size = props.maximum_block_size;
         op.fee = fee;
         return op;
      }

      account_name_type       owner;
      string                  url;
      public_key_type         block_signing_key;
      api_chain_properties    props;
      legacy_asset            fee;
   };

   struct legacy_transfer_to_savings_operation
   {
      legacy_transfer_to_savings_operation() {}
      legacy_transfer_to_savings_operation( const transfer_to_savings_operation& op ) :
         from( op.from ),
         to( op.to ),
         amount( legacy_asset::from_asset( op.amount ) ),
         memo( op.memo )
      {}

      operator transfer_to_savings_operation()const
      {
         transfer_to_savings_operation op;
         op.from = from;
         op.to = to;
         op.amount = amount;
         op.memo = memo;
         return op;
      }

      account_name_type from;
      account_name_type to;
      legacy_asset      amount;
      string            memo;
   };

   struct legacy_transfer_from_savings_operation
   {
      legacy_transfer_from_savings_operation() {}
      legacy_transfer_from_savings_operation( const transfer_from_savings_operation& op ) :
         from( op.from ),
         request_id( op.request_id ),
         to( op.to ),
         amount( legacy_asset::from_asset( op.amount ) ),
         memo( op.memo )
      {}

      operator transfer_from_savings_operation()const
      {
         transfer_from_savings_operation op;
         op.from = from;
         op.request_id = request_id;
         op.to = to;
         op.amount = amount;
         op.memo = memo;
         return op;
      }

      account_name_type from;
      uint32_t          request_id;
      account_name_type to;
      legacy_asset      amount;
      string            memo;
   };

   struct legacy_claim_reward_balance_operation
   {
      legacy_claim_reward_balance_operation() {}
      legacy_claim_reward_balance_operation( const claim_reward_balance_operation& op ) :
         account( op.account ),
         reward_blurt( legacy_asset::from_asset( op.reward_blurt ) ),
         reward_vests( legacy_asset::from_asset( op.reward_vests ) )
      {}

      operator claim_reward_balance_operation()const
      {
         claim_reward_balance_operation op;
         op.account = account;
         op.reward_blurt = reward_blurt;
         op.reward_vests = reward_vests;
         return op;
      }

      account_name_type account;
      legacy_asset      reward_blurt;
      legacy_asset      reward_vests;
   };

   struct legacy_delegate_vesting_shares_operation
   {
      legacy_delegate_vesting_shares_operation() {}
      legacy_delegate_vesting_shares_operation( const delegate_vesting_shares_operation& op ) :
         delegator( op.delegator ),
         delegatee( op.delegatee ),
         vesting_shares( legacy_asset::from_asset( op.vesting_shares ) )
      {}

      operator delegate_vesting_shares_operation()const
      {
         delegate_vesting_shares_operation op;
         op.delegator = delegator;
         op.delegatee = delegatee;
         op.vesting_shares = vesting_shares;
         return op;
      }

      account_name_type delegator;
      account_name_type delegatee;
      legacy_asset      vesting_shares;
   };

   struct legacy_author_reward_operation
   {
      legacy_author_reward_operation() {}
      legacy_author_reward_operation( const author_reward_operation& op ) :
         author( op.author ),
         permlink( op.permlink ),
         blurt_payout( legacy_asset::from_asset( op.blurt_payout ) ),
         vesting_payout( legacy_asset::from_asset( op.vesting_payout ) )
      {}

      operator author_reward_operation()const
      {
         author_reward_operation op;
         op.author = author;
         op.permlink = permlink;
         op.blurt_payout = blurt_payout;
         op.vesting_payout = vesting_payout;
         return op;
      }

      account_name_type author;
      string            permlink;
      legacy_asset      blurt_payout;
      legacy_asset      vesting_payout;
   };

   struct legacy_curation_reward_operation
   {
      legacy_curation_reward_operation() {}
      legacy_curation_reward_operation( const curation_reward_operation& op ) :
         curator( op.curator ),
         reward( legacy_asset::from_asset( op.reward ) ),
         comment_author( op.comment_author ),
         comment_permlink( op.comment_permlink )
      {}

      operator curation_reward_operation()const
      {
         curation_reward_operation op;
         op.curator = curator;
         op.reward = reward;
         op.comment_author = comment_author;
         op.comment_permlink = comment_permlink;
         return op;
      }

      account_name_type curator;
      legacy_asset      reward;
      account_name_type comment_author;
      string            comment_permlink;
   };

   struct legacy_comment_reward_operation
   {
      legacy_comment_reward_operation() {}
      legacy_comment_reward_operation( const comment_reward_operation& op ) :
         author( op.author ),
         permlink( op.permlink ),
         payout( legacy_asset::from_asset( op.payout ) )
      {}

      operator comment_reward_operation()const
      {
         comment_reward_operation op;
         op.author = author;
         op.permlink = permlink;
         op.payout = payout;
         return op;
      }

      account_name_type author;
      string            permlink;
      legacy_asset      payout;
   };

   struct legacy_fill_vesting_withdraw_operation
   {
      legacy_fill_vesting_withdraw_operation() {}
      legacy_fill_vesting_withdraw_operation( const fill_vesting_withdraw_operation& op ) :
         from_account( op.from_account ),
         to_account( op.to_account ),
         withdrawn( legacy_asset::from_asset( op.withdrawn ) ),
         deposited( legacy_asset::from_asset( op.deposited ) )
      {}

      operator fill_vesting_withdraw_operation()const
      {
         fill_vesting_withdraw_operation op;
         op.from_account = from_account;
         op.to_account = to_account;
         op.withdrawn = withdrawn;
         op.deposited = deposited;
         return op;
      }

      account_name_type from_account;
      account_name_type to_account;
      legacy_asset      withdrawn;
      legacy_asset      deposited;
   };

   struct legacy_fill_transfer_from_savings_operation
   {
      legacy_fill_transfer_from_savings_operation() {}
      legacy_fill_transfer_from_savings_operation( const fill_transfer_from_savings_operation& op ) :
         from( op.from ),
         to( op.to ),
         amount( legacy_asset::from_asset( op.amount ) ),
         request_id( op.request_id ),
         memo( op.memo )
      {}

      operator fill_transfer_from_savings_operation()const
      {
         fill_transfer_from_savings_operation op;
         op.from = from;
         op.to = to;
         op.amount = amount;
         op.request_id = request_id;
         op.memo = memo;
         return op;
      }

      account_name_type from;
      account_name_type to;
      legacy_asset      amount;
      uint32_t          request_id = 0;
      string            memo;
   };

   struct legacy_return_vesting_delegation_operation
   {
      legacy_return_vesting_delegation_operation() {}
      legacy_return_vesting_delegation_operation( const return_vesting_delegation_operation& op ) :
         account( op.account ),
         vesting_shares( legacy_asset::from_asset( op.vesting_shares ) )
      {}

      operator return_vesting_delegation_operation()const
      {
         return_vesting_delegation_operation op;
         op.account = account;
         op.vesting_shares = vesting_shares;
         return op;
      }

      account_name_type account;
      legacy_asset      vesting_shares;
   };

   struct legacy_comment_benefactor_reward_operation
   {
      legacy_comment_benefactor_reward_operation() {}
      legacy_comment_benefactor_reward_operation( const comment_benefactor_reward_operation& op ) :
         benefactor( op.benefactor ),
         author( op.author ),
         permlink( op.permlink ),
         blurt_payout( legacy_asset::from_asset( op.blurt_payout ) ),
         vesting_payout( legacy_asset::from_asset( op.vesting_payout ) )
      {}

      operator comment_benefactor_reward_operation()const
      {
         comment_benefactor_reward_operation op;
         op.benefactor = benefactor;
         op.author = author;
         op.permlink = permlink;
         op.blurt_payout = blurt_payout;
         op.vesting_payout = vesting_payout;
         return op;
      }

      account_name_type benefactor;
      account_name_type author;
      string            permlink;
      legacy_asset      blurt_payout;
      legacy_asset      vesting_payout;
   };

   struct legacy_producer_reward_operation
   {
      legacy_producer_reward_operation() {}
      legacy_producer_reward_operation( const producer_reward_operation& op ) :
         producer( op.producer ),
         vesting_shares( legacy_asset::from_asset( op.vesting_shares ) )
      {}

      operator producer_reward_operation()const
      {
         producer_reward_operation op;
         op.producer = producer;
         op.vesting_shares = vesting_shares;
         return op;
      }

      account_name_type producer;
      legacy_asset      vesting_shares;
   };

   struct legacy_claim_account_operation
   {
      legacy_claim_account_operation() {}
      legacy_claim_account_operation( const claim_account_operation& op ) :
         creator( op.creator ),
         fee( legacy_asset::from_asset( op.fee ) )
      {
         extensions.insert( op.extensions.begin(), op.extensions.end() );
      }

      operator claim_account_operation()const
      {
         claim_account_operation op;
         op.creator = creator;
         op.fee = fee;
         op.extensions.insert( extensions.begin(), extensions.end() );
         return op;
      }

      account_name_type creator;
      legacy_asset      fee;
      extensions_type   extensions;
   };

   struct legacy_proposal_pay_operation
   {
      legacy_proposal_pay_operation() {}
      legacy_proposal_pay_operation( const proposal_pay_operation& op ) :
         receiver( op.receiver ),
         payment( legacy_asset::from_asset( op.payment ) ),
         trx_id( op.trx_id ),
         op_in_trx( op.op_in_trx )
      {}

      operator proposal_pay_operation()const
      {
         proposal_pay_operation op;
         op.receiver = receiver;
         op.payment = payment;
         op.trx_id = trx_id;
         op.op_in_trx = op_in_trx;
         return op;
      }

      account_name_type    receiver;
      legacy_asset         payment;
      transaction_id_type  trx_id;
      uint16_t             op_in_trx = 0;
   };

   struct legacy_sps_fund_operation
   {
      legacy_sps_fund_operation() {}
      legacy_sps_fund_operation( const sps_fund_operation& op ) :
         additional_funds( legacy_asset::from_asset( op.additional_funds ) )
      {}

      operator sps_fund_operation()const
      {
         sps_fund_operation op;
         op.additional_funds = additional_funds;
         return op;
      }

      legacy_asset additional_funds;
   };

   typedef fc::static_variant<
            legacy_vote_operation,
            legacy_comment_operation,
            legacy_transfer_operation,
            legacy_transfer_to_vesting_operation,
            legacy_withdraw_vesting_operation,
            legacy_account_create_operation,
            legacy_witness_update_operation,
            legacy_account_witness_vote_operation,
            legacy_account_witness_proxy_operation,
            legacy_custom_operation,
            legacy_delete_comment_operation,
            legacy_custom_json_operation,
            legacy_comment_options_operation,
            legacy_set_withdraw_vesting_route_operation,
            legacy_claim_account_operation,
            legacy_create_claimed_account_operation,
            legacy_request_account_recovery_operation,
            legacy_recover_account_operation,
            legacy_change_recovery_account_operation,
            legacy_escrow_transfer_operation,
            legacy_escrow_dispute_operation,
            legacy_escrow_release_operation,
            legacy_escrow_approve_operation,
            legacy_transfer_to_savings_operation,
            legacy_transfer_from_savings_operation,
            legacy_cancel_transfer_from_savings_operation,
            legacy_custom_binary_operation,
            legacy_decline_voting_rights_operation,
            legacy_reset_account_operation,
            legacy_set_reset_account_operation,
            legacy_claim_reward_balance_operation,
            legacy_delegate_vesting_shares_operation,
            legacy_witness_set_properties_operation,
            legacy_account_update_operation,
            legacy_create_proposal_operation,
            legacy_update_proposal_votes_operation,
            legacy_remove_proposal_operation,
            legacy_author_reward_operation,
            legacy_curation_reward_operation,
            legacy_comment_reward_operation,
            legacy_fill_vesting_withdraw_operation,
            legacy_shutdown_witness_operation,
            legacy_fill_transfer_from_savings_operation,
            legacy_hardfork_operation,
            legacy_comment_payout_update_operation,
            legacy_return_vesting_delegation_operation,
            legacy_comment_benefactor_reward_operation,
            legacy_producer_reward_operation,
            legacy_clear_null_account_balance_operation,
            legacy_proposal_pay_operation,
            legacy_sps_fund_operation
         > legacy_operation;

   struct legacy_operation_conversion_visitor
   {
      legacy_operation_conversion_visitor( legacy_operation& legacy_op ) : l_op( legacy_op ) {}

      typedef bool result_type;

      legacy_operation& l_op;

      bool operator()( const account_update_operation& op )const                 { l_op = op; return true; }
      bool operator()( const comment_operation& op )const                        { l_op = op; return true; }
      bool operator()( const create_claimed_account_operation& op )const         { l_op = op; return true; }
      bool operator()( const delete_comment_operation& op )const                 { l_op = op; return true; }
      bool operator()( const vote_operation& op )const                           { l_op = op; return true; }
      bool operator()( const escrow_approve_operation& op )const                 { l_op = op; return true; }
      bool operator()( const escrow_dispute_operation& op )const                 { l_op = op; return true; }
      bool operator()( const set_withdraw_vesting_route_operation& op )const     { l_op = op; return true; }
      bool operator()( const witness_set_properties_operation& op )const         { l_op = op; return true; }
      bool operator()( const account_witness_vote_operation& op )const           { l_op = op; return true; }
      bool operator()( const account_witness_proxy_operation& op )const          { l_op = op; return true; }
      bool operator()( const custom_operation& op )const                         { l_op = op; return true; }
      bool operator()( const custom_json_operation& op )const                    { l_op = op; return true; }
      bool operator()( const custom_binary_operation& op )const                  { l_op = op; return true; }
      bool operator()( const request_account_recovery_operation& op )const       { l_op = op; return true; }
      bool operator()( const recover_account_operation& op )const                { l_op = op; return true; }
      bool operator()( const reset_account_operation& op )const                  { l_op = op; return true; }
      bool operator()( const set_reset_account_operation& op )const              { l_op = op; return true; }
      bool operator()( const change_recovery_account_operation& op )const        { l_op = op; return true; }
      bool operator()( const cancel_transfer_from_savings_operation& op )const   { l_op = op; return true; }
      bool operator()( const decline_voting_rights_operation& op )const          { l_op = op; return true; }
      bool operator()( const shutdown_witness_operation& op )const               { l_op = op; return true; }
      bool operator()( const hardfork_operation& op )const                       { l_op = op; return true; }
      bool operator()( const comment_payout_update_operation& op )const          { l_op = op; return true; }
      bool operator()( const update_proposal_votes_operation& op )const          { l_op = op; return true; }
      bool operator()( const remove_proposal_operation& op )const                { l_op = op; return true; }
      bool operator()( const clear_null_account_balance_operation& op )const     { l_op = op; return true; }

      bool operator()( const transfer_operation& op )const
      {
         l_op = legacy_transfer_operation( op );
         return true;
      }

      bool operator()( const transfer_to_vesting_operation& op )const
      {
         l_op = legacy_transfer_to_vesting_operation( op );
         return true;
      }

      bool operator()( const withdraw_vesting_operation& op )const
      {
         l_op = legacy_withdraw_vesting_operation( op );
         return true;
      }

      bool operator()( const account_create_operation& op )const
      {
         l_op = legacy_account_create_operation( op );
         return true;
      }

      bool operator()( const witness_update_operation& op )const
      {
         l_op = legacy_witness_update_operation( op );
         return true;
      }

      bool operator()( const comment_options_operation& op )const
      {
         l_op = legacy_comment_options_operation( op );
         return true;
      }

      bool operator()( const escrow_transfer_operation& op )const
      {
         l_op = legacy_escrow_transfer_operation( op );
         return true;
      }

      bool operator()( const escrow_release_operation& op )const
      {
         l_op = legacy_escrow_release_operation( op );
         return true;
      }

      bool operator()( const transfer_to_savings_operation& op )const
      {
         l_op = legacy_transfer_to_savings_operation( op );
         return true;
      }

      bool operator()( const transfer_from_savings_operation& op )const
      {
         l_op = legacy_transfer_from_savings_operation( op );
         return true;
      }

      bool operator()( const claim_reward_balance_operation& op )const
      {
         l_op = legacy_claim_reward_balance_operation( op );
         return true;
      }

      bool operator()( const delegate_vesting_shares_operation& op )const
      {
         l_op = legacy_delegate_vesting_shares_operation( op );
         return true;
      }

      bool operator()( const author_reward_operation& op )const
      {
         l_op = legacy_author_reward_operation( op );
         return true;
      }

      bool operator()( const curation_reward_operation& op )const
      {
         l_op = legacy_curation_reward_operation( op );
         return true;
      }

      bool operator()( const comment_reward_operation& op )const
      {
         l_op = legacy_comment_reward_operation( op );
         return true;
      }

      bool operator()( const fill_vesting_withdraw_operation& op )const
      {
         l_op = legacy_fill_vesting_withdraw_operation( op );
         return true;
      }

      bool operator()( const fill_transfer_from_savings_operation& op )const
      {
         l_op = legacy_fill_transfer_from_savings_operation( op );
         return true;
      }

      bool operator()( const return_vesting_delegation_operation& op )const
      {
         l_op = legacy_return_vesting_delegation_operation( op );
         return true;
      }

      bool operator()( const comment_benefactor_reward_operation& op )const
      {
         l_op = legacy_comment_benefactor_reward_operation( op );
         return true;
      }

      bool operator()( const producer_reward_operation& op )const
      {
         l_op = legacy_producer_reward_operation( op );
         return true;
      }

      bool operator()( const claim_account_operation& op )const
      {
         l_op = legacy_claim_account_operation( op );
         return true;
      }

      bool operator()( const create_proposal_operation& op )const
      {
         l_op = legacy_create_proposal_operation( op );
         return true;
      }

      bool operator()( const proposal_pay_operation& op )const
      {
         l_op = legacy_proposal_pay_operation( op );
         return true;
      }

      bool operator()( const sps_fund_operation& op )const
      {
         l_op = legacy_sps_fund_operation( op );
         return true;
      }

      // Should only be SMT ops
      template< typename T >
      bool operator()( const T& )const { return false; }
};

struct convert_from_legacy_operation_visitor
{
   convert_from_legacy_operation_visitor() {}

   typedef operation result_type;

   operation operator()( const legacy_transfer_operation& op )const
   {
      return operation( transfer_operation( op ) );
   }

   operation operator()( const legacy_transfer_to_vesting_operation& op )const
   {
      return operation( transfer_to_vesting_operation( op ) );
   }

   operation operator()( const legacy_withdraw_vesting_operation& op )const
   {
      return operation( withdraw_vesting_operation( op ) );
   }

   operation operator()( const legacy_account_create_operation& op )const
   {
      return operation( account_create_operation( op ) );
   }

   operation operator()( const legacy_witness_update_operation& op )const
   {
      return operation( witness_update_operation( op ) );
   }

   operation operator()( const legacy_comment_options_operation& op )const
   {
      return operation( comment_options_operation( op ) );
   }

   operation operator()( const legacy_escrow_transfer_operation& op )const
   {
      return operation( escrow_transfer_operation( op ) );
   }

   operation operator()( const legacy_escrow_release_operation& op )const
   {
      return operation( escrow_release_operation( op ) );
   }

   operation operator()( const legacy_transfer_to_savings_operation& op )const
   {
      return operation( transfer_to_savings_operation( op ) );
   }

   operation operator()( const legacy_transfer_from_savings_operation& op )const
   {
      return operation( transfer_from_savings_operation( op ) );
   }

   operation operator()( const legacy_claim_reward_balance_operation& op )const
   {
      return operation( claim_reward_balance_operation( op ) );
   }

   operation operator()( const legacy_delegate_vesting_shares_operation& op )const
   {
      return operation( delegate_vesting_shares_operation( op ) );
   }

   operation operator()( const legacy_author_reward_operation& op )const
   {
      return operation( author_reward_operation( op ) );
   }

   operation operator()( const legacy_curation_reward_operation& op )const
   {
      return operation( curation_reward_operation( op ) );
   }

   operation operator()( const legacy_comment_reward_operation& op )const
   {
      return operation( comment_reward_operation( op ) );
   }

   operation operator()( const legacy_fill_vesting_withdraw_operation& op )const
   {
      return operation( fill_vesting_withdraw_operation( op ) );
   }

   operation operator()( const legacy_fill_transfer_from_savings_operation& op )const
   {
      return operation( fill_transfer_from_savings_operation( op ) );
   }

   operation operator()( const legacy_return_vesting_delegation_operation& op )const
   {
      return operation( return_vesting_delegation_operation( op ) );
   }

   operation operator()( const legacy_comment_benefactor_reward_operation& op )const
   {
      return operation( comment_benefactor_reward_operation( op ) );
   }

   operation operator()( const legacy_producer_reward_operation& op )const
   {
      return operation( producer_reward_operation( op ) );
   }

   operation operator()( const legacy_claim_account_operation& op )const
   {
      return operation( claim_account_operation( op ) );
   }

   operation operator()( const legacy_create_proposal_operation& op )const
   {
      return operation( create_proposal_operation( op ) );
   }

   operation operator()( const legacy_proposal_pay_operation& op )const
   {
      return operation( proposal_pay_operation( op ) );
   }

   operation operator()( const legacy_sps_fund_operation& op )const
   {
      return operation( sps_fund_operation( op ) );
   }

   template< typename T >
   operation operator()( const T& t )const
   {
      return operation( t );
   }
};

} } } // blurt::plugins::condenser_api

namespace fc {

void to_variant( const blurt::plugins::condenser_api::legacy_operation&, fc::variant& );
void from_variant( const fc::variant&, blurt::plugins::condenser_api::legacy_operation& );

void to_variant( const blurt::plugins::condenser_api::legacy_comment_options_extensions&, fc::variant& );
void from_variant( const fc::variant&, blurt::plugins::condenser_api::legacy_comment_options_extensions& );

struct from_old_static_variant
{
   variant& var;
   from_old_static_variant( variant& dv ):var(dv){}

   typedef void result_type;
   template<typename T> void operator()( const T& v )const
   {
      to_variant( v, var );
   }
};

struct to_old_static_variant
{
   const variant& var;
   to_old_static_variant( const variant& dv ):var(dv){}

   typedef void result_type;
   template<typename T> void operator()( T& v )const
   {
      from_variant( var, v );
   }
};

template< typename T >
void old_sv_to_variant( const T& sv, fc::variant& v )
{
   variant tmp;
   variants vars(2);
   vars[0] = sv.which();
   sv.visit( from_old_static_variant(vars[1]) );
   v = std::move(vars);
}

template< typename T >
void old_sv_from_variant( const fc::variant& v, T& sv )
{
   auto ar = v.get_array();
   if( ar.size() < 2 ) return;
   sv.set_which( static_cast< int64_t >( ar[0].as_uint64() ) );
   sv.visit( to_old_static_variant(ar[1]) );
}

}

FC_REFLECT( blurt::plugins::condenser_api::api_chain_properties,
            (account_creation_fee)(maximum_block_size)(account_subsidy_budget)(account_subsidy_decay)
            (operation_flat_fee)(bandwidth_kbytes_fee)
          )

FC_REFLECT( blurt::plugins::condenser_api::legacy_price, (base)(quote) )
FC_REFLECT( blurt::plugins::condenser_api::legacy_transfer_to_savings_operation, (from)(to)(amount)(memo) )
FC_REFLECT( blurt::plugins::condenser_api::legacy_transfer_from_savings_operation, (from)(request_id)(to)(amount)(memo) )

FC_REFLECT( blurt::plugins::condenser_api::legacy_account_create_operation,
            (fee)
            (creator)
            (new_account_name)
            (owner)
            (active)
            (posting)
            (memo_key)
            (json_metadata) )

FC_REFLECT( blurt::plugins::condenser_api::legacy_transfer_operation, (from)(to)(amount)(memo) )
FC_REFLECT( blurt::plugins::condenser_api::legacy_transfer_to_vesting_operation, (from)(to)(amount) )
FC_REFLECT( blurt::plugins::condenser_api::legacy_withdraw_vesting_operation, (account)(vesting_shares) )
FC_REFLECT( blurt::plugins::condenser_api::legacy_witness_update_operation, (owner)(url)(block_signing_key)(props)(fee) )
FC_REFLECT( blurt::plugins::condenser_api::legacy_comment_options_operation, (author)(permlink)(max_accepted_payout)(allow_votes)(allow_curation_rewards)(extensions) )
FC_REFLECT( blurt::plugins::condenser_api::legacy_escrow_transfer_operation, (from)(to)(blurt_amount)(escrow_id)(agent)(fee)(json_meta)(ratification_deadline)(escrow_expiration) );
FC_REFLECT( blurt::plugins::condenser_api::legacy_escrow_release_operation, (from)(to)(agent)(who)(receiver)(escrow_id)(blurt_amount) );
FC_REFLECT( blurt::plugins::condenser_api::legacy_claim_reward_balance_operation, (account)(reward_blurt)(reward_vests) )
FC_REFLECT( blurt::plugins::condenser_api::legacy_delegate_vesting_shares_operation, (delegator)(delegatee)(vesting_shares) );
FC_REFLECT( blurt::plugins::condenser_api::legacy_author_reward_operation, (author)(permlink)(blurt_payout)(vesting_payout) )
FC_REFLECT( blurt::plugins::condenser_api::legacy_curation_reward_operation, (curator)(reward)(comment_author)(comment_permlink) )
FC_REFLECT( blurt::plugins::condenser_api::legacy_comment_reward_operation, (author)(permlink)(payout) )
FC_REFLECT( blurt::plugins::condenser_api::legacy_fill_vesting_withdraw_operation, (from_account)(to_account)(withdrawn)(deposited) )
FC_REFLECT( blurt::plugins::condenser_api::legacy_fill_transfer_from_savings_operation, (from)(to)(amount)(request_id)(memo) )
FC_REFLECT( blurt::plugins::condenser_api::legacy_return_vesting_delegation_operation, (account)(vesting_shares) )
FC_REFLECT( blurt::plugins::condenser_api::legacy_comment_benefactor_reward_operation, (benefactor)(author)(permlink)(blurt_payout)(vesting_payout) )
FC_REFLECT( blurt::plugins::condenser_api::legacy_producer_reward_operation, (producer)(vesting_shares) )
FC_REFLECT( blurt::plugins::condenser_api::legacy_claim_account_operation, (creator)(fee)(extensions) )
FC_REFLECT( blurt::plugins::condenser_api::legacy_proposal_pay_operation, (receiver)(payment)(trx_id)(op_in_trx) )
FC_REFLECT( blurt::plugins::condenser_api::legacy_sps_fund_operation, (additional_funds) )
FC_REFLECT( blurt::plugins::condenser_api::legacy_create_proposal_operation, (creator)(receiver)(start_date)(end_date)(daily_pay)(subject)(permlink) )

FC_REFLECT_TYPENAME( blurt::plugins::condenser_api::legacy_operation )
