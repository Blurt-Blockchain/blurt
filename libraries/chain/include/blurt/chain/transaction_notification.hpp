#pragma once

#include <blurt/protocol/block.hpp>

namespace blurt {
namespace chain {

struct transaction_notification {
  transaction_notification(const blurt::protocol::signed_transaction &tx)
      : transaction(tx) {
    transaction_id = tx.id();
  }

  blurt::protocol::transaction_id_type transaction_id;
  const blurt::protocol::signed_transaction &transaction;
};

} // namespace chain
} // namespace blurt
