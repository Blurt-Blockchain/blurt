#pragma once

#include <blurt/chain/evaluator.hpp>

#include <blurt/private_message/private_message_operations.hpp>
#include <blurt/private_message/private_message_plugin.hpp>

namespace blurt {
namespace private_message {

BLURT_DEFINE_PLUGIN_EVALUATOR(
    private_message_plugin,
    blurt::private_message::private_message_plugin_operation, private_message)

}
} // namespace blurt
