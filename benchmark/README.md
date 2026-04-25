# LMS Benchmark Guide (Monolith vs Microservices)

## 1) Muc tieu

Do hieu nang giua hai kien truc:

- Monolith (`http://localhost:3000`)
- Microservices qua API Gateway (`http://localhost:4000`)

Chi so chinh:

- Throughput (RPS)
- Response time (`avg`, `p95`, `p99`)
- CPU usage
- Memory + Network I/O (qua Grafana/Prometheus)

## 2) Khoi dong he thong

```powershell
cd C:\DuAnCntt\benchmark
docker compose -f docker-compose.benchmark.yml up -d --build
```

Kiem tra nhanh:

```powershell
docker compose -f docker-compose.benchmark.yml ps
```

## 3) Xem monitoring

### Prometheus

- URL uu tien: [http://127.0.0.1:9090](http://127.0.0.1:9090)
- URL thay the: `http://localhost:9090`
- Vao tab **Graph**, nhap query roi bam **Execute**.

Query mau:

```promql
up
```

```promql
sum(rate(container_cpu_usage_seconds_total{container!=""}[1m])) * 100
```

```promql
sum(container_memory_working_set_bytes{container!=""}) / 1024 / 1024
```

Neu bi loi `ERR_CONNECTION_RESET`:

1. Refresh trang.
2. Thu doi sang `http://127.0.0.1:9090` (mot so may bi loi resolve `localhost`/IPv6).
3. Kiem tra container:
   ```powershell
   docker compose -f docker-compose.benchmark.yml ps prometheus
   ```
4. Khoi dong lai Prometheus:
   ```powershell
   docker compose -f docker-compose.benchmark.yml up -d --force-recreate prometheus
   ```

### Grafana

- URL uu tien: [http://127.0.0.1:3001](http://127.0.0.1:3001)
- URL thay the: `http://localhost:3001`
- Login mac dinh:
  - user: `admin`
  - password: `admin`
- Dashboard da duoc provision san:
  - **Benchmark / LMS Benchmark Overview**

Dashboard nay co san cac chart:

- CPU Monolith vs Microservices
- RAM Monolith vs Microservices
- Network RX/TX Monolith vs Microservices
- CPU theo tung service

Neu mo Grafana bi reset ket noi:

- Thu mo bang `127.0.0.1` thay vi `localhost`.
- Khoi dong lai:
  ```powershell
  docker compose -f docker-compose.benchmark.yml up -d --force-recreate grafana
  ```

## 4) Chay benchmark va export CSV (tu dong)

Chay 3 lan (khuyen nghi cho fairness):

```powershell
cd C:\DuAnCntt\benchmark
powershell -ExecutionPolicy Bypass -File .\export-benchmark.ps1 -Runs 3 -SampleIntervalSec 2
```

Y nghia tham so:

- `Runs`: so lan test cho moi kien truc.
- `SampleIntervalSec`: chu ky lay mau CPU qua `docker stats`.
- `Rebuild`: neu can build lai image truoc khi benchmark.
  - Vi du:
    ```powershell
    powershell -ExecutionPolicy Bypass -File .\export-benchmark.ps1 -Runs 1 -Rebuild
    ```

Khuyen nghi de on dinh bo nho Docker Desktop:

- Chay khong rebuild (`-Rebuild` bo trong) cho cac run lap lai.

## 5) `export-benchmark.ps1` dung de lam gi?

Script nay tu dong hoa toan bo quy trinh benchmark:

1. Dung/cap nhat stack benchmark (`docker compose up -d --build`).
2. Chay k6 cho Monolith.
3. Lay mau CPU trong luc k6 dang chay.
4. Chay k6 cho Microservices.
5. Lay mau CPU trong luc k6 dang chay.
6. Trich thong so tu file summary JSON cua k6.
7. Xuat CSV chi tiet tung run.
8. Tinh trung binh theo kien truc va xuat CSV tong hop.

## 6) Y nghia tung file trong `results`

Moi lan chay script tao mot folder:

`results/run-YYYYMMDD-HHMMSS/`

Trong do:

- `benchmark-all-runs.csv`
  - Du lieu chi tiet tung lan chay.
  - Cot chinh:
    - `architecture`: Monolith / Microservices
    - `run`: lan chay thu may
    - `rps`, `avg_ms`, `p95_ms`, `p99_ms`
    - `avg_cpu_percent`

- `benchmark-summary.csv`
  - Tong hop trung binh theo kien truc.
  - Dung de dua vao bang ket qua bao cao.

- `monolith-runN-summary.json`, `microservices-runN-summary.json`
  - Summary goc tu k6 (chi tiet metric).
  - Co the dung de audit lai ket qua.

- `monolith-runN-k6.log`, `microservices-runN-k6.log`
  - Log console khi chay k6.
  - Dung de debug neu run loi.

- `monolith-runN-cpu-samples.csv`, `microservices-runN-cpu-samples.csv`
  - CPU samples theo timestamp, theo container.
  - Dung de ve chart hoac kiem chung dao dong CPU.

## 7) Luu y ve `/metrics` 404

Trong setup nay, app NestJS chua expose endpoint `/metrics`, vi vay scrape truc tiep vao app se bi `Cannot GET /metrics`.

He thong da doi sang scrape cAdvisor:

- Khong can sua code app.
- Van co CPU/RAM/Network metrics cua container de benchmark.

## 8) Tat stack

```powershell
docker compose -f docker-compose.benchmark.yml down
```
