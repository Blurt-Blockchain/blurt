#pragma once

#include <blurt/protocol/types.hpp>
#include <blurt/protocol/authority.hpp>
#include <blurt/protocol/version.hpp>

#include <fc/time.hpp>

namespace blurt { namespace protocol {

   struct base_operation
   {
      uint32_t hardfork;

      void get_required_authorities( vector<authority>& )const {}
      void get_required_active_authorities( flat_set<account_name_type>& )const {}
      void get_required_posting_authorities( flat_set<account_name_type>& )const {}
      void get_required_owner_authorities( flat_set<account_name_type>& )const {}

      bool is_virtual()const { return false; }
      void validate()const {}

      void set_hardfork( uint32_t num ) { hardfork = num; }
   };

   struct virtual_operation : public base_operation
   {
      bool is_virtual()const { return true; }
      void validate()const { FC_ASSERT( false, "This is a virtual operation" ); }
   };

   typedef static_variant<
      void_t
      >                                future_extensions;

   typedef flat_set<future_extensions> extensions_type;


} } // blurt::protocol

FC_REFLECT_TYPENAME( blurt::protocol::future_extensions )
