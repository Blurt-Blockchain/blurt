---
title:  Blurt Witnesses
geometry: margin=2cm
---

# Witnesses

The role of a witness in the Blurt Blockchain is to verify incoming transactions, produce blocks when scheduled, participate in governance.  In addition to this, there is a formal expectation that Witnesses advocate for the Blurt blockchain, review software, and build the Blurt community.  

## Witness Hardware

As many of you are aware, the hardware spec needed for running a Steem/Hive witness has grown significantly over the years!  

[privex.io](https://privex.io) currently offers a highly optomized Hive witness setup that they call Node In A Box(TM).

We have had some discussions about a Blurt-Flavored "Node In A Box(TM)", so in the long-term as the chain grows, their services may limit your costs.  

Additionally, a non-docker bash script AND a docker-based script will be developed and included in this repository.  

Our goal should be to ensure that we do not run on any single infrastructure provider.  While many of us have a bit of a [bare-metal server fetish](https://gitlab.com/virgohardware/core), the fact is that for Blurt's launch and likely for at least the first six months of Blurt's operation, you're not going to need a huge machine to operate a Witness.  We are considering further optomizations to Blurtd which would permanently lower the RAM consumption on both Witness and Seed nodes, but that's as of yet incomplete.  Here is a [reasonable machine spec](https://whaleshares.io/@faddat/witness-post#@faddat/re-daking-re-faddat-witness-post-20200612t195020198z) that should give you a ton of growing room.  

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

| Blurt Witness Spec | |
|---|---|
| CPU |  2+ Cores |
| RAM |    4GB   |
| Storage | 80+GB |

You'll also want to `suggest_brain_key`.  

Copy down its entire output and keep it safely.  You'll be using this brain key to control your Witness.  

> I (Jacob) am of the opinion that double-signing (a single hot key running on more than one node at the same time) is far more harmful to a blockchain system than a node simply going down.  

> _It is my (Jacob's) recommendation that you do not use an automated failover system on your Witness.  If it goes down, and misses blocks, it's really not the end of the world.  Yes, your performance is judged by the team and community on missing blocks or not, but we're all quite rational.  At times, machines go down.  My (Jacob's) personal opinion is that **occasional** downtime is preferable to the risk of double signing created by failover systems._   

## Witness Setup Procedure
**Valid for Testnet 1, June 16, 2020:**

Blurt nodes run well on many Linux distributions, but we recommend Debian 10. 

Make sure that you disable password logins on your potential witness machine and that you login to it ONLY using an SSH keypair.  If you rent a machine with password logins enabled by default, no problem.  To properly fix it, first create a new user for the witness when logged in via ssh using a password as root:

(note: if you run linux on your main machine, use the same username as your machine so you don't have to specify it in the SSH login command)

```bash
useradd witness -m
passwd witness
```

Give it a reasonable password... Next, we can now automate logging into it like this:

```bash
ssh-copy-id witness@your.ip.address.here
```

Enter your SSH password, and `ssh-copy-id` will copy your SSH public key to the server so that you no longer need to use a password to login.  

Test this like:

```bash
ssh witness@youripaddresshere
```

I personally like to use my routine username for this rather than 'witness' as then I can connect to it using `ssh your.ip.address.here` which can be made neat by adding an entry to your `.ssh/config` file to have a more memorable address than `115.52.35.14`:

```
Host lokibeast1
    HostName 95.217.121.243
    User loki
    Port 22
``` 

If it doesn't ask you for a password, you've been successful in setting up proper passwordless SSH that uses a signature by your SSH private key to authenticate you instead of a password.  If it asks for a password, you've failed.  

After you've SSH'd into your server (without it asking for a password) on your server, you should disable password-based logins like this:

```bash
nano /etc/ssh/sshd_config
```

Find this line:
```
#PasswordAuthentication no
```

You should change it to:
```
PasswordAuthentication no
```

Press `ctrl + o` to save the file, and `ctrl + x` to exit the nano editor.   

You can now still access root, just not directly. If you want to set up `sudo` that's up to you (it's easy on ubuntu servers) but more directly without using sudo once you are logged into the witness account, you can just:

```bash
su root
```

and type in root's password.

There is some other configuration items in the `/etc/ssh/sshd_config` you may want to check on. Importantly,
 public key logins must be enabled. The following configuration items you should ensure are in a state you want them to be:
 
```
PermitRootLogin no
PubkeyAuthentication yes
PasswordAuthentication no
PermitEmptyPasswords no
PrintMotd yes
```

```bash
service ssh restart
```

We've reduced setting up a full node to a single-line installer:

```bash
bash <(curl -s https://gitlab.com/blurt/blurt/-/raw/dev/doc/witness-full-node.bash)
```

TODO: At this point, the node should be run until it's synced. Usually takes about 5-10 minutes but we should add something here, `journalctl -f` type command to let the blurtd print logs so you can see when it's finished syncing.

There, now you're running a very nice Blurt Full Node, but you are not yet running a Witness.  In order to run a witness, you'll need to import your Steem active key using the `cli_wallet`.  

So now you'll need to run `cli_wallet`. (type cli_wallet and hit enter)

The first thing you should do is set a password, like:

```
set_password yourpassword
```

**import your Steem Active key**

You first need to import your account's _Active_ key, to allow the witness to post on behalf of your account, and from this it can generate valid delegate key that lets you run your witness without exposing either your _Active_ key or anything sensitive.

```
import_key 5KABCDEFGHIJKLMNOPQRSTUVXYZ
```
Note: the key should start with a 5

This password can be anything but don't use something you use for anything else.

You'll also want to `suggest_brain_key`. This will produce something like this:

```
{
  "brain_priv_key": "SOME SEQUENCE OF NONSENSE WORDS USUALLY 18 WORDS LONG",
  "wif_priv_key": "5J578HtXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "pub_key": "BLT5yjjXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
}
```

Copy down its entire output and keep it safely.  You'll be using this brain key to control your Witness. It would make sense to keep that where you store your steem keys also, KeePassXC is a good option, storing it in your keybase private files is another good option for not losing it.  

**Add private key to config.ini**

Next, we need to use that "wif_private_key" value to allow the witness to sign blocks.

First exit the cli_wallet:

```
Ctrl+D
```

In the code below, replace BRAIN_KEY_WIF_PRIV_KEY with the previously generated Brain wif_priv_key and replace "jacobgadikian" with your own Blurt account name: 

```
echo "private-key = BRAIN_KEY_WIF_PRIV_KEY" >> /blurt/config.ini
echo 'witness = "jacobgadikian"' >> /blurt/config.ini
systemctl restart blurtd
systemctl status blurtd
```

**Declare that you're a Witness** 

Use the command `cli_wallet` to go back into the wallet and then unlock it with:

```
unlock yourpasswordhere
```

Use the below code, but first replace the Blurt account name with your own; replace the blog URL with your own blog (Blurt, Hive, Medium, Steem etc) and the Brain public key with yours which you generated previously: 

```
update_witness "jacobgadikian" "https://whaleshares.io/@faddat" "BRAIN_KEY_PUBLIC_KEY_GOES_HERE" {"account_creation_fee":"3.000 BLURT","maximum_block_size":65536} true
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

Note: gopher23 is an account name.  You'll want to replace `gopher23` with your own account name in the voting step.  The first name is the account that you're voting from, and the second is the account that you're voting for.  

**vote for yoursself**
```
vote_for_witness gopher23 gopher23 true true
```

**vote for someone else**
```
vote_for_witness gopher23 megadrive true true
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

## Common Cli Wallet Commands

Open Cli Wallet:
```
cli_wallet
```

Unlock Wallet:
```
unlock yourpassword
```

Exit Cli Wallet:
```
Ctrl+D 
```

## Common Blurtd Commands

Check block production status:
```
journalctl -u blurtd --no-pager --since "1 minute ago"
```


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
