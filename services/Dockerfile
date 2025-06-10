# syntax=docker/dockerfile:1

FROM node:latest

WORKDIR /app

COPY services/DB/package*.json ./
RUN npm install

COPY services/DB/ .

CMD ["node", "initservice.js"]