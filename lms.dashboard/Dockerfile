# Multi-stage Dockerfile for a Vite + React production build served by Nginx

# ---- Build stage -----------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Enable corepack so we can use pnpm without a global install
RUN corepack enable

# Copy only manifest files first for better layer caching
COPY package.json pnpm-lock.yaml ./

# Install deps (including devDeps needed for building)
RUN pnpm install --frozen-lockfile

# Copy the rest of the source and build
COPY . .
RUN pnpm build

# ---- Runtime stage ---------------------------------------------------------
FROM nginx:1.27-alpine AS runner

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Add SPA-friendly Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

