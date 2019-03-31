#include <blurt/plugins/webserver/webserver_plugin.hpp>

#include <blurt/plugins/chain/chain_plugin.hpp>

#include <fc/network/ip.hpp>
#include <fc/log/logger_config.hpp>
#include <fc/io/json.hpp>
#include <fc/network/resolve.hpp>

#include <boost/asio.hpp>
#include <boost/optional.hpp>
#include <boost/bind.hpp>
#include <boost/preprocessor/stringize.hpp>

#include <boost/beast/core.hpp>
#include <boost/beast/http.hpp>
#include <boost/beast/version.hpp>
#include <boost/asio/bind_executor.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <boost/asio/strand.hpp>
#include <boost/config.hpp>

#include <thread>
#include <memory>
#include <iostream>

namespace blurt {
namespace plugins {
namespace webserver {

namespace asio = boost::asio;
namespace http = boost::beast::http;    // from <boost/beast/http.hpp>

using boost::optional;
using boost::asio::ip::tcp;
using std::map;
using std::shared_ptr;
using std::string;

namespace detail {

//// This function produces an HTTP response for the given
//// request. The type of the response object depends on the
//// contents of the request, so the interface requires the
//// caller to pass a generic lambda for receiving the response.
//template <class Body, class Allocator, class Send>
//void handle_request(http::request<Body, http::basic_fields<Allocator>> &&req, Send &&send) {
//  http::response<http::string_body> res{http::status::ok, req.version()};
//  res.set(http::field::server, BOOST_BEAST_VERSION_STRING);
//  res.set(http::field::content_type, "application/json; charset=UTF-8");
//  res.body() = "{\"jsonrpc\":\"2.0\",\"result\":[{\"name\":\"\",\"total_payouts\":\"11517129.273 BLURT\",\"net_votes\":83755,\"top_posts\":10377,\"comments\":31950,\"trending\":\"136903466\"}],\"id\":\"0\"}";
//  res.prepare_payload();
//
//  return send(std::move(res));
//}

// Report a failure
void fail(boost::system::error_code ec, char const *what) { std::cerr << what << ": " << ec.message() << "\n"; }

// Handles an HTTP server connection
class session : public std::enable_shared_from_this<session> {

  // This is the C++11 equivalent of a generic lambda.
  // The function object is used to send an HTTP message.
  struct send_lambda {
    session &self_;

    explicit send_lambda(session &self) : self_(self) {}

    template <bool isRequest, class Body, class Fields>
    void operator()(http::message<isRequest, Body, Fields> &&msg) const {
      // The lifetime of the message has to extend
      // for the duration of the async operation so
      // we use a shared_ptr to manage it.
      auto sp = std::make_shared<http::message<isRequest, Body, Fields>>(std::move(msg));

      // Store a type-erased version of the shared
      // pointer in the class to keep it alive.
      self_.res_ = sp;

      // Write the response
      // clang-format off
      http::async_write(
          self_.socket_, *sp,
          boost::asio::bind_executor(
              self_.strand_,
              std::bind(&session::on_write, self_.shared_from_this(), std::placeholders::_1, std::placeholders::_2, sp->need_eof())
          )
      );
      // clang-format on
    }
  };

  tcp::socket socket_;
  plugins::json_rpc::json_rpc_plugin *_api;
  boost::asio::strand<boost::asio::io_context::executor_type> strand_;
  boost::beast::flat_buffer buffer_;
  http::request<http::string_body> req_;
  std::shared_ptr<void> res_;
  send_lambda lambda_;

 public:
  // Take ownership of the socket
  explicit session(tcp::socket socket, plugins::json_rpc::json_rpc_plugin *api)
      : socket_(std::move(socket)), _api(api), strand_(socket_.get_executor()), lambda_(*this) {
//    _api = api;
  }

  // Start the asynchronous operation
  void run() { do_read(); }

  void do_read() {
    // Make the request empty before reading,
    // otherwise the operation behavior is undefined.
    req_ = {};

    // Read a request
    // clang-format off
    http::async_read(
        socket_, buffer_, req_,
        boost::asio::bind_executor(strand_, std::bind(&session::on_read, shared_from_this(), std::placeholders::_1, std::placeholders::_2))
    );
    // clang-format on
  }

