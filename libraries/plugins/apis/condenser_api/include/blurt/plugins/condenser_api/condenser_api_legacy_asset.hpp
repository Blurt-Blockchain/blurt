#pragma once
#include <blurt/chain/blurt_fwd.hpp>
#include <blurt/protocol/asset.hpp>

namespace blurt {
namespace plugins {
namespace condenser_api {

using blurt::protocol::asset;
using blurt::protocol::asset_symbol_type;
using blurt::protocol::share_type;

struct legacy_asset {
public:
  legacy_asset() {}

  asset to_asset() const { return asset(amount, symbol); }

  operator asset() const { return to_asset(); }

  static legacy_asset from_asset(const asset &a) {
    legacy_asset leg;
    leg.amount = a.amount;
    leg.symbol = a.symbol;
    return leg;
  }

  string to_string() const;
  static legacy_asset from_string(const string &from);

  share_type amount;
  asset_symbol_type symbol = BLURT_SYMBOL;
};

} // namespace condenser_api
} // namespace plugins
} // namespace blurt

namespace fc {

inline void to_variant(const blurt::plugins::condenser_api::legacy_asset &a,
                       fc::variant &var) {
  var = a.to_string();
}

inline void from_variant(const fc::variant &var,
                         blurt::plugins::condenser_api::legacy_asset &a) {
  a = blurt::plugins::condenser_api::legacy_asset::from_string(var.as_string());
}

} // namespace fc

FC_REFLECT(blurt::plugins::condenser_api::legacy_asset, (amount)(symbol))
