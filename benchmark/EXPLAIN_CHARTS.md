# Giải thích kết quả benchmark

## 1. Tại sao có nhiều thư mục `read`, chỉ có 1 `write` và 1 `mix`?
- Mỗi thư mục trong `benchmark/results` tương ứng với một lần chạy benchmark với loại workload khác nhau:
  - `read`: chỉ test các thao tác đọc dữ liệu.
  - `write`: chỉ test các thao tác ghi dữ liệu.
  - `mixed`: test cả đọc và ghi xen kẽ.
- Việc có nhiều thư mục `read` nghĩa là đã chạy nhiều lần test với workload đọc, còn `write` và `mix` chỉ chạy 1 lần. Mỗi lần chạy sẽ sinh ra một thư mục riêng biệt để lưu kết quả.

## 2. Ý nghĩa các hình ảnh trong thư mục `charts` của mỗi lần chạy
| Tên file | Ý nghĩa |
|----------|---------|
| cpu_usage.png | Biểu đồ tổng quan sử dụng CPU của toàn hệ thống trong suốt quá trình benchmark. |
| cpu_usage_vs_users_microservices.png | Biểu đồ thể hiện mối quan hệ giữa số lượng user và mức sử dụng CPU (microservices). |
| cpu_usage_vs_users_monolith.png | Biểu đồ thể hiện mối quan hệ giữa số lượng user và mức sử dụng CPU (monolith). |
| avg_cpu_percent.png | Biểu đồ phần trăm CPU trung bình sử dụng. |
| latency_avg_ms.png | Biểu đồ độ trễ trung bình (ms) của các request. |
| latency_p95_ms.png | Biểu đồ độ trễ p95 (95% request có độ trễ thấp hơn giá trị này). |
| latency_p99_ms.png | Biểu đồ độ trễ p99 (99% request có độ trễ thấp hơn giá trị này). |
| ... | ... |

- Nếu biểu đồ chỉ có 1 chấm (point) thay vì 1 đường (line), thường do chỉ có 1 mức tải (user) được test hoặc chỉ có 1 sample dữ liệu.
- Nếu biểu đồ chỉ có các chấm rời rạc, có thể do mỗi mức user chỉ có 1 sample hoặc dữ liệu log bị thiếu.
