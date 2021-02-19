
#include <blurt/plugins/network_broadcast_api/network_broadcast_api.hpp>
#include <blurt/plugins/network_broadcast_api/network_broadcast_api_plugin.hpp>

#include <appbase/application.hpp>

namespace blurt {
namespace plugins {
namespace network_broadcast_api {

namespace detail {
class network_broadcast_api_impl {
public:
  network_broadcast_api_impl()
      : _p2p(appbase::app().get_plugin<blurt::plugins::p2p::p2p_plugin>()),
        _chain(
            appbase::app().get_plugin<blurt::plugins::chain::chain_plugin>()) {}

  DECLARE_API_IMPL((broadcast_transaction)(broadcast_block))

  bool check_max_block_age(int32_t max_block_age) const;

  blurt::plugins::p2p::p2p_plugin &_p2p;
  blurt::plugins::chain::chain_plugin &_chain;
};

DEFINE_API_IMPL(network_broadcast_api_impl, broadcast_transaction) {
  FC_ASSERT(!check_max_block_age(args.max_block_age));

  //////////////////////////
  // spam filter
  ilog("broadcast_transaction");
  _chain.db().spam_filter_check_tx(args.trx);
  // end spam filter

  _chain.accept_transaction(args.trx);
  _p2p.broadcast_transaction(args.trx);

  return broadcast_transaction_return();
}

DEFINE_API_IMPL(network_broadcast_api_impl, broadcast_block) {
  _chain.accept_block(args.block, /*currently syncing*/ false,
                      /*skip*/ chain::database::skip_nothing);
  _p2p.broadcast_block(args.block);
  return broadcast_block_return();
}

bool network_broadcast_api_impl::check_max_block_age(
    int32_t max_block_age) const {
  if (max_block_age < 0)
    return false;

  return _chain.db().with_read_lock([&]() {
    fc::time_point_sec now = fc::time_point::now();
    const auto &dgpo = _chain.db().get_dynamic_global_properties();

    return (dgpo.time < now - fc::seconds(max_block_age));
  });
}

} // namespace detail

network_broadcast_api::network_broadcast_api()
    : my(new detail::network_broadcast_api_impl()) {
  JSON_RPC_REGISTER_API(BLURT_NETWORK_BROADCAST_API_PLUGIN_NAME);
}

network_broadcast_api::~network_broadcast_api() {}

DEFINE_LOCKLESS_APIS(network_broadcast_api,
                     (broadcast_transaction)(broadcast_block))

} // namespace network_broadcast_api
} // namespace plugins
} // namespace blurt
