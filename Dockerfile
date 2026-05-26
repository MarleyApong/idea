FROM node:22-alpine AS base

# ── Dependances ──────────────────────────────────────────────────────────────
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ── Build ─────────────────────────────────────────────────────────────────────
FROM base AS builder
RUN apk add --no-cache openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generer le client Prisma
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Production ────────────────────────────────────────────────────────────────
FROM base AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Dossier uploads persistant (monte via volume dans Coolify)
RUN mkdir -p /app/public/uploads && chown nextjs:nodejs /app/public/uploads

# Copier les fichiers de build standalone
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Schema Prisma + CLI (pas les binaires, on les regenere ici)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Generer le client Prisma directement dans le runner
RUN node node_modules/prisma/build/index.js generate \
    && chown -R nextjs:nodejs /app/node_modules/.prisma

# Script de demarrage (migrations + serveur)
COPY --from=builder /app/scripts/start.sh ./start.sh
RUN chmod +x ./start.sh

USER nextjs

EXPOSE 3007
ENV PORT=3007
ENV HOSTNAME="0.0.0.0"

CMD ["./start.sh"]
