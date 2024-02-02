FROM ubuntu:20.04

ARG SPEAKEASY_VER
ENV SPEAKEASY_VER=$SPEAKEASY_VER

RUN apt-get update && apt-get upgrade -y && apt-get install -y curl git

RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && apt-get install -y nodejs

RUN mkdir /speakeasy-web && git clone --depth=1 -b $SPEAKEASY_VER https://git.xx.network/elixxir/speakeasy-web.git /speakeasy-web && cd /speakeasy-web && npm install && npm run build

WORKDIR /speakeasy-web
ENTRYPOINT [ "npm", "run", "start" ]
