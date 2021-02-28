# Witnesses

The role of a witness in the Blurt Blockchain is to verify incoming transactions, produce blocks when scheduled, participate in governance. In addition to this, there is a formal expectation that Witnesses advocate for the Blurt blockchain, review software, and build the Blurt community.

## Witness Hardware

As many of you are aware, the hardware spec needed for running a Steem/Hive witness has grown significantly over the years!

[privex.io](https://privex.io) currently offers a highly optomized Hive witness setup that they call Node In A Box(TM).

We have had some discussions about a Blurt-Flavored "Node In A Box(TM)", so in the long-term as the chain grows, their services may limit your costs and risks.

Additionally, a non-docker bash script AND a docker-based script will be developed and included in this repository.

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
| AWS                         | Cooud                | high        | industry leader for infrastructure                                                                                                                   |

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

**Valid for Mainnet, July 4, 2020:**

Check out this [BLOG POST](https://blurt.blog/blurtopian/@zahidsun/how-to-setup-a-witness-node-step-by-step-video-tutorial) with instructional video!

If you plan to use our automated setup, your witness node should run Debian 10. If you're doing it manually, feel free to use any type of machine that you'd like.

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

Press `ctrl + o` to save the file, and `ctrl + x` to exit the nano editor.

Then run

```bash
service ssh restart
```

**DO NOT OPERATE A BLURT WITNESS WITH PASSWORD AUTHENTICATION ENABLED.**

### Set up a Blurt Full Node

We've reduced setting up a full node to a single-line installer. Run the following command as root on your fresh Debian 10 physical or virtual machine.

```bash
bash <(curl -s https://gitlab.com/blurt/blurt/-/raw/dev/doc/witnesses/witness.bash)
```

Now you've just got to wait a bit for your machine to import 1.3 million Steem accounts and sync the Blurt Blockchain. To monitor this process, do like:

```bash
journalctl -u blurtd -f
```

When you see individual blocks being produced, it's done and you're ready to proceed

Exit the scrolling monitoring logs with `Ctrl+C`

The script sets up a Blurt Full Node, but setting up a Witness will always be a manual process. In order to run a witness, you'll need to import your Blurt active key using the `cli_wallet` so that you can sign a `witness_update` transaction that announces your Witness candidacy to the blockchain. Blurt is a Steem fork, so Steem active keys from 20 May 2020 or earlier will also work.

So now you'll need to run **cli_wallet**. (type `cli_wallet` and hit enter)

The first thing you should do is set a password, like:

```
set_password yourpassword
```

You'll also want to `suggest_brain_key`.

Copy down its entire output and keep it safely. You'll be using this brain key to control your Witness.

**import your Blurt Active key** (_Note: Pre 20 March 2020 Steem keys will also work_)

```
import_key 5KABCDEFGHIJKLMNOPQRSTUVXYZ
```

Note: The key should start with a 5 as per the example key above.

**Add private brain key to config.ini to sign blocks as a Witness**

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

Paste all four of the lines above in one hit into the command line and press enter once.

**Declare that you're a Witness**

Use the command `cli_wallet` to go back into the wallet and then unlock it with:

```
unlock yourpasswordhere
```

Use the below code, but first replace the "jacobgadikian" Blurt account name with your own; also replace the blog URL with your own blog url (Blurt, Hive, Medium, Steem etc) and the Brain public key with yours, which you generated previously:

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

It's also a very good idea for you to vote for yourself from the **cli_wallet**, so that you will begin to make blocks:

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

The Blurt blockchain has fees for every transaction, including voting, posting, power up, power down, transfers, reblurt etc witnesses set the fees according to network demand, ie higher fees when spam is prolific and lower fees when global user activity reduces. Free transactions are a myth, witnesses subsidise free transactions with every increasing server costs to keep up with chain bloat, fees help witnesses keep the bloat down to a minimum.

Fees are calculated as a median of consensus witness fees. Have a look at what fees other witnesses have set on https://blocks.blurtwallet.com/#/witnesses

Set the fees from your unlocked wallet using the below string, remembering to replace "jacobgadikian" with your witness account name and inserting your wallet Public Brain Key where specified. You can also adjust `account_creation_fee`, `operation_flat_fee` and `bandwidth_kbytes_fee` as desired.

```
update_witness_properties "jacobgadikian" {"key":"BRAIN_KEY_PUB_KEY_GOES_HERE", "account_creation_fee":"10.000 BLURT","maximum_block_size":65536,"account_subsidy_budget": 797, "account_subsidy_decay": 347321, "operation_flat_fee":"0.001 BLURT","bandwidth_kbytes_fee":"0.100 BLURT"} true
```

**If you're a witness, you're done now.**

**Full Nodes and Seed Nodes should**

```
systemctl start ipfs-hardened
```

## Common Cli Wallet Commands

Open Cli Wallet:

```bash
cli_wallet
```

Unlock Wallet:

```bash
unlock yourpassword
```

Exit Cli Wallet:

```bash
Ctrl+D
```

## Common Blurtd Commands

Check block production status by printing one minute of history to your terminal:

```bash
journalctl -u blurtd --no-pager --since "1 minute ago"
```

Monitor the blockchain continuously:

```bash
journalctl -u blurtd -f
```

Monitor your node continuously, all processes:

```bash
journalctl -f
```

Stop blurtd

```bash
systemctl stop blurtd
```

Start blurtd

```bash
systemctl start blurtd
```

Restart blurtd

```bash
systemctl restart blurtd
```

Replay Blockchain

```bash
systemctl stop blurtd
blurtd --data-dir /blurt --replay-blockchain
```

Edit config.ini

```bash
nano /blurt/config.ini
```

## Updating for HF1

Enter the `cli_wallet`

**Disable your witness**

In the below command, replace `jacobgadikian` with your Blurt account name and the blog url with your own. Note the `BLT1111111111111111111111111111111114T1Anm` key is the global default key to disable the witness.

```
update_witness "jacobgadikian" "https://your-blog-url" "BLT1111111111111111111111111111111114T1Anm" {"account_creation_fee":"10.000 BLURT","maximum_block_size":65536} true
```

Then `ctrl+d` to exit the wallet.

**upgrade your binary**

```
systemctl stop blurtd
wget -O blurt.zip https://gitlab.com/blurt/blurt/-/jobs/630888073/artifacts/download?file_type=archive
unzip blurt.zip
mv build/programs/blurtd/blurtd_witness /usr/bin/blurtd
chmod +x /usr/bin/blurtd
```

**Edit the systemd unit**

```
nano /etc/systemd/system/blurtd.service
```

Change it so that exec start looks like this:

```
ExecStart=/usr/bin/blurtd --replay --data-dir /blurt
```

`Ctrl+o` to write the changes, hit `ENTER` to complete the writing, `Ctrl+x` to exit.

**Reload Daemon**

```
systemctl daemon-reload
```

**Start blurtd**

```
systemctl start blurtd
```

**Wait for chain to sync**

```
journalctl -u blurtd -f
```

When you start seeing scrolling text showing blocks being produced it is synced! Example: `Got 0 transactions on block 150005 by blurtplus -- Block Time Offset: -342 ms`

**enable your witness**

Enter the `cli_wallet`

Replace `jacobgadikian` with your Blurt account name and the blog url with your own.

```
update_witness "jacobgadikian" "https://your-blog-url" "BRAIN_KEY_PUB_KEY_GOES_HERE" {"account_creation_fee":"10.000 BLURT","maximum_block_size":65536} true
```

Exit wallet with `Ctrl+d`

**Edit the systemd unit and change back to default value**

```
nano /etc/systemd/system/blurtd.service
```

Change back exec start to look like this:

```
ExecStart=/usr/bin/blurtd --data-dir /blurt
```

`Ctrl+o` to write the changes, hit `ENTER` to complete the writing, `Ctrl+x` to exit.

Finally check a block explorer to see that you are broadcasting the new version number.

## Upgrading for HF2

Enter the `cli_wallet`

**Disable your witness**

In the below command, replace `jacobgadikian` with your Blurt account name and the blog url with your own. Note the `BLT1111111111111111111111111111111114T1Anm` key is the global default key to disable the witness.

```
update_witness "jacobgadikian" "https://your-blog-url" "BLT1111111111111111111111111111111114T1Anm" {"account_creation_fee":"10.000 BLURT","maximum_block_size":65536} true
```

Then `ctrl+d` to exit the wallet.

**upgrade your binary**

```
systemctl stop blurtd
wget https://gitlab.com/blurt/blurt/-/jobs/675578369/artifacts/raw/build/bin/blurtd
mv blurtd /usr/bin/blurtd
chmod +x /usr/bin/blurtd
apt install libncurses5
```

**Edit the systemd unit**

```
nano /etc/systemd/system/blurtd.service
```

Change it so that exec start looks like this:

```
ExecStart=/usr/bin/blurtd --replay --data-dir /blurt
```

`Ctrl+o` to write the changes, hit `ENTER` to complete the writing, `Ctrl+x` to exit.

**Reload Daemon**

```
systemctl daemon-reload
```

**Start blurtd**

```
systemctl start blurtd
```

**Wait for chain to sync**

```
journalctl -u blurtd -f
```

When you start seeing scrolling text showing blocks being produced it is synced! Example: `Got 0 transactions on block 150005 by blurtplus -- Block Time Offset: -342 ms`

**enable your witness**

Enter the `cli_wallet`

Replace `jacobgadikian` with your Blurt account name and the blog url with your own.

```
update_witness "jacobgadikian" "https://your-blog-url" "BRAIN_KEY_PUB_KEY_GOES_HERE" {"account_creation_fee":"10.000 BLURT","maximum_block_size":65536} true
```

Exit wallet with `Ctrl+d`

**Edit the systemd unit and change back to default value**

```
nano /etc/systemd/system/blurtd.service
```

Change back exec start to look like this:

```
ExecStart=/usr/bin/blurtd --data-dir /blurt
```

`Ctrl+o` to write the changes, hit `ENTER` to complete the writing, `Ctrl+x` to exit.

Finally check a block explorer to see that you are broadcasting the new version number.

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

## Finished

Thank you so much for running blurt infrastructure. Blurt loves you!
