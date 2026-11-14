# Sử dụng base image Node.js
FROM node:20-alpine AS builder

WORKDIR /app

# Cài đặt các gói cần thiết cho Prisma
RUN apk add --no-cache openssl libc6-compat

# Copy package.json và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ mã nguồn
COPY . .

# Build ứng dụng NestJS
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

EXPOSE 3001

# Chạy migrate bằng DIRECT_URL (cổng 5432) trước, sau đó khởi động app dùng DATABASE_URL (cổng 6543)
CMD npx prisma migrate deploy && node dist/main.js