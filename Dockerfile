FROM node:lts as builder

WORKDIR /home/node/app
COPY . /home/node/app

RUN npm clean-install && npm run build

FROM node:lts-slim
LABEL Brice DEKANY <dbrice@vmware.com>
ENV NODE_ENV=production

WORKDIR /home/node/app

COPY package*.json ./
RUN npm clean-install --omit=dev

COPY --from=builder  --chown=node:node  /home/node/app/build ./build
USER node