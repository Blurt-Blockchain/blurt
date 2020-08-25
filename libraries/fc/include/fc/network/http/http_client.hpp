#pragma once

#include <boost/beast/core.hpp>
#include <boost/beast/http.hpp>
#include <boost/beast/version.hpp>

#include <iostream>
#include <string>

namespace fc {
   namespace http {

      namespace detail { class http_client_impl; }

      class http_client {
      public:
         http_client();

         virtual ~http_client();


         std::string jsonrpc(const std::string &url, const std::string &body);

      private:
         std::unique_ptr<detail::http_client_impl> my;
      };
   }
}