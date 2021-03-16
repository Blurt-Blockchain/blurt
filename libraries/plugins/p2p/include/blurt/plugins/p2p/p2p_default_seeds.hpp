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
   "192.168.195.186:1776",    //ilnegro
   "192.168.195.209:1776",   //megadrive
   "192.168.195.172:1776",     //zahid
   "192.168.195.140:1776",    //imrransoudagar
   "192.168.195.2:1776",    //freakeao
   "192.168.195.160:1776",    //kamikaze
   "192.168.195.117:1776",    //saboin
   "192.168.195.61:1776",   //ionomy
   "192.168.195.141:1776",    //trev03
   "192.168.195.119:1776",   //Nelkeljdm
   "192.168.195.95:1776",   //kilajaem
   "192.168.195.145:1776",    //empato365
   "192.168.195.66:1776",   //opfergnome aka nerdtopiade
   "207.244.233.24:1776",   //opfergnome aka nerdtopiade
   "192.168.195.89:1776",   //blurthispano
   "192.168.195.96:1776",   //oopsiepoopsie
   "192.168.195.48:1776",    //kamrankplyloy
   "192.168.195.234:1776",    //Zahid
   "192.168.195.127:1776",   //eastmael
   "192.168.195.229:1776",     //saboin
   "192.168.195.72:1776",   //notforsale
   "192.168.195.154:1776",   //jakemlim
   "192.168.195.49:1776",   //blurtpower 
   "192.168.195.114:1776",   //jacobgadikian
   "209.145.58.159:1776"  //blurtlatam
};
#endif

} } } // blurt::plugins::p2p
