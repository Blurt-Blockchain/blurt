#pragma once
#include <boost/container/flat_set.hpp>
#include <cstdint>
#include <fc/uint128.hpp>

namespace fc {
class variant;
} // namespace fc

namespace blurt {
namespace protocol {
template <typename Storage = fc::uint128> class fixed_string_impl;

class asset_symbol_type;
class legacy_blurt_asset_symbol_type;
struct legacy_blurt_asset;
} // namespace protocol
} // namespace blurt

using boost::container::flat_set;

template <class Key> class flat_set_ex : public flat_set<Key> {
public:
  flat_set_ex &operator=(const flat_set<Key> &obj) {
    flat_set<Key>::operator=(obj);
    return *this;
  }

  flat_set_ex &operator=(const flat_set_ex &obj) {
    flat_set<Key>::operator=(obj);
    return *this;
  }
};

namespace fc {
namespace raw {

template <typename Stream, typename T>
void pack(Stream &s, const flat_set_ex<T> &value);
template <typename Stream, typename T>
void unpack(Stream &s, flat_set_ex<T> &value, uint32_t depth = 0);

template <typename Stream, typename Storage>
inline void pack(Stream &s,
                 const blurt::protocol::fixed_string_impl<Storage> &u);
template <typename Stream, typename Storage>
inline void unpack(Stream &s, blurt::protocol::fixed_string_impl<Storage> &u,
                   uint32_t depth = 0);

template <typename Stream>
inline void pack(Stream &s, const blurt::protocol::asset_symbol_type &sym);
template <typename Stream>
inline void unpack(Stream &s, blurt::protocol::asset_symbol_type &sym,
                   uint32_t depth = 0);

template <typename Stream>
inline void pack(Stream &s,
                 const blurt::protocol::legacy_blurt_asset_symbol_type &sym);
template <typename Stream>
inline void unpack(Stream &s,
                   blurt::protocol::legacy_blurt_asset_symbol_type &sym,
                   uint32_t depth = 0);

} // namespace raw

template <typename T> void to_variant(const flat_set_ex<T> &var, variant &vo);

template <typename T> void from_variant(const variant &var, flat_set_ex<T> &vo);

template <typename Storage>
inline void to_variant(const blurt::protocol::fixed_string_impl<Storage> &s,
                       fc::variant &v);
template <typename Storage>
inline void from_variant(const variant &v,
                         blurt::protocol::fixed_string_impl<Storage> &s);

inline void to_variant(const blurt::protocol::asset_symbol_type &sym,
                       fc::variant &v);

inline void from_variant(const fc::variant &v,
                         blurt::protocol::legacy_blurt_asset &leg);
inline void to_variant(const blurt::protocol::legacy_blurt_asset &leg,
                       fc::variant &v);

template <typename T> struct get_typename<flat_set_ex<T>> {
  static const char *name() {
    static std::string n =
        std::string("flat_set<") + get_typename<fc::flat_set<T>>::name() + ">";
    return n.c_str();
  }
};

} // namespace fc
