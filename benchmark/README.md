# LMS Benchmark Guide (Code-Driven)

Tai lieu nay mo ta flow benchmark theo code hien tai trong thu muc `benchmark/`.
No giup so sanh Monolith va Microservices mot cach cong bang, de xuat bao cao hoac tai hien ket qua.

## 1) Tong quan kien truc benchmark

Tat ca request benchmark di qua cung mot ingress logic:

- `http://127.0.0.1:5000` (mac dinh)

Router doc header `X-Benchmark-Target` de quyet dinh route:

- `monolith` -> Monolith base URL
- `microservices` -> Microservices base URL

Neu header khong phai `monolith`, router mac dinh route sang microservices.

## 2) Cong nghe duoc su dung

- PowerShell script: dieu phoi toan bo benchmark flow.
- k6 + JavaScript (`k6/test.js`): tao tai va thu metric hieu nang.
- Node.js (`native-router.js`): reverse proxy native theo header.
- Windows Performance Counter: lay CPU host (`\Processor(_Total)\% Processor Time`).
- CSV + JSON: luu ket qua benchmark.
- Python + pandas + matplotlib: ve chart ket qua.

## 3) Files chinh trong benchmark

- `one-click-comparison.ps1`: flow all-in-one (verify + run benchmark).
- `export-benchmark.ps1`: script benchmark chinh.
- `start-native-router.ps1`: start router native va luu PID/log.
- `stop-native-router.ps1`: stop router native theo PID.
- `native-router.js`: router header-based.
- `k6/test.js`: workload `read` / `write` / `mixed`.
- `validate-run-output.ps1`: validate output run folder.
- `plot_results.py`: ve chart tu CSV.

## 4) Yeu cau moi truong

Can co:

1. Windows + PowerShell.
2. Node.js (`node` command co san).
3. k6 (`k6` command co san).
4. Python 3 (neu ve chart).
5. Monolith va Microservices da dang chay san.

Luu y quan trong:

- `start-native-router.ps1` mac dinh Microservices la `http://127.0.0.1:8080`.
- `one-click-comparison.ps1` mac dinh Microservices la `http://127.0.0.1:18080`.
- Khi chay that, hay truyen ro `-MicroservicesBaseUrl` de tranh nham cong.

### 4.1 Neu ban chay he thong bang Docker Compose

Repo co file `docker-compose.benchmark.yml`, nghia la ban co su dung Docker cho phan runtime he thong
(monolith, microservices stack, benchmark router), trong khi script benchmark van chay native tren host.

Chay stack Docker benchmark:

```powershell
docker compose -f .\docker-compose.benchmark.yml up -d --build
```

Dung stack:

```powershell
docker compose -f .\docker-compose.benchmark.yml down
```

Neu dung `benchmark-router` trong compose (map `5000:80`) thi khong can start `native-router.ps1`.
Khi do hay chay benchmark voi `-BaseUrl http://localhost:5000`.

## 5) Huong dan chay tung buoc (khuyen nghi)

### B5.1 Di chuyen vao thu muc benchmark

```powershell
cd C:\Users\Quan Hoang\Downloads\DuAnCntt\benchmark
```

### B5.2 Start native router tren cong 5000

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\start-native-router.ps1 `
  -MonolithBaseUrl http://127.0.0.1:3001 `
  -MicroservicesBaseUrl http://127.0.0.1:8080 `
  -Port 5000
```

Router logs/PID duoc luu trong:

- `.router-state\native-router.out.log`
- `.router-state\native-router.err.log`
- `.router-state\native-router.pid`

### B5.3 Verify endpoint truoc khi chay benchmark

Kiem tra 2 endpoint truc tiep + 2 nhanh header qua cong 5000:

```powershell
curl.exe -s -o NUL -w "%{http_code}`n" http://127.0.0.1:3001/api/v1/courses
curl.exe -s -o NUL -w "%{http_code}`n" http://127.0.0.1:8080/api/v1/courses
curl.exe -s -o NUL -w "%{http_code}`n" -H "X-Benchmark-Target: monolith" http://127.0.0.1:5000/api/v1/courses
curl.exe -s -o NUL -w "%{http_code}`n" -H "X-Benchmark-Target: microservices" http://127.0.0.1:5000/api/v1/courses
```

Hoac dung script all-in-one de verify tu dong:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\one-click-comparison.ps1 `
  -Mode info `
  -MonolithBaseUrl http://127.0.0.1:3001 `
  -MicroservicesBaseUrl http://127.0.0.1:8080 `
  -RouterPort 5000
```

### B5.4 Chay benchmark nhanh (quick smoke test)

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\export-benchmark.ps1 `
  -Runs 1 `
  -ScenarioType concurrent `
  -WorkloadType read `
  -UserLevels "10,20" `
  -ConcurrentDuration "20s" `
  -SampleIntervalSec 2 `
  -CaseCooldownSec 1 `
  -BaseUrl http://localhost:5000
```

### B5.5 Chay benchmark day du (goi y cho bao cao)

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\export-benchmark.ps1 `
  -Runs 3 `
  -ScenarioType concurrent `
  -WorkloadType read `
  -UserLevels "1,5,10,15,20,50" `
  -ConcurrentDuration "2m" `
  -SampleIntervalSec 2 `
  -CaseCooldownSec 2 `
  -BaseUrl http://localhost:5000
```

### B5.6 Dung router sau khi benchmark

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\stop-native-router.ps1
```

## 6) Huong dan chay all-in-one

