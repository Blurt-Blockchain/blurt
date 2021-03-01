FROM lopsided/archlinux

RUN pacman -Syyu --noconfirm npm yarn base-devel

RUN yarn install

EXPOSE 8000

CMD ["pm2 start src/server.js --max-memory-restart 512M"]

