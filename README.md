# Blurt

[![pipeline status](https://gitlab.com/blurt/blurt/badges/dev/pipeline.svg)](https://gitlab.com/blurt/blurt/-/commits/dev)
[![coverage report](https://gitlab.com/blurt/blurt/badges/dev/coverage.svg)](https://gitlab.com/blurt/blurt/-/commits/dev)
![Twitter](https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Ftwitter.com%2FBlurtOfficial)
[![Blurt](https://img.shields.io/badge/-Blurt-red)](https://blurt.blog)
[![DeepSource](https://deepsource.io/gl/blurt/blurt.svg/?label=active+issues&show_trend=true)](https://deepsource.io/gl/blurt/blurt/?ref=repository-badge)
[![DeepSource](https://deepsource.io/gl/blurt/blurt.svg/?label=resolved+issues&show_trend=true)](https://deepsource.io/gl/blurt/blurt/?ref=repository-badge)

Blurt is a public social blockchain with a diverse and vibrant community that strictly upholds [property rights](https://twitter.com/cz_binance/status/1236373815447506945?s=20).

The Blurt blockchain is defined as social media and builds a living, breathing, and growing social economy and communities where users are getting rewarded by curators for sharing their origin content. Blurt provides a scalable blockchain protocol for publicly accessible and immutable content, along with a fast digital currency (BLURT) which enables people to earn by using their brain (A.K.A. “Proof-of-Brain”).

## Compile without CI

We've dramatically reduced the dependencies to compile blurt.

#### Linux:

- Clang 11 or higher
- Conan.io
- ccache

....that's it.

Here's how you do it, assuming a totally fresh system:

```bash
git clone https://gitlab.com/blurt/blurt
cd blurt
cp contrib/conan-profile/default ~/.conan/profiles/default
cat ~/.conan/profiles/default #Do this and check that the architecture is right for how you want to build it.  amd64 and arm64 officially supported.  armv5,6,7 should work.
mkdir build
cd build
conan install ..
cmake ..
make -j$(nproc) blurtd cli_wallet
```

We use Arch Linux to compile blurt, but that does not mean that you must also use Arch. This should work well on Ubuntu and Debian, as well as others. It should also work on multiple CPU architectures.

#### Mac:

- Clang 12 via xcode-install (don't use brew to get clang you'd have a bad time)
- conan.io, `brew install conan`
- ccache

```bash
git clone https://gitlab.com/blurt/blurt
cd blurt
cp contrib/conan-profile/default-mac ~/.conan/profiles/default
cat ~/.conan/profiles/default-mac #Do this and check that the architecture is right for how you want to build it.  amd64 and arm64 officially supported.  armv5,6,7 should work.  Should work on apple M1 processors.
mkdir build
cd build
conan install ..
cmake ..
make -j$(nproc) blurtd cli_wallet
```

#### Windows

100,000 Blurt Bouty for the creation of a guide like the one above for windows. Our devs generally don't touch it.

## Development

Blurt is being converted to a monorepo, with the goal of distributing Blurt as a Mac, Windows, and Linux [electron](http://electronjs.org/) app (think like Slack, which is actually just chrome running a webapp). At that time, blurt will be entirely freed from the cloud, and even the tyranny of the current DNS system. Anyone with sufficient access to the internet, will be able to use blurt.

## 569

As discussed previously, the graphene codebase Blurt is based on shows its age. 569 is a network of chains that share a common code base, and many of them will have their genesis state seeded based on staked Blurt. The first of these 569 projects is called `splash` and it will launch ASAP (tm). The first snapshot of accounts will be taken February 28, 2021. Accounts are migrated at the sole discretion of the Blurt foundation.

## Distribution

- Blurt contains user balances imported from Block 4352**6969** of the STEEM public blockchain, snapshotted on the 20th May 2020.
- Approx 15% or ~60 Million BLURT from the initial supply shall be allocated to the Blurt SocialGraph Foundation (See [@initblurt](https://blocks.blurtwallet.com/#/@initblurt) / [@socialgraph](https://blocks.blurtwallet.com/#/@socialgraph) blockchain accounts).
- SPS DAO public fund account balance was carried over to BLURT and renamed as [@blurt.dao](https://blocks.blurtwallet.com/#/@blurt.dao). Initially the SocialGraph Foundation will steward this fund and gradually had it over to community control as the platform matures.

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

- We adhere to [Austrian Economics](https://mises.org/profile/murray-n-rothbard)
- Our Currency is called BLURT
- Staked BLURT is called BLURT POWER.
- Blurt uses Graphene Delegated Proof-of-Stake Consensus (DPOS), and is looking into alternatives like Cosmos-SDK / Tenderrmint.
- 10% APR inflation narrowing to 1% APR over 20 years
  - 65% of inflation to Authors/Curators.
  - 15% of inflation to Stakeholders.
  - 10% of inflation to Blurt Producers (Witnesses).
  - 10% of inflation to Blurt DAO Fund.

## Status

Blurt enjoyed a smooth launch with large participation from witnesses on July 4, 2020.

Work currently has over 50 witnesses and a healthy user population.

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
