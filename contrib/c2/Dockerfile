FROM faddat/sos-c2

COPY motd /etc/motd

ENV PATH=$PATH:/root/go/bin
ENV GOPATH=/root/go

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
        echo "export PATH=$PATH:/root/go/bin" > /root/.bash_profile && \
        echo "export GOPATH=/root/go" >> /root/.bash_profile && \
        sed -i -e "s/^#!!!CheckSpace/CheckSpace/g" /etc/pacman.conf


# Prepare boot script
# cryptopie is now a full-freatured Starport development enviornment!
# translation:  It is ready to make a splash.
RUN echo "sleep 80" >> /usr/local/bin/firstboot.sh && \
        echo "odroid-c2" > /etc/hostname && \
        echo 'docker run -d --net=host -v blurtd:/blurtd --restart=unless-stopped --name blurtd faddat/arm-blurt-presync /usr/bin/blurtd --data-dir /blurtd --plugin "witness account_by_key account_by_key_api condenser_api database_api network_broadcast_api transaction_status transaction_status_api rc_api" >> /usr/local/bin/firstboot.sh 
