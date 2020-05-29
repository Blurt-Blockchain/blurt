#pragma once
#include <blurt/chain/blurt_fwd.hpp>
#include <appbase/application.hpp>

#include <blurt/plugins/chain/chain_plugin.hpp>

namespace blurt { namespace plugins { namespace account_by_key {

namespace detail { class account_by_key_plugin_impl; }

using namespace appbase;

#define BLURT_ACCOUNT_BY_KEY_PLUGIN_NAME "account_by_key"

class account_by_key_plugin : public appbase::plugin< account_by_key_plugin >
{
   public:
      account_by_key_plugin();
      virtual ~account_by_key_plugin();

      APPBASE_PLUGIN_REQUIRES( (blurt::plugins::chain::chain_plugin) )

      static const std::string& name() { static std::string name = BLURT_ACCOUNT_BY_KEY_PLUGIN_NAME; return name; }

      virtual void set_program_options( options_description& cli, options_description& cfg ) override;
      virtual void plugin_initialize( const variables_map& options ) override;
      virtual void plugin_startup() override;
      virtual void plugin_shutdown() override;

   private:
      std::unique_ptr< detail::account_by_key_plugin_impl > my;
};

} } } // blurt::plugins::account_by_key
