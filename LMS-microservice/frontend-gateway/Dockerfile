FROM node:20-alpine AS builder

WORKDIR /app

# Khai báo ARG để nhận biến từ docker-compose
ARG VITE_API_URL
# Gán ARG vào ENV để Vite có thể đọc được trong quá trình build/chạy
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install

# Copy toàn bộ source code vào container
COPY . .

EXPOSE 5173

# Chạy lệnh dev với --host để nhận diện mạng Docker
CMD ["npm", "run", "dev", "--", "--host"]


