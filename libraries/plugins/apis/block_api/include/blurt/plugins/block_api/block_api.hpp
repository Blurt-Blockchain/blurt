#pragma once

#include <blurt/plugins/json_rpc/utility.hpp>

#include <blurt/plugins/block_api/block_api_args.hpp>

#define BLOCK_API_SINGLE_QUERY_LIMIT 1000

namespace blurt {
namespace plugins {
namespace block_api {

class block_api_impl;

class block_api {
public:
  block_api();
  ~block_api();

  DECLARE_API(

      /////////////////////////////
      // Blocks and transactions //
      /////////////////////////////

      /**
       * @brief Retrieve a block header
       * @param block_num Height of the block whose header should be returned
       * @return header of the referenced block, or null if no matching block
       * was found
       */
      (get_block_header)

      /**
       * @brief Retrieve a full, signed block
       * @param block_num Height of the block to be returned
       * @return the referenced block, or null if no matching block was found
       */
      (get_block))

private:
  std::unique_ptr<block_api_impl> my;
};

} // namespace block_api
} // namespace plugins
} // namespace blurt
