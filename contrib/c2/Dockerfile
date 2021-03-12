FROM faddat/sos-c2

COPY motd /etc/motd

RUN sed -i -e "s/^CheckSpace/#!!!CheckSpace/g" /etc/pacman.conf && \
        pacman -Syyu --noconfirm net-tools ufw vnstat iftop zerotier-one wget go npm yarn protobuf git && \
        systemctl enable docker && \
        git clone https://github.com/tendermint/starport && \
        cd starport && \
        make && \
        mv build/starport /usr/bin/starport && \
        cd .. && rm -rf starport && \
        systemctl enable zerotier-one && \
        systemctl enable vnstat && \
        mkdir /root/go && \
        echo "export PATH=$PATH:/root/go/bin" > /root/.bash_profile && \
        echo "export GOPATH=/root/go" >> /root/.bash_profile && \
        sed -i -e "s/^#!!!CheckSpace/CheckSpace/g" /etc/pacman.conf


# Prepare boot script
# cryptopie is now a full-freatured Starport development enviornment!
# translation:  It is ready to make a splash.
RUN echo "sleep 80" >> /usr/local/bin/firstboot.sh && \
        echo "zerotier-cli join 8056c2e21cf8319f" >> /usr/local/bin/firstboot.sh && \
        echo "ufw enable" >> /usr/local/bin/firstboot.sh && \
        echo "odroid-c2" > /etc/hostname && \
        echo 'docker run -d --net=host -v blurtd:/blurtd --restart=unless-stopped --name blurtd faddat/arm-blurt-presync /usr/bin/blurtd --data-dir /blurtd --plugin "witness account_by_key account_by_key_api condenser_api database_api network_broadcast_api transaction_status transaction_status_api rc_api" --p2p-seed-node 172.26.41.78:1776 --p2p-seed-node 172.26.179.68:1776 --p2p-seed-node 172.26.116.111:1776 --p2p-seed-node 172.26.71.157:1776 --p2p-seed-node 172.26.215.48:1776 --p2p-seed-node 172.26.210.82:1776 --p2p-seed-node 172.26.84.164:1776 --p2p-seed-node 172.26.106.151:1776' >> /usr/local/bin/firstboot.sh 
