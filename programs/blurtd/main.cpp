#include <appbase/application.hpp>
#include <blurt/manifest/plugins.hpp>
#include <iostream>
#include <sstream>
#include <blurt/ipfs/client.h>
#include <fstream>
using namespace std;



int getjson(int, char**) {
  std::stringstream contents;

  ipfs::Client client("localhost", 5001);

  client.FilesGet("/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/readme", &contents);

  std::cout << contents.str() << std::endl;

  return 0;
}

#include <blurt/protocol/types.hpp>
#include <blurt/protocol/version.hpp>

#include <blurt/utilities/logging_config.hpp>
#include <blurt/utilities/key_conversion.hpp>
#include <blurt/utilities/git_revision.hpp>

#include <blurt/plugins/account_by_key/account_by_key_plugin.hpp>
#include <blurt/plugins/account_by_key_api/account_by_key_api_plugin.hpp>
#include <blurt/plugins/chain/chain_plugin.hpp>
#include <blurt/plugins/condenser_api/condenser_api_plugin.hpp>
#include <blurt/plugins/p2p/p2p_plugin.hpp>
#include <blurt/plugins/webserver/webserver_plugin.hpp>
#include <blurt/plugins/witness/witness_plugin.hpp>

#include <fc/exception/exception.hpp>
#include <fc/thread/thread.hpp>
#include <fc/interprocess/signals.hpp>
#include <fc/git_revision.hpp>

#include <boost/exception/diagnostic_information.hpp>
#include <boost/program_options.hpp>

#include <iostream>
#include <csignal>
#include <vector>

namespace bpo = boost::program_options;
using blurt::protocol::version;
using std::string;
using std::vector;

string& version_string()
{
   static string v_str =
      "blurt_blockchain_version: " + fc::string( BLURT_BLOCKCHAIN_VERSION ) + "\n" +
      "blurt_git_revision:       " + fc::string( blurt::utilities::git_revision_sha ) + "\n" +
      "fc_git_revision:          " + fc::string( fc::git_revision_sha ) + "\n";
   return v_str;
}

void info()
{
#ifdef IS_TEST_NET
      std::cerr << "------------------------------------------------------\n\n";
      std::cerr << "            STARTING TEST NETWORK \n\n";
      std::cerr << "------------------------------------------------------\n";
      auto initminer_private_key = blurt::utilities::key_to_wif( BLURT_INIT_PRIVATE_KEY );
      std::cerr << "initminer public key: " << BLURT_INIT_PUBLIC_KEY_STR << "\n";
      std::cerr << "initminer private key: " << initminer_private_key << "\n";
      std::cerr << "blockchain version: " << fc::string( BLURT_BLOCKCHAIN_VERSION ) << "\n";
      std::cerr << "------------------------------------------------------\n";
#else
      std::cerr << "------------------------------------------------------\n\n";
      std::cerr << "            STARTING BLURT NETWORK \n\n";
      std::cerr << "------------------------------------------------------\n";
      std::cerr << "initminer public key: " << BLURT_INIT_PUBLIC_KEY_STR << "\n";
      std::cerr << "chain id: " << std::string( BLURT_CHAIN_ID ) << "\n";
      std::cerr << "blockchain version: " << fc::string( BLURT_BLOCKCHAIN_VERSION ) << "\n";
      std::cerr << "------------------------------------------------------\n";
#endif
}

void check() {
   /* try to open file to read */
   ifstream ifile;
   ifile.open("snapshot.json");
   if(ifile) {
      cout<<"Snapshot exists, making sure it is the right one";
          ipfs::Json add_result;
    client.FilesAdd(
        {{"bar.txt", ipfs::http::FileUpload::Type::kFileName,
          "../compile_commands.json"}},
        &add_result);
    std::cout << "FilesAdd() result:" << std::endl
              << add_result.dump(2) << std::endl;
   } else {
      cout<<"Snapshot doesn't exist";
   }

}





int get(int, char**) {
  std::stringstream contents;

  ipfs::Client client("localhost", 5001);

  client.FilesGet("/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/readme", &contents);

  std::cout << contents.str() << std::endl;

  return 0;
}

int main( int argc, char** argv )
{
   try
   {
      // Setup logging config
      bpo::options_description options;

      blurt::utilities::set_logging_program_options( options );
      options.add_options()
         ("backtrace", bpo::value< string >()->default_value( "yes" ), "Whether to print backtrace on SIGSEGV" );

      appbase::app().add_program_options( bpo::options_description(), options );

      blurt::plugins::register_plugins();

      appbase::app().set_version_string( version_string() );
      appbase::app().set_app_name( "blurtd" );

      // These plugins are included in the default config
      appbase::app().set_default_plugins<
         blurt::plugins::witness::witness_plugin,
         blurt::plugins::account_by_key::account_by_key_plugin,
         blurt::plugins::account_by_key::account_by_key_api_plugin,
         blurt::plugins::condenser_api::condenser_api_plugin >();

      // These plugins are loaded regardless of the config
      bool initialized = appbase::app().initialize<
            blurt::plugins::chain::chain_plugin,
            blurt::plugins::p2p::p2p_plugin,
            blurt::plugins::webserver::webserver_plugin >
            ( argc, argv );

      info();

      if( !initialized )
         return 0;

      auto& args = appbase::app().get_args();

      try
      {
         fc::optional< fc::logging_config > logging_config = blurt::utilities::load_logging_config( args, appbase::app().data_dir() );
         if( logging_config )
            fc::configure_logging( *logging_config );
      }
      catch( const fc::exception& e )
      {
         wlog( "Error parsing logging config. ${e}", ("e", e.to_string()) );
      }

      appbase::app().startup();
      appbase::app().exec();
      std::cout << "exited cleanly\n";
      return 0;
   }
   catch ( const boost::exception& e )
   {
      std::cerr << boost::diagnostic_information(e) << "\n";
   }
   catch ( const fc::exception& e )
   {
      std::cerr << e.to_detail_string() << "\n";
   }
   catch ( const std::exception& e )
   {
      std::cerr << e.what() << "\n";
   }
   catch ( ... )
   {
      std::cerr << "unknown exception\n";
   }

   return -1;
}
