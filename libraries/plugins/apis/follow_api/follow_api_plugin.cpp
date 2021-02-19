#include <blurt/plugins/follow_api/follow_api.hpp>
#include <blurt/plugins/follow_api/follow_api_plugin.hpp>

namespace blurt {
namespace plugins {
namespace follow {

follow_api_plugin::follow_api_plugin() {}
follow_api_plugin::~follow_api_plugin() {}

void follow_api_plugin::set_program_options(options_description &cli,
                                            options_description &cfg) {}

void follow_api_plugin::plugin_initialize(const variables_map &options) {
  ilog("Initializing follow_api_plugin");
  api = std::make_shared<follow_api>();
}

void follow_api_plugin::plugin_startup() {}
void follow_api_plugin::plugin_shutdown() {}

} // namespace follow
} // namespace plugins
} // namespace blurt
