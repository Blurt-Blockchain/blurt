FROM lopsided/archlinux

MAINTAINER Jacob Gadikian <jacob@blurt.foundation>


COPY ./build/bin/blurtd /usr/bin/blurtd
COPY ./contrib/disappear.ini /blurt/config.ini

COPY ./build/bin/cli_wallet /usr/bin/cli_wallet

# FETCH DEPENDENCIES
RUN pacman -Syyu --noconfirm wget ncurses

RUN wget --progress=bar:force:noscroll -O /blurt/snapshot.json  https://cloudflare-ipfs.com/ipfs/QmPrwVpwe4Ya46CN9LXNnrUdWvaDLMwFetMUdpcdpjFbyu


# RUN BLURT
CMD ["/usr/bin/blurtd", "--data-dir", "/blurt"]


EXPOSE 8090
EXPOSE 8091
EXPOSE 1776

