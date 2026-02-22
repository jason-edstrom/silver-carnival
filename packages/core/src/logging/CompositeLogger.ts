import { Logger } from './Logger.js';
import { LogLevel } from './LogLevel.js';

/**
 * Fan-out logger that delegates every log call to each registered child logger.
 * The composite-level threshold acts as a pre-filter; children apply their own thresholds.
 */
export class CompositeLogger extends Logger {
  private readonly loggers: Logger[];

  constructor(loggers: Logger[], level: LogLevel = LogLevel.Verbose) {
    super(level);
    this.loggers = [...loggers];
  }

  override logMessage(level: LogLevel, message: string, ...args: unknown[]): void {
    if (!this.shouldMessageBeLogged(level)) return;
    for (const logger of this.loggers) {
      logger.logMessage(level, message, ...args);
    }
  }

  addLogger(logger: Logger): void {
    this.loggers.push(logger);
  }

  override dispose(): void {
    for (const logger of this.loggers) {
      logger.dispose();
    }
    this.loggers.length = 0;
  }
}
