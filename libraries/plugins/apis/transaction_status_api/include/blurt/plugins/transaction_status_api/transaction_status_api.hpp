#pragma once

#include <blurt/plugins/json_rpc/utility.hpp>
#include <blurt/plugins/transaction_status_api/transaction_status_api_args.hpp>

namespace blurt {
namespace plugins {
namespace transaction_status_api {

namespace detail {
class transaction_status_api_impl;
}

class transaction_status_api {
public:
  transaction_status_api();
  ~transaction_status_api();

  DECLARE_API((find_transaction))
private:
  std::unique_ptr<detail::transaction_status_api_impl> my;
};

} // namespace transaction_status_api
} // namespace plugins
} // namespace blurt
