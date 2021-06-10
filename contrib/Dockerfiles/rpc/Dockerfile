FROM faddat/blurtrpc-amd64

MAINTAINER Jacob Gadikian <jacob@blurt.foundation>


ADD ./build/programs/blurtd/blurtd /usr/bin/blurtd
ADD ./contrib/rpc-config.ini /blurtd/config.ini
ADD ./build/programs/cli_wallet/cli_wallet /usr/bin/cli_wallet


# RUN BLURT
CMD ["/usr/bin/blurtd", "--data-dir", "/blurtd"]


EXPOSE 8090
EXPOSE 8091
EXPOSE 1776
