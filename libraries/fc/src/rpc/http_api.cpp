#include <fc/rpc/http_api.hpp>
#include <fc/network/http/http_client.hpp>

namespace fc {
namespace rpc {

http_api_connection::~http_api_connection() {}

http_api_connection::http_api_connection(std::string jsonrpc_url) {
  _url_str = jsonrpc_url;

  _rpc_state.add_method("call", [this](const variants &args) -> variant {
    // TODO: This logic is duplicated between http_api_connection and websocket_api_connection
    // it should be consolidated into one place instead of copy-pasted
    FC_ASSERT(args.size() == 3 && args[2].is_array());
    api_id_type api_id;
    if (args[0].is_string()) {
      variants subargs;
      subargs.push_back(args[0]);
      variant subresult = this->receive_call(1, "get_api_by_name", subargs);
      api_id = subresult.as_uint64();
    } else
      api_id = args[0].as_uint64();

    return this->receive_call(api_id, args[1].as_string(), args[2].get_array());
  });

  _rpc_state.add_method("notice", [this](const variants &args) -> variant {
    FC_ASSERT(args.size() == 2 && args[1].is_array());
    this->receive_notice(args[0].as_uint64(), args[1].get_array());
    return variant();
  });

  _rpc_state.add_method("callback", [this](const variants &args) -> variant {
    FC_ASSERT(args.size() == 2 && args[1].is_array());
    this->receive_callback(args[0].as_uint64(), args[1].get_array());
    return variant();
  });

  _rpc_state.on_unhandled([&](const std::string &method_name, const variants &args) { return this->receive_call(0, method_name, args); });
}

variant http_api_connection::send_call(api_id_type api_id, string method_name, variants args /* = variants() */) {
  // HTTP has no way to do this, so do nothing
  return variant();
}

variant http_api_connection::send_call(string api_name, string method_name, variants args /* = variants() */) {
  try {
    fc::rpc::request req{"2.0", uint64_t(0), "call", {std::move(api_name), std::move(method_name), std::move(args)}};
    fc::string str_req = fc::json::to_string(req);
    //            ilog("req=${req}", ("req", req));
    //         ilog("str_req=${str_req}", ("str_req", str_req));
    fc::http::http_client client;
    std::string res_body = client.jsonrpc(_url_str, str_req);
    //            ilog("res_body=${res_body}", ("res_body", res_body));
    fc::variant var = fc::json::from_string(res_body);

    auto reply = var.as<fc::rpc::response>();

    fc::variant v;
    if (reply.result) {
      v = fc::variant(*reply.result);
    } else if (reply.error) {
      v = fc::variant(exception_ptr(new FC_EXCEPTION(exception, "${error}", ("error", reply.error->message)("data", reply))));
    } else {
      v = fc::variant();
    }

    return v;
  } catch (...) {
    //
  }

  return variant();
}

variant http_api_connection::send_callback(uint64_t callback_id, variants args /* = variants() */) {
  // HTTP has no way to do this, so do nothing
  return variant();
}

void http_api_connection::send_notice(uint64_t callback_id, variants args /* = variants() */) {
  // HTTP has no way to do this, so do nothing
  return;
}

void http_api_connection::on_request(const fc::http::request &req, const fc::http::server::response &resp) {
  // this must be called by outside HTTP server's on_request method
  std::string resp_body;
  http::reply::status_code resp_status;

  try {
    resp.add_header("Content-Type", "application/json");
    std::string req_body(req.body.begin(), req.body.end());
    auto var = fc::json::from_string(req_body);
    const auto &var_obj = var.get_object();

    if (var_obj.contains("method")) {
      auto call = var.as<fc::rpc::request>();
      try {
        try {
          auto result = _rpc_state.local_call(call.method, call.params);
          resp_body = fc::json::to_string(fc::rpc::response(*call.id, result));
          resp_status = http::reply::OK;
        }
        FC_CAPTURE_AND_RETHROW((call.method)(call.params));
      } catch (const fc::exception &e) {
        resp_body = fc::json::to_string(fc::rpc::response(*call.id, error_object{1, e.to_detail_string(), fc::variant(e)}));
        resp_status = http::reply::InternalServerError;
      }
    } else {
      resp_status = http::reply::BadRequest;
      resp_body = "";
    }
  } catch (const fc::exception &e) {
    resp_status = http::reply::InternalServerError;
    resp_body = "";
    wdump((e.to_detail_string()));
  }

  try {
    resp.set_status(resp_status);
    resp.set_length(resp_body.length());
    resp.write(resp_body.c_str(), resp_body.length());
  } catch (const fc::exception &e) {
    wdump((e.to_detail_string()));
  }
  return;
}

}  // namespace rpc
}  // namespace fc
