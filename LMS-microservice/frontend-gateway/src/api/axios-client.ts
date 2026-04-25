// src/api/axios-client.ts
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
});

// Tự động thêm Token vào mỗi request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tự động xử lý khi Token hết hạn (401)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';

      // 🛑 THÊM CHỐT CHẶN Ở ĐÂY:
      // CHỈ force logout và chuyển hướng nếu API KHÔNG PHẢI là API login
      if (!requestUrl.includes('/login')) {
        localStorage.clear();
        
        // Gợi ý: Chỗ này đuổi về '/' (Trang chọn Role) sẽ hợp lý hơn là ép về '/admin'
        window.location.href = '/'; 
      }
    }
    // Dù có chuyển hướng hay không, vẫn phải ném lỗi đi tiếp để component bắt được
    return Promise.reject(error);
  }
);


export default axiosClient;