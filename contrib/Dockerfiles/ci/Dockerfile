FROM faddat/snapshot

MAINTAINER Jacob Gadikian <jacob@blurt.foundation>


COPY ./build/programs/blurtd/blurtd /usr/bin/blurtd
COPY ./build/programs/cli_wallet/cli_wallet /usr/bin/cli_wallet

# Install and link ncurses
RUN sed -i -e "s/^CheckSpace/#!!!CheckSpace/g" /etc/pacman.conf && \
        pacman -Syyu --noconfirm ncurses && \
        ln -s /usr/lib/libncursesw.so.6 /usr/lib/libncurses.so.6 && \
        sed -i -e "s/^#!!!CheckSpace/CheckSpace/g" /etc/pacman.conf


# RUN BLURT
CMD ["/usr/bin/blurtd", "--data-dir", "/blurtd"]


EXPOSE 8090
EXPOSE 8091
EXPOSE 1776
