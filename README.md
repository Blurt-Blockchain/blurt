# Blurt 

Blurt is a public social blockchain with a diverse and vibrant community that strictly upholds [property rights](https://twitter.com/cz_binance/status/1236373815447506945?s=20).

## Features

* Remove the downvote function. 

## Launch Plans

* Blurt is a fork of the Steem blockchain that begins operating on July 4th, 2020. 

## Centralization

* A regent account with a controlling stake or special weighted vote is added to the blockchain at the time of the fork. 

* The regent account votes on consensus Blurt Producers and DAO proposals. 

* **The regent account does not impact**:
  * circulating supply
  * new inflation A.K.A. organic supply
  * the rewards pool. 

## Decentralization

* The regent account will be programmed to decay to zero or just simply cease to exist after two years, the exact methodology is yet to be determined.
* Prior to deprecating the regent account, the Blurt blockchain will be updated to feature secure consensus protocols, such as One-Stake-One-Vote, to reduce the risk of centralised consensus attacks from large stake accounts.  


## Economy

* Ticker symbol BLURT
* Staked BLURT is called BLURT POWER
* There is no stable coin on the Blurt Blockchain. SBD balances are converted to their STEEM equivalent when the snapshot is taken.
* Initally, Blurt uses Graphene Delegated Proof-of-Stake Consensus (DPOS)
* 10% APR inflation narrowing to 1% APR over 20 years
    * 65% of inflation to Authors/Curators. 
    * 15% of inflation to Stakeholders.
    * 10% of inflation to Blurt Producers.
    * 10% of inflation to Blurt DAO Fund. 
    

## Software Status

This repository currently contains a fork of the Steem blockchain code.  Blurt will launch as a fork of the state of Steem on July 4, 2020.  If you compiled this software today, you would just be compiling Steem code, so we've removed the compile and deploy instructions for now, but they'll return soon.  

## Build

Do this exactly, and it'll work.  Do otherwise and you may have a bad time.  

Spin up an Ubuntu 16.04 Virtual Machine with 16GB of RAM.  Then, run:

```
apt-get update 
apt install git autoconf automake cmake g++ git libbz2-dev libsnappy-dev libssl-dev libtool make pkg-config python3 python3-jinja2 doxygen libboost-chrono-dev libboost-context-dev libboost-coroutine-dev libboost-date-time-dev libboost-filesystem-dev libboost-iostreams-dev libboost-locale-dev libboost-program-options-dev libboost-serialization-dev libboost-signals-dev libboost-system-dev libboost-test-dev libboost-thread-dev libncurses5-dev libreadline-dev perl
git clone https://gitlab.com/blurt/blurt
cd blurt
git submodule update --init --recursive
mkdir build
cd build
cmake -DCMAKE_BUILD_TYPE=Release ..
make -j$(nproc) steemd
make -j$(nproc) cli_wallet
  ```




