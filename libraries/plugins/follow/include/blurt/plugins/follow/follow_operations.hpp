#pragma once
#include <blurt/protocol/base.hpp>

#include <blurt/chain/evaluator.hpp>

namespace blurt {
namespace plugins {
namespace follow {

using namespace std;
using blurt::protocol::account_name_type;
using blurt::protocol::base_operation;

class follow_plugin;

struct follow_operation : base_operation {
  account_name_type follower;
  account_name_type following;
  set<string> what; /// blog, mute

  void validate() const;

  void get_required_posting_authorities(flat_set<account_name_type> &a) const {
    a.insert(follower);
  }
};

struct reblog_operation : base_operation {
  account_name_type account;
  account_name_type author;
  string permlink;

  void validate() const;

  void get_required_posting_authorities(flat_set<account_name_type> &a) const {
    a.insert(account);
  }
};

typedef fc::static_variant<follow_operation, reblog_operation>
    follow_plugin_operation;

BLURT_DEFINE_PLUGIN_EVALUATOR(follow_plugin, follow_plugin_operation, follow);
BLURT_DEFINE_PLUGIN_EVALUATOR(follow_plugin, follow_plugin_operation, reblog);

} // namespace follow
} // namespace plugins
} // namespace blurt

FC_REFLECT(blurt::plugins::follow::follow_operation,
           (follower)(following)(what))
FC_REFLECT(blurt::plugins::follow::reblog_operation,
           (account)(author)(permlink))

BLURT_DECLARE_OPERATION_TYPE(blurt::plugins::follow::follow_plugin_operation)

FC_REFLECT_TYPENAME(blurt::plugins::follow::follow_plugin_operation)
