FROM faddat/blurtpresync-amd64

MAINTAINER Jacob Gadikian <jacob@blurt.foundation>


COPY ./build/programs/blurtd/blurtd /usr/bin/blurtd
COPY ./contrib/rpc-config.ini /blurtd/config.ini
COPY ./build/programs/cli_wallet/cli_wallet /usr/bin/cli_wallet

# FETCH DEPENDENCIES AND SNAPSHOT.
# FETCH SNAPSHOT WITH IPGET, CF IPFS GATEWAY IS UNRELIABLE
RUN pacman -Syyu --noconfirm ncurses && \
        ln -s /usr/lib/libncursesw.so.6 /usr/lib/libncurses.so.6

# RUN BLURT
CMD ["/usr/bin/blurtd", "--data-dir", "/blurtd"]


EXPOSE 8090
EXPOSE 8091
EXPOSE 1776
