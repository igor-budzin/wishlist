import { injectable } from 'inversify';
import winston from 'winston';

export interface ILogger {
  info(message: string, meta?: unknown): void;
  error(message: string, error?: Error | unknown): void;
  warn(message: string, meta?: unknown): void;
  debug(message: string, meta?: unknown): void;
}

@injectable()
export class Logger implements ILogger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
      ],
    });
  }

  info(message: string, meta?: unknown): void {
    this.logger.info(message, meta);
  }

  error(message: string, error?: Error | unknown): void {
    this.logger.error(message, { error });
  }

  warn(message: string, meta?: unknown): void {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: unknown): void {
    this.logger.debug(message, meta);
  }
}
