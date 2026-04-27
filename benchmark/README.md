# LMS Benchmark Guide

Tai lieu nay dung de benchmark `Monolith` va `Microservices` theo cung mot cach goi request.

## 1) Nguyen tac so sanh

Ca 2 kien truc deu duoc goi qua cung 1 cong logic:

- `http://localhost:5000`

Cong `5000` la `benchmark-router` trong `benchmark/docker-compose.benchmark.yml`.
Router nay doc header `X-Benchmark-Target` de chuyen request den dung kien truc:

- `monolith` -> route den Monolith
- `microservices` -> route den API Gateway cua Microservices

Nghia la khi benchmark:

- cung host
- cung cong vao
- cung API path

Chi khac dich den ben trong he thong.

## 2) Metric dang so sanh

- Throughput: `rps`
- Latency: `avg_ms`, `p95_ms`, `p99_ms`
- CPU trung binh: `avg_cpu_percent`

## 3) Khoi dong benchmark stack (`benchmark-download`)

```powershell
cd C:\DuAnCntt\benchmark
docker compose -f docker-compose.benchmark.yml up -d --build
docker compose -f docker-compose.benchmark.yml ps
```

Luu y:

- Benchmark stack chi can host port `5000`.
- Cac service ben trong benchmark khong publish `3000` hoac `4000` ra host nua.
- Co the chay song song voi stack dev neu host port `5000` chua bi dung.
- Cac container benchmark duoc dat prefix `benchmark_download_*` de tranh trung ten khi copy du an.

## 4) Chay benchmark

Lenh khuyen nghi:

```powershell
cd C:\DuAnCntt\benchmark
powershell -ExecutionPolicy Bypass -File .\export-benchmark.ps1 -Runs 3 -SampleIntervalSec 2
```

Tham so:

- `Runs`: so lan test cho moi kien truc
- `SampleIntervalSec`: chu ky lay mau CPU bang `docker stats`
- `Rebuild`: build lai image truoc khi benchmark

Vi du test nhanh 1 run:

```powershell
powershell -ExecutionPolicy Bypass -File .\export-benchmark.ps1 -Runs 1 -SampleIntervalSec 2
```

## 5) Script dang hoat dong nhu the nao

`export-benchmark.ps1` se:

1. Dam bao benchmark stack dang chay
2. Health-check qua `http://localhost:5000`
3. Chay k6 cho Monolith voi header route tuong ung
4. Lay mau CPU trong luc test
5. Chay k6 cho Microservices voi cung endpoint benchmark
6. Xuat CSV va JSON summary

`k6/test.js` luon goi vao `http://host.docker.internal:5000` va gan header `X-Benchmark-Target` de chon kien truc.

## 6) Ket qua duoc luu o dau

Moi lan chay tao 1 thu muc:

`results/run-YYYYMMDD-HHMMSS/`

File quan trong:

- `benchmark-summary.csv`: tong hop trung binh theo kien truc
- `benchmark-all-runs.csv`: du lieu chi tiet tung run
- `monolith-runN-summary.json`, `microservices-runN-summary.json`: summary goc cua k6
- `monolith-runN-k6.log`, `microservices-runN-k6.log`: log debug
- `*-cpu-samples.csv`: mau CPU theo thoi gian

## 7) Ve chart

Neu chua co thu vien:

```powershell
python -m pip install pandas matplotlib
```

Ve chart cho ket qua moi nhat:

```powershell
cd C:\DuAnCntt\benchmark
python .\plot_results.py --results-dir .\results --formats png,jpg
```

## 8) Cach doc ket qua

- `rps_avg` cao hon la tot hon
- `avg_ms_avg`, `p95_ms_avg`, `p99_ms_avg` thap hon la tot hon
- `cpu_percent_avg` thap hon la tiet kiem tai nguyen hon

Nen ket hop:

- `benchmark-summary.csv` de nhin xu huong tong quan
- `benchmark-all-runs.csv` de xem do on dinh giua cac run
- `*-cpu-samples.csv` de xac dinh service nao ton CPU nhieu

## 9) Tat benchmark stack

```powershell
docker compose -f docker-compose.benchmark.yml down
```
