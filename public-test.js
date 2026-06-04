import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 890,
  duration: '60s',
};

export default function () {
  // Test landing page
  let landingRes = http.get('https://greymatterschool.co.za');
  check(landingRes, {
    'landing page loaded': (r) => r.status === 200,
  });

  // Get CSRF token
  let csrfRes = http.get('https://greymatterschool.co.za/api/csrf-token');
  check(csrfRes, {
    'CSRF token retrieved': (r) => r.status === 200,
  });

  // Test login page
  let loginRes = http.get('https://greymatterschool.co.za/login');
  check(loginRes, {
    'login page loaded': (r) => r.status === 200,
  });

  sleep(1);
}