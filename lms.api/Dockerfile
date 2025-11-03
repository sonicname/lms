# Multi-stage Dockerfile for NestJS + pnpm + Prisma (Node 20)
# Using Debian slim for Prisma/OpenSSL compatibility

# ---------- Base ----------
FROM node:20-bookworm-slim AS base
WORKDIR /app

# Ensure required system libs (OpenSSL, ca certificates) are present
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

# Enable corepack to get pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# ---------- Dependencies (for build) ----------
FROM base AS deps
ENV NODE_ENV=development

# Copy only dependency manifests and prisma schema first for better caching
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

# Install all deps (including dev) so we can build
RUN pnpm install --frozen-lockfile

# ---------- Build ----------
FROM deps AS build
# Copy the rest of the source
COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src

# Build the app (outputs to dist/)
RUN pnpm build

# ---------- Production dependencies (no devDeps) ----------
FROM base AS prod-deps
# Copy only manifests and prisma schema
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

# Install production-only dependencies; this also runs Prisma client generate
RUN pnpm install --frozen-lockfile --prod

# ---------- Runner ----------
FROM base AS runner
ENV NODE_ENV=production

# Use the default non-root node user for security
USER node

# Copy node_modules from prod-deps, and the built app from build stage
COPY --chown=node:node --from=prod-deps /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node package.json ./package.json
## Copy environment file(s) if present
# Note: ensure .env is not excluded by .dockerignore when you need it in the image
COPY --chown=node:node .env ./.env

# If you serve static content via @nestjs/serve-static, ensure those assets are in dist
# EXPOSE the port your app listens on (Nest defaults to 3000 if not configured otherwise)
EXPOSE 3000

# Optional: Basic healthcheck (adjust path if you have a health route)
# HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
#   CMD node -e "fetch('http://localhost:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/main.js"]
