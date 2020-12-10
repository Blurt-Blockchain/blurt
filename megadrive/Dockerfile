FROM faddat/sos-full

# COPY --from=registry.gitlab.com/blurt/blurt/md-build /blurt/build/bin/* /usr/bin

# COPY --from=registry.gitlab.com/blurt/blurt/md-build /blurt/contrib/blurtd.service /etc/systemd/system/blurtd.service

# snapshot and config
RUN systemctl enable blurtd && \
		mkdir /blurt && \
		curl -o /blurt/snapshot.json https://cloudflare-ipfs.com/ipfs/QmPrwVpwe4Ya46CN9LXNnrUdWvaDLMwFetMUdpcdpjFbyu && \	
		curl -o /blurt/config.ini https://gitlab.com/blurt/blurt/-/raw/dev/doc/witnesses/config.ini


COPY megadrive/bin/blurtd /usr/bin
COPY megadrive/bin/cli_wallet /usr/bin


