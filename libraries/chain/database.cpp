#include <blurt/chain/blurt_fwd.hpp>

#include <blurt/protocol/blurt_operations.hpp>

#include <blurt/chain/block_summary_object.hpp>
#include <blurt/chain/compound.hpp>
#include <blurt/chain/custom_operation_interpreter.hpp>
#include <blurt/chain/database.hpp>
#include <blurt/chain/database_exceptions.hpp>
#include <blurt/chain/db_with.hpp>
#include <blurt/chain/evaluator_registry.hpp>
#include <blurt/chain/global_property_object.hpp>
#include <blurt/chain/history_object.hpp>
#include <blurt/chain/steem_evaluator.hpp>
#include <blurt/chain/blurt_objects.hpp>
#include <blurt/chain/transaction_object.hpp>
#include <blurt/chain/shared_db_merkle.hpp>
#include <blurt/chain/witness_schedule.hpp>

#include <blurt/chain/util/reward.hpp>
#include <blurt/chain/util/uint256.hpp>
#include <blurt/chain/util/reward.hpp>
#include <blurt/chain/util/manabar.hpp>
#include <blurt/chain/util/rd_setup.hpp>
#include <blurt/chain/util/nai_generator.hpp>
#include <blurt/chain/util/sps_processor.hpp>

#include <fc/smart_ref_impl.hpp>
#include <fc/uint128.hpp>

#include <fc/container/deque.hpp>

#include <fc/io/fstream.hpp>

#include <boost/scope_exit.hpp>

#include <rocksdb/perf_context.h>

#include <iostream>

#include <cstdint>
#include <deque>
#include <fstream>
#include <functional>

namespace blurt { namespace chain {

struct object_schema_repr
{
   std::pair< uint16_t, uint16_t > space_type;
   std::string type;
};

struct operation_schema_repr
{
   std::string id;
   std::string type;
};

struct db_schema
{
   std::map< std::string, std::string > types;
   std::vector< object_schema_repr > object_types;
   std::string operation_type;
   std::vector< operation_schema_repr > custom_operation_types;
};

struct account_snapshot {
   account_name_type name;
   authority owner;
   authority active;
   authority posting;
   public_key_type memo;
   share_type balance; // BLURT
   share_type power; // BLURT POWER
};

} }

FC_REFLECT( blurt::chain::object_schema_repr, (space_type)(type) )
FC_REFLECT( blurt::chain::operation_schema_repr, (id)(type) )
FC_REFLECT( blurt::chain::db_schema, (types)(object_types)(operation_type)(custom_operation_types) )
FC_REFLECT( blurt::chain::account_snapshot, (name)(owner)(active)(posting)(memo)(balance)(power) )

namespace blurt { namespace chain {

using boost::container::flat_set;

struct reward_fund_context
{
   uint128_t   recent_claims = 0;
   asset       reward_balance = asset( 0, BLURT_SYMBOL );
   share_type  blurt_awarded = 0;
};

class database_impl
{
   public:
      database_impl( database& self );

      database&                                       _self;
      evaluator_registry< operation >                 _evaluator_registry;
};

database_impl::database_impl( database& self )
   : _self(self), _evaluator_registry(self) {}

database::database()
   : _my( new database_impl(*this) ) {}

database::~database()
{
   clear_pending();
}

void database::open( const open_args& args )
{
   try
   {
      init_schema();
      chainbase::database::open( args.shared_mem_dir, args.chainbase_flags, args.shared_file_size, args.database_cfg );

      initialize_indexes();
      initialize_evaluators();

      if( !find< dynamic_global_property_object >() )
         with_write_lock( [&]()
         {
            init_genesis( args );
         });

      _benchmark_dumper.set_enabled( args.benchmark_is_enabled );

      _block_log.open( args.data_dir / "block_log" );

      auto log_head = _block_log.head();

      // Rewind all undo state. This should return us to the state at the last irreversible block.
      with_write_lock( [&]()
      {
#ifndef ENABLE_MIRA
         undo_all();
#endif

         if( args.chainbase_flags & chainbase::skip_env_check )
         {
            set_revision( head_block_num() );
         }
         else
         {
            FC_ASSERT( revision() == head_block_num(), "Chainbase revision does not match head block num.",
               ("rev", revision())("head_block", head_block_num()) );
            if (args.do_validate_invariants)
               validate_invariants();
         }
      });

      if( head_block_num() )
      {
         auto head_block = _block_log.read_block_by_num( head_block_num() );
         // This assertion should be caught and a reindex should occur
         FC_ASSERT( head_block.valid() && head_block->id() == head_block_id(), "Chain state does not match block log. Please reindex blockchain." );

         _fork_db.start_block( *head_block );
      }


//        ///////////////////////
//        // TODO: for live testnet only, disable this on mainnet
//        if (head_block_num() == 1028947)  {
//          const auto& witness_idx = get_index<witness_index>().indices();
//
//          // change witness key
//          for (auto itr = witness_idx.begin(); itr != witness_idx.end(); ++itr) {
//            modify(*itr, [&](witness_object& w) {
//              w.signing_key = blurt::protocol::public_key_type("BLT875YGJ2rXwEhUr4hRXduZguwJKEJufsS4oYT6ehHWiDhev7hah");
//            });
//          }
//        }


      with_read_lock( [&]()
      {
         init_hardforks(); // Writes to local state, but reads from db
      });

      if (args.benchmark.first)
      {
         args.benchmark.second(0, get_abstract_index_cntr());
         auto last_block_num = _block_log.head()->block_num();
         args.benchmark.second(last_block_num, get_abstract_index_cntr());
      }

      _shared_file_full_threshold = args.shared_file_full_threshold;
      _shared_file_scale_rate = args.shared_file_scale_rate;
      _sps_remove_threshold = args.sps_remove_threshold;
   }
   FC_CAPTURE_LOG_AND_RETHROW( (args.data_dir)(args.shared_mem_dir)(args.shared_file_size) )
}

#ifdef ENABLE_MIRA
void reindex_set_index_helper( database& db, mira::index_type type, const boost::filesystem::path& p, const boost::any& cfg, std::vector< std::string > indices )
{
   index_delegate_map delegates;

   if ( indices.size() > 0 )
   {
      for ( auto& index_name : indices )
      {
         if ( db.has_index_delegate( index_name ) )
            delegates[ index_name ] = db.get_index_delegate( index_name );
         else
            wlog( "Encountered an unknown index name '${name}'.", ("name", index_name) );
      }
   }
   else
   {
      delegates = db.index_delegates();
   }

   std::string type_str = type == mira::index_type::mira ? "mira" : "bmic";
   for ( auto const& delegate : delegates )
   {
      ilog( "Converting index '${name}' to ${type} type.", ("name", delegate.first)("type", type_str) );
      delegate.second.set_index_type( db, type, p, cfg );
   }
}
#endif

uint32_t database::reindex( const open_args& args )
{
   reindex_notification note( args );

   BOOST_SCOPE_EXIT(this_,&note) {
      BLURT_TRY_NOTIFY(this_->_post_reindex_signal, note);
   } BOOST_SCOPE_EXIT_END

   try
   {

      ilog( "Reindexing Blockchain" );
#ifdef ENABLE_MIRA
      initialize_indexes();
#endif

      wipe( args.data_dir, args.shared_mem_dir, false );
      open( args );

      BLURT_TRY_NOTIFY(_pre_reindex_signal, note);

#ifdef ENABLE_MIRA
      if( args.replay_in_memory )
      {
         ilog( "Configuring replay to use memory..." );
         reindex_set_index_helper( *this, mira::index_type::bmic, args.shared_mem_dir, args.database_cfg, args.replay_memory_indices );
      }
#endif

      _fork_db.reset();    // override effect of _fork_db.start_block() call in open()

      auto start = fc::time_point::now();
      BLURT_ASSERT( _block_log.head(), block_log_exception, "No blocks in block log. Cannot reindex an empty chain." );

      ilog( "Replaying blocks..." );

      uint64_t skip_flags =
         skip_witness_signature |
         skip_transaction_signatures |
         skip_transaction_dupe_check |
         skip_tapos_check |
         skip_merkle_check |
         skip_witness_schedule_check |
         skip_authority_check |
         skip_validate | /// no need to validate operations
         skip_validate_invariants |
         skip_block_log;

      with_write_lock( [&]()
      {
         _block_log.set_locking( false );
         auto itr = _block_log.read_block( 0 );
         auto last_block_num = _block_log.head()->block_num();
         if( args.stop_replay_at > 0 && args.stop_replay_at < last_block_num )
            last_block_num = args.stop_replay_at;
         if( args.benchmark.first > 0 )
         {
            args.benchmark.second( 0, get_abstract_index_cntr() );
         }

         while( itr.first.block_num() != last_block_num )
         {
            auto cur_block_num = itr.first.block_num();
            if( cur_block_num % 100000 == 0 )
            {
               std::cerr << "   " << double( cur_block_num * 100 ) / last_block_num << "%   " << cur_block_num << " of " << last_block_num << "   (" <<
#ifdef ENABLE_MIRA
               get_cache_size()  << " objects cached using " << (get_cache_usage() >> 20) << "M"
#else
               (get_free_memory() >> 20) << "M free"
#endif
               << ")\n";

               //rocksdb::SetPerfLevel(rocksdb::kEnableCount);
               //rocksdb::get_perf_context()->Reset();
            }
            apply_block( itr.first, skip_flags );

            if( cur_block_num % 100000 == 0 )
            {
               //std::cout << rocksdb::get_perf_context()->ToString() << std::endl;
               if( cur_block_num % 1000000 == 0 )
               {
                  dump_lb_call_counts();
               }
            }

            if( (args.benchmark.first > 0) && (cur_block_num % args.benchmark.first == 0) )
               args.benchmark.second( cur_block_num, get_abstract_index_cntr() );
            itr = _block_log.read_block( itr.second );
         }

         apply_block( itr.first, skip_flags );
         note.last_block_number = itr.first.block_num();

         if( (args.benchmark.first > 0) && (note.last_block_number % args.benchmark.first == 0) )
            args.benchmark.second( note.last_block_number, get_abstract_index_cntr() );
         set_revision( head_block_num() );
         _block_log.set_locking( true );

         //get_index< account_index >().indices().print_stats();
      });

      if( _block_log.head()->block_num() )
         _fork_db.start_block( *_block_log.head() );

#ifdef ENABLE_MIRA
      if( args.replay_in_memory )
      {
         ilog( "Migrating state to disk..." );
         reindex_set_index_helper( *this, mira::index_type::mira, args.shared_mem_dir, args.database_cfg, args.replay_memory_indices );
      }
#endif

      auto end = fc::time_point::now();
      ilog( "Done reindexing, elapsed time: ${t} sec", ("t",double((end-start).count())/1000000.0 ) );

      note.reindex_success = true;

      return note.last_block_number;
   }
   FC_CAPTURE_AND_RETHROW( (args.data_dir)(args.shared_mem_dir) )

}

void database::wipe( const fc::path& data_dir, const fc::path& shared_mem_dir, bool include_blocks)
{
   close();
   chainbase::database::wipe( shared_mem_dir );
   if( include_blocks )
   {
      fc::remove_all( data_dir / "block_log" );
      fc::remove_all( data_dir / "block_log.index" );
   }
}

void database::close(bool rewind)
{
   try
   {
      // Since pop_block() will move tx's in the popped blocks into pending,
      // we have to clear_pending() after we're done popping to get a clean
      // DB state (issue #336).
      clear_pending();

#ifdef ENABLE_MIRA
      undo_all();
#endif

      chainbase::database::flush();
      chainbase::database::close();

      _block_log.close();

      _fork_db.reset();
   }
   FC_CAPTURE_AND_RETHROW()
}

bool database::is_known_block( const block_id_type& id )const
{ try {
   return fetch_block_by_id( id ).valid();
} FC_CAPTURE_AND_RETHROW() }

/**
 * Only return true *if* the transaction has not expired or been invalidated. If this
 * method is called with a VERY old transaction we will return false, they should
 * query things by blocks if they are that old.
 */
bool database::is_known_transaction( const transaction_id_type& id )const
{ try {
   const auto& trx_idx = get_index<transaction_index>().indices().get<by_trx_id>();
   return trx_idx.find( id ) != trx_idx.end();
} FC_CAPTURE_AND_RETHROW() }

block_id_type database::find_block_id_for_num( uint32_t block_num )const
{
   try
   {
      if( block_num == 0 )
         return block_id_type();

      // Reversible blocks are *usually* in the TAPOS buffer.  Since this
      // is the fastest check, we do it first.
      block_summary_id_type bsid = block_num & 0xFFFF;
      const block_summary_object* bs = find< block_summary_object, by_id >( bsid );
      if( bs != nullptr )
      {
         if( protocol::block_header::num_from_id(bs->block_id) == block_num )
            return bs->block_id;
      }

      // Next we query the block log.   Irreversible blocks are here.
      auto b = _block_log.read_block_by_num( block_num );
      if( b.valid() )
         return b->id();

      // Finally we query the fork DB.
      shared_ptr< fork_item > fitem = _fork_db.fetch_block_on_main_branch_by_number( block_num );
      if( fitem )
         return fitem->id;

      return block_id_type();
   }
   FC_CAPTURE_AND_RETHROW( (block_num) )
}

block_id_type database::get_block_id_for_num( uint32_t block_num )const
{
   block_id_type bid = find_block_id_for_num( block_num );
   FC_ASSERT( bid != block_id_type() );
   return bid;
}


optional<signed_block> database::fetch_block_by_id( const block_id_type& id )const
{ try {
   auto b = _fork_db.fetch_block( id );
   if( !b )
   {
      auto tmp = _block_log.read_block_by_num( protocol::block_header::num_from_id( id ) );

      if( tmp && tmp->id() == id )
         return tmp;

      tmp.reset();
      return tmp;
   }

   return b->data;
} FC_CAPTURE_AND_RETHROW() }

optional<signed_block> database::fetch_block_by_number( uint32_t block_num )const
{ try {
   optional< signed_block > b;
   shared_ptr< fork_item > fitem = _fork_db.fetch_block_on_main_branch_by_number( block_num );

   if( fitem )
      b = fitem->data;
   else
      b = _block_log.read_block_by_num( block_num );

   return b;
} FC_LOG_AND_RETHROW() }

const signed_transaction database::get_recent_transaction( const transaction_id_type& trx_id ) const
{ try {
   const auto& index = get_index<transaction_index>().indices().get<by_trx_id>();
   auto itr = index.find(trx_id);
   FC_ASSERT(itr != index.end());
   signed_transaction trx;
   fc::raw::unpack_from_buffer( itr->packed_trx, trx );
   return trx;;
} FC_CAPTURE_AND_RETHROW() }

std::vector< block_id_type > database::get_block_ids_on_fork( block_id_type head_of_fork ) const
{ try {
   pair<fork_database::branch_type, fork_database::branch_type> branches = _fork_db.fetch_branch_from(head_block_id(), head_of_fork);
   if( !((branches.first.back()->previous_id() == branches.second.back()->previous_id())) )
   {
      edump( (head_of_fork)
             (head_block_id())
             (branches.first.size())
             (branches.second.size()) );
      assert(branches.first.back()->previous_id() == branches.second.back()->previous_id());
   }
   std::vector< block_id_type > result;
   for( const item_ptr& fork_block : branches.second )
      result.emplace_back(fork_block->id);
   result.emplace_back(branches.first.back()->previous_id());
   return result;
} FC_CAPTURE_AND_RETHROW() }

chain_id_type database::get_chain_id() const
{
   return blurt_chain_id;
}

void database::set_chain_id( const chain_id_type& chain_id )
{
   blurt_chain_id = chain_id;

   idump( (blurt_chain_id) );
}

void database::foreach_block(std::function<bool(const signed_block_header&, const signed_block&)> processor) const
{
   if(!_block_log.head())
      return;

   auto itr = _block_log.read_block( 0 );
   auto last_block_num = _block_log.head()->block_num();
   signed_block_header previousBlockHeader = itr.first;
   while( itr.first.block_num() != last_block_num )
   {
      const signed_block& b = itr.first;
      if(processor(previousBlockHeader, b) == false)
         return;

      previousBlockHeader = b;
      itr = _block_log.read_block( itr.second );
   }

   processor(previousBlockHeader, itr.first);
}

void database::foreach_tx(std::function<bool(const signed_block_header&, const signed_block&,
   const signed_transaction&, uint32_t)> processor) const
{
   foreach_block([&processor](const signed_block_header& prevBlockHeader, const signed_block& block) -> bool
   {
      uint32_t txInBlock = 0;
      for( const auto& trx : block.transactions )
      {
         if(processor(prevBlockHeader, block, trx, txInBlock) == false)
            return false;
         ++txInBlock;
      }

      return true;
   }
   );
}

void database::foreach_operation(std::function<bool(const signed_block_header&,const signed_block&,
   const signed_transaction&, uint32_t, const operation&, uint16_t)> processor) const
{
   foreach_tx([&processor](const signed_block_header& prevBlockHeader, const signed_block& block,
      const signed_transaction& tx, uint32_t txInBlock) -> bool
   {
      uint16_t opInTx = 0;
      for(const auto& op : tx.operations)
      {
         if(processor(prevBlockHeader, block, tx, txInBlock, op, opInTx) == false)
            return false;
         ++opInTx;
      }

      return true;
   }
   );
}


const witness_object& database::get_witness( const account_name_type& name ) const
{ try {
   return get< witness_object, by_name >( name );
} FC_CAPTURE_AND_RETHROW( (name) ) }

const witness_object* database::find_witness( const account_name_type& name ) const
{
   return find< witness_object, by_name >( name );
}

const account_object& database::get_account( const account_name_type& name )const
{ try {
   return get< account_object, by_name >( name );
} FC_CAPTURE_AND_RETHROW( (name) ) }

const account_object* database::find_account( const account_name_type& name )const
{
   return find< account_object, by_name >( name );
}

const comment_object& database::get_comment( const account_name_type& author, const shared_string& permlink )const
{ try {
   return get< comment_object, by_permlink >( boost::make_tuple( author, permlink ) );
} FC_CAPTURE_AND_RETHROW( (author)(permlink) ) }

const comment_object* database::find_comment( const account_name_type& author, const shared_string& permlink )const
{
   return find< comment_object, by_permlink >( boost::make_tuple( author, permlink ) );
}

#ifndef ENABLE_MIRA
const comment_object& database::get_comment( const account_name_type& author, const string& permlink )const
{ try {
   return get< comment_object, by_permlink >( boost::make_tuple( author, permlink) );
} FC_CAPTURE_AND_RETHROW( (author)(permlink) ) }

const comment_object* database::find_comment( const account_name_type& author, const string& permlink )const
{
   return find< comment_object, by_permlink >( boost::make_tuple( author, permlink ) );
}
#endif

const escrow_object& database::get_escrow( const account_name_type& name, uint32_t escrow_id )const
{ try {
   return get< escrow_object, by_from_id >( boost::make_tuple( name, escrow_id ) );
} FC_CAPTURE_AND_RETHROW( (name)(escrow_id) ) }

const escrow_object* database::find_escrow( const account_name_type& name, uint32_t escrow_id )const
{
   return find< escrow_object, by_from_id >( boost::make_tuple( name, escrow_id ) );
}

const savings_withdraw_object& database::get_savings_withdraw( const account_name_type& owner, uint32_t request_id )const
{ try {
   return get< savings_withdraw_object, by_from_rid >( boost::make_tuple( owner, request_id ) );
} FC_CAPTURE_AND_RETHROW( (owner)(request_id) ) }

const savings_withdraw_object* database::find_savings_withdraw( const account_name_type& owner, uint32_t request_id )const
{
   return find< savings_withdraw_object, by_from_rid >( boost::make_tuple( owner, request_id ) );
}

const dynamic_global_property_object&database::get_dynamic_global_properties() const
{ try {
   return get< dynamic_global_property_object >();
} FC_CAPTURE_AND_RETHROW() }

const node_property_object& database::get_node_properties() const
{
   return _node_property_object;
}

const witness_schedule_object& database::get_witness_schedule_object()const
{ try {
   return get< witness_schedule_object >();
} FC_CAPTURE_AND_RETHROW() }

const hardfork_property_object& database::get_hardfork_property_object()const
{ try {
   return get< hardfork_property_object >();
} FC_CAPTURE_AND_RETHROW() }

const time_point_sec database::calculate_discussion_payout_time( const comment_object& comment )const
{
   return comment.cashout_time;
}

const reward_fund_object& database::get_reward_fund( const comment_object& c ) const
{
   return get< reward_fund_object, by_name >( BLURT_POST_REWARD_FUND_NAME );
}

asset database::get_effective_vesting_shares( const account_object& account, asset_symbol_type vested_symbol )const
{
   if( vested_symbol == VESTS_SYMBOL )
      return account.vesting_shares - account.delegated_vesting_shares + account.received_vesting_shares;

   FC_ASSERT( false, "Invalid symbol" );
}

uint32_t database::witness_participation_rate()const
{
   const dynamic_global_property_object& dpo = get_dynamic_global_properties();
   return uint64_t(BLURT_100_PERCENT) * dpo.recent_slots_filled.popcount() / 128;
}

void database::add_checkpoints( const flat_map< uint32_t, block_id_type >& checkpts )
{
   for( const auto& i : checkpts )
      _checkpoints[i.first] = i.second;
}

bool database::before_last_checkpoint()const
{
   return (_checkpoints.size() > 0) && (_checkpoints.rbegin()->first >= head_block_num());
}

void database::add_spam_accounts( const set<account_name_type>& spam_accounts ) {
  _spam_accounts.insert(spam_accounts.begin(), spam_accounts.end());
}

void database::spam_filter_check_tx(const signed_transaction &trx) {
//   ilog("spam_filter_check_tx");
//   //////////////////////////
//   // spam filter
//
//   const auto &filtered_list = get_spam_accounts();
//
//   flat_set<account_name_type> required;
//   vector<authority> other;
//   trx.get_required_authorities(required, required, required, other);
//
//   for (const auto &auth : required) {
//      const auto &acnt = get_account(auth);
//
//      ilog("spam broadcast filter: ${a} ${b}", ("a", auth)("b", acnt.name));
//      if (filtered_list.find(auth) != filtered_list.end()) {
//         FC_ASSERT(false, "spam!");
//      }
//   }
}


/**
 * Push block "may fail" in which case every partial change is unwound.  After
 * push block is successful the block is appended to the chain database on disk.
 *
 * @return true if we switched forks as a result of this push.
 */
bool database::push_block(const signed_block& new_block, uint32_t skip)
{
   //fc::time_point begin_time = fc::time_point::now();

   auto block_num = new_block.block_num();
   if( _checkpoints.size() && _checkpoints.rbegin()->second != block_id_type() )
   {
      auto itr = _checkpoints.find( block_num );
      if( itr != _checkpoints.end() )
         FC_ASSERT( new_block.id() == itr->second, "Block did not match checkpoint", ("checkpoint",*itr)("block_id",new_block.id()) );

      if( _checkpoints.rbegin()->first >= block_num )
         skip = skip_witness_signature
              | skip_transaction_signatures
              | skip_transaction_dupe_check
              /*| skip_fork_db Fork db cannot be skipped or else blocks will not be written out to block log */
              | skip_block_size_check
              | skip_tapos_check
              | skip_authority_check
              /* | skip_merkle_check While blockchain is being downloaded, txs need to be validated against block headers */
              | skip_undo_history_check
              | skip_witness_schedule_check
              | skip_validate
              | skip_validate_invariants
              ;
   }

   bool result;
   detail::with_skip_flags( *this, skip, [&]()
   {
      detail::without_pending_transactions( *this, std::move(_pending_tx), [&]()
      {
         try
         {
            result = _push_block(new_block);
         }
         FC_CAPTURE_AND_RETHROW( (new_block) )

         check_free_memory( false, new_block.block_num() );
      });
   });

   //fc::time_point end_time = fc::time_point::now();
   //fc::microseconds dt = end_time - begin_time;
   //if( ( new_block.block_num() % 10000 ) == 0 )
   //   ilog( "push_block ${b} took ${t} microseconds", ("b", new_block.block_num())("t", dt.count()) );
   return result;
}

void database::_maybe_warn_multiple_production( uint32_t height )const
{
   auto blocks = _fork_db.fetch_block_by_number( height );
   if( blocks.size() > 1 )
   {
      vector< std::pair< account_name_type, fc::time_point_sec > > witness_time_pairs;
      for( const auto& b : blocks )
      {
         witness_time_pairs.push_back( std::make_pair( b->data.witness, b->data.timestamp ) );
      }

      ilog( "Encountered block num collision at block ${n} due to a fork, witnesses are: ${w}", ("n", height)("w", witness_time_pairs) );
   }
   return;
}

bool database::_push_block(const signed_block& new_block)
{ try {
   uint32_t skip = get_node_properties().skip_flags;
   //uint32_t skip_undo_db = skip & skip_undo_block;

   if( !(skip&skip_fork_db) )
   {
      shared_ptr<fork_item> new_head = _fork_db.push_block(new_block);
      _maybe_warn_multiple_production( new_head->num );

      //If the head block from the longest chain does not build off of the current head, we need to switch forks.
      if( new_head->data.previous != head_block_id() )
      {
         //If the newly pushed block is the same height as head, we get head back in new_head
         //Only switch forks if new_head is actually higher than head
         if( new_head->data.block_num() > head_block_num() )
         {
            wlog( "Switching to fork: ${id}", ("id",new_head->data.id()) );
            auto branches = _fork_db.fetch_branch_from(new_head->data.id(), head_block_id());

            // pop blocks until we hit the forked block
            while( head_block_id() != branches.second.back()->data.previous )
               pop_block();

            // push all blocks on the new fork
            for( auto ritr = branches.first.rbegin(); ritr != branches.first.rend(); ++ritr )
            {
                ilog( "pushing blocks from fork ${n} ${id}", ("n",(*ritr)->data.block_num())("id",(*ritr)->data.id()) );
                optional<fc::exception> except;
                try
                {
                   _fork_db.set_head( *ritr );
                   auto session = start_undo_session();
                   apply_block( (*ritr)->data, skip );
                   session.push();
                }
                catch ( const fc::exception& e ) { except = e; }
                if( except )
                {
                   wlog( "exception thrown while switching forks ${e}", ("e",except->to_detail_string() ) );
                   // remove the rest of branches.first from the fork_db, those blocks are invalid
                   while( ritr != branches.first.rend() )
                   {
                      _fork_db.remove( (*ritr)->data.id() );
                      ++ritr;
                   }

                   // pop all blocks from the bad fork
                   while( head_block_id() != branches.second.back()->data.previous )
                      pop_block();

                   // restore all blocks from the good fork
                   for( auto ritr = branches.second.rbegin(); ritr != branches.second.rend(); ++ritr )
                   {
                      _fork_db.set_head( *ritr );
                      auto session = start_undo_session();
                      apply_block( (*ritr)->data, skip );
                      session.push();
                   }
                   throw *except;
                }
            }
            return true;
         }
         else
            return false;
      }
   }

   try
   {
      auto session = start_undo_session();
      apply_block(new_block, skip);
      session.push();
   }
   catch( const fc::exception& e )
   {
      elog("Failed to push new block:\n${e}", ("e", e.to_detail_string()));
      _fork_db.remove(new_block.id());
      throw;
   }

   return false;
} FC_CAPTURE_AND_RETHROW() }

/**
 * Attempts to push the transaction into the pending queue
 *
 * When called to push a locally generated transaction, set the skip_block_size_check bit on the skip argument. This
 * will allow the transaction to be pushed even if it causes the pending block size to exceed the maximum block size.
 * Although the transaction will probably not propagate further now, as the peers are likely to have their pending
 * queues full as well, it will be kept in the queue to be propagated later when a new block flushes out the pending
 * queues.
 */
void database::push_transaction( const signed_transaction& trx, uint32_t skip )
{
   try
   {
      try
      {
         FC_ASSERT( fc::raw::pack_size(trx) <= (get_dynamic_global_properties().maximum_block_size - 256) );
         set_producing( true );
         set_pending_tx( true );
         detail::with_skip_flags( *this, skip,
            [&]()
            {
               _push_transaction( trx );
            });
         set_producing( false );
         set_pending_tx( false );
      }
      catch( ... )
      {
         set_producing( false );
         set_pending_tx( false );
         throw;
      }
   }
   FC_CAPTURE_AND_RETHROW( (trx) )
}

void database::_push_transaction( const signed_transaction& trx )
{
   // If this is the first transaction pushed after applying a block, start a new undo session.
   // This allows us to quickly rewind to the clean state of the head block, in case a new block arrives.
   if( !_pending_tx_session.valid() )
      _pending_tx_session = start_undo_session();

   // Create a temporary undo session as a child of _pending_tx_session.
   // The temporary session will be discarded by the destructor if
   // _apply_transaction fails.  If we make it to merge(), we
   // apply the changes.

   auto temp_session = start_undo_session();
   _apply_transaction( trx );
   _pending_tx.push_back( trx );

   notify_changed_objects();
   // The transaction applied successfully. Merge its changes into the pending block session.
   temp_session.squash();
}

/**
 * Removes the most recent block from the database and
 * undoes any changes it made.
 */
void database::pop_block()
{
   try
   {
      _pending_tx_session.reset();
      auto head_id = head_block_id();

      /// save the head block so we can recover its transactions
      optional<signed_block> head_block = fetch_block_by_id( head_id );
      BLURT_ASSERT( head_block.valid(), pop_empty_chain, "there are no blocks to pop" );

      _fork_db.pop_block();
      undo();

      _popped_tx.insert( _popped_tx.begin(), head_block->transactions.begin(), head_block->transactions.end() );

   }
   FC_CAPTURE_AND_RETHROW()
}

void database::clear_pending()
{
   try
   {
      assert( (_pending_tx.size() == 0) || _pending_tx_session.valid() );
      _pending_tx.clear();
      _pending_tx_session.reset();
   }
   FC_CAPTURE_AND_RETHROW()
}

void database::push_virtual_operation( const operation& op )
{
   FC_ASSERT( is_virtual_operation( op ) );
   operation_notification note = create_operation_notification( op );
   ++_current_virtual_op;
   note.virtual_op = _current_virtual_op;
   notify_pre_apply_operation( note );
   notify_post_apply_operation( note );
}

void database::pre_push_virtual_operation( const operation& op )
{
   FC_ASSERT( is_virtual_operation( op ) );
   operation_notification note = create_operation_notification( op );
   ++_current_virtual_op;
   note.virtual_op = _current_virtual_op;
   notify_pre_apply_operation( note );
}

void database::post_push_virtual_operation( const operation& op )
{
   FC_ASSERT( is_virtual_operation( op ) );
   operation_notification note = create_operation_notification( op );
   note.virtual_op = _current_virtual_op;
   notify_post_apply_operation( note );
}

void database::notify_pre_apply_operation( const operation_notification& note )
{
   BLURT_TRY_NOTIFY( _pre_apply_operation_signal, note )
}

struct action_validate_visitor
{
   typedef void result_type;

