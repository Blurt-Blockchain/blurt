#pragma once
#include <blurt/chain/account_object.hpp>
#include <blurt/chain/block_summary_object.hpp>
#include <blurt/chain/blurt_objects.hpp>
#include <blurt/chain/comment_object.hpp>
#include <blurt/chain/database.hpp>
#include <blurt/chain/global_property_object.hpp>
#include <blurt/chain/history_object.hpp>
#include <blurt/chain/transaction_object.hpp>
#include <blurt/chain/witness_objects.hpp>

namespace blurt {
namespace plugins {
namespace block_api {

using namespace blurt::chain;

struct api_signed_block_object : public signed_block {
  api_signed_block_object(const signed_block &block) : signed_block(block) {
    block_id = id();
    signing_key = signee();
    transaction_ids.reserve(transactions.size());
    for (const signed_transaction &tx : transactions)
      transaction_ids.push_back(tx.id());
  }
  api_signed_block_object() {}

  block_id_type block_id;
  public_key_type signing_key;
  vector<transaction_id_type> transaction_ids;
};

} // namespace block_api
} // namespace plugins
} // namespace blurt

FC_REFLECT_DERIVED(blurt::plugins::block_api::api_signed_block_object,
                   (blurt::protocol::signed_block),
                   (block_id)(signing_key)(transaction_ids))
