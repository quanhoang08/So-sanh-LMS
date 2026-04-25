import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // low load
    { duration: '30s', target: 50 },  // medium load
    { duration: '30s', target: 200 }, // high load
  ],
  summaryTrendStats: ['avg', 'med', 'min', 'max', 'p(90)', 'p(95)', 'p(99)'],
};

// Toggle this flag to switch between monolith and microservices benchmark
const USE_MONOLITH = __ENV.USE_MONOLITH === 'true';

const MONOLITH_BASE_URL = 'http://host.docker.internal:3000';
const MICRO_BASE_URL = 'http://host.docker.internal:4000';

export default function () {
  const baseUrl = USE_MONOLITH ? MONOLITH_BASE_URL : MICRO_BASE_URL;
  const expectedStatuses = http.expectedStatuses({ min: 200, max: 499 });

  // Example scenarios for LMS
  http.get(`${baseUrl}/api/v1/courses`, {
    responseCallback: expectedStatuses,
    redirects: 0,
  });
  http.get(`${baseUrl}/api/v1/courses/1`, {
    responseCallback: expectedStatuses,
    redirects: 0,
  });
  http.post(
    `${baseUrl}/api/v1/auth/login`,
    JSON.stringify({
      email: 'test@example.com',
      password: 'password123',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      responseCallback: expectedStatuses,
      redirects: 0,
    },
  );

  http.post(
    `${baseUrl}/api/v1/courses/1/enrollments`,
    JSON.stringify({
      studentId: 1,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      responseCallback: expectedStatuses,
      redirects: 0,
    },
  );

  sleep(1);
}

