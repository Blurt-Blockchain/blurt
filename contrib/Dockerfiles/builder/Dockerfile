FROM faddat/archlinux

MAINTAINER jacobgadikian@gmail.com

RUN pacman -Syyu --noconfirm python-pip wget git bison doxygen base-devel clang ccache cmake npm yarn neovim 



# Prepare to build
# RUN cd /blurt && \
#		mkdir build && \
#		cd build && \
#		cmake -DBLURT_STATIC_BUILD=ON -DLOW_MEMORY_NODE=OFF -DCLEAR_VOTES=OFF -DBUILD_BLURT_TESTNET=OFF -DSKIP_BY_TX_ID=OFF -DBLURT_LINT_LEVEL=OFF -DENABLE_MIRA=OFF -DCMAKE_BUILD_TYPE=Release ..

# build
# RUN cd blurt/build && \
#		make -j$(nproc) blurtd cli_wallet

