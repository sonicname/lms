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

# Generate Prisma Client and build the app (outputs to dist/)
# Then copy generated client (if using custom output under src/generated) into dist so runtime can resolve it
# Also copy Prisma engine files into dist/generated/prisma to satisfy runtime resolution.
RUN pnpm dlx prisma generate \
  && pnpm build \
  && mkdir -p dist/generated/prisma \
  && if [ -d src/generated/prisma ]; then cp -R src/generated/prisma/* dist/generated/prisma/; fi \
  && if [ -d src/generated ] && [ ! -d src/generated/prisma ]; then cp -R src/generated/* dist/generated/; fi \
  && if [ -d node_modules/.prisma/client ]; then cp -R node_modules/.prisma/client/* dist/generated/prisma/; fi

# ---------- Production dependencies (no devDeps) ----------
FROM base AS prod-deps
# Copy only manifests and prisma schema
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

# Install production-only dependencies; this also runs Prisma client generate
RUN pnpm install --frozen-lockfile --prod \
  && pnpm dlx prisma generate || true

# ---------- Runner ----------
FROM base AS runner
ENV NODE_ENV=production

# Ensure writable upload directory exists and is owned by the runtime user
RUN mkdir -p /app/uploads \
  && chown -R node:node /app/uploads

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
