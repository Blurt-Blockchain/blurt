FROM faddat/sos-c2

COPY motd /etc/motd

RUN sed -i -e "s/^CheckSpace/#!!!CheckSpace/g" /etc/pacman.conf && \
        pacman -Syyu --noconfirm net-tools ufw vnstat iftop zerotier-one wget && \
        mkdir starport && \
        cd starport && \
        wget -O starport_0.14.0_linux_arm64.tar.gz https://github.com/tendermint/starport/releases/download/v0.14.0/starport_0.14.0_linux_arm64.tar.gz && \
        tar xvf starport_0.14.0_linux_arm64.tar.gz && \
        mv starport /usr/bin && \
        chmod +x /usr/bin/starport && \
        sed -i -e "s/^#!!!CheckSpace/CheckSpace/g" /etc/pacman.conf


# Prepare boot script
# cryptopie is now a full-freatured Starport development enviornment!
# translation:  It is ready to make a splash.
RUN echo "sleep 80" >> /usr/local/bin/firstboot.sh && \
        pacman -Syyu --noconfirm go npm yarn && \
        systemctl enable zerotier-one && \
        systemctl enable vnstat && \
        ufw default deny && \
        ufw default deny outgoing && \
        ufw allow ssh && \
        ufw allow 9993/udp && \
        ufw allow out http && \
        ufw allow out https && \
        ufw allow out 9993/udp && \
        ufw allow in on ztuzesm2fn from 0.0.0.0/0 && \
        ufw allow out on ztuzesm2fn to 0.0.0.0/0 && \
        ufw allow in on ztmjfdvu4d from 0.0.0.0/0 && \
        ufw allow out on ztmjfdvu4d to 0.0.0.0/0 && \
        ufw deny out on eth0 from any to any port 1776 && \
        ufw allow out ntp && \
        ufw allow out 53/udp && \
        echo "zerotier-cli join 8056c2e21cf8319f" >> /usr/local/bin/firstboot.sh && \
        echo "ufw enable" >> /usr/local/bin/firstboot.sh && \
        echo "cryptopie" > /etc/hostname && \
        echo 'docker run -d --net=host -v blurtd:/blurtd --restart=unless-stopped --name blurtd faddat/arm-blurt-presync /usr/bin/blurtd --data-dir /blurtd --plugin "witness account_by_key account_by_key_api condenser_api database_api network_broadcast_api transaction_status transaction_status_api rc_api" --p2p-seed-node 172.26.41.78:1776 --p2p-seed-node 172.26.179.68:1776 --p2p-seed-node 172.26.116.111:1776 --p2p-seed-node 172.26.71.157:1776 --p2p-seed-node 172.26.215.48:1776 --p2p-seed-node 172.26.210.82:1776 --p2p-seed-node 172.26.84.164:1776 --p2p-seed-node 172.26.106.151:1776' >> /usr/local/bin/firstboot.sh 
