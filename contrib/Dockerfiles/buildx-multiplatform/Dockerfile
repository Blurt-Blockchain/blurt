# This is a Rosetta-flavored dockerfile that complies with all Rosetta [recommendations](https://www.rosetta-api.org/docs/node_deployment.html#dockerfile-expectations) for Dockerfiles
# * Build Anywhere
# * Compile exclusively from source
FROM conanio/clang10 AS builder

MAINTAINER Jacob Gadikian <jacob@blurt.foundation>



# GET BLURT READY TO BUILD
RUN git clone --recursive https://gitlab.com/blurt/blurt && \
          cd blurt && \
          git checkout dev && \
          mkdir build && \
          cd build && \
          conan install .. -s compiler=clang -s compiler.libcxx=libstdc++11 -if=. -pr=default --build=missing && \
          cmake -DBLURT_STATIC_BUILD=ON -DLOW_MEMORY_NODE=OFF -DCLEAR_VOTES=OFF -DBUILD_BLURT_TESTNET=OFF -DSKIP_BY_TX_ID=OFF -DBLURT_LINT_LEVEL=OFF -DENABLE_MIRA=OFF -DCMAKE_BUILD_TYPE=Release ..


# BUILD BLURT
RUN cd blurt/build && \
        make -j$(nproc) blurtd cli_wallet


FROM debian:10

EXPOSE 8090
EXPOSE 8091
EXPOSE 1776

RUN apt update && \
	apt upgrade && \
	apt install -y wget

RUN mkdir /blurtd

RUN wget -O snapshot.json  https://cloudflare-ipfs.com/ipfs/QmPrwVpwe4Ya46CN9LXNnrUdWvaDLMwFetMUdpcdpjFbyu 1>/dev/null

COPY --from=builder /home/conan/blurt/build /blurt

# RUN BLURT
CMD ["/blurt/build/bin/blurtd", "--data-dir /blurtd"]
