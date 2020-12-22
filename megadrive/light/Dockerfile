FROM faddat/sos-lite

COPY motd /etc/motd
COPY build/bin/cli_wallet /usr/bin

RUN echo "sleep 80" >> /usr/local/bin/firstboot.sh && \
        echo "docker run --net=host -d --restart always --name blurt -v blurt:/blurt registry.gitlab.com/blurt/blurt/megadrive:latest /usr/bin/blurtd --data-dir /blurt" >> /usr/local/bin/firstboot.sh && \
        echo "docker run --name condenser -d --restart always -p 80:8080 registry.gitlab.com/blurt/openblurt/condenser:latest" >> /usr/local/bin/firstboot.sh && \
        echo "docker run --name wls -d --restart always -p 5555:6969 -p 8095:8090 -v whaled:/whaled faddat/wls-pi /usr/bin/whaled --data-dir /whaled" >> /usr/local/bin/firstboot.sh && \
        ln -s /usr/lib/libncursesw.so.6 /usr/lib/libncurses.so.6
        
