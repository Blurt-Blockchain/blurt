FROM faddat/sos AS builder

MAINTAINER jacobgadikian@gmail.com

RUN pacman -Syyu --noconfirm python-pip wget bison doxygen clang cmake npm yarn && \
		pip install conan

COPY . /blurt

ENV CC=clang
ENV CXX=clang++

# Prepare to build
RUN mkdir -p /root/.conan/profiles/ && \
		cp blurt/megadrive/default /root/.conan/profiles/default && \
		cd blurt && \
		mkdir build && \
		cd build && \
		conan install .. -if=. -pr=default --build=missing && \
		cmake -DBLURT_STATIC_BUILD=ON -DLOW_MEMORY_NODE=OFF -DCLEAR_VOTES=OFF -DBUILD_BLURT_TESTNET=OFF -DSKIP_BY_TX_ID=OFF -DBLURT_LINT_LEVEL=OFF -DENABLE_MIRA=OFF -DCMAKE_BUILD_TYPE=Release ..

# build
RUN cd blurt/build && \
		make -j$(nproc) blurtd cli_wallet
	

# RUN git clone https://gitlab.com/blurt/openblurt/condenser && \
#		cd condenser && \
#		yarn install && \
#		yarn build


FROM faddat/sos

# RUN pacman -Syyu yarn

# COPY --from=builder /condenser .

COPY --from=builder /blurt/build/bin/* /usr/bin

COPY --from=builder /blurt/contrib/blurtd.service /etc/systemd/system/blurtd.service


# snapshot and config
RUN systemctl enable blurtd && \
		mkdir /blurt && \
		curl -o /blurt/snapshot.json https://cloudflare-ipfs.com/ipfs/QmPrwVpwe4Ya46CN9LXNnrUdWvaDLMwFetMUdpcdpjFbyu && \	
		curl -o /blurt/config.ini https://gitlab.com/blurt/blurt/-/raw/dev/doc/witnesses/config.ini




