FROM node:alpine

WORKDIR /usr/app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PORT=5000

RUN apk add chromium

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 5000
CMD ["yarn", "start"]