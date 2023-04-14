FROM node:lts as builder

WORKDIR /home/node/app
COPY . /home/node/app

RUN npm clean-install && npm run build

FROM node:lts-slim
LABEL Brice DEKANY <dbrice@vmware.com>
ENV NODE_ENV=production
USER node

WORKDIR /home/node/app

COPY package*.json ./
RUN npm clean-install --production

COPY --from=builder /home/node/app/build ./build
