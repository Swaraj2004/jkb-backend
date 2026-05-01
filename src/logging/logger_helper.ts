import { AuthLog } from '../models/logging_model';
import logger from './logger';

export function logAuthEvent(authLog: AuthLog) {
  logger.log(authLog.level, {
    event: authLog.event,
    user: authLog.user,
    req_ip: authLog.req_ip,
  });
}
