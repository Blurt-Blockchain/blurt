#pragma once
#include <blurt/protocol/base.hpp>

namespace blurt { namespace protocol {

   struct fee_info
   {
      fee_info() {}
      fee_info( int64_t ff, int64_t bf ):operation_flat_fee( ff ), bandwidth_kbytes_fee( bf ) {}

      int64_t operation_flat_fee = 0;
      int64_t bandwidth_kbytes_fee = 0;
   };

   FC_TODO( "Remove when automated actions are created" )
   typedef static_variant<
      void_t,
      version,                 // Normal witness version reporting, for diagnostics and voting
      hardfork_version_vote,   // Voting for the next hardfork to trigger
      fee_info
      >                                block_header_extensions;

   typedef flat_set<block_header_extensions > block_header_extensions_type;

   struct block_header
   {
      digest_type                   digest()const;
      block_id_type                 previous;
      uint32_t                      block_num()const { return num_from_id(previous) + 1; }
      fc::time_point_sec            timestamp;
      string                        witness;
      checksum_type                 transaction_merkle_root;
      block_header_extensions_type  extensions;

      static uint32_t num_from_id(const block_id_type& id);
   };

   struct signed_block_header : public block_header
   {
      block_id_type              id()const;
      fc::ecc::public_key        signee( fc::ecc::canonical_signature_type canon_type = fc::ecc::bip_0062 )const;
      void                       sign( const fc::ecc::private_key& signer, fc::ecc::canonical_signature_type canon_type = fc::ecc::bip_0062 );
      bool                       validate_signee( const fc::ecc::public_key& expected_signee, fc::ecc::canonical_signature_type canon_type = fc::ecc::bip_0062 )const;

      signature_type             witness_signature;
   };


} } // blurt::protocol

FC_REFLECT( blurt::protocol::fee_info, (operation_flat_fee)(bandwidth_kbytes_fee) )
FC_REFLECT_TYPENAME( blurt::protocol::block_header_extensions )

FC_REFLECT( blurt::protocol::block_header, (previous)(timestamp)(witness)(transaction_merkle_root)(extensions) )
FC_REFLECT_DERIVED( blurt::protocol::signed_block_header, (blurt::protocol::block_header), (witness_signature) )
