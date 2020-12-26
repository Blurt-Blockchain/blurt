#pragma once

#include <vector>

namespace blurt { namespace plugins { namespace p2p {

#ifdef IS_TEST_NET
const std::vector< std::string > default_seeds;
#else
const std::vector< std::string > default_seeds = {
   "10.144.187.8:2001",     //seednode1
   "10.144.79.46:2001",     //seednode2
   "10.144.26.249:1776",    //ztfull
   "10.144.240.207:1776",   //ztfull-1
   "10.144.56.18:1776"      // ztfull-2
};
#endif

} } } // blurt::plugins::p2p
