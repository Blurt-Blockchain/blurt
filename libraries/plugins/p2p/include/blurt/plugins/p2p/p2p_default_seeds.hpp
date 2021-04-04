#pragma once

#include <vector>

namespace blurt { namespace plugins { namespace p2p {

#ifdef IS_TEST_NET
const std::vector< std::string > default_seeds;
#else
const std::vector< std::string > default_seeds = {
   "78.46.137.254:2001",     //seednode1
   "88.198.76.136:2001",     //seednode2
   "135.181.36.90:1776",  // rpc
   "159.69.50.171:1776",  // rpc2
   "138.201.152.77:1776",  //rpc3
   "78.47.190.108:1776",    //rpc4
   "207.244.233.24:1776",   //opfergnome aka nerdtopiade
   "209.126.86.39:1776",   //michelangelo3
   "209.145.58.159:1776",  //blurtlatam
   "blurt-seed1.saboin.com:1776",  //saboin
   "blurt-seed2.saboin.com:1776"   //saboin
};
#endif

} } } // blurt::plugins::p2p
