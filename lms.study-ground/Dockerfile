## Build client-only app and serve with Nginx (CSR)

# ---- Build stage -----------------------------------------------------------
FROM node:20-alpine AS builder
ARG VITE_API_URL
ARG VITE_NODE_ENV
ENV VITE_API_URL=$VITE_API_URL \
	VITE_NODE_ENV=$VITE_NODE_ENV
WORKDIR /app

# Enable corepack to use pnpm from packageManager field
RUN corepack enable

# Copy manifests and envs first for better caching
COPY package.json pnpm-lock.yaml .env* ./

# Install deps (include dev deps for build)
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN echo "CSR build: VITE_API_URL=$VITE_API_URL" && pnpm build

# ---- Runtime stage ---------------------------------------------------------
FROM nginx:1.27-alpine AS runner
ENV NGINX_ENTRYPOINT_QUIET_LOGS=1

# Copy built client (React Router outputs to build/client)
COPY --from=builder /app/build/client /usr/share/nginx/html

# Add SPA-friendly Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
