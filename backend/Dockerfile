FROM node:20-alpine

# Cực kỳ quan trọng: Prisma và Alpine bắt buộc cần OpenSSL và libc6-compat để chạy query engine
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build ứng dụng và generate Prisma Client
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npx prisma generate && npm run build

EXPOSE 3001

# Chạy migration an toàn trước, sau đó mới khởi động ứng dụng NestJS
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]