FROM faddat/sos-full

COPY --from=builder /blurt/build/bin/* /usr/bin

COPY --from=builder /blurt/contrib/blurtd.service /etc/systemd/system/blurtd.service

# snapshot and config
RUN systemctl enable blurtd && \
		mkdir /blurt && \
		curl -o /blurt/snapshot.json https://cloudflare-ipfs.com/ipfs/QmPrwVpwe4Ya46CN9LXNnrUdWvaDLMwFetMUdpcdpjFbyu && \	
		curl -o /blurt/config.ini https://gitlab.com/blurt/blurt/-/raw/dev/doc/witnesses/config.ini




