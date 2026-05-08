import { sleep } from 'k6';
import http from 'k6/http';

export let options = {
  insercureSkipTLSVerify: true,
  noConnectionReuse: false,
  stages: [
    { duration: '1m', target: 50 },
    { duration: '2m', target: 50 },
    { duration: '1m', target: 75 },
    { duration: '1m', target: 75 },
    { duration: '2m', target: 100 },
    { duration: '1m', target: 100 },
    { duration: '1m', target: 0 },
  ],
};

export default () => {
  http.batch(['GET', 'http://localhost:8000']);
  sleep(1);
};
