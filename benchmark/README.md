# LMS Benchmark Guide (Monolith vs Microservices)

Tai lieu nay su dung 1 flow don gian:

1. Chay benchmark bang `k6` (thong qua `export-benchmark.ps1`)
2. Xuat ket qua ra CSV/JSON
3. Ve chart bang Python (`plot_results.py`) ra file PNG/JPG

> Khong phu thuoc vao Prometheus/Grafana trong flow chinh.

## 1) Muc tieu benchmark

So sanh hieu nang 2 kien truc:

- Monolith (`http://localhost:3000`)
- Microservices qua API Gateway (`http://localhost:4000`)

Metric can so sanh:

- Throughput: `rps`
- Latency: `avg_ms`, `p95_ms`, `p99_ms`
- CPU trung binh: `avg_cpu_percent`

## 2) Chuan bi va khoi dong stack

```powershell
cd C:\DuAnCntt\benchmark
docker compose -f docker-compose.benchmark.yml up -d --build
docker compose -f docker-compose.benchmark.yml ps
```

Neu container chua on dinh, cho them 20-60 giay roi moi chay benchmark.

## 3) Chay benchmark va xuat ket qua

### Lenh khuyen nghi (3 runs)

```powershell
cd C:\DuAnCntt\benchmark
powershell -ExecutionPolicy Bypass -File .\export-benchmark.ps1 -Runs 3 -SampleIntervalSec 2
```

### Giai thich tham so

- `Runs`: so lan test cho moi kien truc.
  - `Runs 3` = Monolith run1..3 + Microservices run1..3
- `SampleIntervalSec`: chu ky lay mau CPU bang `docker stats`.
- `Rebuild`: rebuild image truoc benchmark (chi dung khi vua sua code/runtime).
  - Vi du:
    ```powershell
    powershell -ExecutionPolicy Bypass -File .\export-benchmark.ps1 -Runs 1 -Rebuild
    ```

### Luu y de ket qua on dinh

- Neu benchmark lap lai nhieu lan, tranh dung `-Rebuild` moi lan.
- Dong bot app nang (IDE tabs khong can thiet, browser tabs nang, vm khac...).
- Uu tien chay benchmark khi may khong dang build task khac.

## 4) Script `export-benchmark.ps1` hoat dong nhu the nao?

Script tu dong hoa toan bo quy trinh:

1. Dam bao stack benchmark dang chay.
2. Chay k6 cho Monolith.
3. Trong luc k6 chay, lay mau CPU theo `SampleIntervalSec`.
4. Chay k6 cho Microservices.
5. Trong luc k6 chay, lay mau CPU theo `SampleIntervalSec`.
6. Trich metric tu JSON summary cua k6.
7. Xuat du lieu chi tiet tung run vao CSV.
8. Tong hop trung binh theo kien truc vao CSV summary.

## 5) Cau truc thu muc `results` va y nghia tung file

Moi lan chay se tao folder:

`results/run-YYYYMMDD-HHMMSS/`

Ben trong:

- `benchmark-all-runs.csv`
  - 1 dong = 1 run cua 1 kien truc.
  - Cot quan trong:
    - `architecture`: Monolith/Microservices
    - `run`: so thu tu run
    - `rps`, `avg_ms`, `p95_ms`, `p99_ms`
    - `avg_cpu_percent`
    - `summary_json`, `k6_log`, `cpu_samples_csv` (ten file lien quan)

- `benchmark-summary.csv`
  - Tong hop trung binh theo kien truc.
  - Thuong co cac cot dang `*_avg` (vi du `rps_avg`, `p95_ms_avg`...).
  - Day la file de dua vao bang ket qua bao cao.

- `monolith-runN-summary.json`, `microservices-runN-summary.json`
  - Output goc cua k6, dung de audit metric chi tiet.
  - Co the xoa neu chi can CSV tong hop, nhung nen giu lai khi can doi chieu.

- `monolith-runN-k6.log`, `microservices-runN-k6.log`
  - Log console cua k6, dung debug khi run loi/timeout.

- `monolith-runN-cpu-samples.csv`, `microservices-runN-cpu-samples.csv`
  - Mau CPU theo thoi gian va container.
  - Dung de ve chart CPU chi tiet theo container.

## 6) Ve chart bang Python (PNG/JPG)

Script da co san: `plot_results.py`

### Cai thu vien (neu chua co)

```powershell
python -m pip install pandas matplotlib
```

### Ve chart cho run moi nhat

```powershell
cd C:\DuAnCntt\benchmark
python .\plot_results.py --results-dir .\results --formats png,jpg
```

### Ve chart cho 1 run cu the

```powershell
python .\plot_results.py --run-dir .\results\run-YYYYMMDD-HHMMSS --formats png
```

### Output chart

Tat ca chart duoc luu tai:

`results/run-YYYYMMDD-HHMMSS/charts/`

Vi du:

- `rps.png` / `rps.jpg`
- `latency_avg_ms.png`
- `latency_p95_ms.png`
- `latency_p99_ms.png`
- `avg_cpu_percent.png`
- `runs_rps.png`
- `runs_avg_ms.png`
- `runs_p95_ms.png`
- `runs_avg_cpu_percent.png`
- `*-cpu-samples_by_container.png`

## 7) Cach phan tich ket qua trong `result`

### Buoc 1: Nhin nhanh tu `benchmark-summary.csv`

So sanh 2 kien truc theo quy tac:

- `rps_avg`: cao hon la tot hon.
- `avg_ms_avg`, `p95_ms_avg`, `p99_ms_avg`: thap hon la tot hon.
- `cpu_percent_avg`: thap hon la tiet kiem tai nguyen hon.

### Buoc 2: Kiem tra do on dinh tu `benchmark-all-runs.csv`

- Xem run nao bat thuong (latency tang dot bien, rps giam manh).
- Neu 1 kien truc dao dong qua lon giua run1/run2/run3 -> do on dinh kem.
- Uu tien ket luan dua tren xu huong trung binh + do dao dong.

### Buoc 3: Doi chieu CPU theo service

- Mo `*-cpu-samples.csv` hoac chart `*_by_container`.
- Xac dinh container/service nao la bottleneck.
- Neu Microservices rps tot hon nhung CPU cao hon rat nhieu, can ghi ro trade-off.

### Mau ket luan ngan cho bao cao

- "Microservices cao hon X% RPS, latency p95 thap hon Y%, nhung CPU cao hon Z% so voi Monolith."
- "Monolith co do on dinh cao hon giua cac run, phu hop tai nguyen han che."

## 8) Lenh nhanh thuong dung

### Chay benchmark 1 run (test nhanh)

```powershell
powershell -ExecutionPolicy Bypass -File .\export-benchmark.ps1 -Runs 1 -SampleIntervalSec 2
```

### Chay benchmark 3 runs (bao cao)

```powershell
powershell -ExecutionPolicy Bypass -File .\export-benchmark.ps1 -Runs 3 -SampleIntervalSec 2
```

### Ve chart PNG + JPG

```powershell
python .\plot_results.py --results-dir .\results --formats png,jpg
```

### Tat stack

```powershell
docker compose -f docker-compose.benchmark.yml down
```
