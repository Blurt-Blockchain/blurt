FROM node:alpine

MAINTAINER jacob@blurt.foundation

COPY . /condenser

WORKDIR /condenser


RUN apk add --no-cache --virtual .build-deps-full \
        binutils-gold \
        g++ \
        gcc \
        gnupg \
        libgcc \
        linux-headers \
        make \
        python3 \
        yarn \
        git \
        libtool \
        autoconf \
        automake

RUN mkdir tmp && \
    yarn install && \
    yarn build

ENV PORT 80
ENV NODE_ENV production

EXPOSE 80

CMD [ "yarn", "run", "production" ]
