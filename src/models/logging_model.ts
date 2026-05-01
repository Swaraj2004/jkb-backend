export interface AuthLog {
  event: string; // e.g. USER_CREATED, LOGIN_FAILED
  level: 'info' | 'warn' | 'error';

  user?: {
    id?: string | number;
    email?: string;
    role?: string;
  };

  req_ip: string; // ip of the request
}
