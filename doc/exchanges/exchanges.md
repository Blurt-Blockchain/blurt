# Exchange Quickstart

System Requirements:

A dedicated server or virtual machine with a minimum of 16GB of RAM, and at least 160GB of SSD storage.

### Set up a Blurt Full Node

We've reduced setting up a full node to a single-line installer. Run the following command as root on your fresh Debian 10 physical or virtual machine.

```bash
bash <(curl -s https://gitlab.com/blurt/blurt/-/raw/dev/doc/exchanges/exchange.bash)

### Running the cli_wallet

The cli_wallet is installed at /usr/bin/cli_wallet.

You can run it by simply invoking `cli_wallet` from the user and filesystem location of your choice.  Wallet.json will be stored there.

### Import Active Key

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

### Upgrading for major releases that require a full reindex

For upgrades that require a full replay, we highly recommend *performing the upgrade on a separate server* in order to minimize downtime of your wallet. When the replay is complete, switch to the server running the newer version of Blurt.
```
