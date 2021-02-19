#pragma once

#include <blurt/protocol/block_header.hpp>
#include <blurt/protocol/transaction.hpp>
#include <blurt/protocol/types.hpp>

#include <blurt/plugins/json_rpc/utility.hpp>
#include <blurt/plugins/transaction_status/transaction_status_objects.hpp>

namespace blurt {
namespace plugins {
namespace transaction_status_api {

struct find_transaction_args {
  chain::transaction_id_type transaction_id;
  fc::optional<fc::time_point_sec> expiration;
};

struct find_transaction_return {
  transaction_status::transaction_status status;
  fc::optional<uint32_t> block_num;
};

} // namespace transaction_status_api
} // namespace plugins
} // namespace blurt

FC_REFLECT(blurt::plugins::transaction_status_api::find_transaction_args,
           (transaction_id)(expiration))
FC_REFLECT(blurt::plugins::transaction_status_api::find_transaction_return,
           (status)(block_num))
