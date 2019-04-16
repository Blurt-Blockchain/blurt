#include <fc/network/http/http_client.hpp>
#include <fc/network/url.hpp>
#include <fc/log/logger.hpp>

#include <boost/beast/core.hpp>
#include <boost/beast/http.hpp>
#include <boost/beast/version.hpp>
#include <boost/asio/connect.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <boost/asio/ssl/error.hpp>
#include <boost/asio/ssl/stream.hpp>
#include <boost/filesystem/fstream.hpp>

#include <cstdlib>
#include <iostream>
#include <string>

namespace fc {
   namespace http {

      namespace basio = boost::asio;
      namespace bbeast = boost::beast;
      namespace bsys = boost::system;

      namespace detail {

         class http_client_impl {
         public:
            http_client_impl() {}

            ~http_client_impl() {}

            std::string jsonrpc(const std::string &url, const std::string &body);

         };

         // https://github.com/boostorg/beast/issues/38
         bool is_ssl_short_read(bsys::error_code const& ec)
         {
            if(ec.value() != 335544539)
               return false;
            if(boost::string_view{ec.category().name()} != "asio.ssl")
               return false;
            BOOST_ASSERT(ec.message() == "short read");
            return true;
         }

         std::string http_client_impl::jsonrpc(const std::string &url, const std::string &body) {
            fc::url https_url(url);

            uint16_t port = 80;
            if (https_url.port()) {
               port = *https_url.port();
            } else {
               if (https_url.proto() == "https") {
                  port = 443;
               }
            }

            bool using_ssl = false;
            if (https_url.proto() == "https") {
               using_ssl = true;
            }

            int version = 11;

//            ilog("debug: host=${host}, port=${port}, path=${path}",
//                 ("host", *https_url.host())
//                    ("port", std::to_string(port))
//                    ("path", https_url.path()->string())
//            );


            basio::io_context ioc; // The io_context is required for all I/O
            basio::ip::tcp::resolver resolver{ioc};
            auto const results = resolver.resolve(*https_url.host(), std::to_string(port)); // Look up the domain name
            bbeast::flat_buffer buffer; // This buffer is used for reading and must be persisted
            bbeast::http::response<bbeast::http::string_body> res; // Declare a container to hold the response
            bsys::error_code ec;

            // Set up an HTTP request message
            bbeast::http::request<bbeast::http::string_body> req{bbeast::http::verb::post, https_url.path()->string(), version};
            req.set(bbeast::http::field::host, *https_url.host());
            req.set(bbeast::http::field::user_agent, BOOST_BEAST_VERSION_STRING);
            req.set(bbeast::http::field::content_type, "application/json; charset=UTF-8");
            req.body() = body;
            req.prepare_payload(); // need this line if method is POST

            if (using_ssl) {
               /**************************
                * HTTPS
                */
               // sslv23_client
               basio::ssl::context ctx{basio::ssl::context::tlsv12_client}; // The SSL context is required, and holds certificates

              // This holds the root certificate used for verification. https://curl.haxx.se/docs/caextract.html
//               ctx.load_verify_file("/Volumes/Data/projects/img_proxy_cpp/cmake-build-debug/cacert.pem"); // testing
#if defined( __APPLE__ )
              ctx.load_verify_file("/private/etc/ssl/cert.pem"); // /etc/ssl/cert.pem
#else
               ctx.set_default_verify_paths();
#endif

               ctx.set_verify_mode(basio::ssl::verify_peer); // Verify the remote server's certificate

               basio::ssl::stream<basio::ip::tcp::socket> stream{ioc, ctx}; // These objects perform our I/O

               // Set SNI Hostname (many hosts need this to handshake successfully)
               if (!SSL_set_tlsext_host_name(stream.native_handle(), https_url.host()->c_str())) {
                  bsys::error_code ec{static_cast<int>(::ERR_get_error()), basio::error::get_ssl_category()};
                  throw bsys::system_error{ec};
               }

               basio::connect(stream.next_layer(), results.begin(), results.end()); // Make the connection on the IP address we get from a lookup
               stream.handshake(basio::ssl::stream_base::client); // Perform the SSL handshake

               bbeast::http::write(stream, req); // Send the HTTP request to the remote host
               bbeast::http::read(stream, buffer, res); // Receive the HTTP response

               std::string str_body = res.body(); // response string

               stream.shutdown(ec); // Gracefully close the stream
               if ((ec == basio::error::eof) || is_ssl_short_read(ec)) {
                  // Rationale:
                  // http://stackoverflow.com/questions/25587403/boost-asio-ssl-async-shutdown-always-finishes-with-an-error
                  ec.assign(0, ec.category());
               }
               if (ec)
                  throw bsys::system_error{ec};

               // If we get here then the connection is closed gracefully

               return str_body;
            } else {
               /**************************
                 * HTTP
                 */
               basio::ip::tcp::socket socket{ioc}; // These objects perform our I/O
               basio::connect(socket, results.begin(), results.end()); // Make the connection on the IP address we get from a lookup
               bbeast::http::write(socket, req); // Send the HTTP request to the remote host
               bbeast::http::read(socket, buffer, res); // Receive the HTTP response
               std::string str_body = res.body(); // response string

               socket.shutdown(basio::ip::tcp::socket::shutdown_both, ec); // Gracefully close the stream

               // not_connected happens sometimes
               // so don't bother reporting it.
               //
               if(ec && ec != boost::system::errc::not_connected)
                  throw boost::system::system_error{ec};

               // If we get here then the connection is closed gracefully

               return str_body;
            }

            return std::string{};
         }
      } // detail

      std::string http_client::jsonrpc(const std::string &url, const std::string &body) {
         return my->jsonrpc(url, body);
      }

      http_client::http_client() : my(new detail::http_client_impl()) {}

      http_client::~http_client() {

      }
   }
}