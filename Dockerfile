FROM node:22-bullseye-slim AS base

# Stage 1: Dependencies
FROM base AS deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    libc6 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Disable Corepack and explicitly set Turbo's package manager
ENV COREPACK_ENABLE=0
ENV TURBO_PACKAGE_MANAGER=npm

# Copy root configurations
COPY package.json package-lock.json* ./

# Copy all workspace package.json files (required for workspace resolution)
COPY apps/web/package.json ./apps/web/
COPY apps/agent/package.json ./apps/agent/

# Install dependencies including optional native binaries for Linux
RUN npm install --include=optional

# Stage 2: Builder
FROM base AS builder
WORKDIR /app

# Inherit node_modules and pre-installed dependencies
COPY --from=deps /app ./

# Copy the rest of the source code
COPY . .

# Environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV TURBO_PACKAGE_MANAGER=npm

# Execute the build via turbo
RUN npm run build

# Stage 3: Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set correct permissions
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy the standalone build result
# Next.js puts the bundled server.js and node_modules here
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000

# Standalone server is entrypoint
CMD ["node", "apps/web/server.js"]
