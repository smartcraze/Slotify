FROM oven/bun:slim AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install

# build stage
FROM oven/bun:slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN --mount=type=secret,id=env,target=/app/.env \
    bun run build

# running stage
FROM oven/bun:slim AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/generated ./generated

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "server.js"]