   action_validate_visitor() {}

   template< typename Action >
   void operator()( const Action& a )const
   {
      a.validate();
   }
};

void database::notify_post_apply_operation( const operation_notification& note )
{
   BLURT_TRY_NOTIFY( _post_apply_operation_signal, note )
}

void database::notify_pre_apply_block( const block_notification& note )
{
   BLURT_TRY_NOTIFY( _pre_apply_block_signal, note )
}

void database::notify_irreversible_block( uint32_t block_num )
{
   BLURT_TRY_NOTIFY( _on_irreversible_block, block_num )
}

void database::notify_post_apply_block( const block_notification& note )
{
   BLURT_TRY_NOTIFY( _post_apply_block_signal, note )
}

void database::notify_pre_apply_transaction( const transaction_notification& note )
{
   BLURT_TRY_NOTIFY( _pre_apply_transaction_signal, note )
}

void database::notify_post_apply_transaction( const transaction_notification& note )
{
   BLURT_TRY_NOTIFY( _post_apply_transaction_signal, note )
}

account_name_type database::get_scheduled_witness( uint32_t slot_num )const
{
   const dynamic_global_property_object& dpo = get_dynamic_global_properties();
   const witness_schedule_object& wso = get_witness_schedule_object();
   uint64_t current_aslot = dpo.current_aslot + slot_num;
   return wso.current_shuffled_witnesses[ current_aslot % wso.num_scheduled_witnesses ];
}

fc::time_point_sec database::get_slot_time(uint32_t slot_num)const
{
   if( slot_num == 0 )
      return fc::time_point_sec();

   auto interval = BLURT_BLOCK_INTERVAL;
   const dynamic_global_property_object& dpo = get_dynamic_global_properties();

   if( head_block_num() == 0 )
   {
      // n.b. first block is at genesis_time plus one block interval
      fc::time_point_sec genesis_time = dpo.time;
      return genesis_time + slot_num * interval;
   }

   int64_t head_block_abs_slot = head_block_time().sec_since_epoch() / interval;
   fc::time_point_sec head_slot_time( head_block_abs_slot * interval );

   // "slot 0" is head_slot_time
   // "slot 1" is head_slot_time,
   //   plus maint interval if head block is a maint block
   //   plus block interval if head block is not a maint block
   return head_slot_time + (slot_num * interval);
}

uint32_t database::get_slot_at_time(fc::time_point_sec when)const
{
   fc::time_point_sec first_slot_time = get_slot_time( 1 );
   if( when < first_slot_time )
      return 0;
   return (when - first_slot_time).to_seconds() / BLURT_BLOCK_INTERVAL + 1;
}

// Create vesting, then a caller-supplied callback after determining how many shares to create, but before
// we modify the database.
// This allows us to implement virtual op pre-notifications in the Before function.
template< typename Before >
asset create_vesting2( database& db, const account_object& to_account, asset liquid, bool to_reward_balance, Before&& before_vesting_callback )
{
   try
   {
      auto calculate_new_vesting = [ liquid ] ( price vesting_share_price ) -> asset
         {
         /**
          *  The ratio of total_vesting_shares / total_vesting_fund_blurt should not
          *  change as the result of the user adding funds
          *
          *  V / C  = (V+Vn) / (C+Cn)
          *
          *  Simplifies to Vn = (V * Cn ) / C
          *
          *  If Cn equals o.amount, then we must solve for Vn to know how many new vesting shares
          *  the user should receive.
          *
          *  128 bit math is requred due to multiplying of 64 bit numbers. This is done in asset and price.
          */
         asset new_vesting = liquid * ( vesting_share_price );
         return new_vesting;
         };

      FC_ASSERT( liquid.symbol == BLURT_SYMBOL );
      // ^ A novelty, needed but risky in case someone managed to slip SBD/TESTS here in blockchain history.
      // Get share price.
      const auto& cprops = db.get_dynamic_global_properties();
      price vesting_share_price = to_reward_balance ? cprops.get_reward_vesting_share_price() : cprops.get_vesting_share_price();
      // Calculate new vesting from provided liquid using share price.
      asset new_vesting = calculate_new_vesting( vesting_share_price );
      before_vesting_callback( new_vesting );
      // Add new vesting to owner's balance.
      if( to_reward_balance )
      {
         db.adjust_reward_balance( to_account, liquid, new_vesting );
      }
      else
      {
         db.modify( to_account, [&]( account_object& a )
         {
            util::update_manabar(
               cprops,
               a,
               true,
               true,
               new_vesting.amount.value );
         });

         db.adjust_balance( to_account, new_vesting );
      }
      // Update global vesting pool numbers.
      db.modify( cprops, [&]( dynamic_global_property_object& props )
      {
         if( to_reward_balance )
         {
            props.pending_rewarded_vesting_shares += new_vesting;
            props.pending_rewarded_vesting_blurt += liquid;
         }
         else
         {
            props.total_vesting_fund_blurt += liquid;
            props.total_vesting_shares += new_vesting;
         }
      } );
      // Update witness voting numbers.
      if( !to_reward_balance )
         db.adjust_proxied_witness_votes( to_account, new_vesting.amount );

      return new_vesting;
   }
   FC_CAPTURE_AND_RETHROW( (to_account.name)(liquid) )
}

/**
 * @param to_account - the account to receive the new vesting shares
 * @param liquid     - BLURT or liquid SMT to be converted to vesting shares
 */
asset database::create_vesting( const account_object& to_account, asset liquid, bool to_reward_balance )
{
   return create_vesting2( *this, to_account, liquid, to_reward_balance, []( asset vests_created ) {} );
}

void database::adjust_proxied_witness_votes( const account_object& a,
                                   const std::array< share_type, BLURT_MAX_PROXY_RECURSION_DEPTH+1 >& delta,
                                   int depth )
{
   if( a.proxy != BLURT_PROXY_TO_SELF_ACCOUNT )
   {
      /// nested proxies are not supported, vote will not propagate
      if( depth >= BLURT_MAX_PROXY_RECURSION_DEPTH )
         return;

      const auto& proxy = get_account( a.proxy );

      modify( proxy, [&]( account_object& a )
      {
         for( int i = BLURT_MAX_PROXY_RECURSION_DEPTH - depth - 1; i >= 0; --i )
         {
            a.proxied_vsf_votes[i+depth] += delta[i];
         }
      } );

      adjust_proxied_witness_votes( proxy, delta, depth + 1 );
   }
   else
   {
      share_type total_delta = 0;
      for( int i = BLURT_MAX_PROXY_RECURSION_DEPTH - depth; i >= 0; --i )
         total_delta += delta[i];
      adjust_witness_votes( a, total_delta );
   }
}

void database::adjust_proxied_witness_votes( const account_object& a, share_type delta, int depth )
{
   if( a.proxy != BLURT_PROXY_TO_SELF_ACCOUNT )
   {
      /// nested proxies are not supported, vote will not propagate
      if( depth >= BLURT_MAX_PROXY_RECURSION_DEPTH )
         return;

      const auto& proxy = get_account( a.proxy );

      modify( proxy, [&]( account_object& a )
      {
         a.proxied_vsf_votes[depth] += delta;
      } );

      adjust_proxied_witness_votes( proxy, delta, depth + 1 );
   }
   else
   {
     adjust_witness_votes( a, delta );
   }
}

void database::adjust_witness_votes( const account_object& a, share_type delta )
{
   const auto& vidx = get_index< witness_vote_index >().indices().get< by_account_witness >();
   auto itr = vidx.lower_bound( boost::make_tuple( a.name, account_name_type() ) );
   while( itr != vidx.end() && itr->account == a.name )
   {
      adjust_witness_vote( get< witness_object, by_name >(itr->witness), delta );
      ++itr;
   }
}

void database::adjust_witness_vote( const witness_object& witness, share_type delta )
{
   const witness_schedule_object& wso = get_witness_schedule_object();
   const dynamic_global_property_object& dpo = get_dynamic_global_properties();

   modify( witness, [&]( witness_object& w )
   {
      auto delta_pos = w.votes.value * (wso.current_virtual_time - w.virtual_last_update);
      w.virtual_position += delta_pos;

      w.virtual_last_update = wso.current_virtual_time;
      w.votes += delta;
      if (has_hardfork(BLURT_HARDFORK_0_3)) {
         FC_ASSERT(w.votes <= dpo.total_vesting_shares.amount + dpo.regent_vesting_shares.amount, "", ("w.votes", w.votes)("props", dpo.total_vesting_shares));
      } else {
         FC_ASSERT( w.votes <= dpo.total_vesting_shares.amount, "", ("w.votes", w.votes)("props", dpo.total_vesting_shares) );
      }

      w.virtual_scheduled_time = w.virtual_last_update + (BLURT_VIRTUAL_SCHEDULE_LAP_LENGTH2 - w.virtual_position)/(w.votes.value+1);

      /** witnesses with a low number of votes could overflow the time field and end up with a scheduled time in the past */
      if( w.virtual_scheduled_time < wso.current_virtual_time )
         w.virtual_scheduled_time = fc::uint128::max_value();
   } );
}

void database::clear_witness_votes( const account_object& a )
{
   const auto& vidx = get_index< witness_vote_index >().indices().get<by_account_witness>();
   auto itr = vidx.lower_bound( boost::make_tuple( a.name, account_name_type() ) );
   while( itr != vidx.end() && itr->account == a.name )
   {
      const auto& current = *itr;
      ++itr;
      remove(current);
   }

   modify( a, [&](account_object& acc )
   {
      acc.witnesses_voted_for = 0;
   });
}

void database::clear_null_account_balance()
{
   const auto& null_account = get_account( BLURT_NULL_ACCOUNT );
   asset total_steem( 0, BLURT_SYMBOL );
   asset total_vests( 0, VESTS_SYMBOL );

   asset vesting_shares_steem_value = asset( 0, BLURT_SYMBOL );

   if( null_account.balance.amount > 0 )
   {
      total_steem += null_account.balance;
   }

   if( null_account.savings_balance.amount > 0 )
   {
      total_steem += null_account.savings_balance;
   }

   if( null_account.vesting_shares.amount > 0 )
   {
      const auto& gpo = get_dynamic_global_properties();
      vesting_shares_steem_value = null_account.vesting_shares * gpo.get_vesting_share_price();
      total_steem += vesting_shares_steem_value;
      total_vests += null_account.vesting_shares;
   }

   if( null_account.reward_blurt_balance.amount > 0 )
   {
      total_steem += null_account.reward_blurt_balance;
   }

   if( null_account.reward_vesting_balance.amount > 0 )
   {
      total_steem += null_account.reward_vesting_blurt;
      total_vests += null_account.reward_vesting_balance;
   }

   if( (total_steem.amount.value == 0) && (total_vests.amount.value == 0) )
      return;

   operation vop_op = clear_null_account_balance_operation();
   clear_null_account_balance_operation& vop = vop_op.get< clear_null_account_balance_operation >();
   if( total_steem.amount.value > 0 )
      vop.total_cleared.push_back( total_steem );
   if( total_vests.amount.value > 0 )
      vop.total_cleared.push_back( total_vests );

   pre_push_virtual_operation( vop_op );

   /////////////////////////////////////////////////////////////////////////////////////

   if( null_account.balance.amount > 0 )
   {
      adjust_balance( null_account, -null_account.balance );
   }

   if( null_account.savings_balance.amount > 0 )
   {
      adjust_savings_balance( null_account, -null_account.savings_balance );
   }

   if( null_account.vesting_shares.amount > 0 )
   {
      const auto& gpo = get_dynamic_global_properties();

      modify( gpo, [&]( dynamic_global_property_object& g )
      {
         g.total_vesting_shares -= null_account.vesting_shares;
         g.total_vesting_fund_blurt -= vesting_shares_steem_value;
      });

      modify( null_account, [&]( account_object& a )
      {
         a.vesting_shares.amount = 0;
      });
   }

   if( null_account.reward_blurt_balance.amount > 0 )
   {
      adjust_reward_balance( null_account, -null_account.reward_blurt_balance );
   }

   if( null_account.reward_vesting_balance.amount > 0 )
   {
      const auto& gpo = get_dynamic_global_properties();

      modify( gpo, [&]( dynamic_global_property_object& g )
      {
         g.pending_rewarded_vesting_shares -= null_account.reward_vesting_balance;
         g.pending_rewarded_vesting_blurt -= null_account.reward_vesting_blurt;
      });

      modify( null_account, [&]( account_object& a )
      {
         a.reward_vesting_blurt.amount = 0;
         a.reward_vesting_balance.amount = 0;
      });
   }

   //////////////////////////////////////////////////////////////

   if( total_steem.amount > 0 )
      adjust_supply( -total_steem );

   post_push_virtual_operation( vop_op );
}

void database::process_proposals( const block_notification& note )
{
   sps_processor sps( *this );
   sps.run( note );
}

void database::process_regent_account()
{
   if( (head_block_num() % 864000) == 0 ) { // 864000 ~ 1 month
      const auto& dgpo = get_dynamic_global_properties();
      auto step = dgpo.regent_init_vesting_shares.amount / 24;
      auto new_regent_vesting_shares = dgpo.regent_vesting_shares.amount - step;

      if (new_regent_vesting_shares >= 0) {
         auto delta = dgpo.regent_vesting_shares.amount - new_regent_vesting_shares;
         const auto& regent_account = this->get_account(BLURT_REGENT_ACCOUNT);

         modify( dgpo, [&]( dynamic_global_property_object& p )
         {
            p.regent_vesting_shares = asset(new_regent_vesting_shares, VESTS_SYMBOL);
            adjust_proxied_witness_votes( regent_account, -delta );
         } );
      }
   }
}

/**
 * This method updates total_reward_shares2 on DGPO, and children_rshares2 on comments, when a comment's rshares2 changes
 * from old_rshares2 to new_rshares2.  Maintaining invariants that children_rshares2 is the sum of all descendants' rshares2,
 * and dgpo.total_reward_shares2 is the total number of rshares2 outstanding.
 */
void database::adjust_rshares2( const comment_object& c, fc::uint128_t old_rshares2, fc::uint128_t new_rshares2 )
{

   const auto& dgpo = get_dynamic_global_properties();
   modify( dgpo, [&]( dynamic_global_property_object& p )
   {
      p.total_reward_shares2 -= old_rshares2;
      p.total_reward_shares2 += new_rshares2;
   } );
}

void database::update_owner_authority( const account_object& account, const authority& owner_authority )
{
   create< owner_authority_history_object >( [&]( owner_authority_history_object& hist )
   {
      hist.account = account.name;
      hist.previous_owner_authority = get< account_authority_object, by_account >( account.name ).owner;
      hist.last_valid_time = head_block_time();
   });

   modify( get< account_authority_object, by_account >( account.name ), [&]( account_authority_object& auth )
   {
      auth.owner = owner_authority;
      auth.last_owner_update = head_block_time();
   });
}

void database::process_vesting_withdrawals()
{
   const auto& widx = get_index< account_index, by_next_vesting_withdrawal >();
   const auto& didx = get_index< withdraw_vesting_route_index, by_withdraw_route >();
   auto current = widx.begin();

   const auto& cprops = get_dynamic_global_properties();

   while( current != widx.end() && current->next_vesting_withdrawal <= head_block_time() )
   {
      const auto& from_account = *current; ++current;

      /**
      *  Let T = total tokens in vesting fund
      *  Let V = total vesting shares
      *  Let v = total vesting shares being cashed out
      *
      *  The user may withdraw  vT / V tokens
      */
      share_type to_withdraw;
      if ( from_account.to_withdraw - from_account.withdrawn < from_account.vesting_withdraw_rate.amount )
         to_withdraw = std::min( from_account.vesting_shares.amount, from_account.to_withdraw % from_account.vesting_withdraw_rate.amount ).value;
      else
         to_withdraw = std::min( from_account.vesting_shares.amount, from_account.vesting_withdraw_rate.amount ).value;

      share_type vests_deposited_as_steem = 0;
      share_type vests_deposited_as_vests = 0;
      asset total_blurt_converted = asset( 0, BLURT_SYMBOL );

      // Do two passes, the first for vests, the second for steem. Try to maintain as much accuracy for vests as possible.
      for( auto itr = didx.upper_bound( boost::make_tuple( from_account.name, account_name_type() ) );
           itr != didx.end() && itr->from_account == from_account.name;
           ++itr )
      {
         if( itr->auto_vest )
         {
            share_type to_deposit = ( ( fc::uint128_t ( to_withdraw.value ) * itr->percent ) / BLURT_100_PERCENT ).to_uint64();
            vests_deposited_as_vests += to_deposit;

            if( to_deposit > 0 )
            {
               const auto& to_account = get< account_object, by_name >( itr->to_account );

               operation vop = fill_vesting_withdraw_operation( from_account.name, to_account.name, asset( to_deposit, VESTS_SYMBOL ), asset( to_deposit, VESTS_SYMBOL ) );

               pre_push_virtual_operation( vop );

               modify( to_account, [&]( account_object& a )
               {
                  a.vesting_shares.amount += to_deposit;
               });

               adjust_proxied_witness_votes( to_account, to_deposit );

               post_push_virtual_operation( vop );
            }
         }
      }

      for( auto itr = didx.upper_bound( boost::make_tuple( from_account.name, account_name_type() ) );
           itr != didx.end() && itr->from_account == from_account.name;
           ++itr )
      {
         if( !itr->auto_vest )
         {
            const auto& to_account = get< account_object, by_name >( itr->to_account );

            share_type to_deposit = ( ( fc::uint128_t ( to_withdraw.value ) * itr->percent ) / BLURT_100_PERCENT ).to_uint64();
            vests_deposited_as_steem += to_deposit;
            auto converted_steem = asset( to_deposit, VESTS_SYMBOL ) * cprops.get_vesting_share_price();
            total_blurt_converted += converted_steem;

            if( to_deposit > 0 )
            {
               operation vop = fill_vesting_withdraw_operation( from_account.name, to_account.name, asset( to_deposit, VESTS_SYMBOL), converted_steem );

               pre_push_virtual_operation( vop );

               modify( to_account, [&]( account_object& a )
               {
                  a.balance += converted_steem;
               });

               modify( cprops, [&]( dynamic_global_property_object& o )
               {
                  o.total_vesting_fund_blurt -= converted_steem;
                  o.total_vesting_shares.amount -= to_deposit;
               });

               post_push_virtual_operation( vop );
            }
         }
      }

      share_type to_convert = to_withdraw - vests_deposited_as_steem - vests_deposited_as_vests;
      FC_ASSERT( to_convert >= 0, "Deposited more vests than were supposed to be withdrawn" );

      auto converted_steem = asset( to_convert, VESTS_SYMBOL ) * cprops.get_vesting_share_price();
      operation vop = fill_vesting_withdraw_operation( from_account.name, from_account.name, asset( to_convert, VESTS_SYMBOL ), converted_steem );
      pre_push_virtual_operation( vop );

      modify( from_account, [&]( account_object& a )
      {
         a.vesting_shares.amount -= to_withdraw;
         a.balance += converted_steem;
         a.withdrawn += to_withdraw;

         if( a.withdrawn >= a.to_withdraw || a.vesting_shares.amount == 0 )
         {
            a.vesting_withdraw_rate.amount = 0;
            a.next_vesting_withdrawal = fc::time_point_sec::maximum();
         }
         else
         {
            a.next_vesting_withdrawal += fc::seconds( BLURT_VESTING_WITHDRAW_INTERVAL_SECONDS );
         }
      });

      modify( cprops, [&]( dynamic_global_property_object& o )
      {
         o.total_vesting_fund_blurt -= converted_steem;
         o.total_vesting_shares.amount -= to_convert;
      });

      if( to_withdraw > 0 )
         adjust_proxied_witness_votes( from_account, -to_withdraw );

      post_push_virtual_operation( vop );
   }
}

void database::adjust_total_payout( const comment_object& cur, const asset& total_payout_value, const asset& curator_payout_value, const asset& beneficiary_payout_value )
{
   modify( cur, [&]( comment_object& c )
   {
      c.total_payout_value += total_payout_value;
      c.curator_payout_value += curator_payout_value;
      c.beneficiary_payout_value += beneficiary_payout_value;
   } );
   /// TODO: potentially modify author's total payout numbers as well
}

/**
 *  This method will iterate through all comment_vote_objects and give them
 *  (max_rewards * weight) / c.total_vote_weight.
 *
 *  @returns unclaimed rewards.
 */
share_type database::pay_curators( const comment_object& c, share_type& max_rewards )
{
   struct cmp
   {
      bool operator()( const comment_vote_object* obj, const comment_vote_object* obj2 ) const
      {
         if( obj->weight == obj2->weight )
            return obj->voter < obj2->voter;
         else
            return obj->weight > obj2->weight;
      }
   };

   try
   {
      uint128_t total_weight( c.total_vote_weight );
      //edump( (total_weight)(max_rewards) );
      share_type unclaimed_rewards = max_rewards;

      if( !c.allow_curation_rewards )
      {
         unclaimed_rewards = 0;
         max_rewards = 0;
      }
      else if( c.total_vote_weight > 0 )
      {
         const auto& cvidx = get_index<comment_vote_index>().indices().get<by_comment_voter>();
         auto itr = cvidx.lower_bound( c.id );

         std::set< const comment_vote_object*, cmp > proxy_set;
         while( itr != cvidx.end() && itr->comment == c.id )
         {
            proxy_set.insert( &( *itr ) );
            ++itr;
         }

         for( auto& item : proxy_set )
         { try {
            uint128_t weight( item->weight );
            auto claim = ( ( max_rewards.value * weight ) / total_weight ).to_uint64();
            if( claim > 0 ) // min_amt is non-zero satoshis
            {
               unclaimed_rewards -= claim;
               const auto& voter = get( item->voter );
               operation vop = curation_reward_operation( voter.name, asset(0, VESTS_SYMBOL), c.author, to_string( c.permlink ) );
               create_vesting2( *this, voter, asset( claim, BLURT_SYMBOL ), true,
                  [&]( const asset& reward )
                  {
                     vop.get< curation_reward_operation >().reward = reward;
                     pre_push_virtual_operation( vop );
                  } );

               #ifndef IS_LOW_MEM
                  modify( voter, [&]( account_object& a )
                  {
                     a.curation_rewards += claim;
                  });
               #endif
               post_push_virtual_operation( vop );
            }
         } FC_CAPTURE_AND_RETHROW( (*item) ) }
      }
      max_rewards -= unclaimed_rewards;

      return unclaimed_rewards;
   } FC_CAPTURE_AND_RETHROW( (max_rewards) )
}

void fill_comment_reward_context_local_state( util::comment_reward_context& ctx, const comment_object& comment )
{
   ctx.rshares = comment.net_rshares;
   ctx.reward_weight = comment.reward_weight;
   ctx.max_payout = comment.max_accepted_payout;
}

share_type database::cashout_comment_helper( util::comment_reward_context& ctx, const comment_object& comment, bool forward_curation_remainder )
{
   try
   {
      share_type claimed_reward = 0;

      if( comment.net_rshares > 0 )
      {
         fill_comment_reward_context_local_state( ctx, comment );

         {
            const auto rf = get_reward_fund( comment );
            ctx.reward_curve = rf.author_reward_curve;
            ctx.content_constant = rf.content_constant;
         }

         const auto& gpo = get_dynamic_global_properties();
         const share_type reward = util::get_rshare_reward( ctx, gpo );
         uint128_t reward_tokens = uint128_t( reward.value );

         if( reward_tokens > 0 )
         {
            share_type curation_tokens = ( ( reward_tokens * get_curation_rewards_percent( comment ) ) / BLURT_100_PERCENT ).to_uint64();
            share_type author_tokens = reward_tokens.to_uint64() - curation_tokens;

            share_type curation_remainder = pay_curators( comment, curation_tokens );

            if( forward_curation_remainder )
               author_tokens += curation_remainder;

            share_type total_beneficiary = 0;
            claimed_reward = author_tokens + curation_tokens;

            for( auto& b : comment.beneficiaries )
            {
               auto benefactor_tokens = ( author_tokens * b.weight ) / BLURT_100_PERCENT;
               auto benefactor_vesting_steem = benefactor_tokens;
               auto vop = comment_benefactor_reward_operation( b.account, comment.author, to_string( comment.permlink ), asset( 0, BLURT_SYMBOL ), asset( 0, VESTS_SYMBOL ) );

               if( b.account == BLURT_TREASURY_ACCOUNT )
               {
                  benefactor_vesting_steem = 0;
                  vop.blurt_payout = asset( benefactor_tokens, BLURT_SYMBOL );
                  adjust_balance( get_account( BLURT_TREASURY_ACCOUNT ), vop.blurt_payout );
               }
               else
               {
                  benefactor_vesting_steem  = benefactor_tokens;
               }

               create_vesting2( *this, get_account( b.account ), asset( benefactor_vesting_steem, BLURT_SYMBOL ), true,
               [&]( const asset& reward )
               {
                  vop.vesting_payout = reward;
                  pre_push_virtual_operation( vop );
               });

               post_push_virtual_operation( vop );
               total_beneficiary += benefactor_tokens;
            }

            author_tokens -= total_beneficiary;
            auto vesting_steem = author_tokens;
            const auto& author = get_account( comment.author );
            operation vop = author_reward_operation( comment.author, to_string( comment.permlink ), asset( 0, BLURT_SYMBOL ), asset( 0, VESTS_SYMBOL ) );

            create_vesting2( *this, author, asset( vesting_steem, BLURT_SYMBOL ), true,
               [&]( const asset& vesting_payout )
               {
                  vop.get< author_reward_operation >().vesting_payout = vesting_payout;
                  pre_push_virtual_operation( vop );
               } );

            adjust_total_payout( comment, asset( vesting_steem, BLURT_SYMBOL ), asset( curation_tokens, BLURT_SYMBOL ), asset( total_beneficiary, BLURT_SYMBOL ) );
            post_push_virtual_operation( vop );
            vop = comment_reward_operation( comment.author, to_string( comment.permlink ), asset( claimed_reward, BLURT_SYMBOL ) );
            pre_push_virtual_operation( vop );
            post_push_virtual_operation( vop );

            #ifndef IS_LOW_MEM
               modify( comment, [&]( comment_object& c )
               {
                  c.author_rewards += author_tokens;
               });

               modify( get_account( comment.author ), [&]( account_object& a )
               {
                  a.posting_rewards += author_tokens;
               });
            #endif

         }
      }

      modify( comment, [&]( comment_object& c )
      {
         /**
         * A payout is only made for positive rshares, negative rshares hang around
         * for the next time this post might get an upvote.
         */
         if( c.net_rshares > 0 )
            c.net_rshares = 0;
         c.children_abs_rshares = 0;
         c.abs_rshares  = 0;
         c.vote_rshares = 0;
         c.total_vote_weight = 0;
         c.max_cashout_time = fc::time_point_sec::maximum();
         c.cashout_time = fc::time_point_sec::maximum();
         c.last_payout = head_block_time();
      } );

      push_virtual_operation( comment_payout_update_operation( comment.author, to_string( comment.permlink ) ) );

      const auto& vote_idx = get_index< comment_vote_index >().indices().get< by_comment_voter >();
      auto vote_itr = vote_idx.lower_bound( comment.id );
      while( vote_itr != vote_idx.end() && vote_itr->comment == comment.id )
      {
         const auto& cur_vote = *vote_itr;
         ++vote_itr;
         if( calculate_discussion_payout_time( comment ) != fc::time_point_sec::maximum() )
         {
            modify( cur_vote, [&]( comment_vote_object& cvo )
            {
               cvo.num_changes = -1;
            });
         }
         else
         {
#ifdef CLEAR_VOTES
            remove( cur_vote );
#endif
         }
      }

      return claimed_reward;
   } FC_CAPTURE_AND_RETHROW( (comment)(ctx) )
}

void database::process_comment_cashout()
{
   util::comment_reward_context ctx;
   vector< reward_fund_context > funds;
   vector< share_type > blurt_awarded;
   const auto& reward_idx = get_index< reward_fund_index, by_id >();

   // Decay recent rshares of each fund
   for( auto itr = reward_idx.begin(); itr != reward_idx.end(); ++itr )
   {
      // Add all reward funds to the local cache and decay their recent rshares
      modify( *itr, [&]( reward_fund_object& rfo )
      {
         fc::microseconds decay_time = BLURT_RECENT_RSHARES_DECAY_TIME_HF19;

         int64_t delta_seconds = (head_block_time() - rfo.last_update).to_seconds();
         if (delta_seconds < decay_time.to_seconds()) {
           rfo.recent_claims -= (rfo.recent_claims * delta_seconds) / decay_time.to_seconds();
         }

         rfo.last_update = head_block_time();
      });

      reward_fund_context rf_ctx;
      rf_ctx.recent_claims = itr->recent_claims;
      rf_ctx.reward_balance = itr->reward_balance;

      // The index is by ID, so the ID should be the current size of the vector (0, 1, 2, etc...)
      assert( funds.size() == static_cast<size_t>(itr->id._id) );

      funds.push_back( rf_ctx );
   }

   const auto& cidx        = get_index< comment_index >().indices().get< by_cashout_time >();
   auto current = cidx.begin();
   //  add all rshares about to be cashed out to the reward funds. This ensures equal satoshi per rshare payment
   {
      while( current != cidx.end() && current->cashout_time <= head_block_time() )
      {
         if( current->net_rshares > 0 )
         {
            const auto& rf = get_reward_fund( *current );
            funds[ rf.id._id ].recent_claims += util::evaluate_reward_curve( current->net_rshares.value, rf.author_reward_curve, rf.content_constant );
         }

         ++current;
      }

      current = cidx.begin();
   }

   /*
    * Payout all comments
    *
    * Each payout follows a similar pattern, but for a different reason.
    * Cashout comment helper does not know about the reward fund it is paying from.
    * The helper only does token allocation based on curation rewards and the SBD
    * global %, etc.
    *
    * Each context is used by get_rshare_reward to determine what part of each budget
    * the comment is entitled to. Prior to hardfork 17, all payouts are done against
    * the global state updated each payout. After the hardfork, each payout is done
    * against a reward fund state that is snapshotted before all payouts in the block.
    */
   while( current != cidx.end() && current->cashout_time <= head_block_time() )
   {
      auto fund_id = get_reward_fund( *current ).id._id;
      ctx.total_reward_shares2 = funds[ fund_id ].recent_claims;
      ctx.total_reward_fund_blurt = funds[ fund_id ].reward_balance;

      funds[ fund_id ].blurt_awarded += cashout_comment_helper( ctx, *current, false );

      current = cidx.begin();
   }

   // Write the cached fund state back to the database
   if( funds.size() )
   {
      for( size_t i = 0; i < funds.size(); i++ )
      {
         modify( get< reward_fund_object, by_id >( reward_fund_id_type( i ) ), [&]( reward_fund_object& rfo )
         {
            rfo.recent_claims = funds[ i ].recent_claims;
            rfo.reward_balance -= asset( funds[ i ].blurt_awarded, BLURT_SYMBOL );
         });
      }
   }
}

/**
 *  Overall the network has an inflation rate of 102% of virtual steem per year
 *  90% of inflation is directed to vesting shares
 *  10% of inflation is directed to subjective proof of work voting
 *  1% of inflation is directed to liquidity providers
 *  1% of inflation is directed to block producers
 *
 *  This method pays out vesting and reward shares every block, and liquidity shares once per day.
 *  This method does not pay out witnesses.
 */
void database::process_funds()
{
   const auto& props = get_dynamic_global_properties();
   const auto& wso = get_witness_schedule_object();

   /**
    * At block 7,000,000 have a 9.5% instantaneous inflation rate, decreasing to 0.95% at a rate of 0.01%
    * every 250k blocks. This narrowing will take approximately 20.5 years and will complete on block 220,750,000
    */
   int64_t start_inflation_rate = int64_t( BLURT_INFLATION_RATE_START_PERCENT );
   int64_t inflation_rate_adjustment = int64_t( head_block_num() / BLURT_INFLATION_NARROWING_PERIOD );
   int64_t inflation_rate_floor = int64_t( BLURT_INFLATION_RATE_STOP_PERCENT );

   // below subtraction cannot underflow int64_t because inflation_rate_adjustment is <2^32
   int64_t current_inflation_rate = std::max( start_inflation_rate - inflation_rate_adjustment, inflation_rate_floor );

   auto new_steem = ( props.current_supply.amount * current_inflation_rate ) / ( int64_t( BLURT_100_PERCENT ) * int64_t( BLURT_BLOCKS_PER_YEAR ) );
   auto content_reward = ( new_steem * props.content_reward_percent ) / BLURT_100_PERCENT;
   content_reward = pay_reward_funds( content_reward );
   auto vesting_reward = ( new_steem * props.vesting_reward_percent ) / BLURT_100_PERCENT;
   auto sps_fund = ( new_steem * props.sps_fund_percent ) / BLURT_100_PERCENT;
   auto witness_reward = new_steem - content_reward - vesting_reward - sps_fund;

   const auto& cwit = get_witness( props.current_witness );
   witness_reward *= BLURT_MAX_WITNESSES;

   if( cwit.schedule == witness_object::timeshare )
      witness_reward *= wso.timeshare_weight;
   else if( cwit.schedule == witness_object::elected )
      witness_reward *= wso.elected_weight;
   else
      wlog( "Encountered unknown witness type for witness: ${w}", ("w", cwit.owner) );

   witness_reward /= wso.witness_pay_normalization_factor;

   if( sps_fund.value )
   {
      adjust_balance( BLURT_TREASURY_ACCOUNT, asset( sps_fund, BLURT_SYMBOL ) );
   }

   new_steem = content_reward + vesting_reward + witness_reward;

   modify( props, [&]( dynamic_global_property_object& p )
   {
      p.total_vesting_fund_blurt += asset( vesting_reward, BLURT_SYMBOL );
      p.current_supply      += asset( new_steem + sps_fund, BLURT_SYMBOL );
      p.sps_interval_ledger += asset( sps_fund, BLURT_SYMBOL );
   });

   operation vop = producer_reward_operation( cwit.owner, asset( 0, VESTS_SYMBOL ) );
   create_vesting2( *this, get_account( cwit.owner ), asset( witness_reward, BLURT_SYMBOL ), false,
      [&]( const asset& vesting_shares )
      {
         vop.get< producer_reward_operation >().vesting_shares = vesting_shares;
         pre_push_virtual_operation( vop );
      } );
   post_push_virtual_operation( vop );
}

void database::process_savings_withdraws()
{
  const auto& idx = get_index< savings_withdraw_index >().indices().get< by_complete_from_rid >();
  auto itr = idx.begin();
  while( itr != idx.end() ) {
     if( itr->complete > head_block_time() )
        break;
     adjust_balance( get_account( itr->to ), itr->amount );

     modify( get_account( itr->from ), [&]( account_object& a )
     {
        a.savings_withdraw_requests--;
     });

     push_virtual_operation( fill_transfer_from_savings_operation( itr->from, itr->to, itr->amount, itr->request_id, to_string( itr->memo) ) );

     remove( *itr );
     itr = idx.begin();
  }
}

void database::process_subsidized_accounts()
{
   const witness_schedule_object& wso = get_witness_schedule_object();
   const dynamic_global_property_object& gpo = get_dynamic_global_properties();

   // Update global pool.
   modify( gpo, [&]( dynamic_global_property_object& g )
   {
      g.available_account_subsidies = rd_apply( wso.account_subsidy_rd, g.available_account_subsidies );
   } );

   // Update per-witness pool for current witness.
   const witness_object& current_witness = get_witness( gpo.current_witness );
   if( current_witness.schedule == witness_object::elected )
   {
      modify( current_witness, [&]( witness_object& w )
      {
         w.available_witness_account_subsidies = rd_apply( wso.account_subsidy_witness_rd, w.available_witness_account_subsidies );
      } );
   }
}

uint16_t database::get_curation_rewards_percent( const comment_object& c ) const
{
   return get_reward_fund( c ).percent_curation_rewards;
}

share_type database::pay_reward_funds( share_type reward )
{
   const auto& reward_idx = get_index< reward_fund_index, by_id >();
   share_type used_rewards = 0;

   for( auto itr = reward_idx.begin(); itr != reward_idx.end(); ++itr )
   {
      // reward is a per block reward and the percents are 16-bit. This should never overflow
      auto r = ( reward * itr->percent_content_rewards ) / BLURT_100_PERCENT;

      modify( *itr, [&]( reward_fund_object& rfo )
      {
         rfo.reward_balance += asset( r, BLURT_SYMBOL );
      });

      used_rewards += r;

      // Sanity check to ensure we aren't printing more BLURT than has been allocated through inflation
      FC_ASSERT( used_rewards <= reward );
   }

   return used_rewards;
}

void database::account_recovery_processing()
{
   // Clear expired recovery requests
   const auto& rec_req_idx = get_index< account_recovery_request_index >().indices().get< by_expiration >();
   auto rec_req = rec_req_idx.begin();

   while( rec_req != rec_req_idx.end() && rec_req->expires <= head_block_time() )
   {
      remove( *rec_req );
      rec_req = rec_req_idx.begin();
   }

   // Clear invalid historical authorities
   const auto& hist_idx = get_index< owner_authority_history_index >().indices(); //by id
   auto hist = hist_idx.begin();

   while( hist != hist_idx.end() && time_point_sec( hist->last_valid_time + BLURT_OWNER_AUTH_RECOVERY_PERIOD ) < head_block_time() )
   {
      remove( *hist );
      hist = hist_idx.begin();
   }

   // Apply effective recovery_account changes
   const auto& change_req_idx = get_index< change_recovery_account_request_index >().indices().get< by_effective_date >();
   auto change_req = change_req_idx.begin();

   while( change_req != change_req_idx.end() && change_req->effective_on <= head_block_time() )
   {
      modify( get_account( change_req->account_to_recover ), [&]( account_object& a )
      {
         a.recovery_account = change_req->recovery_account;
      });

      remove( *change_req );
      change_req = change_req_idx.begin();
   }
}

void database::expire_escrow_ratification()
{
   const auto& escrow_idx = get_index< escrow_index >().indices().get< by_ratification_deadline >();
   auto escrow_itr = escrow_idx.lower_bound( false );

   while( escrow_itr != escrow_idx.end() && !escrow_itr->is_approved() && escrow_itr->ratification_deadline <= head_block_time() )
   {
      const auto& old_escrow = *escrow_itr;
      ++escrow_itr;

      adjust_balance( old_escrow.from, old_escrow.blurt_balance );
      adjust_balance( old_escrow.from, old_escrow.pending_fee );

      remove( old_escrow );
   }
}

void database::process_decline_voting_rights()
{
   const auto& request_idx = get_index< decline_voting_rights_request_index >().indices().get< by_effective_date >();
   auto itr = request_idx.begin();

   while( itr != request_idx.end() && itr->effective_date <= head_block_time() )
   {
      const auto& account = get< account_object, by_name >( itr->account );

      /// remove all current votes
      std::array<share_type, BLURT_MAX_PROXY_RECURSION_DEPTH+1> delta;
      delta[0] = -account.vesting_shares.amount;
      for( int i = 0; i < BLURT_MAX_PROXY_RECURSION_DEPTH; ++i )
         delta[i+1] = -account.proxied_vsf_votes[i];
      adjust_proxied_witness_votes( account, delta );

      clear_witness_votes( account );

      modify( account, [&]( account_object& a )
      {
         a.can_vote = false;
         a.proxy = BLURT_PROXY_TO_SELF_ACCOUNT;
      });

      remove( *itr );
      itr = request_idx.begin();
   }
}

time_point_sec database::head_block_time()const
{
   return get_dynamic_global_properties().time;
}

uint32_t database::head_block_num()const
{
   return get_dynamic_global_properties().head_block_number;
}

block_id_type database::head_block_id()const
{
   return get_dynamic_global_properties().head_block_id;
}

node_property_object& database::node_properties()
{
   return _node_property_object;
}

uint32_t database::last_non_undoable_block_num() const
{
   return get_dynamic_global_properties().last_irreversible_block_num;
}

void database::initialize_evaluators()
{
   _my->_evaluator_registry.register_evaluator< vote_evaluator                           >();
   _my->_evaluator_registry.register_evaluator< comment_evaluator                        >();
   _my->_evaluator_registry.register_evaluator< comment_options_evaluator                >();
   _my->_evaluator_registry.register_evaluator< delete_comment_evaluator                 >();
   _my->_evaluator_registry.register_evaluator< transfer_evaluator                       >();
   _my->_evaluator_registry.register_evaluator< transfer_to_vesting_evaluator            >();
   _my->_evaluator_registry.register_evaluator< withdraw_vesting_evaluator               >();
   _my->_evaluator_registry.register_evaluator< set_withdraw_vesting_route_evaluator     >();
   _my->_evaluator_registry.register_evaluator< account_create_evaluator                 >();
   _my->_evaluator_registry.register_evaluator< account_update_evaluator                 >();
   _my->_evaluator_registry.register_evaluator< witness_update_evaluator                 >();
   _my->_evaluator_registry.register_evaluator< account_witness_vote_evaluator           >();
   _my->_evaluator_registry.register_evaluator< account_witness_proxy_evaluator          >();
   _my->_evaluator_registry.register_evaluator< custom_evaluator                         >();
   _my->_evaluator_registry.register_evaluator< custom_binary_evaluator                  >();
   _my->_evaluator_registry.register_evaluator< custom_json_evaluator                    >();
   _my->_evaluator_registry.register_evaluator< claim_account_evaluator                  >();
   _my->_evaluator_registry.register_evaluator< create_claimed_account_evaluator         >();
   _my->_evaluator_registry.register_evaluator< request_account_recovery_evaluator       >();
   _my->_evaluator_registry.register_evaluator< recover_account_evaluator                >();
   _my->_evaluator_registry.register_evaluator< change_recovery_account_evaluator        >();
   _my->_evaluator_registry.register_evaluator< escrow_transfer_evaluator                >();
   _my->_evaluator_registry.register_evaluator< escrow_approve_evaluator                 >();
   _my->_evaluator_registry.register_evaluator< escrow_dispute_evaluator                 >();
   _my->_evaluator_registry.register_evaluator< escrow_release_evaluator                 >();
   _my->_evaluator_registry.register_evaluator< transfer_to_savings_evaluator            >();
   _my->_evaluator_registry.register_evaluator< transfer_from_savings_evaluator          >();
   _my->_evaluator_registry.register_evaluator< cancel_transfer_from_savings_evaluator   >();
   _my->_evaluator_registry.register_evaluator< decline_voting_rights_evaluator          >();
   _my->_evaluator_registry.register_evaluator< reset_account_evaluator                  >();
   _my->_evaluator_registry.register_evaluator< set_reset_account_evaluator              >();
   _my->_evaluator_registry.register_evaluator< claim_reward_balance_evaluator           >();
   _my->_evaluator_registry.register_evaluator< delegate_vesting_shares_evaluator        >();
   _my->_evaluator_registry.register_evaluator< witness_set_properties_evaluator         >();
   _my->_evaluator_registry.register_evaluator< create_proposal_evaluator                >();
   _my->_evaluator_registry.register_evaluator< update_proposal_votes_evaluator          >();
   _my->_evaluator_registry.register_evaluator< remove_proposal_evaluator                >();
}


void database::register_custom_operation_interpreter( std::shared_ptr< custom_operation_interpreter > interpreter )
{
   FC_ASSERT( interpreter );
   bool inserted = _custom_operation_interpreters.emplace( interpreter->get_custom_id(), interpreter ).second;
   // This assert triggering means we're mis-configured (multiple registrations of custom JSON evaluator for same ID)
   FC_ASSERT( inserted );
}

std::shared_ptr< custom_operation_interpreter > database::get_custom_json_evaluator( const custom_id_type& id )
{
   auto it = _custom_operation_interpreters.find( id );
   if( it != _custom_operation_interpreters.end() )
      return it->second;
   return std::shared_ptr< custom_operation_interpreter >();
}

void initialize_core_indexes( database& db );

void database::initialize_indexes()
{
   initialize_core_indexes( *this );
   _plugin_index_signal();
}

const std::string& database::get_json_schema()const
{
   return _json_schema;
}

void database::init_schema()
{
   /*done_adding_indexes();

   db_schema ds;

   std::vector< std::shared_ptr< abstract_schema > > schema_list;

   std::vector< object_schema > object_schemas;
   get_object_schemas( object_schemas );

   for( const object_schema& oschema : object_schemas )
   {
      ds.object_types.emplace_back();
      ds.object_types.back().space_type.first = oschema.space_id;
      ds.object_types.back().space_type.second = oschema.type_id;
      oschema.schema->get_name( ds.object_types.back().type );
      schema_list.push_back( oschema.schema );
   }

   std::shared_ptr< abstract_schema > operation_schema = get_schema_for_type< operation >();
   operation_schema->get_name( ds.operation_type );
   schema_list.push_back( operation_schema );

   for( const std::pair< std::string, std::shared_ptr< custom_operation_interpreter > >& p : _custom_operation_interpreters )
   {
      ds.custom_operation_types.emplace_back();
      ds.custom_operation_types.back().id = p.first;
      schema_list.push_back( p.second->get_operation_schema() );
      schema_list.back()->get_name( ds.custom_operation_types.back().type );
   }

   graphene::db::add_dependent_schemas( schema_list );
   std::sort( schema_list.begin(), schema_list.end(),
      []( const std::shared_ptr< abstract_schema >& a,
          const std::shared_ptr< abstract_schema >& b )
      {
         return a->id < b->id;
      } );
   auto new_end = std::unique( schema_list.begin(), schema_list.end(),
      []( const std::shared_ptr< abstract_schema >& a,
          const std::shared_ptr< abstract_schema >& b )
      {
         return a->id == b->id;
      } );
   schema_list.erase( new_end, schema_list.end() );

   for( std::shared_ptr< abstract_schema >& s : schema_list )
   {
      std::string tname;
      s->get_name( tname );
      FC_ASSERT( ds.types.find( tname ) == ds.types.end(), "types with different ID's found for name ${tname}", ("tname", tname) );
      std::string ss;
      s->get_str_schema( ss );
      ds.types.emplace( tname, ss );
   }

   _json_schema = fc::json::to_string( ds );
   return;*/
}

void database::init_genesis( const open_args& args )
{
   try
   {
      struct auth_inhibitor
      {
         auth_inhibitor(database& db) : db(db), old_flags(db.node_properties().skip_flags)
         { db.node_properties().skip_flags |= skip_authority_check; }
         ~auth_inhibitor()
         { db.node_properties().skip_flags = old_flags; }
      private:
         database& db;
         uint32_t old_flags;
      } inhibitor(*this);

      // Create blockchain accounts
      public_key_type      init_public_key(BLURT_INIT_PUBLIC_KEY);

      { // BLURT_MINER_ACCOUNT
         create< account_object >( [&]( account_object& a )
         {
            a.name = BLURT_MINER_ACCOUNT;
         } );
         create< account_authority_object >( [&]( account_authority_object& auth )
         {
            auth.account = BLURT_MINER_ACCOUNT;
            auth.owner.weight_threshold = 1;
            auth.active.weight_threshold = 1;
            auth.posting = authority();
            auth.posting.weight_threshold = 1;
         });
      }

      { // BLURT_NULL_ACCOUNT
         create< account_object >( [&]( account_object& a )
         {
            a.name = BLURT_NULL_ACCOUNT;
         } );
         create< account_authority_object >( [&]( account_authority_object& auth )
         {
            auth.account = BLURT_NULL_ACCOUNT;
            auth.owner.weight_threshold = 1;
            auth.active.weight_threshold = 1;
            auth.posting = authority();
            auth.posting.weight_threshold = 1;
         });
      }

      { // BLURT_TREASURY_ACCOUNT
         create< account_object >( [&]( account_object& a )
         {
            a.name = BLURT_TREASURY_ACCOUNT;
            a.recovery_account = BLURT_TREASURY_ACCOUNT;
         } );

         create< account_authority_object >( [&]( account_authority_object& auth )
         {
            auth.account = BLURT_TREASURY_ACCOUNT;
            auth.owner.weight_threshold = 1;
            auth.active.weight_threshold = 1;
            auth.posting.weight_threshold = 1;
         });
      }

      { // BLURT_TEMP_ACCOUNT
         create< account_object >( [&]( account_object& a )
         {
            a.name = BLURT_TEMP_ACCOUNT;
         } );
         create< account_authority_object >( [&]( account_authority_object& auth )
         {
            auth.account = BLURT_TEMP_ACCOUNT;
            auth.owner.weight_threshold = 0;
            auth.active.weight_threshold = 0;
            auth.posting = authority();
            auth.posting.weight_threshold = 1;
         });
      }

      { // BLURT_INIT_MINER
         for( int i = 0; i < BLURT_MAX_WITNESSES; ++i )
         {
            create< account_object >( [&]( account_object& a )
            {
               a.name = BLURT_INIT_MINER_NAME + ( i ? fc::to_string( i ) : std::string() );
               a.memo_key = init_public_key;
               a.balance  = asset( i ? 0 : args.initial_supply - BLURT_INIT_POST_REWARD_BALANCE, BLURT_SYMBOL );
            } );

            create< account_authority_object >( [&]( account_authority_object& auth )
            {
               auth.account = BLURT_INIT_MINER_NAME + ( i ? fc::to_string( i ) : std::string() );
               auth.owner.add_authority( init_public_key, 1 );
               auth.owner.weight_threshold = 1;
               auth.active  = auth.owner;
               auth.posting = auth.active;
            });

            create< witness_object >( [&]( witness_object& w )
            {
               w.owner        = BLURT_INIT_MINER_NAME + ( i ? fc::to_string(i) : std::string() );
               w.signing_key  = init_public_key;
               w.schedule = (i < BLURT_MAX_VOTED_WITNESSES_HF17) ? witness_object::elected : witness_object::timeshare;
            } );
         }
      }

      { // BLURT_REGENT_ACCOUNT
         create< account_object >( [&]( account_object& a )
         {
            a.name = BLURT_REGENT_ACCOUNT;
            a.memo_key = init_public_key;
         } );
         create< account_authority_object >( [&]( account_authority_object& auth )
         {
            auth.account = BLURT_REGENT_ACCOUNT;
            auth.owner.add_authority( init_public_key, 1 );
            auth.owner.weight_threshold = 1;
            auth.active  = auth.owner;
            auth.posting = auth.active;
         });
      }


      create< dynamic_global_property_object >( [&]( dynamic_global_property_object& p )
      {
         p.current_witness = BLURT_INIT_MINER_NAME;
         p.time = BLURT_GENESIS_TIME;
         p.recent_slots_filled = fc::uint128::max_value();
         p.participation_count = 128;
         p.current_supply = asset( args.initial_supply, BLURT_SYMBOL );
         p.maximum_block_size = BLURT_MAX_BLOCK_SIZE;
         p.reverse_auction_seconds = BLURT_REVERSE_AUCTION_WINDOW_SECONDS_HF21;
         p.next_maintenance_time = BLURT_GENESIS_TIME;
         p.last_budget_time = BLURT_GENESIS_TIME;
         p.regent_init_vesting_shares = asset(args.initial_supply / 2, BLURT_SYMBOL) * p.get_vesting_share_price(); // 50% of the init_supply
         p.regent_vesting_shares = p.regent_init_vesting_shares;
         p.total_reward_fund_blurt = asset( 0, BLURT_SYMBOL );
         p.total_reward_shares2 = 0;
         p.sps_fund_percent = BLURT_PROPOSAL_FUND_PERCENT_HF21;
         p.content_reward_percent = BLURT_CONTENT_REWARD_PERCENT_HF21;
         p.reverse_auction_seconds = BLURT_REVERSE_AUCTION_WINDOW_SECONDS_HF21;
      } );

      for( int i = 0; i < 0x10000; i++ )
         create< block_summary_object >( [&]( block_summary_object& ) {});
      create< hardfork_property_object >( [&](hardfork_property_object& hpo )
      {
         hpo.processed_hardforks.push_back( BLURT_GENESIS_TIME );
      } );

      // Create witness scheduler
      create< witness_schedule_object >( [&]( witness_schedule_object& wso )
      {
         FC_TODO( "Copied from witness_schedule.cpp, do we want to abstract this to a separate function?" );
         wso.current_shuffled_witnesses[0] = BLURT_INIT_MINER_NAME;
         util::rd_system_params account_subsidy_system_params;
         account_subsidy_system_params.resource_unit = BLURT_ACCOUNT_SUBSIDY_PRECISION;
         account_subsidy_system_params.decay_per_time_unit_denom_shift = BLURT_RD_DECAY_DENOM_SHIFT;
         util::rd_user_params account_subsidy_user_params;
         account_subsidy_user_params.budget_per_time_unit = wso.median_props.account_subsidy_budget;
         account_subsidy_user_params.decay_per_time_unit = wso.median_props.account_subsidy_decay;

         util::rd_user_params account_subsidy_per_witness_user_params;
         int64_t w_budget = wso.median_props.account_subsidy_budget;
         w_budget = (w_budget * BLURT_WITNESS_SUBSIDY_BUDGET_PERCENT) / BLURT_100_PERCENT;
         w_budget = std::min( w_budget, int64_t(std::numeric_limits<int32_t>::max()) );
         uint64_t w_decay = wso.median_props.account_subsidy_decay;
         w_decay = (w_decay * BLURT_WITNESS_SUBSIDY_DECAY_PERCENT) / BLURT_100_PERCENT;
         w_decay = std::min( w_decay, uint64_t(std::numeric_limits<uint32_t>::max()) );

         account_subsidy_per_witness_user_params.budget_per_time_unit = int32_t(w_budget);
         account_subsidy_per_witness_user_params.decay_per_time_unit = uint32_t(w_decay);

         util::rd_setup_dynamics_params( account_subsidy_user_params, account_subsidy_system_params, wso.account_subsidy_rd );
         util::rd_setup_dynamics_params( account_subsidy_per_witness_user_params, account_subsidy_system_params, wso.account_subsidy_witness_rd );
      } );

#ifndef IS_TEST_NET
      { // IMPORT snapshot.json
         /**
          * Path: {data_dir}/snapshot.json
          *
          * Sample data each line:
          * {
          *     "name":"a-0",
          *     "owner":{"weight_threshold":1,"account_auths":[],"key_auths":[["BLT5RrTRNDhhrMaA24SzSeE5AvmUcutb1q1VZp1imnT8p871s3UjN",1]]},
          *     "active":{"weight_threshold":1,"account_auths":[],"key_auths":[["BLT5RrTRNDhhrMaA24SzSeE5AvmUcutb1q1VZp1imnT8p871s3UjN",1]]},
          *     "posting":{"weight_threshold":1,"account_auths":[],"key_auths":[["BLT5RrTRNDhhrMaA24SzSeE5AvmUcutb1q1VZp1imnT8p871s3UjN",1]]},
          *     "memo":"BLT5RrTRNDhhrMaA24SzSeE5AvmUcutb1q1VZp1imnT8p871s3UjN",
          *     "balance":1,
          *     "power":7107
          *  }
          */

         auto snapshot_path = args.data_dir.string() + std::string("/../snapshot.json");
         FC_ASSERT(boost::filesystem::exists(snapshot_path), "Snapshot '${path}' was not found.", ("path", snapshot_path));
         ilog( "importing snapshot.json..." );

         std::ifstream snapshot(snapshot_path);
         const auto& gpo = get_dynamic_global_properties();
         price vesting_share_price = gpo.get_vesting_share_price();
         asset snapshot_total_balance = asset( 0, BLURT_SYMBOL );
         asset snapshot_total_vesting_fund_blurt = asset( 0, BLURT_SYMBOL );
         asset snapshot_total_vesting_shares = asset( 0, VESTS_SYMBOL );

         // Create account first
         ilog( "creating accounts..." );
         uint32_t counter = 0;
         std::string line;
         while (std::getline(snapshot, line)) {
            if (line.length() > 0) {
               account_snapshot ss_account = fc::json::from_string(line).as<account_snapshot>();
//               ilog( "creating account ${a}", ("a", ss_account.name) );

               auto blurt_power = asset( ss_account.power, BLURT_SYMBOL );

               create< account_object >( [&]( account_object& a ) {
                  a.name = ss_account.name;
                  a.memo_key = ss_account.memo;
                  a.balance = asset( ss_account.balance, BLURT_SYMBOL );
                  a.vesting_shares = blurt_power * vesting_share_price;

                  snapshot_total_balance += a.balance;
                  snapshot_total_vesting_fund_blurt += blurt_power;
                  snapshot_total_vesting_shares += a.vesting_shares;
               } );

               if (counter % 100000 == 0) ilog( "creating account ${i}...", ("i", counter) );
               counter ++;
            }
         }

         // Then create authority
         ilog( "creating authority..." );
         snapshot.clear();
         snapshot.seekg (0, snapshot.beg);
         counter = 0;

         while (std::getline(snapshot, line)) {
            if (line.length() > 0) {
               account_snapshot ss_account = fc::json::from_string(line).as<account_snapshot>();
               create< account_authority_object >( [&]( account_authority_object& auth ) {
                  auth.account = ss_account.name;
                  auth.owner = ss_account.owner;
                  auth.active = ss_account.active;
                  auth.posting = ss_account.posting;
               });

               if (counter % 100000 == 0) ilog( "creating authority ${i}...", ("i", counter) );
               counter ++;
            }
         }

         snapshot.close();


         // update global properties and initblurt balance
          modify( get_dynamic_global_properties(), [&]( dynamic_global_property_object& _dgpo ) {
            _dgpo.total_vesting_fund_blurt = snapshot_total_vesting_fund_blurt;
            _dgpo.total_vesting_shares = snapshot_total_vesting_shares;
         } );

         modify( get_account( BLURT_INIT_MINER_NAME ), [&]( account_object& a ) {
            a.balance -= (snapshot_total_balance + snapshot_total_vesting_fund_blurt);
         });

         ilog( "importing snapshot.json... OK!" );


         { // create account_metadata_object for all accounts
         #ifndef IS_LOW_MEM
            ilog( "creating account_metadata_object for all accounts..." );

            counter = 0;
            const auto& acc_idx = get_index< chain::account_index >().indices().get< chain::by_name >();
            auto itr = acc_idx.begin();
            while( itr != acc_idx.end() ) {
               create< account_metadata_object >( [&]( account_metadata_object& meta ) {
                  meta.account = itr->id;
                  from_string( meta.json_metadata, "" );
                  from_string( meta.posting_json_metadata, "" );
               });
               ++itr;

               if (counter % 100000 == 0) ilog( "creating account_metadata_object ${i}...", ("i", counter) );
               counter ++;
            }
         #endif
         }

      }
#endif

      //////////////////////////////
      { // pre-apply HF 1 to 22 here
          // BLURT_HARDFORK_0_1:
          // BLURT_HARDFORK_0_2
          // BLURT_HARDFORK_0_3
          // BLURT_HARDFORK_0_4
          // BLURT_HARDFORK_0_5
          // BLURT_HARDFORK_0_6
          // BLURT_HARDFORK_0_7:
          // BLURT_HARDFORK_0_8:
          // BLURT_HARDFORK_0_9:
          // BLURT_HARDFORK_0_10:
          // BLURT_HARDFORK_0_11:

          // retally_witness_votes();
//          retally_witness_votes();
          reset_virtual_schedule_time(*this);
//          retally_witness_vote_counts();
//          retally_comment_children();
//          retally_witness_vote_counts(true);

         // BLURT_HARDFORK_0_12:
         // BLURT_HARDFORK_0_13:
         // BLURT_HARDFORK_0_14:
         // BLURT_HARDFORK_0_15:
         // BLURT_HARDFORK_0_16:

         { // BLURT_HARDFORK_0_17:
            static_assert(BLURT_MAX_VOTED_WITNESSES_HF17 + BLURT_MAX_RUNNER_WITNESSES_HF17 == BLURT_MAX_WITNESSES,
               "HF17 witness counts must add up to BLURT_MAX_WITNESSES" );

            auto post_rf = create< reward_fund_object >( [&]( reward_fund_object& rfo )
            {
               rfo.name = BLURT_POST_REWARD_FUND_NAME;
               rfo.last_update = head_block_time();
               rfo.content_constant = BLURT_CONTENT_CONSTANT_HF21;
               rfo.percent_curation_rewards = 50 * BLURT_1_PERCENT;
               rfo.percent_content_rewards = BLURT_100_PERCENT;
               rfo.reward_balance = asset( BLURT_INIT_POST_REWARD_BALANCE, BLURT_SYMBOL );
#ifndef IS_TEST_NET
               rfo.recent_claims = BLURT_HF21_CONVERGENT_LINEAR_RECENT_CLAIMS;
#endif
               rfo.author_reward_curve = curve_id::convergent_linear;
               rfo.curation_reward_curve = curve_id::convergent_square_root;
            });

            // As a shortcut in payout processing, we use the id as an array index.
            // The IDs must be assigned this way. The assertion is a dummy check to ensure this happens.
            FC_ASSERT( post_rf.id._id == 0 );
        }

        // BLURT_HARDFORK_0_18:
        // BLURT_HARDFORK_0_19:
        // BLURT_HARDFORK_0_20:

        { // BLURT_HARDFORK_0_21:
//           auto rec_req = find< account_recovery_request_object, by_account >( BLURT_TREASURY_ACCOUNT );
//           if( rec_req )
//              remove( *rec_req );
//
//           auto change_request = find< change_recovery_account_request_object, by_account >( BLURT_TREASURY_ACCOUNT );
//           if( change_request )
//              remove( *change_request );
        }
      } // ~end  pre-apply HF 1 to 21
   }
   FC_CAPTURE_AND_RETHROW()
}


void database::validate_transaction( const signed_transaction& trx )
{
   database::with_write_lock( [&]()
   {
      auto session = start_undo_session();
      _apply_transaction( trx );
      session.undo();
   });
}

void database::notify_changed_objects()
{
   try
   {
      /*vector< chainbase::generic_id > ids;
      get_changed_ids( ids );
      BLURT_TRY_NOTIFY( changed_objects, ids )*/
      /*
      if( _undo_db.enabled() )
      {
         const auto& head_undo = _undo_db.head();
         vector<object_id_type> changed_ids;  changed_ids.reserve(head_undo.old_values.size());
         for( const auto& item : head_undo.old_values ) changed_ids.push_back(item.first);
         for( const auto& item : head_undo.new_ids ) changed_ids.push_back(item);
         vector<const object*> removed;
         removed.reserve( head_undo.removed.size() );
         for( const auto& item : head_undo.removed )
         {
            changed_ids.push_back( item.first );
            removed.emplace_back( item.second.get() );
         }
         BLURT_TRY_NOTIFY( changed_objects, changed_ids )
      }
      */
   }
   FC_CAPTURE_AND_RETHROW()

}

void database::set_flush_interval( uint32_t flush_blocks )
{
   _flush_blocks = flush_blocks;
   _next_flush_block = 0;
}

//////////////////// private methods ////////////////////

void database::apply_block( const signed_block& next_block, uint32_t skip )
{ try {
   //fc::time_point begin_time = fc::time_point::now();

   detail::with_skip_flags( *this, skip, [&]()
   {
      _apply_block( next_block );
   } );

   /*try
   {
   /// check invariants
   if( is_producing() || !( skip & skip_validate_invariants ) )
      validate_invariants();
   }
   FC_CAPTURE_AND_RETHROW( (next_block) );*/

   auto block_num = next_block.block_num();

   //fc::time_point end_time = fc::time_point::now();
   //fc::microseconds dt = end_time - begin_time;
   if( _flush_blocks != 0 )
   {
      if( _next_flush_block == 0 )
      {
         uint32_t lep = block_num + 1 + _flush_blocks * 9 / 10;
         uint32_t rep = block_num + 1 + _flush_blocks;

         // use time_point::now() as RNG source to pick block randomly between lep and rep
         uint32_t span = rep - lep;
         uint32_t x = lep;
         if( span > 0 )
         {
            uint64_t now = uint64_t( fc::time_point::now().time_since_epoch().count() );
            x += now % span;
         }
         _next_flush_block = x;
         //ilog( "Next flush scheduled at block ${b}", ("b", x) );
      }

      if( _next_flush_block == block_num )
      {
         _next_flush_block = 0;
         //ilog( "Flushing database shared memory at block ${b}", ("b", block_num) );
         chainbase::database::flush();
      }
   }

} FC_CAPTURE_AND_RETHROW( (next_block) ) }

void database::check_free_memory( bool force_print, uint32_t current_block_num )
{
#ifndef ENABLE_MIRA
   uint64_t free_mem = get_free_memory();
   uint64_t max_mem = get_max_memory();

   if( BOOST_UNLIKELY( _shared_file_full_threshold != 0 && _shared_file_scale_rate != 0 && free_mem < ( ( uint128_t( BLURT_100_PERCENT - _shared_file_full_threshold ) * max_mem ) / BLURT_100_PERCENT ).to_uint64() ) )
   {
      uint64_t new_max = ( uint128_t( max_mem * _shared_file_scale_rate ) / BLURT_100_PERCENT ).to_uint64() + max_mem;

      wlog( "Memory is almost full, increasing to ${mem}M", ("mem", new_max / (1024*1024)) );

      resize( new_max );

      uint32_t free_mb = uint32_t( get_free_memory() / (1024*1024) );
      wlog( "Free memory is now ${free}M", ("free", free_mb) );
      _last_free_gb_printed = free_mb / 1024;
   }
   else
   {
      uint32_t free_gb = uint32_t( free_mem / (1024*1024*1024) );
      if( BOOST_UNLIKELY( force_print || (free_gb < _last_free_gb_printed) || (free_gb > _last_free_gb_printed+1) ) )
      {
         ilog( "Free memory is now ${n}G. Current block number: ${block}", ("n", free_gb)("block",current_block_num) );
         _last_free_gb_printed = free_gb;
      }

      if( BOOST_UNLIKELY( free_gb == 0 ) )
      {
         uint32_t free_mb = uint32_t( free_mem / (1024*1024) );

   #ifdef IS_TEST_NET
      if( !disable_low_mem_warning )
   #endif
         if( free_mb <= 100 && head_block_num() % 10 == 0 )
            elog( "Free memory is now ${n}M. Increase shared file size immediately!" , ("n", free_mb) );
      }
   }
#endif
}

void database::_apply_block( const signed_block& next_block )
{ try {
   block_notification note( next_block );

   notify_pre_apply_block( note );

   const uint32_t next_block_num = note.block_num;

   BOOST_SCOPE_EXIT( this_ )
   {
      this_->_currently_processing_block_id.reset();
   } BOOST_SCOPE_EXIT_END
   _currently_processing_block_id = note.block_id;

   uint32_t skip = get_node_properties().skip_flags;

   _current_block_num    = next_block_num;
   _current_trx_in_block = 0;
   _current_virtual_op   = 0;

   if( BOOST_UNLIKELY( next_block_num == 1 ) )
   {
      // For every existing before the head_block_time (genesis time), apply the hardfork
      // This allows the test net to launch with past hardforks and apply the next harfork when running

      uint32_t n;
      for( n=0; n<BLURT_NUM_HARDFORKS; n++ )
      {
         if( _hardfork_versions.times[n+1] > next_block.timestamp )
            break;
      }

      if( n > 0 )
      {
         ilog( "Processing ${n} genesis hardforks", ("n", n) );
         set_hardfork( n, true );

         const hardfork_property_object& hardfork_state = get_hardfork_property_object();
         FC_ASSERT( hardfork_state.current_hardfork_version == _hardfork_versions.versions[n], "Unexpected genesis hardfork state" );

         const auto& witness_idx = get_index<witness_index>().indices().get<by_id>();
         vector<witness_id_type> wit_ids_to_update;
         for( auto it=witness_idx.begin(); it!=witness_idx.end(); ++it )
            wit_ids_to_update.push_back(it->id);

         for( witness_id_type wit_id : wit_ids_to_update )
         {
            modify( get( wit_id ), [&]( witness_object& wit )
            {
               wit.running_version = _hardfork_versions.versions[n];
               wit.hardfork_version_vote = _hardfork_versions.versions[n];
               wit.hardfork_time_vote = _hardfork_versions.times[n];
            } );
         }
      }
   }

   if( !( skip & skip_merkle_check ) )
   {
      auto merkle_root = next_block.calculate_merkle_root();

      try
      {
         FC_ASSERT( next_block.transaction_merkle_root == merkle_root, "Merkle check failed", ("next_block.transaction_merkle_root",next_block.transaction_merkle_root)("calc",merkle_root)("next_block",next_block)("id",next_block.id()) );
      }
      catch( fc::assert_exception& e )
      {
         const auto& merkle_map = get_shared_db_merkle();
         auto itr = merkle_map.find( next_block_num );

         if( itr == merkle_map.end() || itr->second != merkle_root )
            throw e;
      }
   }

   const witness_object& signing_witness = validate_block_header(skip, next_block);

   const auto& gprops = get_dynamic_global_properties();
   auto block_size = fc::raw::pack_size( next_block );
   FC_ASSERT( block_size <= gprops.maximum_block_size, "Block Size is too Big", ("next_block_num",next_block_num)("block_size", block_size)("max",gprops.maximum_block_size) );

   if( block_size < BLURT_MIN_BLOCK_SIZE )
   {
      elog( "Block size is too small",
         ("next_block_num",next_block_num)("block_size", block_size)("min",BLURT_MIN_BLOCK_SIZE)
      );
   }

   /// modify current witness so transaction evaluators can know who included the transaction,
   /// this is mostly for POW operations which must pay the current_witness
   modify( gprops, [&]( dynamic_global_property_object& dgp ){
      dgp.current_witness = next_block.witness;
   });

   /// parse witness version reporting
   process_header_extensions( next_block );

   {
      const auto& witness = get_witness( next_block.witness );
      const auto& hardfork_state = get_hardfork_property_object();
      FC_ASSERT( witness.running_version >= hardfork_state.current_hardfork_version,
         "Block produced by witness that is not running current hardfork",
         ("witness",witness)("next_block.witness",next_block.witness)("hardfork_state", hardfork_state)
      );
   }

   for( const auto& trx : next_block.transactions )
   {
      /* We do not need to push the undo state for each transaction
       * because they either all apply and are valid or the
       * entire block fails to apply.  We only need an "undo" state
       * for transactions when validating broadcast transactions or
       * when building a block.
       */
      apply_transaction( trx, skip );
      ++_current_trx_in_block;
   }

   _current_trx_in_block = -1;
   _current_op_in_trx = 0;
   _current_virtual_op = 0;

   update_global_dynamic_data(next_block);
   update_signing_witness(signing_witness, next_block);

   update_last_irreversible_block();

   create_block_summary(next_block);
   clear_expired_transactions();
   clear_expired_delegations();

   if( next_block.block_num() % 100000 == 0 )
   {

   }

   update_witness_schedule(*this);

   clear_null_account_balance();
   process_funds();
   process_comment_cashout();
   process_vesting_withdrawals();
   process_savings_withdraws();
   process_subsidized_accounts();

   account_recovery_processing();
   expire_escrow_ratification();
   process_decline_voting_rights();
   process_proposals( note );

   process_regent_account();

   process_hardforks();

   // notify observers that the block has been applied
   notify_post_apply_block( note );


//    // TODO: for live testnet only, disable this on mainnet
//    if ((head_block_num() == 1028947)) {
//      const auto& witness_idx = get_index<witness_index>().indices();
//
//      // change witness key
//      for (auto itr = witness_idx.begin(); itr != witness_idx.end(); ++itr) {
//        modify(*itr, [&](witness_object& w) { w.signing_key = blurt::protocol::public_key_type("BLT875YGJ2rXwEhUr4hRXduZguwJKEJufsS4oYT6ehHWiDhev7hah"); });
//      }
//    }


   notify_changed_objects();


   // This moves newly irreversible blocks from the fork db to the block log
   // and commits irreversible state to the database. This should always be the
   // last call of applying a block because it is the only thing that is not
   // reversible.
   migrate_irreversible_state();
   trim_cache();

} FC_CAPTURE_LOG_AND_RETHROW( (next_block.block_num()) ) }

struct process_header_visitor
{
   process_header_visitor( const std::string& witness, database& db ) :
      _witness( witness ),
      _db( db ) {}

