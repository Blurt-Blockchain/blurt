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
   "10.144.56.18:1776",     //ztfull-2
   "10.144.21.141:1776",    //yehey
   "10.144.207.39:1776",    //ilnegro
   "10.144.217.26:1776",    //kamikaze
   "10.144.67.236:1776",    //megadrive
   "10.144.199.222:1776",   //zahid
   "10.144.243.46:1776",    //freakeao
   "10.144.209.159:1776",   //ilnegro
   "10.144.252.215:1776",   //opfergnome
   "10.144.202.98:1776",    //ionomy
   "10.144.148.134:1776",   //yehey
   "10.144.158.221:1776",   //eastmael
   "10.144.171.119:1776",   //nelkeljdm
   "10.144.135.79:1776",    //peerchemist
   "10.144.101.78:1776",    //Tomoyan
   "10.144.240.142:1776",   //Trev03
   "10.144.9.105:1776",     //yehey
   "10.144.110.160:1776",   //rpc-1
   "10.144.229.213:1776",   //afrog
   "10.144.186.251:1776",   //LaPigvino
   "10.144.150.238:1776",   //jacobgadikian 
   "10.144.132.174:1776",   //jakemlim
   "10.144.88.241:1776",    //saboin
   "10.144.254.63:1776",    //yehey
   "10.144.9.104:1776",     //eastmael
   "10.144.178.53:1776",    //techoderx
   "10.144.9.219:1776",     //Saboin
   "10.144.58.86:1776",     //Nerdtopiade
   "10.144.112.241:1776",   //rpc
   "10.144.113.85:1776",    //megadrive
   "10.144.24.154:1776",    //rpc-2
   "10.144.99.124:1776",    //jakemlim
   "10.144.136.13:1776",    //rpc-3
   "10.144.86.38:1776"      //blurtpower
};
#endif

} } } // blurt::plugins::p2p
