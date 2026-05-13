# MIG Tender Frontend — Next.js 16 standalone production build.
# Multi-stage: deps -> builder -> runner. Финальный образ ~150 MB.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# `npm ci` для воспроизводимости — поднимает строго то что в lockfile.
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* переменные нужны во время билда — Next.js их инлайнит
# в клиентский бандл. Передаются через build args в docker-compose.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_DADATA_TOKEN
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PUBLIC_DADATA_TOKEN=${NEXT_PUBLIC_DADATA_TOKEN} \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Не-root юзер
RUN addgroup -S -g 1001 nextjs && adduser -S -u 1001 -G nextjs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