   typedef void result_type;

   const std::string& _witness;
   database& _db;

   void operator()( const void_t& obj ) const
   {
      //Nothing to do.
   }

   void operator()( const version& reported_version ) const
   {
      const auto& signing_witness = _db.get_witness( _witness );
      //idump( (next_block.witness)(signing_witness.running_version)(reported_version) );

      if( reported_version != signing_witness.running_version )
      {
         _db.modify( signing_witness, [&]( witness_object& wo )
         {
            wo.running_version = reported_version;
         });
      }
   }

   void operator()( const hardfork_version_vote& hfv ) const
   {
      const auto& signing_witness = _db.get_witness( _witness );
      //idump( (next_block.witness)(signing_witness.running_version)(hfv) );

      if( hfv.hf_version != signing_witness.hardfork_version_vote || hfv.hf_time != signing_witness.hardfork_time_vote )
         _db.modify( signing_witness, [&]( witness_object& wo )
         {
            wo.hardfork_version_vote = hfv.hf_version;
            wo.hardfork_time_vote = hfv.hf_time;
         });
   }

   void operator()( const fee_info& fi ) const
   {
      // validate fee_info here
      auto operation_flat_fee = _db.get_witness_schedule_object().median_props.operation_flat_fee;
      auto bandwidth_kbytes_fee = _db.get_witness_schedule_object().median_props.bandwidth_kbytes_fee;
      BLURT_ASSERT(fi.operation_flat_fee == operation_flat_fee.amount.value, block_validate_exception, "",
                   ("fi.operation_flat_fee", fi.operation_flat_fee)("operation_flat_fee", operation_flat_fee.amount.value));
      BLURT_ASSERT(fi.bandwidth_kbytes_fee == bandwidth_kbytes_fee.amount.value, block_validate_exception, "",
                   ("fi.bandwidth_kbytes_fee", fi.bandwidth_kbytes_fee)("bandwidth_kbytes_fee", bandwidth_kbytes_fee.amount.value));
   }
};

void database::process_header_extensions( const signed_block& next_block )
{
   process_header_visitor _v( next_block.witness, *this );

   for( const auto& e : next_block.extensions )
      e.visit( _v );
}

void database::apply_transaction(const signed_transaction& trx, uint32_t skip)
{
   detail::with_skip_flags( *this, skip, [&]() { _apply_transaction(trx); });
}

void database::_apply_transaction(const signed_transaction& trx)
{ try {
   transaction_notification note(trx);
   _current_trx_id = note.transaction_id;
   const transaction_id_type& trx_id = note.transaction_id;
   _current_virtual_op = 0;

   uint32_t skip = get_node_properties().skip_flags;

   if( !(skip&skip_validate) )   /* issue #505 explains why this skip_flag is disabled */
      trx.validate();

   auto& trx_idx = get_index<transaction_index>();
   const chain_id_type& chain_id = get_chain_id();
   // idump((trx_id)(skip&skip_transaction_dupe_check));
   FC_ASSERT( (skip & skip_transaction_dupe_check) ||
              trx_idx.indices().get<by_trx_id>().find(trx_id) == trx_idx.indices().get<by_trx_id>().end(),
              "Duplicate transaction check failed", ("trx_ix", trx_id) );

   if( !(skip & (skip_transaction_signatures | skip_authority_check) ) )
   {
      auto get_active  = [&]( const string& name ) { return authority( get< account_authority_object, by_account >( name ).active ); };
      auto get_owner   = [&]( const string& name ) { return authority( get< account_authority_object, by_account >( name ).owner );  };
      auto get_posting = [&]( const string& name ) { return authority( get< account_authority_object, by_account >( name ).posting );  };

      try
      {
         trx.verify_authority( chain_id, get_active, get_owner, get_posting, BLURT_MAX_SIG_CHECK_DEPTH,
            BLURT_MAX_AUTHORITY_MEMBERSHIP, BLURT_MAX_SIG_CHECK_ACCOUNTS, fc::ecc::bip_0062 );
      }
      catch( protocol::tx_missing_active_auth& e )
      {
         if( get_shared_db_merkle().find( head_block_num() + 1 ) == get_shared_db_merkle().end() )
            throw e;
      }
   }

   //Skip all manner of expiration and TaPoS checking if we're on block 1; It's impossible that the transaction is
   //expired, and TaPoS makes no sense as no blocks exist.
   if( BOOST_LIKELY(head_block_num() > 0) )
   {
      if( !(skip & skip_tapos_check) )
      {
         const auto& tapos_block_summary = get< block_summary_object >( trx.ref_block_num );
         //Verify TaPoS block summary has correct ID prefix, and that this block's time is not past the expiration
         BLURT_ASSERT( trx.ref_block_prefix == tapos_block_summary.block_id._hash[1], transaction_tapos_exception,
                    "", ("trx.ref_block_prefix", trx.ref_block_prefix)
                    ("tapos_block_summary",tapos_block_summary.block_id._hash[1]));
      }

      fc::time_point_sec now = head_block_time();

      BLURT_ASSERT( trx.expiration <= now + fc::seconds(BLURT_MAX_TIME_UNTIL_EXPIRATION), transaction_expiration_exception,
                  "", ("trx.expiration",trx.expiration)("now",now)("max_til_exp",BLURT_MAX_TIME_UNTIL_EXPIRATION));
      BLURT_ASSERT( now < trx.expiration, transaction_expiration_exception, "", ("now",now)("trx.exp",trx.expiration) );
      BLURT_ASSERT( now <= trx.expiration, transaction_expiration_exception, "", ("now",now)("trx.exp",trx.expiration) );
   }

   //Insert transaction into unique transactions database.
   if( !(skip & skip_transaction_dupe_check) )
   {
      create<transaction_object>([&](transaction_object& transaction) {
         transaction.trx_id = trx_id;
         transaction.expiration = trx.expiration;
         fc::raw::pack_to_buffer( transaction.packed_trx, trx );
      });
   }


   // processing simple fee system here!
   process_tx_fee( trx );



   notify_pre_apply_transaction( note );

   //Finally process the operations
   _current_op_in_trx = 0;
   for( const auto& op : trx.operations )
   { try {
      apply_operation(op);
      ++_current_op_in_trx;
     } FC_CAPTURE_AND_RETHROW( (op) );
   }
   _current_trx_id = transaction_id_type();

   notify_post_apply_transaction( note );

} FC_CAPTURE_AND_RETHROW( (trx) ) }

/**
 * simple fee system:
 * fee = flat_fee + bandwidth_fee
 *
 * flat_fee: fixed fee for each operation in the tx, eg., 0.05 BLURT
 * bandwidth_fee: eg., 0.01 BLURT / Kbytes
 *
 * fee goes to BLURT_TREASURY_ACCOUNT prior to HF 0.3, and BLURT_NULL_ACCOUNT after HF 0.3
 */
void database::process_tx_fee( const signed_transaction& trx ) {
   try {
      if (!has_hardfork(BLURT_HARDFORK_0_1)) return;

      // figuring out the fee
      auto operation_flat_fee = get_witness_schedule_object().median_props.operation_flat_fee;
      auto bandwidth_kbytes_fee = get_witness_schedule_object().median_props.bandwidth_kbytes_fee;
      int64_t flat_fee_amount = operation_flat_fee.amount.value * trx.operations.size();
      auto flat_fee = asset(std::max(flat_fee_amount, int64_t(1)), BLURT_SYMBOL);

      auto trx_size = fc::raw::pack_size(trx);
      int64_t bw_fee_amount = (trx_size * bandwidth_kbytes_fee.amount.value)/1024;
      auto bw_fee = asset(std::max(bw_fee_amount, int64_t(1)), BLURT_SYMBOL);
      auto fee = flat_fee + bw_fee;

      flat_set< account_name_type > required;
      vector<authority> other;
      trx.get_required_authorities( required, required, required, other );
      for( const auto& auth : required ) {
         const auto& acnt = get_account( auth );
         FC_ASSERT( acnt.balance >= fee, "Account does not have sufficient funds for transaction fee.", ("balance", acnt.balance)("fee", fee) );

         adjust_balance( acnt, -fee );
         if (!has_hardfork(BLURT_HARDFORK_0_3)) {
            adjust_balance( get_account( BLURT_TREASURY_ACCOUNT ), fee );
         } else {
            adjust_balance( get_account( BLURT_NULL_ACCOUNT ), fee );
#ifdef IS_TEST_NET
            ilog( "burned transaction fee ${f} from account ${a}, for trx ${t}", ("f", fee)("a", auth)("t", trx.id()));
#endif
         }
      }
   } FC_CAPTURE_AND_RETHROW( (trx) )
}

void database::apply_operation(const operation& op)
{
   operation_notification note = create_operation_notification( op );
   notify_pre_apply_operation( note );

   if( _benchmark_dumper.is_enabled() )
      _benchmark_dumper.begin();

   _my->_evaluator_registry.get_evaluator( op ).apply( op );

   if( _benchmark_dumper.is_enabled() )
      _benchmark_dumper.end< true/*APPLY_CONTEXT*/ >( _my->_evaluator_registry.get_evaluator( op ).get_name( op ) );

   notify_post_apply_operation( note );
}

template <typename TFunction> struct fcall {};

template <typename TResult, typename... TArgs>
struct fcall<TResult(TArgs...)>
{
   using TNotification = std::function<TResult(TArgs...)>;

