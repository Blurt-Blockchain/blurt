FROM faddat/archlinux

RUN pacman -Syyu --noconfirm npm yarn base-devel pm2

RUN yarn install

EXPOSE 7070

COPY . .


CMD ["yarn","run start"]

