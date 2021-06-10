FROM faddat/blurtpresync-amd64

MAINTAINER Jacob Gadikian <jacob@blurt.foundation>


COPY ./build/bin/blurtd /usr/bin/blurtd
COPY ./build/bin/cli_wallet /usr/bin/cli_wallet

# RUN BLURT
CMD ["/usr/bin/blurtd", "--data-dir", "/blurtd"]


EXPOSE 8090
EXPOSE 8091
EXPOSE 1776

