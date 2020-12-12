FROM faddat/sos-full

COPY blurtd.service /etc/systemd/system/blurtd.service

# snapshot and config
RUN systemctl enable blurtd && \
		mkdir /blurt && \
		curl -o /blurt/snapshot.json https://cloudflare-ipfs.com/ipfs/QmPrwVpwe4Ya46CN9LXNnrUdWvaDLMwFetMUdpcdpjFbyu && \	
		curl -o /blurt/config.ini https://gitlab.com/blurt/blurt/-/raw/dev/doc/witnesses/config.ini

RUN useradd --create-home blurt && \
        echo "blurt:blurt" | chpasswd && \
        usermod --append --groups wheel blurt && \
		echo "megadrive" > /etc/hostname

RUN git clone https://gitlab.com/blurt/openblurt/condenser && \
		cd condenser && \
		yarn install && \
		mkdir tmp && \
		yarn build 


COPY bin/blurtd /usr/bin
COPY bin/cli_wallet /usr/bin


