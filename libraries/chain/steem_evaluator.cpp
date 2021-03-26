#include <blurt/chain/blurt_fwd.hpp>

#include <blurt/chain/steem_evaluator.hpp>
#include <blurt/chain/database.hpp>
#include <blurt/chain/custom_operation_interpreter.hpp>
#include <blurt/chain/blurt_objects.hpp>
#include <blurt/chain/witness_objects.hpp>
#include <blurt/chain/block_summary_object.hpp>

#include <blurt/chain/util/reward.hpp>
#include <blurt/chain/util/manabar.hpp>

#include <fc/macros.hpp>
#include <boost/locale/encoding_utf.hpp>
#include <diff_match_patch.h>
#include <fc/uint128.hpp>
#include <fc/utf8.hpp>
#include <limits>


using boost::locale::conv::utf_to_utf;

std::wstring utf8_to_wstring(const std::string& str)
{
    return utf_to_utf<wchar_t>(str.c_str(), str.c_str() + str.size());
}

std::string wstring_to_utf8(const std::wstring& str)
{
    return utf_to_utf<char>(str.c_str(), str.c_str() + str.size());
}



namespace blurt { namespace chain {
   using fc::uint128_t;

inline void validate_permlink_0_1( const string& permlink )
{
   FC_ASSERT( permlink.size() > BLURT_MIN_PERMLINK_LENGTH && permlink.size() < BLURT_MAX_PERMLINK_LENGTH, "Permlink is not a valid size." );

   for( const auto& c : permlink )
   {
      switch( c )
      {
         case 'a': case 'b': case 'c': case 'd': case 'e': case 'f': case 'g': case 'h': case 'i':
         case 'j': case 'k': case 'l': case 'm': case 'n': case 'o': case 'p': case 'q': case 'r':
         case 's': case 't': case 'u': case 'v': case 'w': case 'x': case 'y': case 'z': case '0':
         case '1': case '2': case '3': case '4': case '5': case '6': case '7': case '8': case '9':
         case '-':
            break;
         default:
            FC_ASSERT( false, "Invalid permlink character: ${s}", ("s", std::string() + c ) );
      }
   }
}

template< bool force_canon >
void copy_legacy_chain_properties( chain_properties& dest, const legacy_chain_properties& src )
{
   dest.account_creation_fee = src.account_creation_fee.to_asset< force_canon >();
   dest.maximum_block_size = src.maximum_block_size;
}

void witness_update_evaluator::do_apply( const witness_update_operation& o )
{
   _db.get_account( o.owner ); // verify owner exists

   {
      FC_ASSERT( o.props.account_creation_fee.symbol.is_canon() );

      FC_ASSERT( o.props.account_creation_fee.amount <= BLURT_MAX_ACCOUNT_CREATION_FEE, "account_creation_fee greater than maximum account creation fee" );
   }

   FC_ASSERT( o.props.maximum_block_size <= BLURT_SOFT_MAX_BLOCK_SIZE, "Max block size cannot be more than 2MiB" );

   const auto& by_witness_name_idx = _db.get_index< witness_index >().indices().get< by_name >();
   auto wit_itr = by_witness_name_idx.find( o.owner );
   if( wit_itr != by_witness_name_idx.end() )
   {
      _db.modify( *wit_itr, [&]( witness_object& w ) {
         from_string( w.url, o.url );
         w.signing_key        = o.block_signing_key;
         copy_legacy_chain_properties< false >( w.props, o.props );
      });
   }
   else
   {
      _db.create< witness_object >( [&]( witness_object& w ) {
         w.owner              = o.owner;
         from_string( w.url, o.url );
         w.signing_key        = o.block_signing_key;
         w.created            = _db.head_block_time();
         copy_legacy_chain_properties< false >( w.props, o.props );
      });
   }
}

struct witness_properties_change_flags
{
   uint32_t account_creation_changed       : 1;
   uint32_t max_block_changed              : 1;
   uint32_t account_subsidy_budget_changed : 1;
   uint32_t account_subsidy_decay_changed  : 1;
   uint32_t key_changed                    : 1;
   uint32_t url_changed                    : 1;
   uint32_t operation_flat_fee_changed     : 1;
   uint32_t bandwidth_kbytes_fee_changed   : 1;
};

void witness_set_properties_evaluator::do_apply( const witness_set_properties_operation& o )
{
   const auto& witness = _db.get< witness_object, by_name >( o.owner ); // verifies witness exists;

   // Capture old properties. This allows only updating the object once.
   chain_properties  props;
   public_key_type   signing_key;
   string            url;

   witness_properties_change_flags flags;

   auto itr = o.props.find( "key" );

   // This existence of 'key' is checked in witness_set_properties_operation::validate
   fc::raw::unpack_from_vector( itr->second, signing_key );
   FC_ASSERT( signing_key == witness.signing_key, "'key' does not match witness signing key.",
      ("key", signing_key)("signing_key", witness.signing_key) );

   itr = o.props.find( "account_creation_fee" );
   flags.account_creation_changed = itr != o.props.end();
   if( flags.account_creation_changed )
   {
      fc::raw::unpack_from_vector( itr->second, props.account_creation_fee );

      {
         FC_ASSERT( props.account_creation_fee.amount <= BLURT_MAX_ACCOUNT_CREATION_FEE, "account_creation_fee greater than maximum account creation fee" );
      }
   }

   itr = o.props.find( "maximum_block_size" );
   flags.max_block_changed = itr != o.props.end();
   if( flags.max_block_changed )
   {
      fc::raw::unpack_from_vector( itr->second, props.maximum_block_size );
   }

   itr = o.props.find( "account_subsidy_budget" );
   flags.account_subsidy_budget_changed = itr != o.props.end();
   if( flags.account_subsidy_budget_changed )
   {
      fc::raw::unpack_from_vector( itr->second, props.account_subsidy_budget );
   }

   itr = o.props.find( "account_subsidy_decay" );
   flags.account_subsidy_decay_changed = itr != o.props.end();
   if( flags.account_subsidy_decay_changed )
   {
      fc::raw::unpack_from_vector( itr->second, props.account_subsidy_decay );
   }

   itr = o.props.find( "new_signing_key" );
   flags.key_changed = itr != o.props.end();
   if( flags.key_changed )
   {
      fc::raw::unpack_from_vector( itr->second, signing_key );
   }

   itr = o.props.find( "url" );
   flags.url_changed = itr != o.props.end();
   if( flags.url_changed )
   {
      fc::raw::unpack_from_vector< std::string >( itr->second, url );
   }

   itr = o.props.find( "operation_flat_fee" );
   flags.operation_flat_fee_changed = itr != o.props.end();
   if( flags.operation_flat_fee_changed )
   {
      fc::raw::unpack_from_vector( itr->second, props.operation_flat_fee );

      FC_ASSERT( props.operation_flat_fee.amount <= 100000, "operation_flat_fee too high!" );
   }

   itr = o.props.find( "bandwidth_kbytes_fee" );
   flags.bandwidth_kbytes_fee_changed = itr != o.props.end();
   if( flags.bandwidth_kbytes_fee_changed )
   {
      fc::raw::unpack_from_vector( itr->second, props.bandwidth_kbytes_fee );

      FC_ASSERT( props.bandwidth_kbytes_fee.amount <= 100000, "bandwidth_kbytes_fee too high!" );
   }

   _db.modify( witness, [&]( witness_object& w )
   {
      if( flags.account_creation_changed )
      {
         w.props.account_creation_fee = props.account_creation_fee;
      }

      if( flags.max_block_changed )
      {
         w.props.maximum_block_size = props.maximum_block_size;
      }

      if( flags.account_subsidy_budget_changed )
      {
         w.props.account_subsidy_budget = props.account_subsidy_budget;
      }

      if( flags.account_subsidy_decay_changed )
      {
         w.props.account_subsidy_decay = props.account_subsidy_decay;
      }

      if( flags.key_changed )
      {
         w.signing_key = signing_key;
      }

      if( flags.url_changed )
      {
         from_string( w.url, url );
      }

      if( flags.operation_flat_fee_changed ) {
         w.props.operation_flat_fee = props.operation_flat_fee;
      }

      if( flags.bandwidth_kbytes_fee_changed ) {
         w.props.bandwidth_kbytes_fee = props.bandwidth_kbytes_fee;
      }
   });

   if (_db.has_hardfork(BLURT_HARDFORK_0_5)) {
      /* witness_set_properties_evaluator is a special case because
         it uses the signing key instead of owner, active, or posting key
         to operate.
         See issue https://gitlab.com/blurt/blurt/-/issues/114
      */
      const witness_schedule_object& wso = _db.get_witness_schedule_object();
      share_type flat_fee_amount = wso.median_props.operation_flat_fee.amount.value;
      auto flat_fee = asset(std::max(flat_fee_amount, share_type(1)), BLURT_SYMBOL);
   
      auto op_size = fc::raw::pack_size(o);
      share_type bw_fee_amount = (op_size * wso.median_props.bandwidth_kbytes_fee.amount.value)/1024;
      auto bw_fee = asset(std::max(bw_fee_amount, share_type(1)), BLURT_SYMBOL);
      auto fee = flat_fee + bw_fee;
   
      const auto& acnt = _db.get_account( o.owner );
      FC_ASSERT( acnt.balance >= fee, "Account does not have sufficient funds for transaction fee.", ("balance", acnt.balance)("fee", fee) );
   
      _db.adjust_balance( acnt, -fee );
      if (_db.has_hardfork(BLURT_HARDFORK_0_4)) {
         _db.adjust_balance( _db.get_account( BLURT_NULL_ACCOUNT ), fee );
#ifdef IS_TEST_NET
         ilog( "burned transaction fee ${f} from account ${a}", ("f", fee)("a", o.owner));
#endif
      } else {
         _db.adjust_balance( _db.get_account( BLURT_TREASURY_ACCOUNT ), fee );
      }
   }
}

void verify_authority_accounts_exist(
   const database& db,
   const authority& auth,
   const account_name_type& auth_account,
   authority::classification auth_class)
{
   for( const std::pair< account_name_type, weight_type >& aw : auth.account_auths )
   {
      const account_object* a = db.find_account( aw.first );
      FC_ASSERT( a != nullptr, "New ${ac} authority on account ${aa} references non-existing account ${aref}",
         ("aref", aw.first)("ac", auth_class)("aa", auth_account) );
   }
}

void initialize_account_object( account_object& acc, const account_name_type& name, const public_key_type& key,
   const dynamic_global_property_object& props, bool mined, const account_name_type& recovery_account, uint32_t hardfork )
{
   acc.name = name;
   acc.memo_key = key;
   acc.created = props.time;
   acc.voting_manabar.last_update_time = props.time.sec_since_epoch();
   acc.mined = mined;

   if( recovery_account != BLURT_TEMP_ACCOUNT )
   {
      acc.recovery_account = recovery_account;
   }
}

void account_create_evaluator::do_apply( const account_create_operation& o )
{
   const auto& creator = _db.get_account( o.creator );
   const auto& props = _db.get_dynamic_global_properties();
   const witness_schedule_object& wso = _db.get_witness_schedule_object();

   FC_ASSERT( o.fee == wso.median_props.account_creation_fee, "Must pay the exact account creation fee. paid: ${p} fee: ${f}",
               ("p", o.fee)
               ("f", wso.median_props.account_creation_fee) );

   {
      verify_authority_accounts_exist( _db, o.owner, o.new_account_name, authority::owner );
      verify_authority_accounts_exist( _db, o.active, o.new_account_name, authority::active );
      verify_authority_accounts_exist( _db, o.posting, o.new_account_name, authority::posting );
   }

   _db.adjust_balance( creator, -o.fee );
   _db.adjust_balance( _db.get< account_object, by_name >( BLURT_NULL_ACCOUNT ), o.fee );

   const auto& new_account = _db.create< account_object >( [&]( account_object& acc )
   {
      initialize_account_object( acc, o.new_account_name, o.memo_key, props, false /*mined*/, o.creator, _db.get_hardfork() );
   });

#ifndef IS_LOW_MEM
   _db.create< account_metadata_object >( [&]( account_metadata_object& meta )
   {
      meta.account = new_account.id;
      from_string( meta.json_metadata, o.json_metadata );
   });
#else
   FC_UNUSED( new_account );
#endif

   _db.create< account_authority_object >( [&]( account_authority_object& auth )
   {
      auth.account = o.new_account_name;
      auth.owner = o.owner;
      auth.active = o.active;
      auth.posting = o.posting;
      auth.last_owner_update = fc::time_point_sec::min();
   });
}

void account_update_evaluator::do_apply( const account_update_operation& o )
{
   FC_ASSERT( o.account != BLURT_TEMP_ACCOUNT, "Cannot update temp account." );

   if( o.posting )
      o.posting->validate();

   const auto& account = _db.get_account( o.account );
   const auto& account_auth = _db.get< account_authority_object, by_account >( o.account );

   if( o.owner )
      validate_auth_size( *o.owner );
   if( o.active )
      validate_auth_size( *o.active );
   if( o.posting )
      validate_auth_size( *o.posting );

   if( o.owner )
   {
#ifndef IS_TEST_NET
      FC_ASSERT( _db.head_block_time() - account_auth.last_owner_update > BLURT_OWNER_UPDATE_LIMIT, "Owner authority can only be updated once an hour." );
#endif

      verify_authority_accounts_exist( _db, *o.owner, o.account, authority::owner );

      _db.update_owner_authority( account, *o.owner );
   }
   if( o.active )
      verify_authority_accounts_exist( _db, *o.active, o.account, authority::active );
   if( o.posting )
      verify_authority_accounts_exist( _db, *o.posting, o.account, authority::posting );

   _db.modify( account, [&]( account_object& acc )
   {
      if( o.memo_key && *o.memo_key != public_key_type() )
            acc.memo_key = *o.memo_key;

      acc.last_account_update = _db.head_block_time();
   });

   #ifndef IS_LOW_MEM
   if( o.json_metadata.size() > 0 || o.posting_json_metadata.size() > 0 )
   {
      _db.modify( _db.get< account_metadata_object, by_account >( account.id ), [&]( account_metadata_object& meta )
      {
         if ( o.json_metadata.size() > 0 )
            from_string( meta.json_metadata, o.json_metadata );

         if ( o.posting_json_metadata.size() > 0 )
            from_string( meta.posting_json_metadata, o.posting_json_metadata );
      });
   }
   #endif

   if( o.active || o.posting )
   {
      _db.modify( account_auth, [&]( account_authority_object& auth)
      {
         if( o.active )  auth.active  = *o.active;
         if( o.posting ) auth.posting = *o.posting;
      });
   }

}

/**
 *  Because net_rshares is 0 there is no need to update any pending payout calculations or parent posts.
 */
void delete_comment_evaluator::do_apply( const delete_comment_operation& o )
{
   const auto& comment = _db.get_comment( o.author, o.permlink );
   FC_ASSERT( comment.children == 0, "Cannot delete a comment with replies." );
   FC_ASSERT( comment.cashout_time != fc::time_point_sec::maximum() );
   FC_ASSERT( comment.net_rshares <= 0, "Cannot delete a comment with net positive votes." );

   if( comment.net_rshares > 0 ) return;

   const auto& vote_idx = _db.get_index<comment_vote_index>().indices().get<by_comment_voter>();

   auto vote_itr = vote_idx.lower_bound( comment_id_type(comment.id) );
   while( vote_itr != vote_idx.end() && vote_itr->comment == comment.id ) {
      const auto& cur_vote = *vote_itr;
      ++vote_itr;
      _db.remove(cur_vote);
   }

   /// this loop can be skiped for validate-only nodes as it is merely gathering stats for indicies
   if( comment.parent_author != BLURT_ROOT_POST_PARENT )
   {
      auto parent = &_db.get_comment( comment.parent_author, comment.parent_permlink );
      auto now = _db.head_block_time();
      while( parent )
      {
         _db.modify( *parent, [&]( comment_object& p ){
            p.children--;
            p.active = now;
         });
   #ifndef IS_LOW_MEM
         if( parent->parent_author != BLURT_ROOT_POST_PARENT )
            parent = &_db.get_comment( parent->parent_author, parent->parent_permlink );
         else
   #endif
            parent = nullptr;
      }
   }

   _db.remove( comment );
}

struct comment_options_extension_visitor
{
   comment_options_extension_visitor( const comment_object& c, database& db ) : _c( c ), _db( db ) {}

