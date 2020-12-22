FROM faddat/sos-c2

COPY motd /etc/motd

RUN echo "sleep 80" >> /usr/local/bin/firstboot.sh && \
        echo "docker run --net=host --restart always --name blurt -v blurt:/blurt registry.gitlab.com/blurt/blurt/megadrive:latest /usr/bin/blurtd --data-dir /blurt" >> /usr/local/bin/firstboot.sh
        echo "docker run --name condenser --restart always -v /blurt:/blurt -p 80:8080 registry.gitlab.com/blurt/openblurt/condenser:latest" && \
        echo "docker run --name wls --restart always -p 5555:6969 -p 8095:8090 -v whaled:/whaled faddat/wls-pi /usr/bin/whaled --data-dir /whaled"