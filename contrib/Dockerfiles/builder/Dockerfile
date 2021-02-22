FROM lopsided/archlinux

MAINTAINER jacobgadikian@gmail.com

RUN sed -i -e "s/^CheckSpace/#!!!CheckSpace/g" /etc/pacman.conf && \
		pacman -Syyu --noconfirm python-pip wget git bison doxygen base-devel clang ccache cmake npm yarn && \
		pip install conan && \
		sed -i -e "s/^#!!!CheckSpace/CheckSpace/g" /etc/pacman.conf


COPY ./contrib/conan-profile/default /root/.conan/profiles/default

ENV CC=clang
ENV CXX=clang++

# Prepare to build
# RUN mkdir -p /root/.conan/profiles/ && \
#		cp /blurt/megadrive/default /root/.conan/profiles/default && \
#		cd /blurt && \
#		mkdir build && \
#		cd build && \
#		conan install .. -if=. -pr=default --build=missing && \
#		cmake -DBLURT_STATIC_BUILD=ON -DLOW_MEMORY_NODE=OFF -DCLEAR_VOTES=OFF -DBUILD_BLURT_TESTNET=OFF -DSKIP_BY_TX_ID=OFF -DBLURT_LINT_LEVEL=OFF -DENABLE_MIRA=OFF -DCMAKE_BUILD_TYPE=Release ..

# build
# RUN cd blurt/build && \
#		make -j$(nproc) blurtd cli_wallet

