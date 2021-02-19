
#pragma once

#include <blurt/schema/abstract_schema.hpp>
#include <blurt/schema/schema_impl.hpp>

#include <blurt/protocol/types.hpp>

namespace blurt {
namespace schema {
namespace detail {

//////////////////////////////////////////////
// account_name_type                        //
//////////////////////////////////////////////

struct schema_account_name_type_impl : public abstract_schema {
  BLURT_SCHEMA_CLASS_BODY(schema_account_name_type_impl)
};

} // namespace detail

template <> struct schema_reflect<blurt::protocol::account_name_type> {
  typedef detail::schema_account_name_type_impl schema_impl_type;
};

} // namespace schema
} // namespace blurt

namespace fc {

template <> struct get_typename<blurt::protocol::account_name_type> {
  static const char *name() { return "blurt::protocol::account_name_type"; }
};

} // namespace fc
