# ==========================================
# STAGE 1: BUILDER (Dùng để biên dịch code)
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy file cấu hình và cài đặt TẤT CẢ thư viện (kể cả dev) để build
COPY package*.json ./

# đã sửa ở đây vào lúc trưa 16/04/2026 nhằm tối ưu dung lượng
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

# Chỉ lấy những gì cực kỳ cần thiết

COPY --from=builder /app/package*.json ./

# Cài đặt thư mục node_modules chỉ chứa production deps trực tiếp ở runner

RUN npm install --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]

