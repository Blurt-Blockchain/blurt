#include <blurt/account_statistics/account_statistics_api.hpp>

namespace blurt {
namespace account_statistics {

namespace detail {
class account_statistics_api_impl {
public:
  account_statistics_api_impl(blurt::app::application &app) : _app(app) {}

  blurt::app::application &_app;
};
} // namespace detail

account_statistics_api::account_statistics_api(
    const blurt::app::api_context &ctx) {
  _my = std::make_shared<detail::account_statistics_api_impl>(ctx.app);
}

void account_statistics_api::on_api_startup() {}

} // namespace account_statistics
} // namespace blurt