FROM faddat/sos-full

COPY contrib/blurtd.service /etc/systemd/system/blurtd.service

# snapshot and config
RUN systemctl enable blurtd && \
		mkdir /blurt && \
		curl -o /blurt/snapshot.json https://cloudflare-ipfs.com/ipfs/QmPrwVpwe4Ya46CN9LXNnrUdWvaDLMwFetMUdpcdpjFbyu && \	
		curl -o /blurt/config.ini https://gitlab.com/blurt/blurt/-/raw/dev/doc/witnesses/config.ini

RUN useradd --create-home blurt && \
        echo "blurt:blurt" | chpasswd && \
        usermod --append --groups wheel blurt && \
		echo "megadrive" > /etc/hostname && \
		echo "password  include   system-local-login" >> /etc/pam.d/login && \
		passwd -e blurt


RUN git clone https://gitlab.com/blurt/openblurt/condenser && \
		pacman -Syyu --noconfirm yarn node-gyp npm ncurses && \
		cd condenser && \
		yarn install && \
		mkdir tmp && \
		yarn build 

COPY megadrive/condenser.service /etc/systemd/system/condenser.service
COPY bin/blurtd /usr/bin
COPY bin/cli_wallet /usr/bin

RUN systemctl enable condenser



