# Blurt

[![pipeline status](https://gitlab.com/blurt/blurt/badges/dev/pipeline.svg)](https://gitlab.com/blurt/blurt/-/commits/dev)
[![coverage report](https://gitlab.com/blurt/blurt/badges/dev/coverage.svg)](https://gitlab.com/blurt/blurt/-/commits/dev)
![Twitter](https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Ftwitter.com%2FBlurtOfficial)
[![Blurt](https://img.shields.io/badge/-Blurt-red)](https://blurt.blog)
[![DeepSource](https://deepsource.io/gl/blurt/blurt.svg/?label=active+issues&show_trend=true)](https://deepsource.io/gl/blurt/blurt/?ref=repository-badge)
[![DeepSource](https://deepsource.io/gl/blurt/blurt.svg/?label=resolved+issues&show_trend=true)](https://deepsource.io/gl/blurt/blurt/?ref=repository-badge)

Blurt is a public social blockchain that uses Larimer-style Dpos, meaning that its code is characterized by heavy use of the Boost C++ libraries, and it uses the fc library for many of its core functions.

## Compile without CI

We've dramatically reduced the dependencies to compile blurt.

#### Linux:

- Clang or gcc
- cmake 3.20 or greater
- ccache

....that's it.

Here's how you do it, assuming a totally fresh system:

```bash
git clone https://gitlab.com/blurt/blurt
cd blurt
mkdir build
cd build
cmake ..
make -j$(nproc) blurtd cli_wallet
```

We use Arch Linux to compile blurt, but that does not mean that you must also use Arch. This should work well on Ubuntu and Debian, as well as others. It should also work on multiple CPU architectures.

#### Mac:

- Clang 12 via xcode-install (don't use brew to get clang you'd have a bad time)
- ccache

```bash
git clone https://gitlab.com/blurt/blurt
cd blurt
mkdir build
cd build
cmake ..
make -j$(nproc) blurtd cli_wallet
```

## Features

- No Downvotes
- [No Stablecoin](https://blurt.world/blurt/@jacobgadikian/blurt-has-no-dollar-stablecoin-why)
- Transaction fees [controlled by witnesses](https://blurt.world/blurt/@jacobgadikian/witnesses-control-fees-on-blurt)
- A **regent account** with a controlling stake or special weighted vote has been added to Blurt.
  - The regent account can vote on Witneses and DAO Proposals.
  - The regent account decays over a two-year period with 24 equal monthly reductions to zero, starting at a power equal to all blurt supply.
  - **The regent account does not impact**:
    - circulating supply
    - inflation
    - reward pool

#### Imported to Blurt From Steem

- STEEM Balances
- SBD balances were converted to BLURT at the chain-reported price of $.26/STEEM from Block 43,526,969
- Usernames
- Public Keys

#### Not Imported to Blurt From Steem

- Content
- Followers
- Profile Pic
- Name
- Location
- Pending Claimed Accounts
- Account Authorizations

## Economy

We feel that all actions that impose costs should themselves have a cost, so that we can avoid becoming a garbage patch.  We're developing features that keep us out of "tragedy of the commons" type situations.

## Software Development

Work is ongoing in the `dev` branch.

The snapshot-verification code can be found in the `snapshot` branch.

Our next milestone is [Hard Fork 3](https://gitlab.com/blurt/blurt/-/milestones/2)

## General Links

- [Official Block Explorer](https://blocks.blurtwallet.com/#/)
- [Community Block Explorer](https://ecosynthesizer.com/blurt)
- [Official Wallet](https://blurtwallet.com/)
- [WhaleVault Keychain Extension](https://chrome.google.com/webstore/detail/whalevault/hcoigoaekhfajcoingnngmfjdidhmdon?hl=en)

## Social Links

- [Bitcointalk](https://bitcointalk.org/index.php?topic=5284933.0)
- [Blurt.blog](https://blurt.blog)
- [Discord](https://discord.blurt.world)
- [Facebook Group](https://www.facebook.com/groups/blurtofficial)
- [Facebook Page](https://www.facebook.com/Blurt-106190134629628)
- [Telegram](https://t.me/blurtofficialchat)
- [Twitter](https://twitter.com/BlurtOfficial)
- [Youtube](https://youtube.com/channel/UCuktvTIxkdejKg_xWMz2vlQ)

## Exchange Listings

- [Beldex.io](https://www.beldex.io/tradeAdvance?pair=BLURT_BTC)
- [Ionomy.com](https://ionomy.com/en/markets/btc-blurt)
- [Hive-engine.com](https://hive-engine.com/?p=market&t=BLURT)
- [Leodex.io](https://leodex.io/market/BLURT)
- [Probit.com](https://www.probit.com/app/exchange/BLURT-BTC)
- [Steem-engine.com](https://steem-engine.com/?p=market&t=BLURT)
- [Stex.com](https://app.stex.com/en/trade/pair/BTC/BLURT/1D)
- [Swaptoken.com](https://swaptoken.com/)

## Indexers

- [Blockfolio.com](https://blockfolio.com/coin/BLURT)
- [Coincodex.com](https://coincodex.com/crypto/blurt/)
- [Coingecko.com](https://www.coingecko.com/en/coins/blurt)
- [CoinJab.com](https://coinjab.com/asset/BLURT)
- [Coinmarketcap.com](https://coinmarketcap.com/currencies/blurt/)
- [Coinpaprika.com](https://coinpaprika.com/coin/blurt-blurt/)
- [Currency.world](https://currency.world/currencies/BLURT)
- [Livecoinwatch.com](https://www.livecoinwatch.com/price/Blurt-BLURT)
- [Worldcoinindex.com](https://www.worldcoinindex.com/coin/blurt)
- [Xangle.io](https://xangle.io/project/BLURT/key-info)

## Documentation

[Developers](doc/devs/README.md)

[Public Nodes](doc/devs/networknodes.md)

[Exchanges](doc/exchanges/README.md)

[Witnesses](doc/witnesses/README.md)
