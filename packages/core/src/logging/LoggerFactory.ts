import { LogLevel } from './LogLevel.js';
import { Logger } from './Logger.js';
import { ConsoleLogger } from './ConsoleLogger.js';
import { FileLogger } from './FileLogger.js';
import type { FileLoggerOptions } from './FileLogger.js';

export type LoggerType = 'console' | 'txt' | 'text' | 'none';

export interface CreateLoggerOptions extends Omit<FileLoggerOptions, 'level'> {
  logType?: LoggerType;
  level?: LogLevel;
}

/**
 * Create a logger from options.
 * Defaults to a ConsoleLogger at Information level.
 *
 * @example
 * const log = createLogger({ logType: 'txt', logName: 'my-test', level: LogLevel.Verbose });
 */
export function createLogger(options: CreateLoggerOptions = {}): Logger {
  const type = ((options.logType ?? 'console') as string).toLowerCase() as LoggerType;
  const level = options.level ?? LogLevel.Information;

  switch (type) {
    case 'txt':
    case 'text': {
      const { logType: _logType, level: _level, ...fileOptions } = options;
      return new FileLogger({ ...fileOptions, level });
    }
    case 'none':
      return new ConsoleLogger(LogLevel.Suspended);
    case 'console':
    default:
      return new ConsoleLogger(level);
  }
}

/**
 * Create a ConsoleLogger directly.
 *
 * @example
 * const log = createConsoleLogger(LogLevel.Verbose);
 */
export function createConsoleLogger(level?: LogLevel): ConsoleLogger {
  return new ConsoleLogger(level);
}
