FROM ubuntu:20.04

ARG SPEAKEASY_VER
ENV SPEAKEASY_VER=$SPEAKEASY_VER

RUN apt-get update && apt-get upgrade -y && apt-get install -y curl git

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs

WORKDIR /speakeasy-web
COPY . .

RUN npm install && npm run build
ENTRYPOINT [ "npm", "run", "start" ]
