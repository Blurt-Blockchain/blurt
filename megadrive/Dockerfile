FROM faddat/sos

MAINTAINER jacobgadikian@gmail.com

RUN pacman -Syyu --noconfirm python-pip wget bison doxygen clang cmake && \
	pip install conan

COPY default /root/.conan/profiles/default

ENV CC=clang
ENV CXX=clang++

# Prepare to build
RUN git clone https://gitlab.com/blurt/blurt --branch armnew && \
	cd blurt && \
	mkdir build && \
	cd build && \
	conan install .. -if=. -pr=default --build=missing && \
	cmake -DBLURT_STATIC_BUILD=ON -DLOW_MEMORY_NODE=OFF -DCLEAR_VOTES=OFF -DBUILD_BLURT_TESTNET=OFF -DSKIP_BY_TX_ID=OFF -DBLURT_LINT_LEVEL=OFF -DENABLE_MIRA=OFF -DCMAKE_BUILD_TYPE=Release ..

# build
RUN cd blurt/build && \
	make -j$(nproc) blurtd cli_wallet && \
	cp bin/* /usr/bin
	
# snapshot and config
RUN mkdir /blurtd && \
	wget -O /blurtd/snapshot.json  https://cloudflare-ipfs.com/ipfs/QmPrwVpwe4Ya46CN9LXNnrUdWvaDLMwFetMUdpcdpjFbyu && \	
	wget -O /blurtd/config.ini https://gitlab.com/blurt/blurt/-/raw/dev/doc/witnesses/config.ini

CMD ["/usr/bin/blurtd","--data-dir /blurtd"]
