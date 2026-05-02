import http from 'k6/http';
import { sleep } from 'k6';

function toInt(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

function toDuration(value, fallback) {
  return (value || '').trim() || fallback;
}

const SCENARIO_TYPE = (__ENV.SCENARIO_TYPE || 'ramp').toLowerCase();
const TARGET_VUS = toInt(__ENV.TARGET_VUS, 100);
const STAGE_STEP_VUS = toInt(__ENV.STAGE_STEP_VUS, 100);
const STAGE_DURATION = toDuration(__ENV.STAGE_DURATION, '30s');
const RAMP_MAX_VUS = toInt(__ENV.RAMP_MAX_VUS, TARGET_VUS);

const optionsByScenario = {
  ramp: {
    // Keep ramp lightweight per case: one linear ramp from low VU to target.
    // UserLevels in export script already represent the multi-point load curve.
    stages: [
      { duration: STAGE_DURATION, target: Math.max(1, RAMP_MAX_VUS) },
    ],
    gracefulRampDown: '0s',
  },
  concurrent: {
    vus: TARGET_VUS,
    duration: toDuration(__ENV.CONCURRENT_DURATION, '2m'),
  },
};

export const options = {
  ...(optionsByScenario[SCENARIO_TYPE] || optionsByScenario.ramp),
  // Need login response body (access_token) for microservices read auth.
  discardResponseBodies: false,
  summaryTrendStats: ['avg', 'med', 'min', 'max', 'p(90)', 'p(95)', 'p(99)'],
};

// Toggle this flag to switch between monolith and microservices benchmark
const USE_MONOLITH = __ENV.USE_MONOLITH === 'true';
const TARGET_ARCH = (__ENV.TARGET_ARCH || (USE_MONOLITH ? 'monolith' : 'microservices')).toLowerCase();
const WORKLOAD_TYPE = (__ENV.WORKLOAD_TYPE || 'mixed').toLowerCase();
const REQUEST_TIMEOUT = toDuration(__ENV.REQUEST_TIMEOUT, '30s');

// Unified benchmark ingress for both architectures
const BENCHMARK_BASE_URL = (__ENV.BENCHMARK_BASE_URL || 'http://host.docker.internal:5000').trim();

export default function () {
  const baseUrl = BENCHMARK_BASE_URL;
  // Treat 4xx/5xx as failures so fail-fast can stop invalid benchmark datasets.
  const expectedStatuses = http.expectedStatuses({ min: 200, max: 399 });
  const commonHeaders = {
    'X-Benchmark-Target': TARGET_ARCH,
  };

  const isStudentWorkload = WORKLOAD_TYPE === 'write' || WORKLOAD_TYPE === 'stress';

  const MONOLITH_LOGIN = isStudentWorkload ? {
    email: '52200001@student.tdtu.edu.vn',
    password: 'student123',
  } : {
    email: 'nguyenvana@lecturer.tdtu.edu.vn',
    password: 'lecturer123',
  };
  const MONOLITH_COURSE_DETAIL_ID = '1';

  const MICROSERVICES_LOGIN = isStudentWorkload ? {
    email: 'tranvanquyen@student.tdtu.edu.vn',
    password: 'hashed_student_pw',
    role: 'STUDENT',
  } : {
    email: 'nguyenthanhan@lecturer.tdtu.edu.vn',
    password: 'hashed_lecturer_pw',
    role: 'LECTURER',
  };
  const MICROSERVICES_COURSE_DETAIL_ID = 'BE-NESTJS-01';

  let authHeaders = commonHeaders;
  let studentId = 1;

  // Logic đăng nhập dùng chung cho các workload cần xác thực
  function doLogin() {
    if (USE_MONOLITH) {
      const res = http.post(
        `${baseUrl}/api/v1/auth/login`,
        JSON.stringify(MONOLITH_LOGIN),
        {
          headers: { ...commonHeaders, 'Content-Type': 'application/json' },
          responseCallback: expectedStatuses,
          redirects: 0,
          timeout: REQUEST_TIMEOUT,
        }
      );
      if (res.json()?.data?.id) studentId = res.json().data.id;
    } else {
      const res = http.post(
        `${baseUrl}/api/v1/users/login`,
        JSON.stringify(MICROSERVICES_LOGIN),
        {
          headers: { ...commonHeaders, 'Content-Type': 'application/json' },
          responseCallback: expectedStatuses,
          redirects: 0,
          timeout: REQUEST_TIMEOUT,
        }
      );
      const loginJson = res.json();
      const accessToken = loginJson?.data?.access_token;
      if (loginJson?.data?.id) studentId = loginJson.data.id;
      if (!accessToken) {
        throw new Error('microservices login: missing data.access_token');
      }
      authHeaders = {
        ...commonHeaders,
        Authorization: `Bearer ${accessToken}`,
      };
    }
  }

  if (WORKLOAD_TYPE === 'read') {
    doLogin();

    http.get(`${baseUrl}/api/v1/courses`, {
      headers: USE_MONOLITH ? commonHeaders : { ...authHeaders },
      responseCallback: expectedStatuses,
      redirects: 0,
      timeout: REQUEST_TIMEOUT,
    });

    const detailPath = USE_MONOLITH
      ? `${baseUrl}/api/v1/courses/${MONOLITH_COURSE_DETAIL_ID}`
      : `${baseUrl}/api/v1/courses/${MICROSERVICES_COURSE_DETAIL_ID}`;

    const listPath = USE_MONOLITH ? `${baseUrl}/api/v1/courses` : `${baseUrl}/api/v1/courses/`;
    http.get(listPath, {
      headers: USE_MONOLITH ? commonHeaders : { ...authHeaders },
      responseCallback: expectedStatuses,
      redirects: 0,
      timeout: REQUEST_TIMEOUT,
    });

    http.get(detailPath, {
      headers: USE_MONOLITH ? commonHeaders : { ...authHeaders },
      responseCallback: expectedStatuses,
      redirects: 0,
      timeout: REQUEST_TIMEOUT,
    });

    sleep(1);

  } else if (WORKLOAD_TYPE === 'write') {
    // TC2: Write-Intensive Access
    doLogin();

    const updateUrl = USE_MONOLITH
      ? `${baseUrl}/api/v1/students/${studentId}`
      : `${baseUrl}/api/v1/students/profile`;

    // Mô phỏng ghi dữ liệu: Cập nhật hồ sơ
    const payload = JSON.stringify({ 
      phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
      address: `19 Nguyen Huu Tho, Q7, TP.HCM` 
    });
    const writeParams = {
      headers: USE_MONOLITH ? { ...commonHeaders, 'Content-Type': 'application/json' } : { ...authHeaders, 'Content-Type': 'application/json' },
      responseCallback: expectedStatuses,
      redirects: 0,
      timeout: REQUEST_TIMEOUT,
    };

    if (USE_MONOLITH) {
      http.put(updateUrl, payload, writeParams);
    } else {
      http.patch(updateUrl, payload, writeParams);
    }

    // Đọc lại để xác nhận
    const readUrl = USE_MONOLITH
      ? `${baseUrl}/api/v1/students/${studentId}`
      : `${baseUrl}/api/v1/students/profile`;

    http.get(readUrl, {
      headers: USE_MONOLITH ? commonHeaders : { ...authHeaders },
      responseCallback: expectedStatuses,
      redirects: 0,
      timeout: REQUEST_TIMEOUT,
    });

    sleep(1);

  } else if (WORKLOAD_TYPE === 'stress') {
    // TC4: High Concurrency / Mixed Load
    doLogin();

    const reqOptions = {
      headers: USE_MONOLITH ? commonHeaders : { ...authHeaders },
      responseCallback: expectedStatuses,
      redirects: 0,
      timeout: REQUEST_TIMEOUT,
    };

    // 1. Xem danh sách khóa học (API Monolith courses có thể cấm student, nhưng nếu cấm thì 403 được coi là thất bại)
    // Tạm bỏ course list ra khỏi stress của student để tránh fail, thay bằng get profile nhiều lần
    const profileUrl = USE_MONOLITH
      ? `${baseUrl}/api/v1/students/${studentId}`
      : `${baseUrl}/api/v1/students/profile`;
    
    http.get(profileUrl, reqOptions);
    
    // 2. Cập nhật hồ sơ
    const payload = JSON.stringify({ phone: `09${Math.floor(10000000 + Math.random() * 90000000)}` });
    const patchParams = { ...reqOptions, headers: { ...reqOptions.headers, 'Content-Type': 'application/json' } };
    
    if (USE_MONOLITH) {
      http.put(profileUrl, payload, patchParams);
    } else {
      http.patch(profileUrl, payload, patchParams);
    }

    // 3. Xem danh sách đăng ký
    const enrollmentsUrl = USE_MONOLITH 
      ? `${baseUrl}/api/v1/students/${studentId}/enrollments`
      : `${baseUrl}/api/v1/students/profile`; // Microservices chưa có API này thì gọi profile tạm
    http.get(enrollmentsUrl, reqOptions);

    // Sleep ngắn hơn để tăng áp lực concurrency
    sleep(0.5);

  } else {
    // default mixed
    doLogin();
    http.get(`${baseUrl}/api/v1/courses`, {
      headers: USE_MONOLITH ? commonHeaders : { ...authHeaders },
      responseCallback: expectedStatuses,
      redirects: 0,
      timeout: REQUEST_TIMEOUT,
    });
    sleep(1);
  }
}

