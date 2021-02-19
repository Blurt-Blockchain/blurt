#pragma once
#include <blurt/protocol/block_header.hpp>
#include <blurt/protocol/transaction.hpp>

namespace blurt {
namespace protocol {

struct signed_block : public signed_block_header {
  checksum_type calculate_merkle_root() const;
  vector<signed_transaction> transactions;
};

} // namespace protocol
} // namespace blurt

FC_REFLECT_DERIVED(blurt::protocol::signed_block,
                   (blurt::protocol::signed_block_header), (transactions))
