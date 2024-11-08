# Build stage
FROM node:20 AS builder
WORKDIR /haven-web

# Copy only files needed for installation
COPY package*.json ./
COPY next.config.js ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci

# Copy sourcecode
COPY . .

# Build the application
RUN npm run build

# Lightweight production image
FROM node:20-slim
ENV NODE_ENV=production
WORKDIR /haven-web

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy only the built output from the builder stage
COPY --from=builder /haven-web/.next .next
COPY --from=builder /haven-web/out out

ENTRYPOINT [ "npm", "run", "start" ]
