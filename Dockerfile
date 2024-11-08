# Build stage
FROM node:20 AS builder
WORKDIR /haven-web

ARG SPEAKEASY_VER
ENV SPEAKEASY_VER=$SPEAKEASY_VER

# Install git
RUN apt-get update && apt-get upgrade -y && apt-get install -y git

# Clone repo from git.xx.network
RUN git clone --depth=1 --branch $SPEAKEASY_VER https://git.xx.network/elixxir/speakeasy-web.git /haven-web

# Install dependencies
# Check if package-lock.json exists and run appropriate install command
RUN [ -f package-lock.json ] && npm ci || npm install

# Build the application
RUN npm run build

# Lightweight production image
FROM node:20-slim
ENV NODE_ENV=production
WORKDIR /haven-web

# Install only production dependencies
COPY package*.json ./
# Check if package-lock.json exists and run appropriate install command
RUN [ -f package-lock.json ] && npm ci --omit=dev || npm install --omit=dev

# Copy only the built output from the builder stage
COPY --from=builder /haven-web/.next .next
COPY --from=builder /haven-web/out out

ENTRYPOINT [ "npm", "run", "start" ]
