import { LogLevel } from './LogLevel.js';

/**
 * Abstract base class for all MAQS loggers.
 * Use this as the type annotation anywhere a logger is accepted.
 * Implements level filtering, suspend/resume state machine, and convenience methods.
 * Subclasses only need to implement logMessage().
 */
export abstract class Logger {
  private level: LogLevel;
  private suspendedLevel: LogLevel | null = null;

  protected constructor(level: LogLevel = LogLevel.Information) {
    this.level = level;
  }

  abstract logMessage(level: LogLevel, message: string, ...args: unknown[]): void;

  logError(message: string, ...args: unknown[]): void {
    this.logMessage(LogLevel.Error, message, ...args);
  }

  logWarning(message: string, ...args: unknown[]): void {
    this.logMessage(LogLevel.Warning, message, ...args);
  }

  logInfo(message: string, ...args: unknown[]): void {
    this.logMessage(LogLevel.Information, message, ...args);
  }

  logVerbose(message: string, ...args: unknown[]): void {
    this.logMessage(LogLevel.Verbose, message, ...args);
  }

  logSuccess(message: string, ...args: unknown[]): void {
    this.logMessage(LogLevel.Success, message, ...args);
  }

  getLoggingLevel(): LogLevel {
    return this.level;
  }

  setLoggingLevel(level: LogLevel): void {
    this.level = level;
  }

  suspendLogging(): void {
    this.suspendedLevel = this.level;
    this.level = LogLevel.Suspended;
  }

  continueLogging(): void {
    if (this.suspendedLevel !== null) {
      this.level = this.suspendedLevel;
      this.suspendedLevel = null;
    }
  }

  currentDateTime(): string {
    return new Date().toISOString().replace('T', ' ').slice(0, 23);
  }

  dispose(): void {
    // Base has no resources; subclasses override if needed.
  }

  /**
   * Returns true if the given message level should be written at the current threshold.
   * A message is written when messageLevel <= threshold (ERROR=0 is always highest priority).
   */
  protected shouldMessageBeLogged(level: LogLevel): boolean {
    if (this.level === LogLevel.Suspended) return false;
    return level <= this.level;
  }

  /** Printf-style format: replaces %s, %d, %j with positional args. */
  protected safeFormat(template: string, args: unknown[]): string {
    let i = 0;
    return template.replace(/%[sdj%]/g, (match) => {
      if (match === '%%') return '%';
      if (i >= args.length) return match;
      const val = args[i++];
      if (match === '%j') return JSON.stringify(val);
      return String(val);
    });
  }
}
