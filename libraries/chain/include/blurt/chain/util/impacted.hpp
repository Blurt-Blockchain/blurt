#pragma once

#include <blurt/protocol/operations.hpp>
#include <blurt/protocol/transaction.hpp>
#include <fc/container/flat.hpp>

#include <fc/string.hpp>

namespace blurt {
namespace app {

using namespace fc;

void operation_get_impacted_accounts(
    const blurt::protocol::operation &op,
    fc::flat_set<protocol::account_name_type> &result);

void transaction_get_impacted_accounts(
    const blurt::protocol::transaction &tx,
    fc::flat_set<protocol::account_name_type> &result);

} // namespace app
} // namespace blurt
