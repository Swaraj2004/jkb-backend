import winston from 'winston';
import { LOGGING_INFO, MAX_LOG_FILE_SIZE } from '../utils/consts';
import 'winston-daily-rotate-file';
const { combine, timestamp, json } = winston.format;

const authTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/auth-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: MAX_LOG_FILE_SIZE,
  // TODO: remove after certain time
  // maxFiles: '14d',
});

const logger = winston.createLogger({
  level: LOGGING_INFO,
  format: combine(timestamp(), json()),
  transports: [authTransport],
});

// logger.log(LOGGING_INFO, 'Hi from aum');
export default logger;
