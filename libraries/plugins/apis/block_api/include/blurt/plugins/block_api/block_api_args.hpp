#pragma once
#include <blurt/plugins/block_api/block_api_objects.hpp>

#include <blurt/protocol/block_header.hpp>
#include <blurt/protocol/transaction.hpp>
#include <blurt/protocol/types.hpp>

#include <blurt/plugins/json_rpc/utility.hpp>

namespace blurt {
namespace plugins {
namespace block_api {

/* get_block_header */

struct get_block_header_args {
  uint32_t block_num;
};

struct get_block_header_return {
  optional<block_header> header;
};

/* get_block */
struct get_block_args {
  uint32_t block_num;
};

struct get_block_return {
  optional<api_signed_block_object> block;
};

} // namespace block_api
} // namespace plugins
} // namespace blurt

FC_REFLECT(blurt::plugins::block_api::get_block_header_args, (block_num))

FC_REFLECT(blurt::plugins::block_api::get_block_header_return, (header))

FC_REFLECT(blurt::plugins::block_api::get_block_args, (block_num))

FC_REFLECT(blurt::plugins::block_api::get_block_return, (block))
