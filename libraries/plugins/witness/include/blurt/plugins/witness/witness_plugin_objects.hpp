#pragma once

#include <blurt/chain/blurt_object_types.hpp>

#ifndef BLURT_WITNESS_SPACE_ID
#define BLURT_WITNESS_SPACE_ID 19
#endif

namespace blurt {
namespace chain {
struct by_account;
}
} // namespace blurt

namespace blurt {
namespace plugins {
namespace witness {

using namespace blurt::chain;

enum witness_object_types {
  witness_custom_op_object_type = (BLURT_WITNESS_SPACE_ID << 8)
};

class witness_custom_op_object
    : public object<witness_custom_op_object_type, witness_custom_op_object> {
public:
  template <typename Constructor, typename Allocator>
  witness_custom_op_object(Constructor &&c, allocator<Allocator> a) {
    c(*this);
  }

  witness_custom_op_object() {}

  id_type id;
  account_name_type account;
  uint32_t count = 0;
};

typedef multi_index_container<
    witness_custom_op_object,
    indexed_by<
        ordered_unique<tag<by_id>, member<witness_custom_op_object,
                                          witness_custom_op_object::id_type,
                                          &witness_custom_op_object::id>>,
        ordered_unique<tag<by_account>,
                       member<witness_custom_op_object, account_name_type,
                              &witness_custom_op_object::account>>>,
    allocator<witness_custom_op_object>>
    witness_custom_op_index;

} // namespace witness
} // namespace plugins
} // namespace blurt

FC_REFLECT(blurt::plugins::witness::witness_custom_op_object,
           (id)(account)(count))
CHAINBASE_SET_INDEX_TYPE(blurt::plugins::witness::witness_custom_op_object,
                         blurt::plugins::witness::witness_custom_op_index)
