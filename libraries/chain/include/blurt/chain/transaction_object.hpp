#pragma once
#include <blurt/chain/steem_fwd.hpp>

#include <blurt/protocol/transaction.hpp>

#include <blurt/chain/buffer_type.hpp>
#include <blurt/chain/steem_object_types.hpp>

//#include <boost/multi_index/hashed_index.hpp>

namespace blurt { namespace chain {

   using blurt::protocol::signed_transaction;
   using chainbase::t_vector;

   /**
    * The purpose of this object is to enable the detection of duplicate transactions. When a transaction is included
    * in a block a transaction_object is added. At the end of block processing all transaction_objects that have
    * expired can be removed from the index.
    */
   class transaction_object : public object< transaction_object_type, transaction_object >
   {
      BLURT_STD_ALLOCATOR_CONSTRUCTOR( transaction_object )

      public:
         template< typename Constructor, typename Allocator >
         transaction_object( Constructor&& c, allocator< Allocator > a )
            : packed_trx( a )
         {
            c( *this );
         }

         id_type              id;

         typedef buffer_type t_packed_trx;

         t_packed_trx         packed_trx;
         transaction_id_type  trx_id;
         time_point_sec       expiration;
   };

   struct by_expiration;
   struct by_trx_id;
   typedef multi_index_container<
      transaction_object,
      indexed_by<
         ordered_unique< tag< by_id >, member< transaction_object, transaction_object_id_type, &transaction_object::id > >,
         ordered_unique< tag< by_trx_id >, member< transaction_object, transaction_id_type, &transaction_object::trx_id > >,
         ordered_unique< tag< by_expiration >,
            composite_key< transaction_object,
               member<transaction_object, time_point_sec, &transaction_object::expiration >,
               member<transaction_object, transaction_object::id_type, &transaction_object::id >
            >
         >
      >,
      allocator< transaction_object >
   > transaction_index;

} } // blurt::chain

FC_REFLECT( blurt::chain::transaction_object, (id)(packed_trx)(trx_id)(expiration) )
CHAINBASE_SET_INDEX_TYPE( blurt::chain::transaction_object, blurt::chain::transaction_index )

namespace helpers
{
   template <>
   class index_statistic_provider<blurt::chain::transaction_index>
   {
   public:
      typedef blurt::chain::transaction_index IndexType;
      typedef typename blurt::chain::transaction_object::t_packed_trx t_packed_trx;

      index_statistic_info gather_statistics(const IndexType& index, bool onlyStaticInfo) const
      {
         index_statistic_info info;
         gather_index_static_data(index, &info);

         if(onlyStaticInfo == false)
         {
            for(const auto& o : index)
            {
               info._item_additional_allocation += o.packed_trx.capacity()*sizeof(t_packed_trx::value_type);
            }
         }

         return info;
      }
   };

} /// namespace helpers
