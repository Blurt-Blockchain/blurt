---
title:  Blurt Witnesses
geometry: margin=2cm
---

# Witnesses

The role of a witness in the Blurt Blockchain is to verify incoming transactions, produce blocks when scheduled, participate in governance.  In addition to this, there is a formal expectation that Witnesses advocate for the Blurt blockchain, review software, and build the Blurt community.  

## Witness Hardware

As many of you are aware, the hardware spec needed for running a Steem witness has grown significantly over the years!  

[privex.io](https://privex.io) currently offers a highly optomized Hive witness setup that they call Node In A Box(TM).

We have had some discussions about a Blurt-Flavored "Node In A Box(TM), so in the long-term as the chain grows, their services may limit your costs.  

Additionally, a non-docker bash script AND a docker-based bash script will be developed and included in this repository.  

Collectively, our goal should be to ensure that we do not run on any single infrastructure provider.  While many of us have a bit of a [bare-metal server fetish](https://gitlab.com/virgohardware/core), the fact is that for Blurt's launch and likely for at least the first six months of Blurt's operation, you're not going to need a huge machine to operate a Witness.  We are considering further optomizations to Blurtd which would permanently lower the RAM consumption on both Witness and Seed nodes, but that's as of yet incomplete.  Here is a [reasonable machine spec](https://whaleshares.io/@faddat/witness-post#@faddat/re-daking-re-faddat-witness-post-20200612t195020198z) that should give you a ton of growing room.  

**Infrastructure Providers**:
What's important here is that everyone is not using only a single provider.  

| **Provider**   |      **Machine Types**      |  **Price** | **Special Feature** |
|----------|-------------|------|------------|
| hetzner.de |  Bare Metal and Cloud |  Competitive | Cheap Bare Metal |
| privex.io |    Bare Metal and Cloud   |  Mid-range | Privacy, Peering, Cryptocurrency Payments, Witness Optomization, Team has steemed since 2016 |
| vultr.com | cloud and bare metal |  Mid-Range | Easy and straightforward |
| digitalocean.com | cloud | mid-range | tutorial ecosystem |
| contabo.com | cloud | low | Price AND one time I saw a contabo node outperform nearly all others in a network stress test situation on the [akash.io](https://akash.io) testnet. |
| Your local hosting provider | bare metal | ? | Diversify the Witness Set |
| GCE | Cloud | high | admin features |
| AWS | Cooud | high | industry leader for infrastructure |



**Machine Spec**:
Your Witness machine spec is entirely **your** choice.  This recommended spec should be relatively low cost ($5-20 per month) and should also run your Blurt Witness very effectively.  


Accurate as of **June 15, 2020**:

**Blurt Witness Spec**

|  Component |  Size     |
|----------|-------------|
| **CPU** |  2+ Cores |
| **RAM** |    4GB   |
| **Storage** | 80+GB |

## Witness Setup Procedure
**Valid for Testnet 1, June 16, 2020:**

Blurt nodes run well on many Linux distributions, but we recommend Debian 10. 

**SSH into your witness node and run:**

```bash
# UPDATE YOUR DEBIAN 10 SYSTEM TO THE LATEST VERSIONS OF PACKAGES
apt update
apt upgrade -y

# INSTALL UNZIP AND WGET
apt install -y unzip wget libbz2-dev libsnappy-dev libncurses5-dev libreadline-dev

# DOWNLOAD BUILD ARTIFACTS
wget https://gitlab.com/blurt/blurt/-/jobs/596005137/artifacts/download

# UNZIP THE BUILD ARTIFACTS, BLURTD AND CLI_WALLET
unzip download

# PUT BLURTD AND CLI_WALLET ON YOUR $PATH
mv build/programs/blurtd/blurtd_witness /usr/bin/blurtd
mv build/programs/cli_wallet/cli_wallet /usr/bin/cli_wallet
rm -rf build
rm download

# ENSURE THAT BLURTD AND CLI_WALLET ARE EXECUTABLE
chmod +x /usr/bin/blurtd
chmod +x /usr/bin/cli_wallet

# MAKE ~/.blurtd AND FILL IT WITH 1.3 MILLION STEEM ACCOUNTS
mkdir /blurtd
wget -O /blurtd/snapshot.json https://test.blurt.world/_download/snapshot.json
wget -O /blurtd/config.ini https://gitlab.com/blurt/blurt/-/blob/dev/doc/witness_config.ini

# INSTALL BLURTD.SERVICE 
wget -O /etc/systemd/system/blurtd.service https://gitlab.com/blurt/blurt/-/raw/dev/doc/blurtd.service

# ENABLE BLURTD SYSTEMD SERVICE
systemctl enable blurtd

# START BLURTD
systemctl start blurtd 

# CHECK ON BLURTD 
systemctl status blurtd

# TODO: run as another user, security, system settings
```

There, now you're running a very nice Blurt Full Node, but you are not yet running a Witness.  In order to run a witness, you'll need to import your Steem active key using the `cli_wallet`.  

So now you'll need to run `cli_wallet`. (type cli_wallet and hit enter)

The first thing you should do is set a password, like:

```
set_password yourpassword
```

You'll also want to `suggest_brain_key`.  

Copy down its entire output and keep it safely.  You'll be using this brain key to control your Witness.  

**import your Steem Active key**

```
import_key 5KABCDEFGHIJKLMNOPQRSTUVXYZ
```
Note: the key should start with a 5

**Add private key to config.ini**

echo "private-key = BRAIN_KEY_PRIVATE_KEY_GOES_HERE" >> ~/.blurtd/config.ini
echo 'witness = "jacobgadikian"' 

**Declare that you're a Witness** 

Go back into the `cli_wallet` and fire off this command, adjusted for your account and public key. 
```
update_witness "jacobgadikian" "https://whaleshares.io/@faddat" "BLT8mBSoVWNcXqsk2PHTfJCxRz9ebJgz8e1WgAnuqQBpTjs9UXqGh" {"account_creation_fee":"3.000 BLURT","maximum_block_size":65536} true
```

Success looks like this:
```json
{
  "ref_block_num": 12141,
  "ref_block_prefix": 747640993,
  "expiration": "2020-06-15T16:54:30",
  "operations": [[
      "witness_update",{
        "owner": "jacobgadikian",
        "url": "https://whaleshares.io/@faddat",
        "block_signing_key": "BLT8mBSoVWNcXqsk2PHTfJCxRz9ebJgz8e1WgAnuqQBpTjs9UXqGh",
        "props": {
          "account_creation_fee": "3.000 BLURT",
          "maximum_block_size": 65536,
          "account_subsidy_budget": 797,
          "account_subsidy_decay": 347321
        },
        "fee": "0.000 BLURT"
      }
    ]
  ],
  "extensions": [],
  "signatures": [
    "1f132ce16452adf8667be7a0bb9bf909396dcea8e21093729a8c1b072fd3ad4f9909aa675a131871b0feb582077ea2b7a78c675155e0125f33c5376c087f2438f7"
  ],
  "transaction_id": "d28314a76b29cfb30e8c8de40c819ae38b538181",
  "block_num": 12142,
  "transaction_num": 0
}
```

It's also a very good idea for you to vote for yourself from the CLI wallet, so that you will begin to make blocks:

```
vote_for_witness gopher23 gopher23 true true
```

Success looks like:

```json
{
  "ref_block_num": 35495,
  "ref_block_prefix": 2258033885,
  "expiration": "2020-06-16T12:23:03",
  "operations": [[
      "account_witness_vote",{
        "account": "gopher23",
        "witness": "gopher23",
        "approve": true
      }
    ]
  ],
  "extensions": [],
  "signatures": [
    "1f7f104f99d77fdb397ef2ec01f178185efe7baa01077afd094dd34a9ecee68ea7511659ef3bfb829c333ae967746c8dd14282fe847bce693a96046f29308ead03"
  ],
  "transaction_id": "1472efb61fb35a65afe69f4c0f9344009b951462",
  "block_num": 35496,
  "transaction_num": 0
}
```

## Failover Script

On Steem / Hive, and also in other blockchain ecosystems, some Witnesses / Validators choose to create automated failover systems that ensure that their nodes do not miss blocks in the event that their Witness / Validator / Block Producer goes down.  If your failover system breaks, you could end up double-signing blocks, which is **very** bad.  

I (Jacob) am of the opinion that double-signing (a single hot key running on more than one node at the same time) is far more harmful to a blockchain system than a node simply going down.  

It is my (Jacob's) recommendation that you do not use an automated failover system on your Witness.  If it goes down, and misses blocks, it's really not the end of the world.  Yes, your performance is judged by the team and community on missing blocks or not, but we're all quite rational.  At times, machines go down.  My (Jacob's) personal opinion is that **occasional** downtime is preferable to the risk of double signing created by failover systems.   

That said, your Witness is ultimately your responsiibility,  your Witness configuration is your decision to make.  


## Social Expectations

Please get to know one another.  Know how to contact one another in case of an emergency. You literally operate the Blurt community.  Have multiple secure ways to talk to one another in case something goes wrong. 

[Tox](https://tox.chat) has no central servers whatsoever, is reliable, and uses public key cryptography for every aspect of its operations.  Generally, I (Jacob) trust Tox more than alternatives like Telegram, Signal, WhatsApp, Slack and other "secure" chat setups.  I (Jacob) be making a Tox Blurt Witness group, but I strongly encourage you to have your own solutions for getting ahold of other Witnesses should the need arise.  

## Security Disclosures

If you encounter a security issue with your witness or other Blurt infrastructure, please contact security@blurt.foundation **and** these people individually by messaging apps of your choice:

* Jacob Gadikian (faddat or jacobgadikian depending on platform)
* Tuan Pham Anh (Baabeetaa)
* David Vennik (Loki / l0k1 / )
* Ricardo Ferreira (thecryptodrive)

We take security very seriously and it is also no problem to publicly disclose security issues.  You will not pay a [social penalty](https://steemit.com/steem/@dantheman/steem-and-bitshares-cryptographic-security-update) for making [security disclousures](https://steemit.com/life/@inertia/q437x6) to the Blurt community.  


## Properties

### account_creation_fee

This is the fee in STEEM that must be paid to create an account. This field must be non-negative.

### account_subsidy_budget

The account subsidies to be added to the account subisidy per block. This is the maximum rate that accounts can be created via subsidization.
The value must be between `1` and `268435455` where `10000` is one account per block.

### account_subsidy_decay

The per block decay of the account subsidy pool. Must be between `64` and `4294967295 (2^32)` where `68719476736 (2^36)` is 100% decay per block.

Below are some example values:

| Half-Life | `account_subsidy_decay` |
|:----------|------------------------:|
| 12 Hours | 3307750 |
| 1 Day | 1653890 |
| 2 Days | 826952 |
| 3 Days | 551302 |
| 4 Days | 413477 |
| 5 Days | 330782 |
| 6 Days | 275652 |
| 1 Week | 236273 |
| 2 Weeks | 118137 |
| 3 Weeks | 78757 |
| 4 Weeks | 59068 |

A more detailed explanation of resource dynamics can be found [here](./devs/2018-08-20-resource-notes.md).

### maximum_block_size

The maximum size of a single block in bytes. The value must be not less than `65536`. The value must not be more than 2MB (`2097152`).

### url

A witness published URL, usually to a post about their witness and role in the Blurt communityy. The URL must not be longer than 2048 characters.

### new_signing_key

Sets the signing key for the witness, which is used to sign blocks.