Script nay tu verify endpoint + (tuy chon) start router + chay benchmark.

### B6.1 Che do quick

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\one-click-comparison.ps1 `
  -Mode quick `
  -MonolithBaseUrl http://127.0.0.1:3001 `
  -MicroservicesBaseUrl http://127.0.0.1:8080 `
  -RouterPort 5000
```

### B6.2 Che do full

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\one-click-comparison.ps1 `
  -Mode full `
  -MonolithBaseUrl http://127.0.0.1:3001 `
  -MicroservicesBaseUrl http://127.0.0.1:8080 `
  -RouterPort 5000
```

Neu da co router dang chay san va khong muon script dong vao router:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\one-click-comparison.ps1 `
  -Mode full `
  -NoStartRouter `
  -MonolithBaseUrl http://127.0.0.1:3001 `
  -MicroservicesBaseUrl http://127.0.0.1:8080 `
  -RouterPort 5000
```

## 7) Logic benchmark chi tiet (theo code)

`export-benchmark.ps1` thuc hien:

1. Kiem tra `k6` command.
2. Kiem tra endpoint readiness cho ca 2 nhanh header (tru khi `-SkipHealthCheck`).
3. Tao run folder: `results/run-YYYYMMDD-HHMMSS`.
4. Lap theo tung `run` va `users`:
   - Chay Monolith.
   - Chay Microservices.
5. Moi case:
   - Chay `k6 run` voi env (`SCENARIO_TYPE`, `WORKLOAD_TYPE`, `TARGET_VUS`, ...).
   - Song song lay CPU host theo `SampleIntervalSec`.
   - Retry neu case loi (`CaseRetryCount`, `RetryDelaySec`).
   - Fail-fast neu `http_req_failed` > `MaxFailedRequestRate` (mac dinh 5%).
6. Tong hop output:
   - `benchmark-all-runs.csv`
   - `benchmark-summary.csv`
   - `*-summary.json`, `*-k6.log`, `*-cpu-samples.csv`

## 8) Tham so quan trong

- `Runs`: so lan chay moi users-level.
- `UserLevels`: danh sach VU, vi du `"10,20,50"`.
- `ScenarioType`: `ramp` hoac `concurrent`.
- `WorkloadType`: `read`, `write`, `mixed`.
- `BaseUrl`: ingress benchmark (thuong la `http://localhost:5000`).
- `SampleIntervalSec`: chu ky lay mau CPU host.
- `CaseRetryCount`: so lan retry case loi.
- `RetryDelaySec`: delay giua cac lan retry.
- `CaseCooldownSec`: thoi gian nghi giua cac case.
- `MaxFailedRequestRate`: nguong fail-fast cua `http_req_failed`.
- `SkipHealthCheck`: bo qua readiness check (chi dung khi chac chan endpoint on dinh).

## 9) Kich ban tai trong `k6/test.js`

- `read`: login + doc danh sach/chi tiet khoa hoc.
- `write`: login + tao enrollment.
- `mixed`: ket hop read va write.
- Cuoi moi vong co `sleep(1)` de mo phong nhat quan.

Script luon gui header `X-Benchmark-Target` de route dung nhanh benchmark.

## 10) Validate ket qua output

Sau khi chay xong, validate run folder:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\validate-run-output.ps1 `
  -RunDir .\results\run-YYYYMMDD-HHMMSS
```

Script se kiem tra:

- `benchmark-summary.csv` co du lieu.
- `benchmark-all-runs.csv` co du lieu.
- `*-summary.json` parse duoc va co `metrics.http_reqs`.
- `*-cpu-samples.csv` dung header schema.

## 11) Ve chart

Neu chua cai thu vien:

```powershell
python -m pip install pandas matplotlib
```

Ve chart cho run moi nhat:

```powershell
python .\plot_results.py --results-dir .\results --formats png,jpg
```

Ve chart cho 1 user cu the:

```powershell
python .\plot_results.py --results-dir .\results --formats png --summary-user 1000
```

Chi dinh ro run folder:

```powershell
python .\plot_results.py --run-dir .\results\run-YYYYMMDD-HHMMSS --formats png
```

## 12) Cach doc ket qua

- Throughput: `rps` / `rps_avg` cao hon la tot hon.
- Latency: `avg_ms`, `p95_ms`, `p99_ms` thap hon la tot hon.
- CPU host: `avg_cpu_percent` / `cpu_percent_avg` thap hon la tiet kiem tai nguyen hon.
- Nen doc ket hop:
  - `benchmark-summary.csv` de xem xu huong tong quan.
  - `benchmark-all-runs.csv` de danh gia do on dinh giua cac run.
  - `*-cpu-samples.csv` de xem CPU theo thoi gian.

## 13) Loi thuong gap va cach xu ly

- `Khong tim thay lenh 'k6'`:
  - Cai k6 va mo terminal moi.
- Endpoint chua san sang cho `monolith`/`microservices`:
  - Kiem tra service da chay dung cong chua.
  - Kiem tra router `5000` da start chua.
- Fail-fast do `http_req_failed` vuot nguong:
  - Kiem tra logs `*-k6.log`, backend logs, router logs.
  - Giam users/load hoac nang cap tai nguyen.
- Loi `cannot allocate memory`:
  - Giam `UserLevels`, dong ung dung nen, chay lai.
- Khac port microservices (`8080` vs `18080`):
  - Luon truyen ro `-MicroservicesBaseUrl` khi chay script.
