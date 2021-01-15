FROM faddat/sos-lite

COPY motd /etc/motd
COPY build/bin/cli_wallet /usr/bin

RUN echo "sleep 80" >> /usr/local/bin/firstboot.sh && \
        echo "cryptopie" > /etc/hostname && \
        ln -s /usr/lib/libncursesw.so.6 /usr/lib/libncurses.so.6 && \
        echo 'docker run -d --net=host -v blurtd:/blurtd --restart=unless-stopped --name blurtd faddat/arm-blurt-presync /usr/bin/blurtd --data-dir /blurtd --plugin "witness account_by_key account_by_key_api condenser_api database_api network_broadcast_api transaction_status transaction_status_api rc_api"' >> /usr/local/bin/firstboot.sh && \
        sleep 600 && \
        echo "docker run --name wls -d --restart always -p 5555:6969 -p 8095:8090 -v whaled:/whaled faddat/wls-pi /usr/bin/whaled --data-dir /whaled" >> /usr/local/bin/firstboot.sh
        