  void on_read(boost::system::error_code ec, std::size_t bytes_transferred) {
    boost::ignore_unused(bytes_transferred);

    // This means they closed the connection
    if (ec == http::error::end_of_stream) return do_close();

    if (ec) return fail(ec, "read");

    /////////////////////////////////////////////////////////////////////
//    handle_request(std::move(req_), lambda_);  // Send the response

    http::response<http::string_body> res{http::status::ok, req_.version()};
    res.set(http::field::server, BOOST_BEAST_VERSION_STRING);
    res.set(http::field::content_type, "application/json; charset=UTF-8");

    try {
      auto req_body = req_.body();
      auto res_body = _api->call(req_body);
      res.body() = res_body;
    } catch (fc::exception &e) {
      edump((e));
      res.body() = "Could not call API";
      res.result(http::status::not_found);
    } catch (...) {
      auto eptr = std::current_exception();

      try {
        if (eptr) std::rethrow_exception(eptr);

        res.body() = "unknown error occurred";
        res.result(http::status::internal_server_error);
      } catch (const std::exception &e) {
        std::stringstream s;
        s << "unknown exception: " << e.what();
        res.body() = s.str();
        res.result(http::status::internal_server_error);
      }
    }

    res.prepare_payload();

    lambda_(std::move(res));
  }

  void on_write(boost::system::error_code ec, std::size_t bytes_transferred, bool close) {
    boost::ignore_unused(bytes_transferred);

    if (ec) return fail(ec, "write");

    if (close) {
      // This means we should close the connection, usually because
      // the response indicated the "Connection: close" semantic.
      return do_close();
    }

    res_ = nullptr;  // We're done with the response so delete it
    do_read();       // Read another request
  }

  void do_close() {
    // Send a TCP shutdown
    boost::system::error_code ec;
    socket_.shutdown(tcp::socket::shutdown_send, ec);

    // At this point the connection is closed gracefully
  }
};

// Accepts incoming connections and launches the sessions
class listener : public std::enable_shared_from_this<listener> {
  tcp::acceptor acceptor_;
  tcp::socket socket_;
  plugins::json_rpc::json_rpc_plugin *_api;

 public:
  listener(boost::asio::io_context &ioc, tcp::endpoint endpoint, plugins::json_rpc::json_rpc_plugin *api) : acceptor_(ioc), socket_(ioc), _api(api) {
    boost::system::error_code ec;

    acceptor_.open(endpoint.protocol(), ec);  // Open the acceptor
    if (ec) {
      fail(ec, "open");
      return;
    }

    acceptor_.set_option(boost::asio::socket_base::reuse_address(true));  // Allow address reuse
    if (ec) {
      fail(ec, "set_option");
      return;
    }

    acceptor_.bind(endpoint, ec);  // Bind to the server address
    if (ec) {
      fail(ec, "bind");
      return;
    }

    // Start listening for connections
    acceptor_.listen(boost::asio::socket_base::max_listen_connections, ec);
    if (ec) {
      fail(ec, "listen");
      return;
    }
  }

  // Start accepting incoming connections
  void run() {
    if (!acceptor_.is_open()) return;
    do_accept();
  }

  void do_accept() { acceptor_.async_accept(socket_, std::bind(&listener::on_accept, shared_from_this(), std::placeholders::_1)); }

  void on_accept(boost::system::error_code ec) {
    if (ec) {
      fail(ec, "accept");
    } else {
      std::make_shared<session>(std::move(socket_), _api)->run();  // Create the session and run it
    }

    do_accept();  // Accept another connection
  }
};

class webserver_plugin_impl {
 public:
  webserver_plugin_impl(uint16_t thread_pool_size) : _thread_pool_size(thread_pool_size) {
//    for (uint32_t i = 0; i < thread_pool_size; ++i) thread_pool.create_thread(boost::bind(&asio::io_context::run, &thread_pool_ios));
  }

  void start_webserver();

  void stop_webserver();

//  void handle_http_message(websocket_server_type *, connection_hdl);

  shared_ptr<listener> http_thread;
  optional<tcp::endpoint> http_endpoint;

  uint16_t _thread_pool_size = 2;
  asio::io_context ioc{_thread_pool_size};

