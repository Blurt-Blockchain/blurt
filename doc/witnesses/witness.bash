#!/bin/bash

set -euo pipefail

# UPDATE YOUR DEBIAN 10 SYSTEM TO THE LATEST VERSIONS OF PACKAGES
apt update
apt upgrade -y

# Install Dependencies
apt install -y ntp unzip wget libbz2-dev libsnappy-dev libncurses5 libreadline-dev



# Enable NTP
systemctl enable ntp
systemctl start ntp

# CREATE BLURT USER
mkdir /blurt 
adduser --gecos "" --disabled-password --home /blurt blurt
chown blurt /blurt

# FILESYSTEM LIMITS AS ADVISED HERE: https://developers.steem.io/tutorials-recipes/exchange_node
echo "*      hard    nofile     94000" >> /etc/security/limits.conf
echo "*      soft    nofile     94000" >> /etc/security/limits.conf
echo "*      hard    nproc      64000" >> /etc/security/limits.conf
echo "*      soft    nproc      64000" >> /etc/security/limits.conf
echo "fs.file-max = 2097152" >> /etc/sysctl.conf
sysctl -p


# DOWNLOAD BUILD ARTIFACTS OF LATEST WITNESS JOB
# TODO: make this actually get latest artifacts instead of fixing on a known-good build
wget -O download https://gitlab.com/blurt/blurt/-/jobs/724631987/artifacts/download

# UNZIP THE BUILD ARTIFACTS, BLURTD AND CLI_WALLET
unzip download

# PUT BLURTD AND CLI_WALLET ON YOUR $PATH
mv build/bin/blurtd /usr/bin/blurtd
mv build/bin/cli_wallet /usr/bin/cli_wallet
rm -rf build
rm download

# CONFIG.INI FOR SEAMLESS
wget -O /blurt/config.ini https://gitlab.com/blurt/blurt/-/raw/dev/doc/witnesses/config.ini

# ENSURE THAT BLURTD AND CLI_WALLET ARE EXECUTABLE
chmod +x /usr/bin/blurtd
chmod +x /usr/bin/cli_wallet

# IMPORT 1.3 MILLION STEEM ACCOUNTS AND CONFIGURATION TEMPLATE
# testnet snaphsot.json is QmU2zT7W2GbifQxqpU9ALMNFUT2QwsBt4L7SaHpm6QTm4Q
# mainnet snapshot.json is QmPrwVpwe4Ya46CN9LXNnrUdWvaDLMwFetMUdpcdpjFbyu
wget -O /blurt/snapshot.json  https://cloudflare-ipfs.com/ipfs/QmPrwVpwe4Ya46CN9LXNnrUdWvaDLMwFetMUdpcdpjFbyu

# INSTALL BLURTD.SERVICE
wget -O /etc/systemd/system/blurtd.service https://gitlab.com/blurt/blurt/-/raw/dev/contrib/blurtd.service

# ENABLE BLURTD SYSTEMD SERVICE
systemctl enable blurtd

# START BLURTD
systemctl start blurtd

# LOVE USERS
echo -e "\e[1;31;42m Thank you for running Blurt infrastructure. \e[0m"
echo -e "\e[1;31;42m BLURT LOVES YOU! \e[0m"


