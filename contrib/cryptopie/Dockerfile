FROM faddat/sos-lite

COPY motd /etc/motd

ENV PATH=$PATH:/root/go/bin
ENV GOPATH=/root/go

# THIS WILL BOOT AND JOIN A KILLABLE PI NET RUN BY JACOB

# Disk space thing
# Download starport, too

RUN sed -i -e "s/^CheckSpace/#!!!CheckSpace/g" /etc/pacman.conf && \
        pacman -Syyu --noconfirm net-tools ufw vnstat iftop base-devel wget protobuf git go yarn npm && \
        sed -i -e "s/^#!!!CheckSpace/CheckSpace/g" /etc/pacman.conf && \
        git clone https://github.com/tendermint/starport && \
        cd starport && \
        make 

# Prepare boot script
# cryptopie is now a full-freatured Starport development enviornment!
# translation:  It is ready to make a splash.
RUN echo "sleep 80" >> /usr/local/bin/firstboot.sh && \
        systemctl enable vnstat && \
        echo "export PATH=$PATH:/root/go/bin" > /root/.bash_profile && \
        echo "export GOPATH=/root/go" >> /root/.bash_profile && \
        echo "cryptopie" > /etc/hostname && \
        echo 'docker run -d --net=host -v blurtd:/blurtd --restart=unless-stopped --name blurtd faddat/arm-blurt-presync /usr/bin/blurtd --data-dir /blurtd --plugin "witness account_by_key account_by_key_api condenser_api database_api network_broadcast_api transaction_status transaction_status_api rc_api" --p2p-seed-node 172.26.41.78:1776 --p2p-seed-node 172.26.179.68:1776 --p2p-seed-node 172.26.116.111:1776 --p2p-seed-node 172.26.71.157:1776 --p2p-seed-node 172.26.215.48:1776 --p2p-seed-node 172.26.210.82:1776 --p2p-seed-node 172.26.84.164:1776 --p2p-seed-node 172.26.106.151:1776' >> /usr/local/bin/firstboot.sh 
