
#pragma once

#include <memory>

#include <blurt/protocol/types.hpp>

namespace blurt {
namespace schema {
struct abstract_schema;
}
} // namespace blurt

namespace blurt {
namespace protocol {
struct custom_json_operation;
}
} // namespace blurt

namespace blurt {
namespace chain {

class custom_operation_interpreter {
public:
  virtual void apply(const protocol::custom_json_operation &op) = 0;
  virtual void apply(const protocol::custom_binary_operation &op) = 0;
  virtual blurt::protocol::custom_id_type get_custom_id() = 0;
  virtual std::shared_ptr<blurt::schema::abstract_schema>
  get_operation_schema() = 0;
};

} // namespace chain
} // namespace blurt
