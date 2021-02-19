#include <blurt/plugins/transaction_status_api/transaction_status_api.hpp>
#include <blurt/plugins/transaction_status_api/transaction_status_api_plugin.hpp>

namespace blurt {
namespace plugins {
namespace transaction_status_api {

transaction_status_api_plugin::transaction_status_api_plugin() {}
transaction_status_api_plugin::~transaction_status_api_plugin() {}

void transaction_status_api_plugin::set_program_options(
    boost::program_options::options_description &cli,
    boost::program_options::options_description &cfg) {}

void transaction_status_api_plugin::plugin_initialize(
    const boost::program_options::variables_map &options) {
  ilog("Initializing transaction_status_api_plugin");
  api = std::make_unique<transaction_status_api>();
}

void transaction_status_api_plugin::plugin_startup() {}

void transaction_status_api_plugin::plugin_shutdown() {}

} // namespace transaction_status_api
} // namespace plugins
} // namespace blurt
