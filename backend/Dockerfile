FROM oven/bun:1

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json bun.lock ./
COPY prisma ./prisma
RUN bun install

COPY . .

EXPOSE 3000

CMD ["bun", "src/server.ts"]
