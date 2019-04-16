#include <fc/network/http/http_client.hpp>
#include <fc/network/url.hpp>
#include <fc/log/logger.hpp>

#include <boost/test/unit_test.hpp>
#include <boost/asio.hpp>
#include <boost/beast/core.hpp>
#include <boost/beast/http.hpp>
#include <boost/beast/version.hpp>

#include <iostream>
#include <string>

#include <fc/crypto/hex.hpp>

BOOST_AUTO_TEST_SUITE(fc_network)

   BOOST_AUTO_TEST_CASE(http_client_test) {



      fc::http::http_client client;

//      {
//         BOOST_TEST_MESSAGE("--- Test https get");
//         std::string res_body = client.request("https://jsonplaceholder.typicode.com/todos/1");
//         std::string expected_res("{\n  \"userId\": 1,\n  \"id\": 1,\n  \"title\": \"delectus aut autem\",\n  \"completed\": false\n}");
//
////         ilog("res_body=${res_body}, hex=${hex}, expected_res=${expected_res}",
////              ("res_body", res_body)
////                 ("hex", fc::to_hex(res_body.c_str(), res_body.length()))
////                 ("expected_res", fc::to_hex(expected_res.c_str(), expected_res.length()))
////         );
//
//         BOOST_CHECK_EQUAL(res_body, expected_res);
//      }

//      {
//         BOOST_TEST_MESSAGE("--- Test http get");
//         std::string res_body = client.request(boost::beast::http::verb::get, "https://jsonplaceholder.typicode.com/todos/1");
//         std::string expected_res("{\n  \"userId\": 1,\n  \"id\": 1,\n  \"title\": \"delectus aut autem\",\n  \"completed\": false\n}");
//         BOOST_CHECK_EQUAL(res_body, expected_res);
//      }

//      {
//         BOOST_TEST_MESSAGE("--- Test http jsonrpc");
//         std::string post_body = "{\"title\":\"foo\",\"body\":\"bar\",\"userId\":1}";
//         std::string res_body = client.jsonrpc("http://jsonplaceholder.typicode.com/posts", post_body);
////         ilog("res_body=${res_body}", ("res_body", res_body));
//         BOOST_CHECK_EQUAL(res_body, "{\n  \"id\": 101\n}");
//      }
//
//      {
//         BOOST_TEST_MESSAGE("--- Test https jsonrpc");
//         std::string post_body = "{\"title\":\"foo\",\"body\":\"bar\",\"userId\":1}";
//         std::string res_body = client.jsonrpc("https://jsonplaceholder.typicode.com/posts", post_body);
////         ilog("res_body=${res_body}", ("res_body", res_body));
//         BOOST_CHECK_EQUAL(res_body, "{\n  \"id\": 101\n}");
//      }

      {
         BOOST_TEST_MESSAGE("--- Test https://pubrpc.whaleshares.io/");
         std::string post_body = "{\"jsonrpc\":\"2.0\",\"id\":0,\"method\":\"call\",\"params\":[\"database_api\",\"get_dynamic_global_properties\",[]]}";
         std::string res_body = client.jsonrpc("https://pubrpc.whaleshares.io/", post_body);
         ilog("res_body=${res_body}", ("res_body", res_body));
         std::string expected_res("{\"jsonrpc\":\"2.0\",\"result\":{\"id\":0,\"head_block_n...");
         BOOST_CHECK_EQUAL(res_body.substr(0, 10), expected_res.substr(0,10));
      }

   }


BOOST_AUTO_TEST_SUITE_END()