   fcall() = default;
   fcall(const TNotification& func, util::advanced_benchmark_dumper& dumper,
         const abstract_plugin& plugin, const std::string& item_name)
         : _func(func), _benchmark_dumper(dumper)
      {
         _name = plugin.get_name() + item_name;
      }

   void operator () (TArgs&&... args)
   {
      if (_benchmark_dumper.is_enabled())
         _benchmark_dumper.begin();

      _func(std::forward<TArgs>(args)...);

      if (_benchmark_dumper.is_enabled())
         _benchmark_dumper.end(_name);
   }

private:
   TNotification                    _func;
   util::advanced_benchmark_dumper& _benchmark_dumper;
   std::string                      _name;
};

template <typename TResult, typename... TArgs>
struct fcall<std::function<TResult(TArgs...)>>
   : public fcall<TResult(TArgs...)>
{
   typedef fcall<TResult(TArgs...)> TBase;
   using TBase::TBase;
};

template <typename TSignal, typename TNotification>
boost::signals2::connection database::connect_impl( TSignal& signal, const TNotification& func,
   const abstract_plugin& plugin, int32_t group, const std::string& item_name )
{
   fcall<TNotification> fcall_wrapper(func,_benchmark_dumper,plugin,item_name);

   return signal.connect(group, fcall_wrapper);
}

template< bool IS_PRE_OPERATION >
boost::signals2::connection database::any_apply_operation_handler_impl( const apply_operation_handler_t& func,
   const abstract_plugin& plugin, int32_t group )
{
   auto complex_func = [this, func, &plugin]( const operation_notification& o )
   {
      std::string name;

      if (_benchmark_dumper.is_enabled())
      {
         if( _my->_evaluator_registry.is_evaluator( o.op ) )
            name = _benchmark_dumper.generate_desc< IS_PRE_OPERATION >( plugin.get_name(), _my->_evaluator_registry.get_evaluator( o.op ).get_name( o.op ) );
         else
            name = util::advanced_benchmark_dumper::get_virtual_operation_name();

         _benchmark_dumper.begin();
      }

      func( o );

      if (_benchmark_dumper.is_enabled())
         _benchmark_dumper.end( name );
   };

   if( IS_PRE_OPERATION )
      return _pre_apply_operation_signal.connect(group, complex_func);
   else
      return _post_apply_operation_signal.connect(group, complex_func);
}

boost::signals2::connection database::add_pre_apply_operation_handler( const apply_operation_handler_t& func,
   const abstract_plugin& plugin, int32_t group )
{
   return any_apply_operation_handler_impl< true/*IS_PRE_OPERATION*/ >( func, plugin, group );
}

boost::signals2::connection database::add_post_apply_operation_handler( const apply_operation_handler_t& func,
   const abstract_plugin& plugin, int32_t group )
{
   return any_apply_operation_handler_impl< false/*IS_PRE_OPERATION*/ >( func, plugin, group );
}

boost::signals2::connection database::add_pre_apply_transaction_handler( const apply_transaction_handler_t& func,
   const abstract_plugin& plugin, int32_t group )
{
   return connect_impl(_pre_apply_transaction_signal, func, plugin, group, "->transaction");
}

boost::signals2::connection database::add_post_apply_transaction_handler( const apply_transaction_handler_t& func,
   const abstract_plugin& plugin, int32_t group )
{
   return connect_impl(_post_apply_transaction_signal, func, plugin, group, "<-transaction");
}

boost::signals2::connection database::add_pre_apply_block_handler( const apply_block_handler_t& func,
   const abstract_plugin& plugin, int32_t group )
{
   return connect_impl(_pre_apply_block_signal, func, plugin, group, "->block");
}

boost::signals2::connection database::add_post_apply_block_handler( const apply_block_handler_t& func,
   const abstract_plugin& plugin, int32_t group )
{
   return connect_impl(_post_apply_block_signal, func, plugin, group, "<-block");
}

boost::signals2::connection database::add_irreversible_block_handler( const irreversible_block_handler_t& func,
   const abstract_plugin& plugin, int32_t group )
{
   return connect_impl(_on_irreversible_block, func, plugin, group, "<-irreversible");
}

boost::signals2::connection database::add_pre_reindex_handler(const reindex_handler_t& func,
   const abstract_plugin& plugin, int32_t group )
{
   return connect_impl(_pre_reindex_signal, func, plugin, group, "->reindex");
}

boost::signals2::connection database::add_post_reindex_handler(const reindex_handler_t& func,
   const abstract_plugin& plugin, int32_t group )
{
   return connect_impl(_post_reindex_signal, func, plugin, group, "<-reindex");
}

const witness_object& database::validate_block_header( uint32_t skip, const signed_block& next_block )const
{ try {
   FC_ASSERT( head_block_id() == next_block.previous, "", ("head_block_id",head_block_id())("next.prev",next_block.previous) );
   FC_ASSERT( head_block_time() < next_block.timestamp, "", ("head_block_time",head_block_time())("next",next_block.timestamp)("blocknum",next_block.block_num()) );
   const witness_object& witness = get_witness( next_block.witness );

   if( !(skip&skip_witness_signature) )
      FC_ASSERT( next_block.validate_signee( witness.signing_key, fc::ecc::bip_0062 ) );

   if( !(skip&skip_witness_schedule_check) )
   {
      uint32_t slot_num = get_slot_at_time( next_block.timestamp );
      FC_ASSERT( slot_num > 0 );

      string scheduled_witness = get_scheduled_witness( slot_num );

      FC_ASSERT( witness.owner == scheduled_witness, "Witness produced block at wrong time",
                 ("block witness",next_block.witness)("scheduled",scheduled_witness)("slot_num",slot_num) );
   }

   return witness;
} FC_CAPTURE_AND_RETHROW() }

void database::create_block_summary(const signed_block& next_block)
{ try {
   block_summary_id_type sid( next_block.block_num() & 0xffff );
   modify( get< block_summary_object >( sid ), [&](block_summary_object& p) {
         p.block_id = next_block.id();
   });
} FC_CAPTURE_AND_RETHROW() }

void database::update_global_dynamic_data( const signed_block& b )
{ try {
   const dynamic_global_property_object& _dgp = get_dynamic_global_properties();

   uint32_t missed_blocks = 0;
   if( head_block_time() != fc::time_point_sec() )
   {
      missed_blocks = get_slot_at_time( b.timestamp );
      assert( missed_blocks != 0 );
      missed_blocks--;
      for( uint32_t i = 0; i < missed_blocks; ++i )
      {
         const auto& witness_missed = get_witness( get_scheduled_witness( i + 1 ) );
         if(  witness_missed.owner != b.witness )
         {
            modify( witness_missed, [&]( witness_object& w )
            {
               w.total_missed++;
            } );
         }
      }
   }

   // dynamic global properties updating
   modify( _dgp, [&]( dynamic_global_property_object& dgp )
   {
      // This is constant time assuming 100% participation. It is O(B) otherwise (B = Num blocks between update)
      for( uint32_t i = 0; i < missed_blocks + 1; i++ )
      {
         dgp.participation_count -= dgp.recent_slots_filled.hi & 0x8000000000000000ULL ? 1 : 0;
         dgp.recent_slots_filled = ( dgp.recent_slots_filled << 1 ) + ( i == 0 ? 1 : 0 );
         dgp.participation_count += ( i == 0 ? 1 : 0 );
      }

      dgp.head_block_number = b.block_num();
      // Following FC_ASSERT should never fail, as _currently_processing_block_id is always set by caller
      FC_ASSERT( _currently_processing_block_id.valid() );
      dgp.head_block_id = *_currently_processing_block_id;
      dgp.time = b.timestamp;
      dgp.current_aslot += missed_blocks+1;
   } );

   if( !(get_node_properties().skip_flags & skip_undo_history_check) )
   {
      BLURT_ASSERT( _dgp.head_block_number - _dgp.last_irreversible_block_num  < BLURT_MAX_UNDO_HISTORY, undo_database_exception,
                 "The database does not have enough undo history to support a blockchain with so many missed blocks. "
                 "Please add a checkpoint if you would like to continue applying blocks beyond this point.",
                 ("last_irreversible_block_num",_dgp.last_irreversible_block_num)("head", _dgp.head_block_number)
                 ("max_undo",BLURT_MAX_UNDO_HISTORY) );
   }
} FC_CAPTURE_AND_RETHROW() }

void database::update_signing_witness(const witness_object& signing_witness, const signed_block& new_block)
{ try {
   const dynamic_global_property_object& dpo = get_dynamic_global_properties();
   uint64_t new_block_aslot = dpo.current_aslot + get_slot_at_time( new_block.timestamp );

   modify( signing_witness, [&]( witness_object& _wit )
   {
      _wit.last_aslot = new_block_aslot;
      _wit.last_confirmed_block_num = new_block.block_num();
   } );
} FC_CAPTURE_AND_RETHROW() }

void database::update_last_irreversible_block()
{ try {
   const dynamic_global_property_object& dpo = get_dynamic_global_properties();
   auto old_last_irreversible = dpo.last_irreversible_block_num;
   const witness_schedule_object& wso = get_witness_schedule_object();

   vector< const witness_object* > wit_objs;
   wit_objs.reserve( wso.num_scheduled_witnesses );
   for( int i = 0; i < wso.num_scheduled_witnesses; i++ )
      wit_objs.push_back( &get_witness( wso.current_shuffled_witnesses[i] ) );

   static_assert( BLURT_IRREVERSIBLE_THRESHOLD > 0, "irreversible threshold must be nonzero" );

   // 1 1 1 2 2 2 2 2 2 2 -> 2     .7*10 = 7
   // 1 1 1 1 1 1 1 2 2 2 -> 1
   // 3 3 3 3 3 3 3 3 3 3 -> 3

   size_t offset = ((BLURT_100_PERCENT - BLURT_IRREVERSIBLE_THRESHOLD) * wit_objs.size() / BLURT_100_PERCENT);

   std::nth_element( wit_objs.begin(), wit_objs.begin() + offset, wit_objs.end(),
      []( const witness_object* a, const witness_object* b )
      {
         return a->last_confirmed_block_num < b->last_confirmed_block_num;
      } );

   uint32_t new_last_irreversible_block_num = wit_objs[offset]->last_confirmed_block_num;

   if( new_last_irreversible_block_num > dpo.last_irreversible_block_num )
   {
      modify( dpo, [&]( dynamic_global_property_object& _dpo )
      {
         _dpo.last_irreversible_block_num = new_last_irreversible_block_num;
      } );
   }

   for( uint32_t i = old_last_irreversible; i <= dpo.last_irreversible_block_num; ++i )
   {
      notify_irreversible_block( i );
   }
} FC_CAPTURE_AND_RETHROW() }

void database::migrate_irreversible_state()
{
   // This method should happen atomically. We cannot prevent unclean shutdown in the middle
   // of the call, but all side effects happen at the end to minize the chance that state
   // invariants will be violated.
   try
   {
      const dynamic_global_property_object& dpo = get_dynamic_global_properties();

      auto fork_head = _fork_db.head();
      if( fork_head )
      {
         FC_ASSERT( fork_head->num == dpo.head_block_number, "Fork Head: ${f} Chain Head: ${c}", ("f",fork_head->num)("c", dpo.head_block_number) );
      }

      if( !( get_node_properties().skip_flags & skip_block_log ) )
      {
         // output to block log based on new last irreverisible block num
         const auto& tmp_head = _block_log.head();
         uint64_t log_head_num = 0;
         vector< item_ptr > blocks_to_write;

         if( tmp_head )
            log_head_num = tmp_head->block_num();

         if( log_head_num < dpo.last_irreversible_block_num )
         {
            // Check for all blocks that we want to write out to the block log but don't write any
            // unless we are certain they all exist in the fork db
            while( log_head_num < dpo.last_irreversible_block_num )
            {
               item_ptr block_ptr = _fork_db.fetch_block_on_main_branch_by_number( log_head_num+1 );
               FC_ASSERT( block_ptr, "Current fork in the fork database does not contain the last_irreversible_block" );
               blocks_to_write.push_back( block_ptr );
               log_head_num++;
            }

            for( auto block_itr = blocks_to_write.begin(); block_itr != blocks_to_write.end(); ++block_itr )
            {
               _block_log.append( block_itr->get()->data );
            }

            _block_log.flush();
         }
      }

      // This deletes blocks from the fork db
      _fork_db.set_max_size( dpo.head_block_number - dpo.last_irreversible_block_num + 1 );

      // This deletes undo state
      commit( dpo.last_irreversible_block_num );
   }
   FC_CAPTURE_AND_RETHROW()
}

void database::clear_expired_transactions()
{
   //Look for expired transactions in the deduplication list, and remove them.
   //Transactions must have expired by at least two forking windows in order to be removed.
   auto& transaction_idx = get_index< transaction_index >();
   const auto& dedupe_index = transaction_idx.indices().get< by_expiration >();
   while( ( !dedupe_index.empty() ) && ( head_block_time() > dedupe_index.begin()->expiration ) )
      remove( *dedupe_index.begin() );
}

void database::clear_expired_delegations()
{
   auto now = head_block_time();
   const auto& delegations_by_exp = get_index< vesting_delegation_expiration_index, by_expiration >();
   auto itr = delegations_by_exp.begin();
   const auto& gpo = get_dynamic_global_properties();

   while( itr != delegations_by_exp.end() && itr->expiration < now )
   {
      operation vop = return_vesting_delegation_operation( itr->delegator, itr->vesting_shares );
      try{
      pre_push_virtual_operation( vop );

      modify( get_account( itr->delegator ), [&]( account_object& a )
      {
         util::update_manabar( gpo, a, true, true, itr->vesting_shares.amount.value );
         a.delegated_vesting_shares -= itr->vesting_shares;
      });

      post_push_virtual_operation( vop );

      remove( *itr );
      itr = delegations_by_exp.begin();
   } FC_CAPTURE_AND_RETHROW( (vop) ) }
}

void database::modify_balance( const account_object& a, const asset& delta, bool check_balance )
{
   modify( a, [&]( account_object& acnt )
   {
      switch( delta.symbol.asset_num )
      {
         case BLURT_ASSET_NUM_BLURT:
            acnt.balance += delta;
            if( check_balance )
            {
               FC_ASSERT( acnt.balance.amount.value >= 0, "Insufficient BLURT funds" );
            }
            break;
         case BLURT_ASSET_NUM_VESTS:
            acnt.vesting_shares += delta;
            if( check_balance )
            {
               FC_ASSERT( acnt.vesting_shares.amount.value >= 0, "Insufficient VESTS funds" );
            }
            break;
         default:
            FC_ASSERT( false, "invalid symbol" );
      }
   } );
}

void database::modify_reward_balance( const account_object& a, const asset& value_delta, const asset& share_delta, bool check_balance )
{
   modify( a, [&]( account_object& acnt )
   {
      switch( value_delta.symbol.asset_num )
      {
         case BLURT_ASSET_NUM_BLURT:
            if( share_delta.amount.value == 0 )
            {
               acnt.reward_blurt_balance += value_delta;
               if( check_balance )
               {
                  FC_ASSERT( acnt.reward_blurt_balance.amount.value >= 0, "Insufficient reward BLURT funds" );
               }
            }
            else
            {
               acnt.reward_vesting_blurt += value_delta;
               acnt.reward_vesting_balance += share_delta;
               if( check_balance )
               {
                  FC_ASSERT( acnt.reward_vesting_balance.amount.value >= 0, "Insufficient reward VESTS funds" );
               }
            }
            break;
         default:
            FC_ASSERT( false, "invalid symbol" );
      }
   });
}

void database::set_index_delegate( const std::string& n, index_delegate&& d )
{
   _index_delegate_map[ n ] = std::move( d );
}

const index_delegate& database::get_index_delegate( const std::string& n )
{
   return _index_delegate_map.at( n );
}

bool database::has_index_delegate( const std::string& n )
{
   return _index_delegate_map.find( n ) != _index_delegate_map.end();
}

const index_delegate_map& database::index_delegates()
{
   return _index_delegate_map;
}

void database::adjust_balance( const account_object& a, const asset& delta )
{
   if ( delta.amount < 0 )
   {
      asset available = get_balance( a, delta.symbol );
      FC_ASSERT( available >= -delta,
         "Account ${acc} does not have sufficient funds for balance adjustment. Required: ${r}, Available: ${a}",
            ("acc", a.name)("r", delta)("a", available) );
   }

   modify_balance( a, delta, true );
}

void database::adjust_balance( const account_name_type& name, const asset& delta )
{
   if ( delta.amount < 0 )
   {
      asset available = get_balance( name, delta.symbol );
      FC_ASSERT( available >= -delta,
         "Account ${acc} does not have sufficient funds for balance adjustment. Required: ${r}, Available: ${a}",
            ("acc", name)("r", delta)("a", available) );
   }

   modify_balance( get_account( name ), delta, true );
}

void database::adjust_savings_balance( const account_object& a, const asset& delta )
{
   modify( a, [&]( account_object& acnt )
   {
      switch( delta.symbol.asset_num )
      {
         case BLURT_ASSET_NUM_BLURT:
            acnt.savings_balance += delta;
            FC_ASSERT( acnt.savings_balance.amount.value >= 0, "Insufficient savings BLURT funds" );
            break;
         default:
            FC_ASSERT( !"invalid symbol" );
      }
   } );
}

void database::adjust_reward_balance( const account_object& a, const asset& value_delta,
                                      const asset& share_delta /*= asset(0,VESTS_SYMBOL)*/ )
{
   FC_ASSERT( value_delta.symbol.is_vesting() == false && share_delta.symbol.is_vesting() );
   modify_reward_balance(a, value_delta, share_delta, true);
}

void database::adjust_reward_balance( const account_name_type& name, const asset& value_delta,
                                      const asset& share_delta /*= asset(0,VESTS_SYMBOL)*/ )
{
   FC_ASSERT( value_delta.symbol.is_vesting() == false && share_delta.symbol.is_vesting() );

   const auto& a = get_account( name );
   modify_reward_balance(a, value_delta, share_delta, true);
}

void database::adjust_supply( const asset& delta, bool adjust_vesting )
{
   const auto& props = get_dynamic_global_properties();
   if( props.head_block_number < BLURT_BLOCKS_PER_DAY*7 )
      adjust_vesting = false;

   modify( props, [&]( dynamic_global_property_object& props )
   {
      switch( delta.symbol.asset_num )
      {
         case BLURT_ASSET_NUM_BLURT:
         {
            asset new_vesting( (adjust_vesting && delta.amount > 0) ? delta.amount * 9 : 0, BLURT_SYMBOL );
            props.current_supply += delta + new_vesting;
            props.total_vesting_fund_blurt += new_vesting;
            FC_ASSERT( props.current_supply.amount.value >= 0 );
            break;
         }
         default:
            FC_ASSERT( false, "invalid symbol" );
      }
   } );
}


asset database::get_balance( const account_object& a, asset_symbol_type symbol )const
{
   switch( symbol.asset_num )
   {
      case BLURT_ASSET_NUM_BLURT:
         return a.balance;
      default:
      {
         FC_ASSERT( false, "Invalid symbol: ${s}", ("s", symbol) );
      }
   }
}

asset database::get_balance( const account_name_type& name, asset_symbol_type symbol )const
{
   return get_balance( get_account( name ), symbol );
}

asset database::get_savings_balance( const account_object& a, asset_symbol_type symbol )const
{
   switch( symbol.asset_num )
   {
      case BLURT_ASSET_NUM_BLURT:
         return a.savings_balance;
      default: // Note no savings balance for SMT per comments in issue 1682.
         FC_ASSERT( !"invalid symbol" );
   }
}

void database::init_hardforks()
{
   _hardfork_versions.times[ 0 ] = fc::time_point_sec( BLURT_GENESIS_TIME );
   _hardfork_versions.versions[ 0 ] = hardfork_version( 0, 0 );

   FC_ASSERT( BLURT_HARDFORK_0_1 == 1, "Invalid hardfork configuration" );
   _hardfork_versions.times[ BLURT_HARDFORK_0_1 ] = fc::time_point_sec( BLURT_HARDFORK_0_1_TIME );
   _hardfork_versions.versions[ BLURT_HARDFORK_0_1 ] = BLURT_HARDFORK_0_1_VERSION;

   FC_ASSERT( BLURT_HARDFORK_0_2 == 2, "Invalid hardfork configuration" );
   _hardfork_versions.times[ BLURT_HARDFORK_0_2 ] = fc::time_point_sec( BLURT_HARDFORK_0_2_TIME );
   _hardfork_versions.versions[ BLURT_HARDFORK_0_2 ] = BLURT_HARDFORK_0_2_VERSION;

   FC_ASSERT( BLURT_HARDFORK_0_3 == 3, "Invalid hardfork configuration" );
   _hardfork_versions.times[ BLURT_HARDFORK_0_3 ] = fc::time_point_sec( BLURT_HARDFORK_0_3_TIME );
   _hardfork_versions.versions[ BLURT_HARDFORK_0_3 ] = BLURT_HARDFORK_0_3_VERSION;

   const auto& hardforks = get_hardfork_property_object();
   FC_ASSERT( hardforks.last_hardfork <= BLURT_NUM_HARDFORKS, "Chain knows of more hardforks than configuration", ("hardforks.last_hardfork",hardforks.last_hardfork)("BLURT_NUM_HARDFORKS",BLURT_NUM_HARDFORKS) );
   FC_ASSERT( _hardfork_versions.versions[ hardforks.last_hardfork ] <= BLURT_BLOCKCHAIN_VERSION, "Blockchain version is older than last applied hardfork" );
   FC_ASSERT( BLURT_BLOCKCHAIN_HARDFORK_VERSION >= BLURT_BLOCKCHAIN_VERSION );
   FC_ASSERT( BLURT_BLOCKCHAIN_HARDFORK_VERSION == _hardfork_versions.versions[ BLURT_NUM_HARDFORKS ] );
}

void database::process_hardforks()
{
   try
   {
      // If there are upcoming hardforks and the next one is later, do nothing
      const auto& hardforks = get_hardfork_property_object();

      {
         while( _hardfork_versions.versions[ hardforks.last_hardfork ] < hardforks.next_hardfork
            && hardforks.next_hardfork_time <= head_block_time() )
         {
            if( hardforks.last_hardfork < BLURT_NUM_HARDFORKS ) {
               apply_hardfork( hardforks.last_hardfork + 1 );
            }
            else
               throw unknown_hardfork_exception();
         }
      }
   }
   FC_CAPTURE_AND_RETHROW()
}

bool database::has_hardfork( uint32_t hardfork )const
{
   return get_hardfork_property_object().processed_hardforks.size() > hardfork;
}

uint32_t database::get_hardfork()const
{
   return get_hardfork_property_object().processed_hardforks.size() - 1;
}

void database::set_hardfork( uint32_t hardfork, bool apply_now )
{
   auto const& hardforks = get_hardfork_property_object();

   for( uint32_t i = hardforks.last_hardfork + 1; i <= hardfork && i <= BLURT_NUM_HARDFORKS; i++ )
   {
      modify( hardforks, [&]( hardfork_property_object& hpo )
      {
         hpo.next_hardfork = _hardfork_versions.versions[i];
         hpo.next_hardfork_time = head_block_time();
      } );

      if( apply_now )
         apply_hardfork( i );
   }
}

void database::apply_hardfork( uint32_t hardfork )
{
   if( _log_hardforks )
      elog( "HARDFORK ${hf} at block ${b}", ("hf", hardfork)("b", head_block_num()) );
   operation hardfork_vop = hardfork_operation( hardfork );

   pre_push_virtual_operation( hardfork_vop );

   switch( hardfork )
   {
      case BLURT_HARDFORK_0_1:
         {
            modify( get< reward_fund_object, by_name >( BLURT_POST_REWARD_FUND_NAME ), [&]( reward_fund_object& rfo ) {
#ifndef  IS_TEST_NET
               rfo.recent_claims = BLURT_HARDFORK_0_1_RECENT_CLAIMS;
#endif
            });
         }
         break;
      case BLURT_HARDFORK_0_2:
         break;
      case BLURT_HARDFORK_0_3: {
         // TODO: uncomment this before final code merge - I don't have these accounts defined in my local testnet
         /*for (const std::string &line : hardfork3::get_accounts()) {
            account_snapshot ss_account = fc::json::from_string(line).as<account_snapshot>();
            ilog("update account_auth for ${a}", ("a", ss_account.name));
            const auto &account_auth = get<account_authority_object, by_account>(ss_account.name);
            modify(account_auth, [&](account_authority_object &auth) {
               auth.owner = ss_account.owner;
               auth.active = ss_account.active;
               auth.posting = ss_account.posting;
            });
         }*/

         modify( get< reward_fund_object, by_name >( BLURT_POST_REWARD_FUND_NAME ), [&]( reward_fund_object& rfo ) {
            rfo.content_constant = BLURT_HARDFORK_0_3_REWARD_CONTENT_CONSTANT;
         });
      }
         break;
      default:
         break;
   }

   modify( get_hardfork_property_object(), [&]( hardfork_property_object& hfp )
   {
      FC_ASSERT( hardfork == hfp.last_hardfork + 1, "Hardfork being applied out of order", ("hardfork",hardfork)("hfp.last_hardfork",hfp.last_hardfork) );
      FC_ASSERT( hfp.processed_hardforks.size() == hardfork, "Hardfork being applied out of order" );
      hfp.processed_hardforks.push_back( _hardfork_versions.times[ hardfork ] );
      hfp.last_hardfork = hardfork;
      hfp.current_hardfork_version = _hardfork_versions.versions[ hardfork ];
      FC_ASSERT( hfp.processed_hardforks[ hfp.last_hardfork ] == _hardfork_versions.times[ hfp.last_hardfork ], "Hardfork processing failed sanity check..." );
   } );

   post_push_virtual_operation( hardfork_vop );
}

/**
 * Verifies all supply invariantes check out
 */
void database::validate_invariants()const
{
   try
   {
      const auto& account_idx = get_index< account_index, by_name >();
      asset total_supply = asset( 0, BLURT_SYMBOL );
      asset total_vesting = asset( 0, VESTS_SYMBOL );
      asset pending_vesting_steem = asset( 0, BLURT_SYMBOL );
      share_type total_vsf_votes = share_type( 0 );

      auto gpo = get_dynamic_global_properties();

      /// verify no witness has too many votes
      const auto& witness_idx = get_index< witness_index >().indices();
      for( auto itr = witness_idx.begin(); itr != witness_idx.end(); ++itr ) {
         if (has_hardfork(BLURT_HARDFORK_0_3)) {
            FC_ASSERT( itr->votes <= gpo.total_vesting_shares.amount + gpo.regent_vesting_shares.amount, "", ("itr",*itr) );
         } else {
            FC_ASSERT( itr->votes <= gpo.total_vesting_shares.amount, "", ("itr",*itr) );
         }
      }

      for( auto itr = account_idx.begin(); itr != account_idx.end(); ++itr )
      {
         total_supply += itr->balance;
         total_supply += itr->savings_balance;
         total_supply += itr->reward_blurt_balance;
         total_vesting += itr->vesting_shares;
         total_vesting += itr->reward_vesting_balance;
         pending_vesting_steem += itr->reward_vesting_blurt;
         total_vsf_votes += ( itr->proxy == BLURT_PROXY_TO_SELF_ACCOUNT ?
                                 itr->witness_vote_weight() :
                                 ( BLURT_MAX_PROXY_RECURSION_DEPTH > 0 ?
                                      itr->proxied_vsf_votes[BLURT_MAX_PROXY_RECURSION_DEPTH - 1] :
                                      itr->vesting_shares.amount ) );
      }

      const auto& escrow_idx = get_index< escrow_index >().indices().get< by_id >();

      for( auto itr = escrow_idx.begin(); itr != escrow_idx.end(); ++itr )
      {
         total_supply += itr->blurt_balance;

         if( itr->pending_fee.symbol == BLURT_SYMBOL )
            total_supply += itr->pending_fee;
         else
            FC_ASSERT( false, "found escrow pending fee that is not BLURT" );
      }

      const auto& savings_withdraw_idx = get_index< savings_withdraw_index >().indices().get< by_id >();

      for( auto itr = savings_withdraw_idx.begin(); itr != savings_withdraw_idx.end(); ++itr )
      {
         if( itr->amount.symbol == BLURT_SYMBOL )
            total_supply += itr->amount;
         else
            FC_ASSERT( false, "found savings withdraw that is not BLURT" );
      }

      const auto& reward_idx = get_index< reward_fund_index, by_id >();
      for( auto itr = reward_idx.begin(); itr != reward_idx.end(); ++itr )
      {
         total_supply += itr->reward_balance;
      }

      total_supply += gpo.total_vesting_fund_blurt + gpo.total_reward_fund_blurt + gpo.pending_rewarded_vesting_blurt;

      FC_ASSERT( gpo.current_supply == total_supply, "", ("gpo.current_supply",gpo.current_supply)("total_supply",total_supply) );
      FC_ASSERT( gpo.total_vesting_shares + gpo.pending_rewarded_vesting_shares == total_vesting, "", ("gpo.total_vesting_shares",gpo.total_vesting_shares)("total_vesting",total_vesting) );
      FC_ASSERT( gpo.total_vesting_shares.amount == total_vsf_votes, "", ("total_vesting_shares",gpo.total_vesting_shares)("total_vsf_votes",total_vsf_votes) );
      FC_ASSERT( gpo.pending_rewarded_vesting_blurt == pending_vesting_steem, "", ("pending_rewarded_vesting_blurt",gpo.pending_rewarded_vesting_blurt)("pending_vesting_steem", pending_vesting_steem));
   }
   FC_CAPTURE_LOG_AND_RETHROW( (head_block_num()) );
}

void database::retally_comment_children()
{
   const auto& cidx = get_index< comment_index >().indices();

   // Clear children counts
   for( auto itr = cidx.begin(); itr != cidx.end(); ++itr )
   {
      modify( *itr, [&]( comment_object& c )
      {
         c.children = 0;
      });
   }

   for( auto itr = cidx.begin(); itr != cidx.end(); ++itr )
   {
      if( itr->parent_author != BLURT_ROOT_POST_PARENT )
      {
// Low memory nodes only need immediate child count, full nodes track total children
#ifdef IS_LOW_MEM
         modify( get_comment( itr->parent_author, itr->parent_permlink ), [&]( comment_object& c )
         {
            c.children++;
         });
#else
         const comment_object* parent = &get_comment( itr->parent_author, itr->parent_permlink );
         while( parent )
         {
            modify( *parent, [&]( comment_object& c )
            {
               c.children++;
            });

            if( parent->parent_author != BLURT_ROOT_POST_PARENT )
               parent = &get_comment( parent->parent_author, parent->parent_permlink );
            else
               parent = nullptr;
         }
#endif
      }
   }
}

void database::retally_witness_votes()
{
   const auto& witness_idx = get_index< witness_index >().indices();

   // Clear all witness votes
   for( auto itr = witness_idx.begin(); itr != witness_idx.end(); ++itr )
   {
      modify( *itr, [&]( witness_object& w )
      {
         w.votes = 0;
         w.virtual_position = 0;
      } );
   }

   const auto& account_idx = get_index< account_index >().indices();

   // Apply all existing votes by account
   for( auto itr = account_idx.begin(); itr != account_idx.end(); ++itr )
   {
      if( itr->proxy != BLURT_PROXY_TO_SELF_ACCOUNT ) continue;

      const auto& a = *itr;

      const auto& vidx = get_index<witness_vote_index>().indices().get<by_account_witness>();
      auto wit_itr = vidx.lower_bound( boost::make_tuple( a.name, account_name_type() ) );
      while( wit_itr != vidx.end() && wit_itr->account == a.name )
      {
         adjust_witness_vote( get< witness_object, by_name >(wit_itr->witness), a.witness_vote_weight() );
         ++wit_itr;
      }
   }
}

void database::retally_witness_vote_counts( bool force )
{
   const auto& account_idx = get_index< account_index >().indices();

   // Check all existing votes by account
   for( auto itr = account_idx.begin(); itr != account_idx.end(); ++itr )
   {
      const auto& a = *itr;
      uint16_t witnesses_voted_for = 0;
      if( force || (a.proxy != BLURT_PROXY_TO_SELF_ACCOUNT  ) )
      {
        const auto& vidx = get_index< witness_vote_index >().indices().get< by_account_witness >();
        auto wit_itr = vidx.lower_bound( boost::make_tuple( a.name, account_name_type() ) );
        while( wit_itr != vidx.end() && wit_itr->account == a.name )
        {
           ++witnesses_voted_for;
           ++wit_itr;
        }
      }
      if( a.witnesses_voted_for != witnesses_voted_for )
      {
         modify( a, [&]( account_object& account )
         {
            account.witnesses_voted_for = witnesses_voted_for;
         } );
      }
   }
}

optional< chainbase::database::session >& database::pending_transaction_session()
{
   return _pending_tx_session;
}

} } //blurt::chain
