#pragma once
#include <blurt/chain/blurt_fwd.hpp>
#include <blurt/plugins/chain/chain_plugin.hpp>
#include <blurt/plugins/json_rpc/json_rpc_plugin.hpp>
#include <blurt/plugins/p2p/p2p_plugin.hpp>
#include <blurt/plugins/rc/rc_plugin.hpp>

#include <appbase/application.hpp>

#define BLURT_NETWORK_BROADCAST_API_PLUGIN_NAME "network_broadcast_api"

namespace blurt {
namespace plugins {
namespace network_broadcast_api {

using namespace appbase;

class network_broadcast_api_plugin
    : public appbase::plugin<network_broadcast_api_plugin> {
public:
  APPBASE_PLUGIN_REQUIRES((blurt::plugins::json_rpc::json_rpc_plugin)(
      blurt::plugins::rc::rc_plugin)(blurt::plugins::chain::chain_plugin)(
      blurt::plugins::p2p::p2p_plugin))

  network_broadcast_api_plugin();
  virtual ~network_broadcast_api_plugin();

  static const std::string &name() {
    static std::string name = BLURT_NETWORK_BROADCAST_API_PLUGIN_NAME;
    return name;
  }

  virtual void set_program_options(options_description &cli,
                                   options_description &cfg) override;
  virtual void plugin_initialize(const variables_map &options) override;
  virtual void plugin_startup() override;
  virtual void plugin_shutdown() override;

  std::shared_ptr<class network_broadcast_api> api;
};

} // namespace network_broadcast_api
} // namespace plugins
} // namespace blurt
