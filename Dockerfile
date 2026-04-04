FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy the monorepo configuration files
COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/
COPY apps/agent/package.json ./apps/agent/

# Install all dependencies (handles workspaces)
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy all node_modules from deps stage (root and workspace levels)
COPY --from=deps /app ./

# Copy all source files
COPY . .

# Next.js telemetry is disabled
ENV NEXT_TELEMETRY_DISABLED=1

# Build the project using turbo (from root)
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir -p .next && chown nextjs:nodejs .next

# Copy the standalone build and static files
# In a monorepo, next build (standalone) is in apps/web/.next/standalone
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# When using standalone, we run server.js from the apps/web directory
# Standalone mode in monorepos might have a slightly different path
# Usually it is /app/apps/web/server.js if not properly handled
CMD ["node", "apps/web/server.js"]
