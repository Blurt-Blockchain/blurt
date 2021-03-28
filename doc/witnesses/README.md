# Witnesses

The role of a witness in the Blurt Blockchain is to verify incoming transactions, produce blocks when scheduled, participate in governance. In addition to this, there is a formal expectation that Witnesses advocate for the Blurt blockchain, review software, and build the Blurt community.

## Witness Hardware

Our goal should be to ensure that we do not run on any single infrastructure provider. While many of us have a bit of a [bare-metal server fetish](https://gitlab.com/virgohardware/core), the fact is that for Blurt's launch and likely for at least the first six months of Blurt's operation, you're not going to need a huge machine to operate a Witness. We are considering further optomizations to Blurtd which would permanently lower the RAM consumption on both Witness and Seed nodes, but that's as of yet incomplete. Here is a [reasonable machine spec](https://whaleshares.io/@faddat/witness-post#@faddat/re-daking-re-faddat-witness-post-20200612t195020198z) that should give you a ton of growing room.

**Infrastructure Providers**:
What's important here is that everyone is not using only a single provider.

| **Provider**                | **Machine Types**    | **Price**   | **Special Feature**                                                                                                                                  |
| --------------------------- | -------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| hetzner.de                  | Bare Metal and Cloud | Competitive | Cheap Bare Metal                                                                                                                                     |
| privex.io                   | Bare Metal and Cloud | Mid-range   | Privacy, Peering, Cryptocurrency Payments, Witness Optomization, Team has steemed since 2016                                                         |
| vultr.com                   | cloud and bare metal | Mid-Range   | Easy and straightforward                                                                                                                             |
| digitalocean.com            | cloud                | mid-range   | tutorial ecosystem                                                                                                                                   |
| contabo.com                 | cloud                | low         | Price AND one time I saw a contabo node outperform nearly all others in a network stress test situation on the [akash.io](https://akash.io) testnet. |
| Your local hosting provider | bare metal           | ?           | Diversify the Witness Set                                                                                                                            |
| GCE                         | Cloud                | high        | admin features                                                                                                                                       |
| AWS                         | Cloud                | high        | industry leader for infrastructure                                                                                                                   |

**Machine Spec**:
Your Witness machine spec is entirely **your** choice. This recommended spec should be relatively low cost ($5-20 per month) and should also run your Blurt Witness very effectively.

Accurate as of **June 15, 2020**:

**Blurt Witness Spec**

| Component   | Size     |
| ----------- | -------- |
| **CPU**     | 2+ Cores |
| **RAM**     | 4GB      |
| **Storage** | 80+GB    |

## Witness Setup Procedure

**Valid for Mainnet, March 28, 2021:**

It is recommended to use either Debian 10 or Ubuntu 20.04.

### Configure Passwordless SSH Logins: IMPORTANT!

Make sure that you disable password logins on your witness machine and that you login to it ONLY using an SSH keypair. If you rent a machine with password logins enabled by default, no problem. Do like:

```bash
ssh-copy-id root@youripaddresshere
```

Enter your SSH password, and `ssh-copy-id` will copy your SSH public key to the server so that you no longer need to use a password to login.

Test this like:

```bash
ssh root@youripaddresshere
```

If it doesn't ask you for a password, you've been successful in setting up proper passwordless SSH that uses a signature by your SSH private key to authenticate you instead of a password. If it asks for a password, you've failed.

After you've SSH'd into your server (without it asking for a password) on your server, you should disable password-based logins like this:

```bash
nano /etc/ssh/sshd_config
```

Find this line:

```
#PasswordAuthentication yes
```

You should change it to:

```
PasswordAuthentication no
```

Press `Ctrl + o` to save the file, and `Ctrl + x` to exit the nano editor.

Then run

```bash
service ssh restart
```

**DO NOT OPERATE A BLURT WITNESS WITH PASSWORD AUTHENTICATION ENABLED.**

### Set up a Blurt Witness or Seed Node

Blurt nodes are now provided as Docker container images with the latest build. This makes upgrading during hardforks much quicker and smoother.

You will need to have root privileges to perform this installation. If you are not logged in as root, you can run the following command to get root privileges:

```bash
sudo su
```

Start by installing dependencies and getting your server up to date:

```bash
apt update
apt upgrade -y
apt install -y software-properties-common gnupg vnstat ifstat iftop atop ufw fail2ban systemd-timesyncd
```

Install Docker:

```bash
curl -s https://get.docker.com | bash
```

Setup your firewall to block all incoming connections except for SSH and port 1776 for p2p connections:

```bash
ufw default deny
ufw allow ssh
ufw allow 1776
ufw enable
```

To install the Docker container with the Blurt node, run the following command:

```bash
docker run -d --net=host -v blurtd:/blurtd --name blurtd  registry.gitlab.com/blurt/blurt/witness:dev /usr/bin/blurtd --data-dir /blurtd --plugin "witness account_by_key account_by_key_api condenser_api database_api network_broadcast_api transaction_status transaction_status_api rc_api" --webserver-http-endpoint 127.0.0.1:8091 --webserver-ws-endpoint 127.0.0.1:8090
```

Now, the Docker image will be downloaded and your Blurt node will start up inside of a Docker container.

You will have to wait for the node to import over 1 million Blurt accounts and synchronize the Blurt blockchain.

To monitor this process, you can run the following command:

```bash
docker logs blurtd -f
```

Once you see individual blocks being handled, the chain is fully synchronized.

It will look something like this:

```
1355794ms p2p_plugin.cpp:212            handle_block         ] Got 0 transactions on block 7561872 by saboin -- Block Time Offset: -205 ms
1358831ms p2p_plugin.cpp:212            handle_block         ] Got 0 transactions on block 7561873 by opfergnome -- Block Time Offset: -168 ms
1361695ms p2p_plugin.cpp:212            handle_block         ] Got 0 transactions on block 7561874 by blurthispano -- Block Time Offset: -304 ms
1364788ms p2p_plugin.cpp:212            handle_block         ] Got 0 transactions on block 7561875 by megadrive -- Block Time Offset: -212 ms
1367689ms p2p_plugin.cpp:212            handle_block         ] Got 0 transactions on block 7561876 by ionomy -- Block Time Offset: -310 ms
1370683ms p2p_plugin.cpp:212            handle_block         ] Got 1 transactions on block 7561877 by busbecq -- Block Time Offset: -316 ms
1374015ms p2p_plugin.cpp:212            handle_block         ] Got 0 transactions on block 7561878 by jakeminlim -- Block Time Offset: 15 ms
1376675ms p2p_plugin.cpp:212            handle_block         ] Got 0 transactions on block 7561879 by zahidsun -- Block Time Offset: -325 ms
1379685ms p2p_plugin.cpp:212            handle_block         ] Got 0 transactions on block 7561880 by imransoudagar -- Block Time Offset: -314 ms
1382709ms p2p_plugin.cpp:212            handle_block         ] Got 0 transactions on block 7561881 by double-u -- Block Time Offset: -290 ms
1385647ms p2p_plugin.cpp:212            handle_block         ] Got 0 transactions on block 7561882 by kentzz001 -- Block Time Offset: -352 ms
1388925ms p2p_plugin.cpp:212            handle_block         ] Got 0 transactions on block 7561883 by jacobgadikian -- Block Time Offset: -74 ms
1391731ms p2p_plugin.cpp:212            handle_block         ] Got 0 transactions on block 7561884 by empato365 -- Block Time Offset: -268 ms
1394757ms p2p_plugin.cpp:212            handle_block         ] Got 0 transactions on block 7561885 by africa.witness -- Block Time Offset: -242 ms
1397830ms p2p_plugin.cpp:212            handle_block         ] Got 0 transactions on block 7561886 by michelangelo3 -- Block Time Offset: -169 ms
```

Once you get there, you can exit the scrolling monitoring logs with `Ctrl + C`

If you are only setting up a seed node, you are done.

In order to run a witness, you'll need to import your Blurt active key using the `cli_wallet` so that you can sign a `witness_update` transaction that announces your witness candidacy to the blockchain. Blurt is a Steem fork, so Steem active keys from 20 May, 2020 or earlier will also work.

So now you'll need to run **cli_wallet**.

To do this, you will have to enter blurtd's Docker container:

```bash
docker exec -it blurtd bash
```

You will notice that your command prompt will be surrounded by brackets to let you know that you are inside a Docker container.

Example:

```
[root@saboin-blurt /]#
```

Next, navigate to the `/blurtd` directory:

```bash
cd /blurtd
```

Note that it is important to run `cli_wallet` from the `/blurtd` directory because this directory is the only one that will not be erased in the event that you need to reinstall your Blurt node or when you upgrade during hardforks.

To start `cli_wallet`, run this command:

```bash
cli_wallet
```

The first thing you should do is set a password:

```
set_password yourpassword
```

You'll also want to run:

```
suggest_brain_key
```

Copy down its entire output and keep it safely. You'll be using this brain key to control your Witness.

**import your Blurt Active key** (_Note: Pre 20 March 2020 Steem keys will also work_)

```
import_key 5KABCDEFGHIJKLMNOPQRSTUVXYZ
```

Note: The key should start with a 5 as per the example key above.

You'll also need to import the brain priv_wif_key that you generated in the previous step.

```
import_key 5Jf7aeiqYC2vPzaVtrgpHr2SmfFdP7gV5XDwyj3fFoZt13bdGhc
```

###### Don't worry! The key in the example is not a valid key.

**Add private brain key to config.ini to sign blocks as a Witness**

First exit the cli_wallet by pressing `Ctrl + d`.

Then exit the Docker container:

```bash
exit
```

Next, we need to edit `config.ini` to put in the settings for your witness.

Use nano to edit `config.ini`:

```bash
nano /var/lib/docker/volumes/blurtd/_data/config.ini
```

Scroll almost all the way down until you get to this line:

```bash
# name of witness controlled by this node (e.g. initwitness )
# witness =
```

Delete the hash sign and the leading space before `witness =`, and add your witness username inside quotation marks after the equal sign like this:

```bash
# name of witness controlled by this node (e.g. initwitness )
witness = "jacobgadikian"
```

###### Replace jacobgadikian with your own Blurt username.

Next, find this line:

```bash
# WIF PRIVATE KEY to be used by one or more witnesses or miners
# private-key =
```

Delete the hash sign and the leading space before `private-key =`, and add your previously generated Brain wif_priv_key after the equal sign like this:

```bash
# WIF PRIVATE KEY to be used by one or more witnesses or miners
private-key = 5Jf7aeiqYC2vPzaVtrgpHr2SmfFdP7gV5XDwyj3fFoZt13bdGhc
```

######(Don't worry! The key in the example is not a valid key.)

Press `Ctrl + o` to save the file, and `Ctrl + x` to exit the nano editor.

Now restart the Blurt node with the following command:

```bash
docker restart blurtd
```

**Declare that you're a Witness**

We need to go back into `cli_wallet` to do this:

```bash
docker exec -it blurtd bash
cd /blurtd
cli_wallet
```

First, we need to unlock the wallet:

```
unlock yourpasswordhere
```

Use the folowing code, but first replace the "jacobgadikian" Blurt account name with your own; also replace the blog URL with your own blog URL (this should ideally be a Blurt post that introduces your witness or at the very least a link you your Blurt profile), and the Brain public key with yours, which you generated previously:

```
update_witness "jacobgadikian" "https://your-blog-url" "BRAIN_KEY_PUB_KEY_GOES_HERE" {"account_creation_fee":"10.000 BLURT","maximum_block_size":65536} true
```

Success looks like this:

```json
{
  "ref_block_num": 12141,
  "ref_block_prefix": 747640993,
  "expiration": "2020-06-15T16:54:30",
  "operations": [
    [
      "witness_update",
      {
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

It's also a very good idea for you to vote for yourself from the `cli_wallet`, so that you will begin to make blocks:

Note: You'll want to replace `jacobgadikian` with your own Blurt account name in the next voting step. The first name is the account that you're voting from and the second name with placeholder 'gopher23' is the account that you're voting for.

**vote for yourself**

```
vote_for_witness jacobgadikian jacobgadikian true true
```

**vote for someone else (gopher23 in this case)**

```
vote_for_witness jacobgadikian gopher23 true true
```

Success for voting for **gopher23** witness looks like:

```json
{
  "ref_block_num": 35495,
  "ref_block_prefix": 2258033885,
  "expiration": "2020-06-16T12:23:03",
  "operations": [
    [
      "account_witness_vote",
      {
        "account": "jacobgadikian",
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

**Updating Fees**

The Blurt blockchain has fees for every transaction, including voting, posting, power up, power down, transfers, reblurt, et cetera. Witnesses set the fees according to network demand, ie. higher fees when spam is prolific and lower fees when global user activity reduces. Free transactions are a myth. Witnesses subsidise free transactions with ever-increasing server costs to keep up with chain bloat. Fees help witnesses keep the bloat down to a minimum.

Fees are calculated as a median of consensus witness fees. Have a look at what fees other witnesses have set on https://blocks.blurtwallet.com/#/witnesses

Set the fees from your unlocked wallet using the string below, remembering to replace "jacobgadikian" with your witness account name and inserting your wallet Public Brain Key where specified. You can also adjust `account_creation_fee`, `operation_flat_fee` and `bandwidth_kbytes_fee` as desired.

```
update_witness_properties "jacobgadikian" {"key":"BRAIN_KEY_PUB_KEY_GOES_HERE", "account_creation_fee":"10.000 BLURT","maximum_block_size":65536,"account_subsidy_budget": 797, "account_subsidy_decay": 347321, "operation_flat_fee":"0.001 BLURT","bandwidth_kbytes_fee":"0.200 BLURT"} true
```

To exit Cli Wallet and Docker container, press `Ctrl + d` and run:

```bash
exit
```

## Common Cli Wallet Commands

Enter Docker container and open Cli Wallet:

```bash
docker exec -it blurtd bash
cd /blurtd
cli_wallet
```

Unlock Wallet:

```
unlock yourpassword
```

Exit Cli Wallet and Docker container:

Press `Ctrl + d` and then run:

```bash
exit
```

## Common Docker/Blurtd related commands

Monitor the blockchain continuously:

```bash
docker logs blurtd -f
```

Stop blurtd

```bash
docker stop blurtd
```

Start blurtd

```bash
docker start blurtd
```

Restart blurtd

```bash
docker restart blurtd
```

Edit config.ini

```bash
nano /var/lib/docker/volumes/blurtd/_data/config.ini
```

## Disabling your witness

There might be some situations in which you need to disable your witness. If you are working on your witness server and you want to avoid missing blocks, it's a good idea to disable it before working on it, then re-enable it once you're done.

In that case, enter the Docker container and run Cli Wallet:

```bash
docker exec -it blurtd bash
cd /blurtd
cli_wallet
```

Run the following command, but replace `jacobgadikian` with your Blurt account name and the blog url with your own. Note the `BLT1111111111111111111111111111111114T1Anm` key is the global default key to disable the witness.

```
update_witness "jacobgadikian" "https://your-blog-url" "BLT1111111111111111111111111111111114T1Anm" {"account_creation_fee":"10.000 BLURT","maximum_block_size":65536} true
```

## Running two or more servers for backup

You can have one or more backup servers in case your main one fails or starts missing blocks. It's also more convenient if you need to do some work on your main server because you don't need to disable your witness. Instead you can just switch the block signing over to your backup server while doing your work on your main, then switch back when you're done.

It's highly recommended for consensus witnesses to have backup servers.

The procedure to setup your backup servers are the same as with your main server. You will need to generate a new Brain key for your backup server.

Then, in order to switch between the servers, you just need to do an `update_witness` operation from your Cli Wallet and put in the public key that matches the server you want to use for signing blocks with your witness.

Run the following command from `cli_wallet`, but replace "jacobgadikian" with your Blurt witness account, the blog URL with your own, and the brain pub key with the one for the server you want to use for signing blocks.

```
update_witness "jacobgadikian" "https://your-blog-url" "BRAIN_KEY_PUB_KEY_GOES_HERE" {"account_creation_fee":"10.000 BLURT","maximum_block_size":65536} true
```

## Social Expectations

Please get to know one another. Know how to contact one another in case of an emergency. You literally operate the Blurt community. Have multiple secure ways to talk to one another in case something goes wrong.

[Tox](https://tox.chat) has no central servers whatsoever, is reliable, and uses public key cryptography for every aspect of its operations. Generally, I (Jacob) trust Tox more than alternatives like Telegram, Signal, WhatsApp, Slack and other "secure" chat setups. I (Jacob) be making a Tox Blurt Witness group, but I strongly encourage you to have your own solutions for getting ahold of other Witnesses should the need arise.

Jacob's Tox ID is:

```
C3AAA8746D06C08595D3E7247D0764093A6D25B14894502F07DBBD0248C4CB391C9E6BA8E4D1
```

See how it's not a phone number and not a handle but instead just cryptography?

[Discord](https://discord.blurt.world) - Please join our public Discord server, there is always regular discussion in the witness channels there.

## Security Disclosures

If you encounter a security issue with your witness or other Blurt infrastructure, please contact security@blurt.foundation **and** these people individually by messaging apps of your choice:

- Jacob Gadikian (faddat or jacobgadikian depending on platform)
- Tuan Pham Anh (Baabeetaa)
- Ricardo Ferreira (thecryptodrive / megadrive)

We take security very seriously and it is also no problem to publicly disclose security issues. You will not pay a [social penalty](https://steemit.com/steem/@dantheman/steem-and-bitshares-cryptographic-security-update) for making [security disclousures](https://steemit.com/life/@inertia/q437x6) to the Blurt community.

## Properties

### account_creation_fee

This is the fee in BLURT that must be paid to create an account. This field must be non-negative.

### account_subsidy_budget

The account subsidies to be added to the account subisidy per block. This is the maximum rate that accounts can be created via subsidization.
The value must be between `1` and `268435455` where `10000` is one account per block.

### account_subsidy_decay

The per block decay of the account subsidy pool. Must be between `64` and `4294967295 (2^32)` where `68719476736 (2^36)` is 100% decay per block.

Below are some example values:

| Half-Life | `account_subsidy_decay` |
| :-------- | ----------------------: |
| 12 Hours  |                 3307750 |
| 1 Day     |                 1653890 |
| 2 Days    |                  826952 |
| 3 Days    |                  551302 |
| 4 Days    |                  413477 |
| 5 Days    |                  330782 |
| 6 Days    |                  275652 |
| 1 Week    |                  236273 |
| 2 Weeks   |                  118137 |
| 3 Weeks   |                   78757 |
| 4 Weeks   |                   59068 |

A more detailed explanation of resource dynamics can be found [here](../devs/2018-08-20-resource-notes.md).

### maximum_block_size

The maximum size of a single block in bytes. The value must be not less than `65536`. The value must not be more than 2MB (`2097152`).

### url

A witness published URL, usually to a post about their witness and role in the Blurt communityy. The URL must not be longer than 2048 characters.

### new_signing_key

Sets the signing key for the witness, which is used to sign blocks.

### operation_flat_fee

This is the flat fee in BLURT that will be charged on every operation done on the Blurt blockchain.

### bandwidth_kbytes_fee

This is an additional fee in BLURT that will be charged on every operation based on the size of the data it contains.

## Finished

Thank you so much for running blurt infrastructure. Blurt loves you!
