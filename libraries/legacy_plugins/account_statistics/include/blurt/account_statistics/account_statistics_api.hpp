#pragma once

#include <blurt/account_statistics/account_statistics_plugin.hpp>

#include <fc/api.hpp>

namespace blurt {
namespace app {
struct api_context;
}
} // namespace blurt

namespace blurt {
namespace account_statistics {

namespace detail {
class account_statistics_api_impl;
}

class account_statistics_api {
public:
  account_statistics_api(const blurt::app::api_context &ctx);

  void on_api_startup();

private:
  std::shared_ptr<detail::account_statistics_api_impl> _my;
};

} // namespace account_statistics
} // namespace blurt

FC_API(blurt::account_statistics::account_statistics_api, )