#pragma once

#include <blurt/protocol/transaction.hpp>

#include <fc/int_array.hpp>
#include <fc/reflect/reflect.hpp>
#include <vector>

#define BLURT_NUM_RESOURCE_TYPES 5

namespace blurt {
namespace plugins {
namespace rc {

enum rc_resource_types {
  resource_history_bytes,
  resource_new_accounts,
  resource_market_bytes,
  resource_state_bytes,
  resource_execution_time
};

typedef fc::int_array<int64_t, BLURT_NUM_RESOURCE_TYPES> resource_count_type;

struct count_resources_result {
  resource_count_type resource_count;
};

void count_resources(const blurt::protocol::signed_transaction &tx,
                     count_resources_result &result);

} // namespace rc
} // namespace plugins
} // namespace blurt

FC_REFLECT_ENUM(
    blurt::plugins::rc::rc_resource_types,
    (resource_history_bytes)(resource_new_accounts)(resource_market_bytes)(
        resource_state_bytes)(resource_execution_time))

FC_REFLECT(blurt::plugins::rc::count_resources_result, (resource_count))

FC_REFLECT_TYPENAME(blurt::plugins::rc::resource_count_type)
