#include <blurt/plugins/database_api/database_api.hpp>
#include <blurt/plugins/database_api/database_api_plugin.hpp>

namespace blurt {
namespace plugins {
namespace database_api {

database_api_plugin::database_api_plugin() {}
database_api_plugin::~database_api_plugin() {}

void database_api_plugin::set_program_options(options_description &cli,
                                              options_description &cfg) {}

void database_api_plugin::plugin_initialize(const variables_map &options) {
  ilog("Initializing database_api_plugin");
  api = std::make_shared<database_api>();
}

void database_api_plugin::plugin_startup() {}

void database_api_plugin::plugin_shutdown() {}

} // namespace database_api
} // namespace plugins
} // namespace blurt
