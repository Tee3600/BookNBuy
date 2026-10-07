# BookNBuy production image (Next.js standalone + Prisma).
# Build: docker build -t booknbuy .   Run: see docker-compose.prod.yml
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Prisma client for the postgres schema (no live DB needed to generate)
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
RUN addgroup -S app && adduser -S app -G app
COPY --from=builder /app/public ./public
COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/scripts ./scripts
USER app
EXPOSE 3000
ENV PORT=3000 HOSTNAME="0.0.0.0"
# Apply migrations at startup, then serve. Provide DATABASE_URL via env.
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
