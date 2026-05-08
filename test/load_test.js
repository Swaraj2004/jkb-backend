import { sleep } from 'k6';
import http from 'k6/http';

export let options = {
  insercureSkipTLSVerify: true,
  noConnectionReuse: false,
  vus: 20,
  duration: '30s',
  // vus: 1,
  // duration: '10s',
};

export default () => {
  http.get('http://localhost:8000');
  sleep(1);
};