  plugins::json_rpc::json_rpc_plugin *api;
  boost::signals2::connection chain_sync_con;
};

void webserver_plugin_impl::start_webserver() {
  if (http_endpoint) {
    // http_server.set_reuse_addr(true);
    // http_server.set_http_handler(boost::bind(&webserver_plugin_impl::handle_http_message, this, &http_server, _1));

    ilog("start processing http thread");
    try {
      // Create and launch a listening port
      http_thread = std::make_shared<listener>(ioc, http_endpoint.get(), api);
      http_thread->run();

      // Run the I/O service on the requested number of threads
      std::vector<std::thread> v;
      v.reserve(_thread_pool_size - 1);
      for (auto i = _thread_pool_size - 1; i > 0; --i) v.emplace_back([this] { ioc.run(); });
      ioc.run();

      ilog("http io_context exit");
    } catch (...) {
      elog("error thrown from http io service");
    }
  }
}

void webserver_plugin_impl::stop_webserver() {
  ioc.stop();
}

//void webserver_plugin_impl::handle_http_message(websocket_server_type *server, connection_hdl hdl) {
//  auto con = server->get_con_from_hdl(hdl);
//  con->defer_http_response();
//
//  thread_pool_ios.post([con, this]() {
//
//    websocketpp::uri_ptr uri = con->get_uri();
//    string resource = uri->get_resource();
//    string query = uri->get_query();
//
//    ilog("handle_http_message resource=${resource}, query=${query}", ("resource", resource)("query", query));
//
//    auto body = con->get_request_body();
//
//    try {
//      con->set_body(api->call(body));
//      con->set_status(websocketpp::http::status_code::ok);
//    } catch (fc::exception &e) {
//      edump((e));
//      con->set_body("Could not call API");
//      con->set_status(websocketpp::http::status_code::not_found);
//    } catch (...) {
//      auto eptr = std::current_exception();
//
//      try {
//        if (eptr) std::rethrow_exception(eptr);
//
//        con->set_body("unknown error occurred");
//        con->set_status(websocketpp::http::status_code::internal_server_error);
//      } catch (const std::exception &e) {
//        std::stringstream s;
//        s << "unknown exception: " << e.what();
//        con->set_body(s.str());
//        con->set_status(websocketpp::http::status_code::internal_server_error);
//      }
//    }
//
//    con->send_http_response();
//  });
//}

}  // namespace detail

webserver_plugin::webserver_plugin() {}

webserver_plugin::~webserver_plugin() {}

void webserver_plugin::set_program_options(options_description &, options_description &cfg) {
  // clang-format off
  cfg.add_options(
    )(
        "webserver-http-endpoint", bpo::value<string>(), "Local http endpoint for webserver requests."
    )(
        "webserver-thread-pool-size", bpo::value<uint16_t>()->default_value(2), "Number of threads used to handle queries. Default: 2."
    );
  // clang-format on
}

void webserver_plugin::plugin_initialize(const variables_map &options) {
  ilog("Initializing webserver plugin");

  auto thread_pool_size = options.at("webserver-thread-pool-size").as<uint16_t>();
  FC_ASSERT(thread_pool_size > 0, "webserver-thread-pool-size must be greater than 0");
  ilog("configured with ${tps} thread pool size", ("tps", thread_pool_size));
  my.reset(new detail::webserver_plugin_impl(thread_pool_size));

  if (options.count("webserver-http-endpoint")) {
    auto http_endpoint = options.at("webserver-http-endpoint").as<string>();
    auto endpoints = fc::resolve_string_to_ip_endpoints(http_endpoint);
    FC_ASSERT(endpoints.size(), "webserver-http-endpoint ${hostname} did not resolve", ("hostname", http_endpoint));
    my->http_endpoint = tcp::endpoint(boost::asio::ip::address_v4::from_string((string)endpoints[0].get_address()), endpoints[0].port());
    ilog("configured http to listen on ${ep}", ("ep", endpoints[0]));
  }
}

void webserver_plugin::plugin_startup() {
  my->api = appbase::app().find_plugin<plugins::json_rpc::json_rpc_plugin>();
  FC_ASSERT(my->api != nullptr, "Could not find API Register Plugin");

  plugins::chain::chain_plugin *chain = appbase::app().find_plugin<plugins::chain::chain_plugin>();
  if (chain != nullptr && chain->get_state() != appbase::abstract_plugin::started) {
    ilog("Waiting for chain plugin to start");
    my->chain_sync_con = chain->on_sync.connect(0, [this]() { my->start_webserver(); });
  } else {
    my->start_webserver();
  }
}

void webserver_plugin::plugin_shutdown() {
  ilog("webserver_plugin::plugin_shutdown");
  my->stop_webserver();
}

}  // namespace webserver
}  // namespace plugins
}  // namespace blurt
