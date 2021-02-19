#pragma once
#include <blurt/plugins/json_rpc/utility.hpp>

#include <blurt/protocol/types.hpp>

#include <fc/optional.hpp>
#include <fc/variant.hpp>
#include <fc/vector.hpp>

namespace blurt {
namespace plugins {
namespace account_by_key {

namespace detail {
class account_by_key_api_impl;
}

struct get_key_references_args {
  std::vector<blurt::protocol::public_key_type> keys;
};

struct get_key_references_return {
  std::vector<std::vector<blurt::protocol::account_name_type>> accounts;
};

class account_by_key_api {
public:
  account_by_key_api();
  ~account_by_key_api();

  DECLARE_API((get_key_references))

private:
  std::unique_ptr<detail::account_by_key_api_impl> my;
};

} // namespace account_by_key
} // namespace plugins
} // namespace blurt

FC_REFLECT(blurt::plugins::account_by_key::get_key_references_args, (keys))

FC_REFLECT(blurt::plugins::account_by_key::get_key_references_return,
           (accounts))
