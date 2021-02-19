#include <blurt/chain/generic_custom_operation_interpreter.hpp>

namespace blurt {
namespace chain {

std::string legacy_custom_name_from_type(const std::string &type_name) {
  auto start = type_name.find_last_of(':') + 1;
  auto end = type_name.find_last_of('_');
  return type_name.substr(start, end - start);
}

} // namespace chain
} // namespace blurt
