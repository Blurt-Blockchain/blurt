FROM faddat/sos-lite

COPY motd /etc/motd

# THIS WILL BOOT AND JOIN A KILLABLE PI NET RUN BY JACOB

RUN echo "sleep 80" >> /usr/local/bin/firstboot.sh && \
        pacman -Syyu --noconfirm net-tools ufw vnstat iftop zerotier-one && \
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
        echo 'docker run -d --net=host -v blurtd:/blurtd --restart=unless-stopped --name blurtd faddat/arm-blurt-presync /usr/bin/blurtd --data-dir /blurtd --plugin "witness account_by_key account_by_key_api condenser_api database_api network_broadcast_api transaction_status transaction_status_api rc_api" --p2p-seed-node 172.26.41.146:1776' >> /usr/local/bin/firstboot.sh && \
        
        
