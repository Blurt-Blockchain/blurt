#include <blurt/chain/blurt_fwd.hpp>

#include <blurt/protocol/sps_operations.hpp>

#include <blurt/chain/database.hpp>
#include <blurt/chain/steem_evaluator.hpp>
#include <blurt/chain/sps_objects.hpp>

#include <blurt/chain/util/sps_helper.hpp>


namespace blurt { namespace chain {

using blurt::chain::create_proposal_evaluator;

void create_proposal_evaluator::do_apply( const create_proposal_operation& o )
{
   try
   {
      /** start date can be earlier than head_block_time - otherwise creating a proposal can be difficult,
          since passed date should be adjusted by potential transaction execution delay (i.e. 3 sec
          as a time for processed next block).
      */
      FC_ASSERT(o.end_date > _db.head_block_time(), "Can't create inactive proposals...");

      asset fee( BLURT_TREASURY_FEE, BLURT_SYMBOL );

      //treasury account must exist, also we need it later to change its balance
      const auto& treasury_account =_db.get_account( BLURT_TREASURY_ACCOUNT );

      const auto& owner_account = _db.get_account( o.creator );
      const auto* receiver_account = _db.find_account( o.receiver );

      /// Just to check the receiver account exists.
      FC_ASSERT(receiver_account != nullptr, "Specified receiver account: ${r} must exist in the blockchain",
         ("r", o.receiver));

      const auto* commentObject = _db.find_comment(o.creator, o.permlink);
      if(commentObject == nullptr)
      {
         commentObject = _db.find_comment(o.receiver, o.permlink);
         FC_ASSERT(commentObject != nullptr, "Proposal permlink must point to the article posted by creator or receiver");
      }

      _db.create< proposal_object >( [&]( proposal_object& proposal )
      {
         proposal.proposal_id = proposal.id;

         proposal.creator = o.creator;
         proposal.receiver = o.receiver;

         proposal.start_date = o.start_date;
         proposal.end_date = o.end_date;

         proposal.daily_pay = o.daily_pay;

         proposal.subject = o.subject.c_str();

         proposal.permlink = o.permlink.c_str();
      });

      _db.adjust_balance( owner_account, -fee );
      /// Fee shall be paid to the treasury
      _db.adjust_balance(treasury_account, fee );
   }
   FC_CAPTURE_AND_RETHROW( (o) )
}

void update_proposal_votes_evaluator::do_apply( const update_proposal_votes_operation& o )
{
   try
   {
      const auto& pidx = _db.get_index< proposal_index >().indices().get< by_proposal_id >();
      const auto& pvidx = _db.get_index< proposal_vote_index >().indices().get< by_voter_proposal >();

      for( const auto id : o.proposal_ids )
      {
         //checking if proposal id exists
         auto found_id = pidx.find( id );
         if( found_id == pidx.end() || found_id->removed )
            continue;

         auto found = pvidx.find( boost::make_tuple( o.voter, id ) );

         if( o.approve )
         {
            if( found == pvidx.end() )
               _db.create< proposal_vote_object >( [&]( proposal_vote_object& proposal_vote )
               {
                  proposal_vote.voter = o.voter;
                  proposal_vote.proposal_id = id;
               } );
         }
         else
         {
            if( found != pvidx.end() )
               _db.remove( *found );
         }
      }
   }
   FC_CAPTURE_AND_RETHROW( (o) )
}

void remove_proposal_evaluator::do_apply(const remove_proposal_operation& op)
{
   try
   {
      sps_helper::remove_proposals( _db, op.proposal_ids, op.proposal_owner );

      /*
         Because of performance removing proposals are restricted due to the `sps_remove_threshold` threshold.
         Therefore all proposals are marked with flag `removed` and `end_date` is moved beyond 'head_time + BLURT_PROPOSAL_MAINTENANCE_CLEANUP`
         flag `removed` - it's information for 'sps_api' plugin
         moving `end_date` - triggers the algorithm in `sps_processor::remove_proposals`

         When automatic actions will be introduced, this code will disappear.
      */
      for( const auto id : op.proposal_ids )
      {
         const auto& pidx = _db.get_index< proposal_index >().indices().get< by_proposal_id >();

         auto found_id = pidx.find( id );
         if( found_id == pidx.end() || found_id->removed )
            continue;

         _db.modify( *found_id, [&]( proposal_object& proposal )
         {
            proposal.removed = true;

            auto head_date = _db.head_block_time();
            auto new_end_date = head_date - fc::seconds( BLURT_PROPOSAL_MAINTENANCE_CLEANUP );

            proposal.end_date = new_end_date;
         } );
      }

   }
   FC_CAPTURE_AND_RETHROW( (op) )
}

} } // blurt::chain
