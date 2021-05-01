FROM faddat/archlinux

RUN pacman -Syyu --noconfirm npm yarn base-devel

RUN yarn install

EXPOSE 7070

CMD ["pm2 start src/server.js --max-memory-restart 512M"]

