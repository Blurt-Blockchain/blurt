#pragma once

#include <blurt/protocol/asset.hpp>

#define BLURT_SYMBOL_LEGACY_SER_1 (uint64_t(1) | (BLURT_SYMBOL_U64 << 8))
#define BLURT_SYMBOL_LEGACY_SER_2 (uint64_t(2) | (BLURT_SYMBOL_U64 << 8))
#define BLURT_SYMBOL_LEGACY_SER_3 (uint64_t(5) | (BLURT_SYMBOL_U64 << 8))
#define BLURT_SYMBOL_LEGACY_SER_4                                              \
  (uint64_t(3) | (uint64_t('0') << 8) | (uint64_t('.') << 16) |                \
   (uint64_t('0') << 24) | (uint64_t('0') << 32) | (uint64_t('1') << 40))
#define BLURT_SYMBOL_LEGACY_SER_5                                              \
  (uint64_t(3) | (uint64_t('6') << 8) | (uint64_t('.') << 16) |                \
   (uint64_t('0') << 24) | (uint64_t('0') << 32) | (uint64_t('0') << 40))

namespace blurt {
namespace protocol {

class legacy_blurt_asset_symbol_type {
public:
  legacy_blurt_asset_symbol_type() {}

  bool is_canon() const { return (ser == BLURT_SYMBOL_SER); }

  uint64_t ser = BLURT_SYMBOL_SER;
};

struct legacy_blurt_asset {
public:
  legacy_blurt_asset() {}

  template <bool force_canon> asset to_asset() const {
    if (force_canon) {
      FC_ASSERT(symbol.is_canon(),
                "Must use canonical BLURT symbol serialization");
    }
    return asset(amount, BLURT_SYMBOL);
  }

  static legacy_blurt_asset from_amount(share_type amount) {
    legacy_blurt_asset leg;
    leg.amount = amount;
    return leg;
  }

  static legacy_blurt_asset from_asset(const asset &a) {
    FC_ASSERT(a.symbol == BLURT_SYMBOL);
    return from_amount(a.amount);
  }

  share_type amount;
  legacy_blurt_asset_symbol_type symbol;
};

} // namespace protocol
} // namespace blurt

namespace fc {
namespace raw {

template <typename Stream>
inline void pack(Stream &s,
                 const blurt::protocol::legacy_blurt_asset_symbol_type &sym) {
  switch (sym.ser) {
  case BLURT_SYMBOL_LEGACY_SER_1:
  case BLURT_SYMBOL_LEGACY_SER_2:
  case BLURT_SYMBOL_LEGACY_SER_3:
  case BLURT_SYMBOL_LEGACY_SER_4:
  case BLURT_SYMBOL_LEGACY_SER_5:
    wlog("pack legacy serialization ${s}", ("s", sym.ser));
  case BLURT_SYMBOL_SER:
    pack(s, sym.ser);
    break;
  default:
    FC_ASSERT(false, "Cannot serialize legacy symbol ${s}", ("s", sym.ser));
  }
}

template <typename Stream>
inline void unpack(Stream &s,
                   blurt::protocol::legacy_blurt_asset_symbol_type &sym,
                   uint32_t depth) {
  //  994240:        "account_creation_fee": "0.1 BLURT"
  // 1021529:        "account_creation_fee": "10.0 BLURT"
  // 3143833:        "account_creation_fee": "3.00000 BLURT"
  // 3208405:        "account_creation_fee": "2.00000 BLURT"
  // 3695672:        "account_creation_fee": "3.00 BLURT"
  // 4338089:        "account_creation_fee": "0.001 0.001"
  // 4626205:        "account_creation_fee": "6.000 6.000"
  // 4632595:        "account_creation_fee": "6.000 6.000"
  depth++;
  uint64_t ser = 0;

  fc::raw::unpack(s, ser, depth);
  switch (ser) {
  case BLURT_SYMBOL_LEGACY_SER_1:
  case BLURT_SYMBOL_LEGACY_SER_2:
  case BLURT_SYMBOL_LEGACY_SER_3:
  case BLURT_SYMBOL_LEGACY_SER_4:
  case BLURT_SYMBOL_LEGACY_SER_5:
    wlog("unpack legacy serialization ${s}", ("s", ser));
  case BLURT_SYMBOL_SER:
    sym.ser = ser;
    break;
  default:
    FC_ASSERT(false, "Cannot deserialize legacy symbol ${s}", ("s", ser));
  }
}

} // namespace raw

inline void to_variant(const blurt::protocol::legacy_blurt_asset &leg,
                       fc::variant &v) {
  to_variant(leg.to_asset<false>(), v);
}

inline void from_variant(const fc::variant &v,
                         blurt::protocol::legacy_blurt_asset &leg) {
  blurt::protocol::asset a;
  from_variant(v, a);
  leg = blurt::protocol::legacy_blurt_asset::from_asset(a);
}

template <>
struct get_typename<blurt::protocol::legacy_blurt_asset_symbol_type> {
  static const char *name() {
    return "blurt::protocol::legacy_blurt_asset_symbol_type";
  }
};

} // namespace fc

FC_REFLECT(blurt::protocol::legacy_blurt_asset, (amount)(symbol))
