import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 1. Định nghĩa plugin hiển thị danh sách URL
const showAppRoutes = () => {
  return {
    name: 'show-app-routes',
    configureServer(server: any) {
      // Đợi server lắng nghe (listening) rồi mới in ra
      server.httpServer?.once('listening', () => {
        const port = server.config.server.port || 5173;
        const base = `http://localhost:${port}`;

        setTimeout(() => {
          console.log(`  \x1b[32m➜\x1b[0m  \x1b[1mApp Routes (React Router):\x1b[0m`);
          console.log(`  \x1b[34m➜\x1b[0m  Portal:     \x1b[36m${base}/\x1b[0m`);
          console.log(`  \x1b[34m➜\x1b[0m  Settings:   \x1b[36m${base}/login/staff\x1b[0m`);
          console.log(`  \x1b[34m➜\x1b[0m  Login:      \x1b[36m${base}/login/student\x1b[0m`);
          console.log(`  \x1b[34m➜\x1b[0m  Profile:    \x1b[36m${base}/student/attendance\x1b[0m`);
          console.log(`  \x1b[34m➜\x1b[0m  Profile:    \x1b[36m${base}/student/courses\x1b[0m`);
          console.log(`  \x1b[34m➜\x1b[0m  Profile:    \x1b[36m${base}/student/assignments\x1b[0m`);
          console.log(`  \x1b[34m➜\x1b[0m  Settings:   \x1b[36m${base}/staff\x1b[0m`);
          console.log(`  \x1b[34m➜\x1b[0m  Settings:   \x1b[36m${base}/login/staff\x1b[0m`);
          console.log(`\n`);
        }, 100); // Delay nhẹ để nó hiện sau dòng Local mặc định của Vite
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    showAppRoutes() // Thêm vào đây
  ],
  server: {
    port: 5173,
    open: true // Tự động mở trình duyệt nếu muốn
  }
})
