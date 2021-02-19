#pragma once

#include <fc/time.hpp>

#include <blurt/chain/database.hpp>

namespace blurt {
namespace plugins {
namespace chain {

class abstract_block_producer {
public:
  virtual ~abstract_block_producer() = default;

  virtual blurt::chain::signed_block
  generate_block(fc::time_point_sec when,
                 const blurt::chain::account_name_type &witness_owner,
                 const fc::ecc::private_key &block_signing_private_key,
                 uint32_t skip = blurt::chain::database::skip_nothing) = 0;
};

} // namespace chain
} // namespace plugins
} // namespace blurt
