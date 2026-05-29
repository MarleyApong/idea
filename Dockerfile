FROM node:22-alpine AS base

# ── Dependances ──────────────────────────────────────────────────────────────
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

# ── Build ─────────────────────────────────────────────────────────────────────
FROM base AS builder
RUN apk add --no-cache openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Production deps (prod only, cached separement) ───────────────────────────
FROM base AS prodDeps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# ── Production ────────────────────────────────────────────────────────────────
FROM base AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p /app/public/uploads && \
    chown nextjs:nodejs /app/public/uploads

# Reutiliser les deps de prod sans relancer npm install
COPY --from=prodDeps /app/node_modules ./node_modules

# Generer le client Prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
RUN npx prisma generate

# Copier uniquement server.js + .next depuis le standalone (pas ses node_modules)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/server.js ./server.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

COPY scripts/start.sh ./start.sh
RUN chmod +x ./start.sh && chown nextjs:nodejs ./start.sh

USER nextjs

EXPOSE 3007
ENV PORT=3007
ENV HOSTNAME="0.0.0.0"

CMD ["./start.sh"]
