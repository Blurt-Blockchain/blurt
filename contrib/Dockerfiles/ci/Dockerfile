FROM lopsided/archlinux

MAINTAINER Jacob Gadikian <jacob@blurt.foundation>


COPY ./build/bin/blurtd /usr/bin/blurtd
COPY ./build/bin/cli_wallet /usr/bin/cli_wallet

# FETCH DEPENDENCIES
RUN pacman -Syyu --noconfirm wget ncurses

RUN mkdir /blurt && \
            wget --progress=bar:force:noscroll -O /blurt/snapshot.json  https://cloudflare-ipfs.com/ipfs/QmPrwVpwe4Ya46CN9LXNnrUdWvaDLMwFetMUdpcdpjFbyu && \
            ln -s /usr/lib/libncursesw.so.6 /usr/lib/libncurses.so.6


# RUN BLURT
CMD ["/usr/bin/blurtd", "--data-dir", "/blurt"]


EXPOSE 8090
EXPOSE 8091
EXPOSE 1776
