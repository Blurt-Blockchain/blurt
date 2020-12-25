FROM lopsided/archlinux

MAINTAINER Jacob Gadikian <jacob@blurt.foundation>


COPY ./build/bin/blurtd /usr/bin/blurtd
COPY ./build/bin/cli_wallet /usr/bin/cli_wallet

# FETCH DEPENDENCIES AND SNAPSHOT.
# FETCH SNAPSHOT WITH IPGET, CF IPFS GATEWAY IS UNRELIABLE
RUN pacman -Syyu --noconfirm wget ncurses && \
        wget https://dist.ipfs.io/ipget/v0.6.0/ipget_v0.6.0_linux-amd64.tar.gz && \
        tar xvf ipget_v0.6.0_linux-amd64.tar.gz && \
        mv ipget/ipget /usr/bin && \
        ipget --progress -o /blurt/snapshot.json QmPrwVpwe4Ya46CN9LXNnrUdWvaDLMwFetMUdpcdpjFbyu && \
        rm ipget_v0.6.0_linux-amd64.tar.gz && \
        rm -rf ipget && \
        ln -s /usr/lib/libncursesw.so.6 /usr/lib/libncurses.so.6


# RUN BLURT
CMD ["/usr/bin/blurtd", "--data-dir", "/blurt"]


EXPOSE 8090
EXPOSE 8091
EXPOSE 1776
