# Blurt

[![pipeline status](https://gitlab.com/blurt/blurt/badges/dev/pipeline.svg)](https://gitlab.com/blurt/blurt/-/commits/dev)
[![coverage report](https://gitlab.com/blurt/blurt/badges/dev/coverage.svg)](https://gitlab.com/blurt/blurt/-/commits/dev)
![Twitter URL](https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Ftwitter.com%2FBlurtOfficial)
[![Steem](https://img.shields.io/badge/-steem-blue)](https://steemit.com/steem/@blurt)
[![Hive](https://img.shields.io/badge/-hive-red)](https://hive.blog/@blurt)


Blurt is a public social blockchain with a diverse and vibrant community that strictly upholds [property rights](https://twitter.com/cz_binance/status/1236373815447506945?s=20).

## Features

* No Downvotes
* No SBD (Steem Backed Dollar) stablecoin
* A **regent account** with a controlling stake or special weighted vote has been added to Blurt. 
  * The regent account votes on consensus Blurt Producers and DAO proposals.
  * The regent account is programmed to decay over a two-year period. 
  * **The regent account does not impact**:
    * circulating supply
    * new inflation A.K.A. organic supply
    * the rewards pool
* **Imported to Blurt From Steem**:
  * Balances - less Steemit stake described in this issue https://gitlab.com/blurt/blurt/-/issues/10
  * SBD balances will be converted to BLURT at the time of snapshot importation 
* **Not Imported to Blurt From Steem**:
  * Content
  * Followers
  * Profile Pic
  * Name
  * Location
  * Pending Claimed Accounts

## Launch Plans

* Blurt is a fork of the Steem blockchain's code that launches on or before July 4th, 2020 with Steem balances taken in a [snapshot](https://gitlab.com/blurt/blurt/-/issues/5) at block 43526969.  


## Decentralization And Security
Blurt(1) the blockchain whose code lives here in this repository is the first step towards realizing [Social Money For Enemies](https://steemit.com/steem/@jacobgadikian/3jk4ut-social-money-for-enemies).
The exclusion at Hive and zeroing (basically on-chain theft executed by some witnesses) at Steemit made for a very interesting testing ground to learn about systems that can effectively secure both money and speech.
POS chains have a certain scalability limit, and  the solution past that point is to go multi-chain and allow content to be accessed from a unified mobile app.  

* Blurt will likely move to another consensus protocol at some point during those two years, and the leading candidate for the new consensus is Tendermint via the Cosmos-SDK. Some other possiblities are being explored, as well. 

## Economy

* Ticker symbol BLURT
* Staked BLURT is called BLURT POWER
* There is no stablecoin on the Blurt Blockchain. SBD balances are converted to their BLURT equivalent when the snapshot is taken.
* Initally, Blurt uses Graphene Delegated Proof-of-Stake Consensus (DPOS)
* 10% APR inflation narrowing to 1% APR over 20 years
    * 65% of inflation to Authors/Curators.
    * 15% of inflation to Stakeholders.
    * 10% of inflation to Blurt Producers.
    * 10% of inflation to Blurt DAO Fund.


## Software Status

Blurt will launch with steem balances from block 43526969 on or before July 4, 2020.   Work is ongoing in the `dev` branch.  
The snapshot-verification code can be found in the `snapshot` branch.  

## Build

Do this exactly, and it'll work.  Do otherwise and you may experience difficulties.

Spin up a Debian 10 Virtual Machine with 16GB of RAM.  Then, run:

```
apt-get update
apt install git autoconf automake cmake g++ git libbz2-dev libsnappy-dev libssl-dev libtool make pkg-config python3 python3-jinja2 doxygen libboost-chrono-dev libboost-context-dev libboost-coroutine-dev libboost-date-time-dev libboost-filesystem-dev libboost-iostreams-dev libboost-locale-dev libboost-program-options-dev libboost-serialization-dev libboost-signals-dev libboost-system-dev libboost-test-dev libboost-thread-dev libncurses5-dev libreadline-dev perl
git clone https://gitlab.com/blurt/blurt
cd blurt
git submodule update --init --recursive
mkdir build
cd build
cmake -DCMAKE_BUILD_TYPE=Release ..
make -j$(nproc) blurtd
make -j$(nproc) cli_wallet
```
