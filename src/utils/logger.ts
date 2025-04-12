// filepath: /home/shyndman/dev/cli-defuddle/src/utils/logger.ts
import winston from 'winston';

// Define log levels and colors
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to Winston
winston.addColors(colors);

// Define format for logging
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

// Create the logger instance
const logger = winston.createLogger({
  level: 'info', // Default level
  levels,
  format,
  transports: [new winston.transports.Console()],
});

// Function to set log level based on verbose flag
export function setLogLevel(verbose: boolean): void {
  logger.level = verbose ? 'debug' : 'info';
}

export default logger;
