# Multi-stage Dockerfile for a Vite + React production build served by Nginx

# ---- Build stage -----------------------------------------------------------
FROM node:20-alpine AS builder
ARG VITE_API_URL
ARG VITE_NODE_ENV
ENV VITE_API_URL=$VITE_API_URL \
	VITE_NODE_ENV=$VITE_NODE_ENV
WORKDIR /app

# Enable corepack so we can use pnpm without a global install
RUN corepack enable

# Copy only manifest files first for better layer caching plus env definition files
COPY package.json pnpm-lock.yaml .env* ./

# Install deps (including devDeps needed for building)
RUN pnpm install --frozen-lockfile

# Copy the rest of the source and build
COPY . .
# Ensure Vite sees build-time variables (must start with VITE_*)
RUN echo "Using VITE_API_URL=$VITE_API_URL" && pnpm build

# ---- Runtime stage ---------------------------------------------------------
FROM nginx:1.27-alpine AS runner
ENV NGINX_ENTRYPOINT_QUIET_LOGS=1

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Add SPA-friendly Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

