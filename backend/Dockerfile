# Sử dụng base image Node.js
FROM node:20-alpine AS builder

WORKDIR /app

# Cài đặt các gói cần thiết cho Prisma
RUN apk add --no-cache openssl libc6-compat

# Copy package.json và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ mã nguồn (bao gồm cả schema.prisma và prisma.config.ts)
COPY . .

# 1. BẮT BUỘC: Phải generate Prisma Client TRƯỚC KHI build NestJS
RUN npx prisma generate

# 2. Sau đó mới chạy build ứng dụng NestJS
RUN npm run build

# --- PRODUCTION STAGE ---
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/src/generated ./src/generated

EXPOSE 3001

CMD DATABASE_URL="${DIRECT_URL:-$DATABASE_URL}" npx prisma migrate deploy && node dist/main.js