# ==========================================
# STAGE 1: BUILDER (Dùng để biên dịch code)
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy file cấu hình và cài đặt TẤT CẢ thư viện (kể cả dev) để build
COPY package*.json ./
RUN npm ci 

# Copy source code và tiến hành build (tạo ra thư mục dist)
COPY . .
RUN npm run build

# ==========================================
#           STAGE 2: Runner, đã sửa ở đây vào lúc trưa 16/04/2026 nhằm tối ưu dung lượng
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev  && npm cache clean --force

# Copy thư mục dist đã build phẳng từ builder
COPY --from=builder /app/dist ./dist

EXPOSE 3002

CMD ["node", "dist/main"]