FROM node:22-bullseye-slim AS base

# Stage 0: Pruner
FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune frontend --docker

# Stage 1: Dependencies
FROM base AS deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    libc6 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV COREPACK_ENABLE=0
ENV TURBO_PACKAGE_MANAGER=npm
COPY --from=pruner /app/out/json/ .
RUN npm install --include=optional

# Stage 2: Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app ./
COPY --from=pruner /app/out/full/ .
# We build the project using turbo
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN npm run build -- --filter=frontend

# Stage 3: Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build from builder stage
# In monorepos, standalone usually creates the whole structure inside 'standalone/'
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000

# The entrypoint is server.js inside the app directory
CMD ["node", "apps/web/server.js"]
