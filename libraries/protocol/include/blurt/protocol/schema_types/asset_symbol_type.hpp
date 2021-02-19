
#pragma once

#include <blurt/schema/abstract_schema.hpp>
#include <blurt/schema/schema_impl.hpp>

#include <blurt/protocol/asset_symbol.hpp>

namespace blurt {
namespace schema {
namespace detail {

//////////////////////////////////////////////
// asset_symbol_type                        //
//////////////////////////////////////////////

struct schema_asset_symbol_type_impl : public abstract_schema {
  BLURT_SCHEMA_CLASS_BODY(schema_asset_symbol_type_impl)
};

} // namespace detail

template <> struct schema_reflect<blurt::protocol::asset_symbol_type> {
  typedef detail::schema_asset_symbol_type_impl schema_impl_type;
};

} // namespace schema
} // namespace blurt
