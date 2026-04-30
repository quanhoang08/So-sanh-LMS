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

  // Seeded credentials / ids (from LMS-monolithic/seed.sql and LMS-microservice/*/schema.sql)
  const MONOLITH_LOGIN = {
    email: 'nguyenvana@lecturer.tdtu.edu.vn',
    password: 'lecturer123',
  };
  const MONOLITH_COURSE_DETAIL_ID = '1';

  const MICROSERVICES_LOGIN = {
    email: 'nguyenthanhan@lecturer.tdtu.edu.vn',
    // AccountService stores bcrypt hash computed from "hashed_lecturer_pw" in schema.sql
    password: 'hashed_lecturer_pw',
    role: 'LECTURER',
  };
  const MICROSERVICES_COURSE_DETAIL_ID = 'BE-NESTJS-01';

  if (WORKLOAD_TYPE === 'read') {
    let authHeaders = commonHeaders;

    // Login first, otherwise Course endpoints will return 401.
    if (USE_MONOLITH) {
      http.post(
        `${baseUrl}/api/v1/auth/login`,
        JSON.stringify(MONOLITH_LOGIN),
        {
          headers: { ...commonHeaders, 'Content-Type': 'application/json' },
          responseCallback: expectedStatuses,
          redirects: 0,
          timeout: REQUEST_TIMEOUT,
        }
      );
      // Monolith auth uses cookie refreshToken (JwtStrategy extracts from cookies).
    } else {
      const loginRes = http.post(
        `${baseUrl}/api/v1/users/login`,
        JSON.stringify(MICROSERVICES_LOGIN),
        {
          headers: { ...commonHeaders, 'Content-Type': 'application/json' },
          responseCallback: expectedStatuses,
          redirects: 0,
          timeout: REQUEST_TIMEOUT,
        }
      );
      const loginJson = loginRes.json();
      const accessToken = loginJson?.data?.access_token;
      if (!accessToken) {
        throw new Error('microservices login: missing data.access_token');
      }
      authHeaders = {
        ...commonHeaders,
        Authorization: `Bearer ${accessToken}`,
      };
    }

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
    // For microservices nginx, list is often routed via the trailing-slash location.
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
  } else if (WORKLOAD_TYPE === 'write') {
    http.post(
      `${baseUrl}/api/v1/auth/login`,
      JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
      {
        headers: { ...commonHeaders, 'Content-Type': 'application/json' },
        responseCallback: expectedStatuses,
        redirects: 0,
        timeout: REQUEST_TIMEOUT,
      },
    );
    http.post(
      `${baseUrl}/api/v1/courses/1/enrollments`,
      JSON.stringify({
        studentId: 1,
      }),
      {
        headers: { ...commonHeaders, 'Content-Type': 'application/json' },
        responseCallback: expectedStatuses,
        redirects: 0,
        timeout: REQUEST_TIMEOUT,
      },
    );
  } else {
    http.get(`${baseUrl}/api/v1/courses`, {
      headers: commonHeaders,
      responseCallback: expectedStatuses,
      redirects: 0,
      timeout: REQUEST_TIMEOUT,
    });
    http.get(`${baseUrl}/api/v1/courses/1`, {
      headers: commonHeaders,
      responseCallback: expectedStatuses,
      redirects: 0,
      timeout: REQUEST_TIMEOUT,
    });
    http.post(
      `${baseUrl}/api/v1/auth/login`,
      JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
      {
        headers: { ...commonHeaders, 'Content-Type': 'application/json' },
        responseCallback: expectedStatuses,
        redirects: 0,
        timeout: REQUEST_TIMEOUT,
      },
    );
    http.post(
      `${baseUrl}/api/v1/courses/1/enrollments`,
      JSON.stringify({
        studentId: 1,
      }),
      {
        headers: { ...commonHeaders, 'Content-Type': 'application/json' },
        responseCallback: expectedStatuses,
        redirects: 0,
        timeout: REQUEST_TIMEOUT,
      },
    );
  }

  sleep(1);
}