   typedef void result_type;

   const comment_object& _c;
   database& _db;

   void operator()( const comment_payout_beneficiaries& cpb ) const
   {
      FC_ASSERT( _c.beneficiaries.size() == 0, "Comment already has beneficiaries specified." );
      FC_ASSERT( _c.abs_rshares == 0, "Comment must not have been voted on before specifying beneficiaries." );

      _db.modify( _c, [&]( comment_object& c )
      {
         for( auto& b : cpb.beneficiaries )
         {
            auto acc = _db.find< account_object, by_name >( b.account );
            FC_ASSERT( acc != nullptr, "Beneficiary \"${a}\" must exist.", ("a", b.account) );
            c.beneficiaries.push_back( b );
         }
      });
   }
};

void comment_options_evaluator::do_apply( const comment_options_operation& o )
{
   if (!_db.has_hardfork(BLURT_HARDFORK_0_6))
      FC_ASSERT(o.percent_blurt == 0, "Payments in blurt are disabled");

   const auto& comment = _db.get_comment( o.author, o.permlink );
   if( !o.allow_curation_rewards || !o.allow_votes || o.max_accepted_payout < comment.max_accepted_payout )
      FC_ASSERT( comment.abs_rshares == 0, "One of the included comment options requires the comment to have no rshares allocated to it." );

   FC_ASSERT( comment.allow_curation_rewards >= o.allow_curation_rewards, "Curation rewards cannot be re-enabled." );
   FC_ASSERT( comment.allow_votes >= o.allow_votes, "Voting cannot be re-enabled." );
   FC_ASSERT( comment.max_accepted_payout >= o.max_accepted_payout, "A comment cannot accept a greater payout." );
   FC_ASSERT( comment.percent_blurt >= o.percent_blurt, "A comment cannot accept a greater percent BLURT.");

   _db.modify( comment, [&]( comment_object& c ) {
       c.max_accepted_payout   = o.max_accepted_payout;
       c.percent_blurt         = o.percent_blurt;
       c.allow_votes           = o.allow_votes;
       c.allow_curation_rewards = o.allow_curation_rewards;
   });

   for( auto& e : o.extensions )
   {
      e.visit( comment_options_extension_visitor( comment, _db ) );
   }
}

void comment_evaluator::do_apply( const comment_operation& o )
{ try {
   FC_ASSERT( o.title.size() + o.body.size() + o.json_metadata.size(), "Cannot update comment because nothing appears to be changing." );

   //////////////////////////
   // spam filter
#ifndef IS_LOW_MEM
   bool filtered = false;
   {
      const auto& filtered_list = _db.get_spam_accounts();
      if (filtered_list.find(o.author) != filtered_list.end()) {
         filtered = true;
//         ilog("spam comment filter: ${a}", ("a", o.author));
      }
   }
#endif
   // end spam filter

   const auto& by_permlink_idx = _db.get_index< comment_index >().indices().get< by_permlink >();
   auto itr = by_permlink_idx.find( boost::make_tuple( o.author, o.permlink ) );

   const auto& auth = _db.get_account( o.author ); /// prove it exists

   comment_id_type id;

   const comment_object* parent = nullptr;
   if( o.parent_author != BLURT_ROOT_POST_PARENT )
   {
      parent = &_db.get_comment( o.parent_author, o.parent_permlink );
      FC_ASSERT( parent->depth < BLURT_MAX_COMMENT_DEPTH, "Comment is nested ${x} posts deep, maximum depth is ${y}.", ("x",parent->depth)("y",BLURT_MAX_COMMENT_DEPTH) );
   }

   FC_ASSERT( fc::is_utf8( o.json_metadata ), "JSON Metadata must be UTF-8" );

   auto now = _db.head_block_time();

   if ( itr == by_permlink_idx.end() )
   {
      if( o.parent_author != BLURT_ROOT_POST_PARENT )
      {
         FC_ASSERT( _db.get( parent->root_comment ).allow_replies, "The parent comment has disabled replies." );
      }

      {
         if( o.parent_author == BLURT_ROOT_POST_PARENT )
             FC_ASSERT( ( now - auth.last_root_post ) > BLURT_MIN_ROOT_COMMENT_INTERVAL, "You may only post once every 5 minutes.", ("now",now)("last_root_post", auth.last_root_post) );
         else
             FC_ASSERT( (now - auth.last_post) >= BLURT_MIN_REPLY_INTERVAL_HF20, "You may only comment once every 3 seconds.", ("now",now)("auth.last_post",auth.last_post) );
      }

      uint16_t reward_weight = BLURT_100_PERCENT;
      uint64_t post_bandwidth = auth.post_bandwidth;

      _db.modify( auth, [&]( account_object& a ) {
         if( o.parent_author == BLURT_ROOT_POST_PARENT )
         {
            a.last_root_post = now;
            a.post_bandwidth = uint32_t( post_bandwidth );
         }
         a.last_post = now;
         a.last_post_edit = now;
         a.post_count++;
      });

      const auto& new_comment = _db.create< comment_object >( [&]( comment_object& com )
      {
         {
            validate_permlink_0_1( o.parent_permlink );
            validate_permlink_0_1( o.permlink );
         }

         com.author = o.author;
         from_string( com.permlink, o.permlink );
         com.last_update = _db.head_block_time();
         com.created = com.last_update;
         com.active = com.last_update;
         com.last_payout = fc::time_point_sec::min();
         com.max_cashout_time = fc::time_point_sec::maximum();
         com.reward_weight = reward_weight;
         if( !_db.has_hardfork(BLURT_HARDFORK_0_6) )
         {
            com.percent_blurt = 0;
         }

         if ( o.parent_author == BLURT_ROOT_POST_PARENT )
         {
            com.parent_author = "";
            from_string( com.parent_permlink, o.parent_permlink );
            from_string( com.category, o.parent_permlink );
            com.root_comment = com.id;
         }
         else
         {
            com.parent_author = parent->author;
            com.parent_permlink = parent->permlink;
            com.depth = parent->depth + 1;
            com.category = parent->category;
            com.root_comment = parent->root_comment;
         }

         com.cashout_time = com.created + BLURT_CASHOUT_WINDOW_SECONDS;
      });

      id = new_comment.id;


#ifndef IS_LOW_MEM
      _db.create< comment_content_object >( [&]( comment_content_object& con ) {
         con.comment = id;
         from_string( con.title, o.title );
         if (!filtered) {
            if( o.body.size() < 1024*1024*128 ) {
               from_string( con.body, o.body );
            }
            from_string( con.json_metadata, o.json_metadata );
         }
      });
#endif


/// this loop can be skiped for validate-only nodes as it is merely gathering stats for indicies
//      auto now = _db.head_block_time();
      while( parent ) {
         _db.modify( *parent, [&]( comment_object& p ){
            p.children++;
            p.active = now;
         });
#ifndef IS_LOW_MEM
         if( parent->parent_author != BLURT_ROOT_POST_PARENT )
            parent = &_db.get_comment( parent->parent_author, parent->parent_permlink );
         else
#endif
            parent = nullptr;
      }

   }
   else // start edit case
   {
      const auto& comment = *itr;

      FC_ASSERT( now - auth.last_post_edit >= BLURT_MIN_COMMENT_EDIT_INTERVAL, "Can only perform one comment edit per block." );

      _db.modify( comment, [&]( comment_object& com )
      {
         com.last_update   = _db.head_block_time();
         com.active        = com.last_update;
         std::function< bool( const shared_string& a, const string& b ) > equal;

         equal = []( const shared_string& a, const string& b ) -> bool { return a.size() == b.size() && std::strcmp( a.c_str(), b.c_str() ) == 0; };

         if( !parent )
         {
            FC_ASSERT( com.parent_author == account_name_type(), "The parent of a comment cannot change." );
            FC_ASSERT( equal( com.parent_permlink, o.parent_permlink ), "The permlink of a comment cannot change." );
         }
         else
         {
            FC_ASSERT( com.parent_author == o.parent_author, "The parent of a comment cannot change." );
            FC_ASSERT( equal( com.parent_permlink, o.parent_permlink ), "The permlink of a comment cannot change." );
         }
      });

      _db.modify( auth, [&]( account_object& a )
      {
         a.last_post_edit = now;
      });
#ifndef IS_LOW_MEM
      if (!filtered) {
         _db.modify( _db.get< comment_content_object, by_comment >( comment.id ), [&]( comment_content_object& con )
         {
            if( o.title.size() )         from_string( con.title, o.title );
            if( o.json_metadata.size() )
               from_string( con.json_metadata, o.json_metadata );

            if( o.body.size() ) {
               try {
               diff_match_patch<std::wstring> dmp;
               auto patch = dmp.patch_fromText( utf8_to_wstring(o.body) );
               if( patch.size() ) {
                  auto result = dmp.patch_apply( patch, utf8_to_wstring( to_string( con.body ) ) );
                  auto patched_body = wstring_to_utf8(result.first);
                  if( !fc::is_utf8( patched_body ) ) {
                     idump(("invalid utf8")(patched_body));
                     from_string( con.body, fc::prune_invalid_utf8(patched_body) );
                  } else { from_string( con.body, patched_body ); }
               }
               else { // replace
                  from_string( con.body, o.body );
               }
               } catch ( ... ) {
                  from_string( con.body, o.body );
               }
            }
         });
      }
#endif



   } // end EDIT case

} FC_CAPTURE_AND_RETHROW( (o) ) }

void escrow_transfer_evaluator::do_apply( const escrow_transfer_operation& o )
{
   try
   {
      const auto& from_account = _db.get_account(o.from);
      _db.get_account(o.to);
      _db.get_account(o.agent);

      FC_ASSERT( o.ratification_deadline > _db.head_block_time(), "The escorw ratification deadline must be after head block time." );
      FC_ASSERT( o.escrow_expiration > _db.head_block_time(), "The escrow expiration must be after head block time." );

      asset steem_spent = o.blurt_amount;
      if( o.fee.symbol == BLURT_SYMBOL )
         steem_spent += o.fee;

      _db.adjust_balance( from_account, -steem_spent );
      _db.create<escrow_object>([&]( escrow_object& esc )
      {
         esc.escrow_id              = o.escrow_id;
         esc.from                   = o.from;
         esc.to                     = o.to;
         esc.agent                  = o.agent;
         esc.ratification_deadline  = o.ratification_deadline;
         esc.escrow_expiration      = o.escrow_expiration;
         esc.blurt_balance          = o.blurt_amount;
         esc.pending_fee            = o.fee;
      });
   }
   FC_CAPTURE_AND_RETHROW( (o) )
}

void escrow_approve_evaluator::do_apply( const escrow_approve_operation& o )
{
   try
   {

      const auto& escrow = _db.get_escrow( o.from, o.escrow_id );

      FC_ASSERT( escrow.to == o.to, "Operation 'to' (${o}) does not match escrow 'to' (${e}).", ("o", o.to)("e", escrow.to) );
      FC_ASSERT( escrow.agent == o.agent, "Operation 'agent' (${a}) does not match escrow 'agent' (${e}).", ("o", o.agent)("e", escrow.agent) );
      FC_ASSERT( escrow.ratification_deadline >= _db.head_block_time(), "The escrow ratification deadline has passed. Escrow can no longer be ratified." );

      bool reject_escrow = !o.approve;

      if( o.who == o.to )
      {
         FC_ASSERT( !escrow.to_approved, "Account 'to' (${t}) has already approved the escrow.", ("t", o.to) );

         if( !reject_escrow )
         {
            _db.modify( escrow, [&]( escrow_object& esc )
            {
               esc.to_approved = true;
            });
         }
      }
      if( o.who == o.agent )
      {
         FC_ASSERT( !escrow.agent_approved, "Account 'agent' (${a}) has already approved the escrow.", ("a", o.agent) );

         if( !reject_escrow )
         {
            _db.modify( escrow, [&]( escrow_object& esc )
            {
               esc.agent_approved = true;
            });
         }
      }

      if( reject_escrow )
      {
         _db.adjust_balance( o.from, escrow.blurt_balance );
         _db.adjust_balance( o.from, escrow.pending_fee );

         _db.remove( escrow );
      }
      else if( escrow.to_approved && escrow.agent_approved )
      {
         _db.adjust_balance( o.agent, escrow.pending_fee );

         _db.modify( escrow, [&]( escrow_object& esc )
         {
            esc.pending_fee.amount = 0;
         });
      }
   }
   FC_CAPTURE_AND_RETHROW( (o) )
}

void escrow_dispute_evaluator::do_apply( const escrow_dispute_operation& o )
{
   try
   {
      _db.get_account( o.from ); // Verify from account exists

      const auto& e = _db.get_escrow( o.from, o.escrow_id );
      FC_ASSERT( _db.head_block_time() < e.escrow_expiration, "Disputing the escrow must happen before expiration." );
      FC_ASSERT( e.to_approved && e.agent_approved, "The escrow must be approved by all parties before a dispute can be raised." );
      FC_ASSERT( !e.disputed, "The escrow is already under dispute." );
      FC_ASSERT( e.to == o.to, "Operation 'to' (${o}) does not match escrow 'to' (${e}).", ("o", o.to)("e", e.to) );
      FC_ASSERT( e.agent == o.agent, "Operation 'agent' (${a}) does not match escrow 'agent' (${e}).", ("o", o.agent)("e", e.agent) );

      _db.modify( e, [&]( escrow_object& esc )
      {
         esc.disputed = true;
      });
   }
   FC_CAPTURE_AND_RETHROW( (o) )
}

void escrow_release_evaluator::do_apply( const escrow_release_operation& o )
{
   try
   {
      _db.get_account(o.from); // Verify from account exists

      const auto& e = _db.get_escrow( o.from, o.escrow_id );
      FC_ASSERT( e.blurt_balance >= o.blurt_amount, "Release amount exceeds escrow balance. Amount: ${a}, Balance: ${b}", ("a", o.blurt_amount)("b", e.blurt_balance) );
      FC_ASSERT( e.to == o.to, "Operation 'to' (${o}) does not match escrow 'to' (${e}).", ("o", o.to)("e", e.to) );
      FC_ASSERT( e.agent == o.agent, "Operation 'agent' (${a}) does not match escrow 'agent' (${e}).", ("o", o.agent)("e", e.agent) );
      FC_ASSERT( o.receiver == e.from || o.receiver == e.to, "Funds must be released to 'from' (${f}) or 'to' (${t})", ("f", e.from)("t", e.to) );
      FC_ASSERT( e.to_approved && e.agent_approved, "Funds cannot be released prior to escrow approval." );

      // If there is a dispute regardless of expiration, the agent can release funds to either party
      if( e.disputed )
      {
         FC_ASSERT( o.who == e.agent, "Only 'agent' (${a}) can release funds in a disputed escrow.", ("a", e.agent) );
      }
      else
      {
         FC_ASSERT( o.who == e.from || o.who == e.to, "Only 'from' (${f}) and 'to' (${t}) can release funds from a non-disputed escrow", ("f", e.from)("t", e.to) );

         if( e.escrow_expiration > _db.head_block_time() )
         {
            // If there is no dispute and escrow has not expired, either party can release funds to the other.
            if( o.who == e.from )
            {
               FC_ASSERT( o.receiver == e.to, "Only 'from' (${f}) can release funds to 'to' (${t}).", ("f", e.from)("t", e.to) );
            }
            else if( o.who == e.to )
            {
               FC_ASSERT( o.receiver == e.from, "Only 'to' (${t}) can release funds to 'from' (${t}).", ("f", e.from)("t", e.to) );
            }
         }
      }
      // If escrow expires and there is no dispute, either party can release funds to either party.

      _db.adjust_balance( o.receiver, o.blurt_amount );
      _db.modify( e, [&]( escrow_object& esc )
      {
         esc.blurt_balance -= o.blurt_amount;
      });

      if( e.blurt_balance.amount == 0 )
      {
         _db.remove( e );
      }
   }
   FC_CAPTURE_AND_RETHROW( (o) )
}

void transfer_evaluator::do_apply( const transfer_operation& o )
{
   FC_ASSERT( o.amount.symbol == BLURT_SYMBOL, "Can only transfer BLURT_SYMBOL");

   _db.adjust_balance( o.from, -o.amount );
   _db.adjust_balance( o.to, o.amount );
}

void transfer_to_vesting_evaluator::do_apply( const transfer_to_vesting_operation& o )
{
   const auto& from_account = _db.get_account(o.from);
   const auto& to_account = o.to.size() ? _db.get_account(o.to) : from_account;

   FC_ASSERT( o.amount.symbol == BLURT_SYMBOL, "Can only transfer BLURT_SYMBOL");

   _db.adjust_balance( from_account, -o.amount );
   _db.create_vesting( to_account, o.amount );
}

void withdraw_vesting_evaluator::do_apply( const withdraw_vesting_operation& o )
{
   const auto& account = _db.get_account( o.account );

   FC_ASSERT( o.vesting_shares.amount >= 0, "Cannot withdraw negative VESTS. account: ${account}, vests:${vests}",
      ("account", o.account)("vests", o.vesting_shares) );
   FC_ASSERT( account.vesting_shares >= asset( 0, VESTS_SYMBOL ), "Account does not have sufficient Steem Power for withdraw." );
   FC_ASSERT( account.vesting_shares - account.delegated_vesting_shares >= o.vesting_shares, "Account does not have sufficient Steem Power for withdraw." );

   if( o.vesting_shares.amount == 0 )
   {
      FC_ASSERT( account.vesting_withdraw_rate.amount  != 0, "This operation would not change the vesting withdraw rate." );

      _db.modify( account, [&]( account_object& a ) {
         a.vesting_withdraw_rate = asset( 0, VESTS_SYMBOL );
         a.next_vesting_withdrawal = time_point_sec::maximum();
         a.to_withdraw = 0;
         a.withdrawn = 0;
      });
   }
   else
   {
      int vesting_withdraw_intervals = _db.has_hardfork( BLURT_HARDFORK_0_5 )
         ? BLURT_VESTING_WITHDRAW_INTERVALS_HF5
         : BLURT_VESTING_WITHDRAW_INTERVALS;

      _db.modify( account, [&]( account_object& a )
      {
         auto new_vesting_withdraw_rate = asset( o.vesting_shares.amount / vesting_withdraw_intervals, VESTS_SYMBOL );

         if( new_vesting_withdraw_rate.amount == 0 )
               new_vesting_withdraw_rate.amount = 1;

         if( new_vesting_withdraw_rate.amount * vesting_withdraw_intervals < o.vesting_shares.amount )
         {
            new_vesting_withdraw_rate.amount += 1;
         }

         FC_ASSERT( account.vesting_withdraw_rate  != new_vesting_withdraw_rate, "This operation would not change the vesting withdraw rate." );

         a.vesting_withdraw_rate = new_vesting_withdraw_rate;
         a.next_vesting_withdrawal = _db.head_block_time() + fc::seconds(BLURT_VESTING_WITHDRAW_INTERVAL_SECONDS);
         a.to_withdraw = o.vesting_shares.amount;
         a.withdrawn = 0;
      });
   }
}

void set_withdraw_vesting_route_evaluator::do_apply( const set_withdraw_vesting_route_operation& o )
{
   try
   {
   const auto& from_account = _db.get_account( o.from_account );
   const auto& to_account = _db.get_account( o.to_account );
   const auto& wd_idx = _db.get_index< withdraw_vesting_route_index >().indices().get< by_withdraw_route >();
   auto itr = wd_idx.find( boost::make_tuple( from_account.name, to_account.name ) );

   FC_ASSERT( o.to_account != BLURT_TREASURY_ACCOUNT,
         "Cannot withdraw vesting to ${s}", ("s", BLURT_TREASURY_ACCOUNT) );

   if( itr == wd_idx.end() )
   {
      FC_ASSERT( o.percent != 0, "Cannot create a 0% destination." );
      FC_ASSERT( from_account.withdraw_routes < BLURT_MAX_WITHDRAW_ROUTES, "Account already has the maximum number of routes." );

      _db.create< withdraw_vesting_route_object >( [&]( withdraw_vesting_route_object& wvdo )
      {
         wvdo.from_account = from_account.name;
         wvdo.to_account = to_account.name;
         wvdo.percent = o.percent;
         wvdo.auto_vest = o.auto_vest;
      });

      _db.modify( from_account, [&]( account_object& a )
      {
         a.withdraw_routes++;
      });
   }
   else if( o.percent == 0 )
   {
      _db.remove( *itr );

      _db.modify( from_account, [&]( account_object& a )
      {
         a.withdraw_routes--;
      });
   }
   else
   {
      _db.modify( *itr, [&]( withdraw_vesting_route_object& wvdo )
      {
         wvdo.from_account = from_account.name;
         wvdo.to_account = to_account.name;
         wvdo.percent = o.percent;
         wvdo.auto_vest = o.auto_vest;
      });
   }

   itr = wd_idx.upper_bound( boost::make_tuple( from_account.name, account_name_type() ) );
   uint16_t total_percent = 0;

   while( itr != wd_idx.end() && itr->from_account == from_account.name )
   {
      total_percent += itr->percent;
      ++itr;
   }

   FC_ASSERT( total_percent <= BLURT_100_PERCENT, "More than 100% of vesting withdrawals allocated to destinations." );
   }
   FC_CAPTURE_AND_RETHROW()
}

void account_witness_proxy_evaluator::do_apply( const account_witness_proxy_operation& o )
{
   const auto& account = _db.get_account( o.account );
   FC_ASSERT( account.proxy != o.proxy, "Proxy must change." );

   FC_ASSERT( account.can_vote, "Account has declined the ability to vote and cannot proxy votes." );

   /// remove all current votes
   std::array<share_type, BLURT_MAX_PROXY_RECURSION_DEPTH+1> delta;
   delta[0] = -account.vesting_shares.amount;
   for( int i = 0; i < BLURT_MAX_PROXY_RECURSION_DEPTH; ++i )
      delta[i+1] = -account.proxied_vsf_votes[i];
   _db.adjust_proxied_witness_votes( account, delta );

   if( o.proxy.size() ) {
      const auto& new_proxy = _db.get_account( o.proxy );
      flat_set<account_id_type> proxy_chain( { account.id, new_proxy.id } );
      proxy_chain.reserve( BLURT_MAX_PROXY_RECURSION_DEPTH + 1 );

      /// check for proxy loops and fail to update the proxy if it would create a loop
      auto cprox = &new_proxy;
      while( cprox->proxy.size() != 0 ) {
         const auto next_proxy = _db.get_account( cprox->proxy );
         FC_ASSERT( proxy_chain.insert( next_proxy.id ).second, "This proxy would create a proxy loop." );
         cprox = &next_proxy;
         FC_ASSERT( proxy_chain.size() <= BLURT_MAX_PROXY_RECURSION_DEPTH, "Proxy chain is too long." );
      }

      /// clear all individual vote records
      _db.clear_witness_votes( account );

      _db.modify( account, [&]( account_object& a ) {
         a.proxy = o.proxy;
      });

      /// add all new votes
      for( int i = 0; i <= BLURT_MAX_PROXY_RECURSION_DEPTH; ++i )
         delta[i] = -delta[i];
      _db.adjust_proxied_witness_votes( account, delta );
   } else { /// we are clearing the proxy which means we simply update the account
      _db.modify( account, [&]( account_object& a ) {
          a.proxy = o.proxy;
      });
   }
}


void account_witness_vote_evaluator::do_apply( const account_witness_vote_operation& o )
{
   const auto& voter = _db.get_account( o.account );
   FC_ASSERT( voter.proxy.size() == 0, "A proxy is currently set, please clear the proxy before voting for a witness." );

   if( o.approve )
      FC_ASSERT( voter.can_vote, "Account has declined its voting rights." );

   const auto& witness = _db.get_witness( o.witness );

   const auto& by_account_witness_idx = _db.get_index< witness_vote_index >().indices().get< by_account_witness >();
   auto itr = by_account_witness_idx.find( boost::make_tuple( voter.name, witness.owner ) );

   auto vote_weight = voter.witness_vote_weight();

   if (o.account == BLURT_REGENT_ACCOUNT) { // for regent
      const dynamic_global_property_object& dgpo = _db.get_dynamic_global_properties();
      vote_weight = dgpo.regent_vesting_shares.amount;
   }

   if( itr == by_account_witness_idx.end() ) {
      FC_ASSERT( o.approve, "Vote doesn't exist, user must indicate a desire to approve witness." );

      {
         FC_ASSERT( voter.witnesses_voted_for < BLURT_MAX_ACCOUNT_WITNESS_VOTES, "Account has voted for too many witnesses." ); // TODO: Remove after hardfork 2

         _db.create<witness_vote_object>( [&]( witness_vote_object& v ) {
             v.witness = witness.owner;
             v.account = voter.name;
         });

         _db.adjust_witness_vote( witness, vote_weight );
      }

      _db.modify( voter, [&]( account_object& a ) {
         a.witnesses_voted_for++;
      });

   } else {
      FC_ASSERT( !o.approve, "Vote currently exists, user must indicate a desire to reject witness." );

      _db.adjust_witness_vote( witness, -vote_weight );
      _db.modify( voter, [&]( account_object& a ) {
         a.witnesses_voted_for--;
      });
      _db.remove( *itr );
   }
}

void vote_evaluator::do_apply( const vote_operation& o )
{ try {
   const auto& comment = _db.get_comment( o.author, o.permlink );
   const auto& voter   = _db.get_account( o.voter );
   const auto& dgpo    = _db.get_dynamic_global_properties();

   FC_ASSERT( voter.can_vote, "Voter has declined their voting rights." );
   FC_ASSERT( o.weight >= 0, "Downvote is not allowed" ); /// TODO: move this to validate?

   if( o.weight > 0 ) FC_ASSERT( comment.allow_votes, "Votes are not allowed on the comment." );

   if( _db.calculate_discussion_payout_time( comment ) == fc::time_point_sec::maximum() )
   {
#ifndef CLEAR_VOTES
      const auto& comment_vote_idx = _db.get_index< comment_vote_index >().indices().get< by_comment_voter >();
      auto itr = comment_vote_idx.find( boost::make_tuple( comment.id, voter.id ) );

      if( itr == comment_vote_idx.end() )
         _db.create< comment_vote_object >( [&]( comment_vote_object& cvo )
         {
            cvo.voter = voter.id;
            cvo.comment = comment.id;
            cvo.vote_percent = o.weight;
            cvo.last_update = _db.head_block_time();
         });
      else
         _db.modify( *itr, [&]( comment_vote_object& cvo )
         {
            cvo.vote_percent = o.weight;
            cvo.last_update = _db.head_block_time();
         });
#endif
      return;
   }
   else
   {
      FC_ASSERT( _db.head_block_time() < comment.cashout_time, "Comment is actively being rewarded. Cannot vote on comment." );
   }

   const auto& comment_vote_idx = _db.get_index< comment_vote_index, by_comment_voter >();
   auto itr = comment_vote_idx.find( boost::make_tuple( comment.id, voter.id ) );

   // Lazily delete vote
   if( itr != comment_vote_idx.end() && itr->num_changes == -1 )
   {
      FC_ASSERT( false, "Cannot vote again on a comment after payout." );

      _db.remove( *itr );
      itr = comment_vote_idx.end();
   }

   auto now = _db.head_block_time();
   FC_ASSERT( ( now - voter.last_vote_time ).to_seconds() >= BLURT_MIN_VOTE_INTERVAL_SEC, "Can only vote once every 3 seconds." );

   _db.modify( voter, [&]( account_object& a )
   {
      util::update_manabar( _db.get_dynamic_global_properties(), a, true, true );
   });

   FC_ASSERT( voter.voting_manabar.current_mana >= 0, "Account does not have enough mana to vote." );

   int16_t abs_weight = abs( o.weight );
   uint128_t used_mana = ( uint128_t( voter.voting_manabar.current_mana ) * abs_weight * 60 * 60 * 24 ) / BLURT_100_PERCENT;
   int64_t max_vote_denom = dgpo.vote_power_reserve_rate * BLURT_VOTING_MANA_REGENERATION_SECONDS;
   FC_ASSERT( max_vote_denom > 0 );

   used_mana = ( used_mana + max_vote_denom - 1 ) / max_vote_denom;
   int64_t abs_rshares = used_mana.to_int64();
   if( !_db.has_hardfork(BLURT_HARDFORK_0_4) ) // dust threshold removed in HF 0.4.0
   {
      abs_rshares -= BLURT_VOTE_DUST_THRESHOLD;
   }
   abs_rshares = std::max( int64_t(0), abs_rshares );
   uint32_t cashout_delta = ( comment.cashout_time - _db.head_block_time() ).to_seconds();

   if( cashout_delta < BLURT_UPVOTE_LOCKOUT_SECONDS )
   {
      abs_rshares = (int64_t) ( ( uint128_t( abs_rshares ) * cashout_delta ) / BLURT_UPVOTE_LOCKOUT_SECONDS ).to_uint64();
   }

   if( itr == comment_vote_idx.end() )
   {
      FC_ASSERT( o.weight != 0, "Vote weight cannot be 0." );
      /// this is the rshares voting for or against the post

      int64_t rshares = o.weight < 0 ? -abs_rshares : abs_rshares;

      _db.modify( voter, [&]( account_object& a )
      {
         a.voting_manabar.use_mana( used_mana.to_int64() );
         a.last_vote_time = _db.head_block_time();
      });

      /// if the current net_rshares is less than 0, the post is getting 0 rewards so it is not factored into total rshares^2
//      fc::uint128_t old_rshares = std::max(comment.net_rshares.value, int64_t(0));
      const auto& root = _db.get( comment.root_comment );

      auto old_vote_rshares = comment.vote_rshares;

      _db.modify( comment, [&]( comment_object& c )
      {
         c.net_rshares += rshares;
         c.abs_rshares += abs_rshares;
         if( rshares > 0 )
            c.vote_rshares += rshares;
         if( rshares > 0 )
            c.net_votes++;
         else if( !_db.has_hardfork(BLURT_HARDFORK_0_4) || (_db.has_hardfork(BLURT_HARDFORK_0_4) && rshares < 0) )
            c.net_votes--;
      });

      _db.modify( root, [&]( comment_object& c )
      {
         c.children_abs_rshares += abs_rshares;
      });

//      fc::uint128_t new_rshares = std::max( comment.net_rshares.value, int64_t(0) );
//
//      /// calculate rshares2 value
//      new_rshares = util::evaluate_reward_curve( new_rshares );
//      old_rshares = util::evaluate_reward_curve( old_rshares );

      uint64_t max_vote_weight = 0;

      /** this verifies uniqueness of voter
       *
       *  cv.weight / c.total_vote_weight ==> % of rshares increase that is accounted for by the vote
       *
       *  W(R) = B * R / ( R + 2S )
       *  W(R) is bounded above by B. B is fixed at 2^64 - 1, so all weights fit in a 64 bit integer.
       *
       *  The equation for an individual vote is:
       *    W(R_N) - W(R_N-1), which is the delta increase of proportional weight
       *
       *  c.total_vote_weight =
       *    W(R_1) - W(R_0) +
       *    W(R_2) - W(R_1) + ...
       *    W(R_N) - W(R_N-1) = W(R_N) - W(R_0)
       *
       *  Since W(R_0) = 0, c.total_vote_weight is also bounded above by B and will always fit in a 64 bit integer.
       *
      **/
      _db.create<comment_vote_object>( [&]( comment_vote_object& cv )
      {
         cv.voter   = voter.id;
         cv.comment = comment.id;
         cv.rshares = rshares;
         cv.vote_percent = o.weight;
         cv.last_update = _db.head_block_time();

         bool curation_reward_eligible = rshares > 0 && (comment.last_payout == fc::time_point_sec()) && comment.allow_curation_rewards;

         if( curation_reward_eligible )
         {
            curation_reward_eligible = _db.get_curation_rewards_percent( comment ) > 0;
         }

         if( curation_reward_eligible )
         {
            // cv.weight = W(R_1) - W(R_0)
            const auto& reward_fund = _db.get_reward_fund( comment );
            auto curve = reward_fund.curation_reward_curve;
            auto content_constant = reward_fund.content_constant;
            if( _db.has_hardfork(BLURT_HARDFORK_0_4) )
            {
               // in HF 0.3.0, this value changed but we still want old value for the curation curve
               content_constant = BLURT_CONTENT_CONSTANT_HF21;
            }
            uint64_t old_weight = util::evaluate_reward_curve( old_vote_rshares.value, curve, content_constant ).to_uint64();
            uint64_t new_weight = util::evaluate_reward_curve( comment.vote_rshares.value, curve, content_constant ).to_uint64();

            if( old_weight >= new_weight ) // old_weight > new_weight should never happen
            {
               cv.weight = 0;
            }
            else
            {
               cv.weight = new_weight - old_weight;

               max_vote_weight = cv.weight;

               /// discount weight by time
               uint128_t w(max_vote_weight);
               uint64_t delta_t = std::min( uint64_t((cv.last_update - comment.created).to_seconds()), uint64_t( dgpo.reverse_auction_seconds ) );

               w *= delta_t;
               w /= dgpo.reverse_auction_seconds;
               cv.weight = w.to_uint64();
            }
         }
         else
         {
            cv.weight = 0;
         }
      });

      if( max_vote_weight ) // Optimization
      {
         _db.modify( comment, [&]( comment_object& c )
         {
            c.total_vote_weight += max_vote_weight;
         });
      }
   }
   else
   {
      FC_ASSERT( itr->num_changes < BLURT_MAX_VOTE_CHANGES, "Voter has used the maximum number of vote changes on this comment." );
      FC_ASSERT( itr->vote_percent != o.weight, "Your current vote on this comment is identical to this vote." );

      int64_t rshares = o.weight < 0 ? -abs_rshares : abs_rshares;

      _db.modify( voter, [&]( account_object& a )
      {
         a.voting_manabar.use_mana( used_mana.to_int64() );
         a.last_vote_time = _db.head_block_time();
      });

      /// if the current net_rshares is less than 0, the post is getting 0 rewards so it is not factored into total rshares^2
//      fc::uint128_t old_rshares = std::max( comment.net_rshares.value, int64_t( 0 ) );
      const auto& root = _db.get( comment.root_comment );

      _db.modify( comment, [&]( comment_object& c )
      {
         c.net_rshares -= itr->rshares;
         c.net_rshares += rshares;
         c.abs_rshares += abs_rshares;

         /// TODO: figure out how to handle remove a vote (rshares == 0 )
         if( rshares > 0 && itr->rshares < 0 )
            c.net_votes += 2;
         else if( rshares > 0 && itr->rshares == 0 )
            c.net_votes += 1;
         else if( rshares == 0 && itr->rshares < 0 )
            c.net_votes += 1;
         else if( rshares == 0 && itr->rshares > 0 )
            c.net_votes -= 1;
         else if( rshares < 0 && itr->rshares == 0 )
            c.net_votes -= 1;
         else if( rshares < 0 && itr->rshares > 0 )
            c.net_votes -= 2;
      });

      _db.modify( root, [&]( comment_object& c )
      {
         c.children_abs_rshares += abs_rshares;
      });

//      fc::uint128_t new_rshares = std::max( comment.net_rshares.value, int64_t(0));
//
//      /// calculate rshares2 value
//      new_rshares = util::evaluate_reward_curve( new_rshares );
//      old_rshares = util::evaluate_reward_curve( old_rshares );

      _db.modify( comment, [&]( comment_object& c )
      {
         c.total_vote_weight -= itr->weight;
      });

      _db.modify( *itr, [&]( comment_vote_object& cv )
      {
         cv.rshares = rshares;
         cv.vote_percent = o.weight;
         cv.last_update = _db.head_block_time();
         cv.weight = 0;
         cv.num_changes += 1;
      });
   }
} FC_CAPTURE_AND_RETHROW( (o) ) }

void custom_evaluator::do_apply( const custom_operation& o )
{
   database& d = db();
   if( d.is_producing() )
      FC_ASSERT( o.data.size() <= BLURT_CUSTOM_OP_DATA_MAX_LENGTH,
         "Operation data must be less than ${bytes} bytes.", ("bytes", BLURT_CUSTOM_OP_DATA_MAX_LENGTH) );

   FC_ASSERT( o.required_auths.size() <= BLURT_MAX_AUTHORITY_MEMBERSHIP,
         "Authority membership exceeded. Max: ${max} Current: ${n}", ("max", BLURT_MAX_AUTHORITY_MEMBERSHIP)("n", o.required_auths.size()) );
}

void custom_json_evaluator::do_apply( const custom_json_operation& o )
{
   database& d = db();

   if( d.is_producing() )
      FC_ASSERT( o.json.length() <= BLURT_CUSTOM_OP_DATA_MAX_LENGTH,
         "Operation JSON must be less than ${bytes} bytes.", ("bytes", BLURT_CUSTOM_OP_DATA_MAX_LENGTH) );

   {
      size_t num_auths = o.required_auths.size() + o.required_posting_auths.size();
      FC_ASSERT( num_auths <= BLURT_MAX_AUTHORITY_MEMBERSHIP,
         "Authority membership exceeded. Max: ${max} Current: ${n}", ("max", BLURT_MAX_AUTHORITY_MEMBERSHIP)("n", num_auths) );
   }

   std::shared_ptr< custom_operation_interpreter > eval = d.get_custom_json_evaluator( o.id );
   if( !eval )
      return;

   try
   {
      eval->apply( o );
   }
   catch( const fc::exception& e )
   {
      if( d.is_producing() )
         throw e;
   }
   catch(...)
   {
      elog( "Unexpected exception applying custom json evaluator." );
   }
}


void custom_binary_evaluator::do_apply( const custom_binary_operation& o )
{
   database& d = db();
   if( d.is_producing() )
   {
      FC_ASSERT( o.data.size() <= BLURT_CUSTOM_OP_DATA_MAX_LENGTH,
         "Operation data must be less than ${bytes} bytes.", ("bytes", BLURT_CUSTOM_OP_DATA_MAX_LENGTH) );
      FC_ASSERT( false, "custom_binary_operation is deprecated" );
   }

   {
      size_t num_auths = o.required_owner_auths.size() + o.required_active_auths.size() + o.required_posting_auths.size();
      for( const auto& auth : o.required_auths )
      {
         num_auths += auth.key_auths.size() + auth.account_auths.size();
      }

      FC_ASSERT( num_auths <= BLURT_MAX_AUTHORITY_MEMBERSHIP,
         "Authority membership exceeded. Max: ${max} Current: ${n}", ("max", BLURT_MAX_AUTHORITY_MEMBERSHIP)("n", num_auths) );
   }

   std::shared_ptr< custom_operation_interpreter > eval = d.get_custom_json_evaluator( o.id );
   if( !eval )
      return;

   try
   {
      eval->apply( o );
   }
   catch( const fc::exception& e )
   {
      if( d.is_producing() )
         throw e;
   }
   catch(...)
   {
      elog( "Unexpected exception applying custom json evaluator." );
   }
}

void claim_account_evaluator::do_apply( const claim_account_operation& o )
{
   if (_db.has_hardfork(BLURT_HARDFORK_0_2)) FC_ASSERT(false, "This operation is disable since hard fork 2.");

   const auto& creator = _db.get_account( o.creator );
   const auto& wso = _db.get_witness_schedule_object();

   FC_ASSERT( creator.balance >= o.fee, "Insufficient balance to create account.", ( "creator.balance", creator.balance )( "required", o.fee ) );

   if( o.fee.amount == 0 )
   {
      const auto& gpo = _db.get_dynamic_global_properties();

      // This block is a little weird. We want to enforce that only elected witnesses can include the transaction, but
      // we do not want to prevent the transaction from propogating on the p2p network. Because we do not know what type of
      // witness will have produced the including block when the tx is broadcast, we need to disregard this assertion when the tx
      // is propogating, but require it when applying the block.
      if( !_db.is_pending_tx() )
      {
         const auto& current_witness = _db.get_witness( gpo.current_witness );
         FC_ASSERT( current_witness.schedule == witness_object::elected, "Subsidized accounts can only be claimed by elected witnesses. current_witness:${w} witness_type:${t}",
            ("w",current_witness.owner)("t",current_witness.schedule) );

         FC_ASSERT( current_witness.available_witness_account_subsidies >= BLURT_ACCOUNT_SUBSIDY_PRECISION, "Witness ${w} does not have enough subsidized accounts to claim",
            ("w", current_witness.owner) );

         _db.modify( current_witness, [&]( witness_object& w )
         {
            w.available_witness_account_subsidies -= BLURT_ACCOUNT_SUBSIDY_PRECISION;
         });
      }

      FC_ASSERT( gpo.available_account_subsidies >= BLURT_ACCOUNT_SUBSIDY_PRECISION, "There are not enough subsidized accounts to claim" );

      _db.modify( gpo, [&]( dynamic_global_property_object& gpo )
      {
         gpo.available_account_subsidies -= BLURT_ACCOUNT_SUBSIDY_PRECISION;
      });
   }
   else
   {
      FC_ASSERT( o.fee == wso.median_props.account_creation_fee,
         "Cannot pay more than account creation fee. paid: ${p} fee: ${f}",
         ("p", o.fee.amount.value)
         ("f", wso.median_props.account_creation_fee) );
   }

   _db.adjust_balance( _db.get_account( BLURT_NULL_ACCOUNT ), o.fee );

   _db.modify( creator, [&]( account_object& a )
   {
      a.balance -= o.fee;
      a.pending_claimed_accounts++;
   });
}

void create_claimed_account_evaluator::do_apply( const create_claimed_account_operation& o )
{
   if (_db.has_hardfork(BLURT_HARDFORK_0_2)) FC_ASSERT(false, "This operation is disable since hard fork 2.");

   const auto& creator = _db.get_account( o.creator );
   const auto& props = _db.get_dynamic_global_properties();

   FC_ASSERT( creator.pending_claimed_accounts > 0, "${creator} has no claimed accounts to create", ( "creator", o.creator ) );

   verify_authority_accounts_exist( _db, o.owner, o.new_account_name, authority::owner );
   verify_authority_accounts_exist( _db, o.active, o.new_account_name, authority::active );
   verify_authority_accounts_exist( _db, o.posting, o.new_account_name, authority::posting );

   _db.modify( creator, [&]( account_object& a )
   {
      a.pending_claimed_accounts--;
   });

   const auto& new_account = _db.create< account_object >( [&]( account_object& acc )
   {
      initialize_account_object( acc, o.new_account_name, o.memo_key, props, false /*mined*/, o.creator, _db.get_hardfork() );
   });

#ifndef IS_LOW_MEM
   _db.create< account_metadata_object >( [&]( account_metadata_object& meta )
   {
      meta.account = new_account.id;
      from_string( meta.json_metadata, o.json_metadata );
   });
#else
   FC_UNUSED( new_account );
#endif

   _db.create< account_authority_object >( [&]( account_authority_object& auth )
   {
      auth.account = o.new_account_name;
      auth.owner = o.owner;
      auth.active = o.active;
      auth.posting = o.posting;
      auth.last_owner_update = fc::time_point_sec::min();
   });

}

void request_account_recovery_evaluator::do_apply( const request_account_recovery_operation& o )
{
   const auto& account_to_recover = _db.get_account( o.account_to_recover );

   if ( account_to_recover.recovery_account.length() )   // Make sure recovery matches expected recovery account
   {
      FC_ASSERT( account_to_recover.recovery_account == o.recovery_account, "Cannot recover an account that does not have you as there recovery partner." );
      if( o.recovery_account == BLURT_TEMP_ACCOUNT )
         wlog( "Recovery by temp account" );
   }
   else                                                  // Empty string recovery account defaults to top witness
      FC_ASSERT( _db.get_index< witness_index >().indices().get< by_vote_name >().begin()->owner == o.recovery_account, "Top witness must recover an account with no recovery partner." );

   const auto& recovery_request_idx = _db.get_index< account_recovery_request_index >().indices().get< by_account >();
   auto request = recovery_request_idx.find( o.account_to_recover );

   if( request == recovery_request_idx.end() ) // New Request
   {
      FC_ASSERT( !o.new_owner_authority.is_impossible(), "Cannot recover using an impossible authority." );
      FC_ASSERT( o.new_owner_authority.weight_threshold, "Cannot recover using an open authority." );

      validate_auth_size( o.new_owner_authority );


      // Check accounts in the new authority exist
      for( auto& a : o.new_owner_authority.account_auths )
      {
         _db.get_account( a.first );
      }

      _db.create< account_recovery_request_object >( [&]( account_recovery_request_object& req )
      {
         req.account_to_recover = o.account_to_recover;
         req.new_owner_authority = o.new_owner_authority;
         req.expires = _db.head_block_time() + BLURT_ACCOUNT_RECOVERY_REQUEST_EXPIRATION_PERIOD;
      });
   }
   else if( o.new_owner_authority.weight_threshold == 0 ) // Cancel Request if authority is open
   {
      _db.remove( *request );
   }
   else // Change Request
   {
      FC_ASSERT( !o.new_owner_authority.is_impossible(), "Cannot recover using an impossible authority." );

      // Check accounts in the new authority exist
      for( auto& a : o.new_owner_authority.account_auths )
      {
         _db.get_account( a.first );
      }

      _db.modify( *request, [&]( account_recovery_request_object& req )
      {
         req.new_owner_authority = o.new_owner_authority;
         req.expires = _db.head_block_time() + BLURT_ACCOUNT_RECOVERY_REQUEST_EXPIRATION_PERIOD;
      });
   }
}

void recover_account_evaluator::do_apply( const recover_account_operation& o )
{
   const auto& account = _db.get_account( o.account_to_recover );

   FC_ASSERT( _db.head_block_time() - account.last_account_recovery > BLURT_OWNER_UPDATE_LIMIT, "Owner authority can only be updated once an hour." );

   const auto& recovery_request_idx = _db.get_index< account_recovery_request_index >().indices().get< by_account >();
   auto request = recovery_request_idx.find( o.account_to_recover );

   FC_ASSERT( request != recovery_request_idx.end(), "There are no active recovery requests for this account." );
   FC_ASSERT( request->new_owner_authority == o.new_owner_authority, "New owner authority does not match recovery request." );

   const auto& recent_auth_idx = _db.get_index< owner_authority_history_index >().indices().get< by_account >();
   auto hist = recent_auth_idx.lower_bound( o.account_to_recover );
   bool found = false;

   while( hist != recent_auth_idx.end() && hist->account == o.account_to_recover && !found )
   {
      found = hist->previous_owner_authority == o.recent_owner_authority;
      if( found ) break;
      ++hist;
   }

   FC_ASSERT( found, "Recent authority not found in authority history." );

   _db.remove( *request ); // Remove first, update_owner_authority may invalidate iterator
   _db.update_owner_authority( account, o.new_owner_authority );
   _db.modify( account, [&]( account_object& a )
   {
      a.last_account_recovery = _db.head_block_time();
   });
}

void change_recovery_account_evaluator::do_apply( const change_recovery_account_operation& o )
{
   _db.get_account( o.new_recovery_account ); // Simply validate account exists
   const auto& account_to_recover = _db.get_account( o.account_to_recover );

   const auto& change_recovery_idx = _db.get_index< change_recovery_account_request_index >().indices().get< by_account >();
   auto request = change_recovery_idx.find( o.account_to_recover );

   if( request == change_recovery_idx.end() ) // New request
   {
      _db.create< change_recovery_account_request_object >( [&]( change_recovery_account_request_object& req )
      {
         req.account_to_recover = o.account_to_recover;
         req.recovery_account = o.new_recovery_account;
         req.effective_on = _db.head_block_time() + BLURT_OWNER_AUTH_RECOVERY_PERIOD;
      });
   }
   else if( account_to_recover.recovery_account != o.new_recovery_account ) // Change existing request
   {
      _db.modify( *request, [&]( change_recovery_account_request_object& req )
      {
         req.recovery_account = o.new_recovery_account;
         req.effective_on = _db.head_block_time() + BLURT_OWNER_AUTH_RECOVERY_PERIOD;
      });
   }
   else // Request exists and changing back to current recovery account
   {
      _db.remove( *request );
   }
}

void transfer_to_savings_evaluator::do_apply( const transfer_to_savings_operation& op )
{
   const auto& from = _db.get_account( op.from );
   const auto& to   = _db.get_account(op.to);

   FC_ASSERT( op.to != BLURT_TREASURY_ACCOUNT,
         "Cannot transfer savings to ${s}", ("s", BLURT_TREASURY_ACCOUNT) );

   _db.adjust_balance( from, -op.amount );
   _db.adjust_savings_balance( to, op.amount );
}

void transfer_from_savings_evaluator::do_apply( const transfer_from_savings_operation& op )
{
   const auto& from = _db.get_account( op.from );
   _db.get_account(op.to); // Verify to account exists

   FC_ASSERT( from.savings_withdraw_requests < BLURT_SAVINGS_WITHDRAW_REQUEST_LIMIT, "Account has reached limit for pending withdraw requests." );
   FC_ASSERT( op.amount.symbol == BLURT_SYMBOL, "Can only transfer BLURT_SYMBOL");

   FC_ASSERT( _db.get_savings_balance( from, op.amount.symbol ) >= op.amount );
   _db.adjust_savings_balance( from, -op.amount );
   _db.create<savings_withdraw_object>( [&]( savings_withdraw_object& s ) {
      s.from   = op.from;
      s.to     = op.to;
      s.amount = op.amount;
#ifndef IS_LOW_MEM
      from_string( s.memo, op.memo );
#endif
      s.request_id = op.request_id;
      s.complete = _db.head_block_time() + BLURT_SAVINGS_WITHDRAW_TIME;
   });

   _db.modify( from, [&]( account_object& a )
   {
      a.savings_withdraw_requests++;
   });
}

void cancel_transfer_from_savings_evaluator::do_apply( const cancel_transfer_from_savings_operation& op )
{
   const auto& swo = _db.get_savings_withdraw( op.from, op.request_id );
   _db.adjust_savings_balance( _db.get_account( swo.from ), swo.amount );
   _db.remove( swo );

   const auto& from = _db.get_account( op.from );
   _db.modify( from, [&]( account_object& a )
   {
      a.savings_withdraw_requests--;
   });
}

void decline_voting_rights_evaluator::do_apply( const decline_voting_rights_operation& o )
{
   const auto& account = _db.get_account( o.account );
   const auto& request_idx = _db.get_index< decline_voting_rights_request_index >().indices().get< by_account >();
   auto itr = request_idx.find( account.name );

   if( o.decline )
   {
      FC_ASSERT( itr == request_idx.end(), "Cannot create new request because one already exists." );

      _db.create< decline_voting_rights_request_object >( [&]( decline_voting_rights_request_object& req )
      {
         req.account = account.name;
         req.effective_date = _db.head_block_time() + BLURT_OWNER_AUTH_RECOVERY_PERIOD;
      });
   }
   else
   {
      FC_ASSERT( itr != request_idx.end(), "Cannot cancel the request because it does not exist." );
      _db.remove( *itr );
   }
}

void reset_account_evaluator::do_apply( const reset_account_operation& op )
{
   FC_ASSERT( false, "Reset Account Operation is currently disabled." );
/*
   const auto& acnt = _db.get_account( op.account_to_reset );
   auto band = _db.find< account_bandwidth_object, by_account_bandwidth_type >( boost::make_tuple( op.account_to_reset, bandwidth_type::old_forum ) );
   if( band != nullptr )
      FC_ASSERT( ( _db.head_block_time() - band->last_bandwidth_update ) > fc::days(60), "Account must be inactive for 60 days to be eligible for reset" );
   FC_ASSERT( acnt.reset_account == op.reset_account, "Reset account does not match reset account on account." );

   _db.update_owner_authority( acnt, op.new_owner_authority );
*/
}

void set_reset_account_evaluator::do_apply( const set_reset_account_operation& op )
{
   FC_ASSERT( false, "Set Reset Account Operation is currently disabled." );
/*
   const auto& acnt = _db.get_account( op.account );
   _db.get_account( op.reset_account );

   FC_ASSERT( acnt.reset_account == op.current_reset_account, "Current reset account does not match reset account on account." );
   FC_ASSERT( acnt.reset_account != op.reset_account, "Reset account must change" );

   _db.modify( acnt, [&]( account_object& a )
   {
       a.reset_account = op.reset_account;
   });
*/
}

void claim_reward_balance_evaluator::do_apply( const claim_reward_balance_operation& op )
{
   const auto& acnt = _db.get_account( op.account );

   FC_ASSERT( op.reward_blurt <= acnt.reward_blurt_balance, "Cannot claim that much BLURT. Claim: ${c} Actual: ${a}",
      ("c", op.reward_blurt)("a", acnt.reward_blurt_balance) );
   FC_ASSERT( op.reward_vests <= acnt.reward_vesting_balance, "Cannot claim that much VESTS. Claim: ${c} Actual: ${a}",
      ("c", op.reward_vests)("a", acnt.reward_vesting_balance) );

   asset reward_vesting_blurt_to_move = asset( 0, BLURT_SYMBOL );
   if( op.reward_vests == acnt.reward_vesting_balance )
      reward_vesting_blurt_to_move = acnt.reward_vesting_blurt;
   else
      reward_vesting_blurt_to_move = asset( ( ( uint128_t( op.reward_vests.amount.value ) * uint128_t( acnt.reward_vesting_blurt.amount.value ) )
         / uint128_t( acnt.reward_vesting_balance.amount.value ) ).to_uint64(), BLURT_SYMBOL );

   _db.adjust_reward_balance( acnt, -op.reward_blurt );
   _db.adjust_balance( acnt, op.reward_blurt );

   _db.modify( acnt, [&]( account_object& a )
   {
      util::update_manabar( _db.get_dynamic_global_properties(), a, true, true, op.reward_vests.amount.value );

      a.vesting_shares += op.reward_vests;
      a.reward_vesting_balance -= op.reward_vests;
      a.reward_vesting_blurt -= reward_vesting_blurt_to_move;
   });

   _db.modify( _db.get_dynamic_global_properties(), [&]( dynamic_global_property_object& gpo )
   {
      gpo.total_vesting_shares += op.reward_vests;
      gpo.total_vesting_fund_blurt += reward_vesting_blurt_to_move;

      gpo.pending_rewarded_vesting_shares -= op.reward_vests;
      gpo.pending_rewarded_vesting_blurt -= reward_vesting_blurt_to_move;
   });

   _db.adjust_proxied_witness_votes( acnt, op.reward_vests.amount );
}

void delegate_vesting_shares_evaluator::do_apply( const delegate_vesting_shares_operation& op )
{

   const auto& delegator = _db.get_account( op.delegator );
   const auto& delegatee = _db.get_account( op.delegatee );
   auto delegation = _db.find< vesting_delegation_object, by_delegation >( boost::make_tuple( op.delegator, op.delegatee ) );

   const auto& gpo = _db.get_dynamic_global_properties();

   asset available_shares;

   {
      auto max_mana = util::get_effective_vesting_shares( delegator );

      _db.modify( delegator, [&]( account_object& a )
      {
         util::update_manabar( gpo, a, true, true );
      });

      available_shares = asset( delegator.voting_manabar.current_mana, VESTS_SYMBOL );

      // Assume delegated VESTS are used first when consuming mana. You cannot delegate received vesting shares
      available_shares.amount = std::min( available_shares.amount, max_mana - delegator.received_vesting_shares.amount );

      if( delegator.next_vesting_withdrawal < fc::time_point_sec::maximum()
         && delegator.to_withdraw - delegator.withdrawn > delegator.vesting_withdraw_rate.amount )
      {
         /*
         current voting mana does not include the current week's power down:

         std::min(
            account.vesting_withdraw_rate.amount.value,           // Weekly amount
            account.to_withdraw.value - account.withdrawn.value   // Or remainder
            );

         But an account cannot delegate **any** VESTS that they are powering down.
         The remaining withdrawal needs to be added in but then the current week is double counted.
         */

         auto weekly_withdraw = asset( std::min(
            delegator.vesting_withdraw_rate.amount.value,           // Weekly amount
            delegator.to_withdraw.value - delegator.withdrawn.value   // Or remainder
            ), VESTS_SYMBOL );

         available_shares += weekly_withdraw - asset( delegator.to_withdraw - delegator.withdrawn, VESTS_SYMBOL );
      }
   }

   const auto& wso = _db.get_witness_schedule_object();

   // HF 20 increase fee meaning by 30x, reduce these thresholds to compensate.
   auto min_delegation = asset( wso.median_props.account_creation_fee.amount / 3, BLURT_SYMBOL ) * gpo.get_vesting_share_price();
   auto min_update = asset( wso.median_props.account_creation_fee.amount / 30, BLURT_SYMBOL ) * gpo.get_vesting_share_price();

   // If delegation doesn't exist, create it
   if( delegation == nullptr )
   {
      FC_ASSERT( available_shares >= op.vesting_shares, "Account ${acc} does not have enough mana to delegate. required: ${r} available: ${a}",
         ("acc", op.delegator)("r", op.vesting_shares)("a", available_shares) );
      FC_ASSERT( op.vesting_shares >= min_delegation, "Account must delegate a minimum of ${v}", ("v", min_delegation) );

      _db.create< vesting_delegation_object >( [&]( vesting_delegation_object& obj )
      {
         obj.delegator = op.delegator;
         obj.delegatee = op.delegatee;
         obj.vesting_shares = op.vesting_shares;
         obj.min_delegation_time = _db.head_block_time();
      });

      _db.modify( delegator, [&]( account_object& a )
      {
         a.delegated_vesting_shares += op.vesting_shares;
         a.voting_manabar.use_mana( op.vesting_shares.amount.value );
      });

      _db.modify( delegatee, [&]( account_object& a )
      {
         util::update_manabar( gpo, a, true, true, op.vesting_shares.amount.value );

         a.received_vesting_shares += op.vesting_shares;
      });
   }
   // Else if the delegation is increasing
   else if( op.vesting_shares >= delegation->vesting_shares )
   {
      auto delta = op.vesting_shares - delegation->vesting_shares;

      FC_ASSERT( delta >= min_update, "Steem Power increase is not enough of a difference. min_update: ${min}", ("min", min_update) );
      FC_ASSERT( available_shares >= delta, "Account ${acc} does not have enough mana to delegate. required: ${r} available: ${a}",
         ("acc", op.delegator)("r", delta)("a", available_shares) );

      _db.modify( delegator, [&]( account_object& a )
      {
         a.delegated_vesting_shares += delta;
         a.voting_manabar.use_mana( delta.amount.value );
      });

      _db.modify( delegatee, [&]( account_object& a )
      {
         util::update_manabar( gpo, a, true, true, delta.amount.value );

         a.received_vesting_shares += delta;
      });

      _db.modify( *delegation, [&]( vesting_delegation_object& obj )
      {
         obj.vesting_shares = op.vesting_shares;
      });
   }
   // Else the delegation is decreasing
   else /* delegation->vesting_shares > op.vesting_shares */
   {
      auto delta = delegation->vesting_shares - op.vesting_shares;

      if( op.vesting_shares.amount > 0 )
      {
         FC_ASSERT( delta >= min_update, "Steem Power decrease is not enough of a difference. min_update: ${min}", ("min", min_update) );
         FC_ASSERT( op.vesting_shares >= min_delegation, "Delegation must be removed or leave minimum delegation amount of ${v}", ("v", min_delegation) );
      }
      else
      {
         FC_ASSERT( delegation->vesting_shares.amount > 0, "Delegation would set vesting_shares to zero, but it is already zero");
      }

      _db.create< vesting_delegation_expiration_object >( [&]( vesting_delegation_expiration_object& obj )
      {
         obj.delegator = op.delegator;
         obj.vesting_shares = delta;
         obj.expiration = std::max( _db.head_block_time() + gpo.delegation_return_period, delegation->min_delegation_time );
      });

      _db.modify( delegatee, [&]( account_object& a )
      {
         util::update_manabar( gpo, a, true, true );

         a.received_vesting_shares -= delta;
         a.voting_manabar.use_mana( delta.amount.value );

         if( a.voting_manabar.current_mana < 0 )
         {
            a.voting_manabar.current_mana = 0;
         }
      });

      if( op.vesting_shares.amount > 0 )
      {
         _db.modify( *delegation, [&]( vesting_delegation_object& obj )
         {
            obj.vesting_shares = op.vesting_shares;
         });
      }
      else
      {
         _db.remove( *delegation );
      }
   }
}

} } // blurt::chain
