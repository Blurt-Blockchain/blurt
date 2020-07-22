# Blurt

[![pipeline status](https://gitlab.com/blurt/blurt/badges/dev/pipeline.svg)](https://gitlab.com/blurt/blurt/-/commits/dev)
[![coverage report](https://gitlab.com/blurt/blurt/badges/dev/coverage.svg)](https://gitlab.com/blurt/blurt/-/commits/dev)
![Twitter URL](https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Ftwitter.com%2FBlurtOfficial)
[![Steem](https://img.shields.io/badge/-steem-blue)](https://steemit.com/steem/@blurt)
[![Hive](https://img.shields.io/badge/-hive-red)](https://hive.blog/@blurt)

Blurt is a public social blockchain with a diverse and vibrant community that strictly upholds [property rights](https://twitter.com/cz_binance/status/1236373815447506945?s=20).
Blurt contains balances imported from Block 4352**6969**.  

## Features
* No Downvotes
* [No Stablecoin](https://blurt.world/blurt/@jacobgadikian/blurt-has-no-dollar-stablecoin-why)
* Transaction fees [controlled by witnesses](https://blurt.world/blurt/@jacobgadikian/witnesses-control-fees-on-blurt)
* A **regent account** with a controlling stake or special weighted vote has been added to Blurt. 
  * The regent account can vote on Witneses and DAO Proposals.
  * The regent account decays over a two-year period with 24 equal monthly reductions to zero, starting at a power equal to all blurt supply. 
  * **The regent account does not impact**:
    * circulating supply
    * inflation
    * reward pool
    
#### Imported to Blurt From Steem
  * STEEM Balances
  * SBD balances were converted to BLURT at the chain-reported price of $.26/STEEM from Block 43,526,969
  * Usernames
  * Public Keys
  
#### Not Imported to Blurt From Steem
  * Content
  * Followers
  * Profile Pic
  * Name
  * Location
  * Pending Claimed Accounts
  * Account Authorizations

## Economy
* We adhere to [Austrian Economics](https://mises.org/profile/murray-n-rothbard)
* Our Currency is called BLURT
* Staked BLURT is called BLURT POWER.
* Blurt uses Graphene Delegated Proof-of-Stake Consensus (DPOS), and is looking into alternatives like Cosmos-SDK / Tenderrmint.
* 10% APR inflation narrowing to 1% APR over 20 years
    * 65% of inflation to Authors/Curators.
    * 15% of inflation to Stakeholders.
    * 10% of inflation to Blurt Producers.
    * 10% of inflation to Blurt DAO Fund.


## Status
Blurt enjoyed a smooth launch with large participation from witnesses on July 4, 2020.  

Shortly after launch, two bugs were discovered: 

**~~Resource Credits~~**

The resource credit bug allowed for unrestricted writes to the Blurt blockchain, and this was exploited by the account `@social` to post hundreds of thousands prepared 64kb comments whose sole contents was a GIF of a penis or jpg of two men deeply enjoying one another's company. 
After consulting with the community, HF1, which introduced [fees controlled by witnesses](https://blurt.world/blurt/@jacobgadikian/witnesses-control-fees-on-blurt) was released. 
Witnesses have currently stabilized fees at 0.001 BLURT per operation and 0.1 BLURT per kilobyte.    We consider the Resource credit bug to be fully mitigated, and will remove resource credits from Blurt in [Hard Fork 2](https://gitlab.com/blurt/blurt/-/milestones/2). 

**Rewards**

The convergent linear reward curve currently used by BLURT is malfunctioning.  Rewards will be fixed in [Hard Fork 2](https://gitlab.com/blurt/blurt/-/milestones/2), which will be released ~August 1, 2020. 

## Software Development
Work is ongoing in the `dev` branch.  

The snapshot-verification code can be found in the `snapshot` branch.  

Our next milestone is [Hard Fork 2](https://gitlab.com/blurt/blurt/-/milestones/2)

## Documentation

[Developers](doc/devs/README.md)

[Exchanges](doc/exchanges/README.md)

[Witnesses](doc/witnesses/README.md)

## Exchange Tracker

### Centralized Exchanges That Listed Steem at Block 43,526,969 and are in posession of airdrop funds

| Exchange   | Airdrop Funds  | Airdrop Funds Status  | Listed?  | Fee Requested?  | Fee Amount   | Point of Contact | Conversation   |
|---|---|---|---|---|---|---|---|
| Ionomy      | 42731.888 BLURT  | In Progress  |  YES | NO |  0 | E-mail, Discord | Yes |
| Bithumb       |   | HELD  |   |   |   |   |   |
| Upbit       |   | HELD  |   |   |   |   |   |
| Gopax       |   | HELD  |   |   |   |   |   |
| Bittrex     |   | HELD  |   |   |   |   |   |
| Binance     |   | HELD  |   |   |   |   |   |
| Huobi       |   | HELD  |   |   |   |   |   |
| Probit      | YES  | HELD  | NO  | YES  | 1 BTC + 1 BTC of BLURT  |    |
| Poloinex    |   | HELD  |   |   |   |   |   |
| Bitflyer    |   | HELD  |   |   |   |   |   |
| Daybit      |   | HELD  |   |   |   |   |   |
| Sistemkoin  |   | HELD  |   |   |   |   |   |
| Kraken      |   | HELD  |   |   |   |   |   |
| Okex        |   | HELD  |   |   |   |   |   |

The Blurt community is deeply grateful to Ionomy for their intention to honor the Blurt airdrop on holders of STEEM from block 43,526,969.

### Centralized Exchanges that didn't list Steem at block 43,526,969 and are not in posession of airdrop funds
| Exchange   |  Listed?  | Fee Requested?  | Fee Amount   | Requested By | Handling |
|---|---|---|---|---|---|
| Cointiger   | NO  | YES  | 5 BTC + BLURT for giveaway  |  empato365  | empato365 |
| Coinbase    | NO | NO | N/A |  
| Indodax |   |   |     |    |   
| [rekenningku](https://www.rekeningku.com) |   |    | 

### Decentralized Exchanges

| Exchange   | Listed?  | Fee  | Fee Amount   | Responsible Party |
|---|---|---|---|---|
| Binance DEX  | NO  | List tx fee  | 1000 BNB   |  N/A   |
| Uniswap     |  NO | NO  | ERC20 Token Creation + Contract Creation   | N/A |
| Hive Engine  | YES  | YES  | 100 HIVE for BLURT ticker  | @daking | 
| Steem Engine  | NO  | YES  | 100 STEEM for BLURT ticker  | N/A | 
| Incognito DEX  | NO  | N/A  | tiny  | N/A |
| Poloni DEX | NO | ? | ? | N/A |
| NewDEX | NO | ? | ? | N/A |
| IDEX | NO | ? | ? | N/A |
| Kyber | NO | ? | ? | N/A |

The Blurt community is deeply grateful to @daking for maintaining the @blurtlink serrvice that connects Blurt to Hive Engine.
