#!/bin/bash
# TODO: run as another user, security, system settings
# POST-LAUNCH TODO: This should probably not be reading files directly from git, or if so, from versioned releases. 

# UPDATE YOUR DEBIAN 10 SYSTEM TO THE LATEST VERSIONS OF PACKAGES
apt update
apt upgrade -y

# CREATE BLURT USER
useradd -m -d /blurt blurt

# INSTALL UNZIP AND WGET
apt install -y unzip wget libbz2-dev libsnappy-dev libncurses5-dev libreadline-dev

# FILESYSTEM LIMITS AS ADVISED HERE: https://developers.steem.io/tutorials-recipes/exchange_node
echo "*      hard    nofile     94000" >> /etc/security/limits.conf
echo "*      soft    nofile     94000" >> /etc/security/limits.conf
echo "*      hard    nproc      64000" >> /etc/security/limits.conf
echo "*      soft    nproc      64000" >> /etc/security/limits.conf
echo "fs.file-max = 2097152" >> /etc/sysctl.conf
sysctl -p

# DOWNLOAD BUILD ARTIFACTS
# POST-LAUNCH TODO: THIS SHOULD GET SOME KIND OF "LATEST" VERSION.  
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

# IMPORT 1.3 MILLION STEEM ACCOUNTS AND CONFIGURATION TEMPLATE
wget -O /blurt/snapshot.json https://test.blurt.world/_download/snapshot.json
wget -O /blurt/config.ini https://gitlab.com/blurt/blurt/-/raw/dev/doc/witness_config.ini

# INSTALL BLURTD.SERVICE 
wget -O /etc/systemd/system/blurtd.service https://gitlab.com/blurt/blurt/-/raw/dev/doc/blurtd.service

# ENABLE BLURTD SYSTEMD SERVICE
systemctl enable blurtd

# START BLURTD
systemctl start blurtd 
