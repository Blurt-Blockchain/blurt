# Running an exchange node manually

This document is a step by step guide to running a Blurt exchange node manually on a clean Ubuntu 18.04 docker image.

System Requirements:
A dedicated server or virtual machine with a minimum of 16GB of RAM, and at least 160GB of SSD storage.


#### 1. Install Docker
You can install Docker on most Linux distributions like this:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```


#### 2. Download
In this step, you will download:

- `snapshot.json` (genesis file)
- `blurtd` (pre-built binary)
- `config.ini` (sample config)

You can change the `BLURT_DIR` variable to anywhere you'd like to store your Blurt blockchain data.

```bash
apt install -y unzip
export BLURT_DIR=/blurtd
mkdir $BLURT_DIR
export BLURT_ARTIFACTS=https://gitlab.com/blurt/blurt/-/jobs/644229270/artifacts/download

cd $BLURT_DIR
mkdir -p tmp
wget -O $BLURT_DIR/tmp/download $BLURT_ARTIFACTS
unzip $BLURT_DIR/tmp/download -d $BLURT_DIR/tmp/
mv $BLURT_DIR/tmp/build/programs/blurtd/blurtd $BLURT_DIR
rm -rf tmp

wget -O $BLURT_DIR/snapshot.json https://cloudflare-ipfs.com/ipfs/QmPrwVpwe4Ya46CN9LXNnrUdWvaDLMwFetMUdpcdpjFbyu
wget -O $BLURT_DIR/config.ini https://gitlab.com/blurt/blurt/-/raw/dev/doc/exchange_config.ini
chmod +x blurtd
```

#### 3. Configuration

To track specific accounts instead of all accounts, add this to `$BLURT_DIR/config.ini`:

Eg., tracking `birdinc` account only

```
account-history-track-account-range = ["birdinc", "birdinc"]
```

#### 3. Run node

To run an interactive bash shell in the container, use option `-it` instead of `-d`

```bash
docker run --name blurtd_exchange --rm -d \
    -v $BLURT_DIR:/blurtd \
    -p 2001:2001 -p 8090:8090 -p 8091:8091 \
    --ulimit nofile=94000:94000 --ulimit nproc=64000:64000 \
    --stop-timeout 30 \
    ubuntu:18.04 \
    /bin/bash -c "
    apt-get update -qq &&
    apt-get install -qq libsnappy-dev libncurses-dev libreadline-dev &&
    ln -s /lib/x86_64-linux-gnu/libncurses.so.5.9 /lib/x86_64-linux-gnu/libncurses.so.6 &&
    ln -s /lib/x86_64-linux-gnu/libncursesw.so.5.9 /lib/x86_64-linux-gnu/libtinfo.so.6 &&
    cd /blurtd && ./blurtd -d ."
```

To monitor or view logs from the container, run:

```bash
docker logs -f blurtd_exchange
```

To stop your node, run:

```bash
docker stop -t 30 blurtd_exchange
```

To resynch the chain from start, delete the `blockchain` folder then start the node again.

#### 4. Running the cli_wallet

The cli_wallet is installed at /usr/bin/cli_wallet.

You can run it by simply invoking `cli_wallet` from the user and filesystem location of your choice.  Wallet.json will be stored there.

#### 5. Import Active Key

To be able to successfully process or create transfers, you need to import the active key of the account being tracked.
Otherwise, you may encounter `RPCError: missing required active authority : Missing Active Authority xxxuser`.

1. Run `cli_wallet`
2. Unclock your wallet with `unlock "<wallet password>"` (replace `<wallet password>` with your wallet's password; the double quotes are needed)
3. In the unlocked wallet, run `import_key <active key>` (replace `<active key>` with your exchange account's active key)

You can check if you've successfully imported your active key by making a test transfer.

Otherwise, press `Ctrl + D` to exit `cli_wallet`.

#### CLI Wallet Transfer function

Definition:

`transfer(string from, string to, asset amount, string memo, bool broadcast)`

Example:

`transfer from_account to_account "0.001 BLURT" "test transfer" true`

You can issue `help` command inside `cli_wallet` to list the available commands.
Or `gethelp <command>` to get more details.
