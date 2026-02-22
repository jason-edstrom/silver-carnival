import { Logger } from './Logger.js';
import { LogLevel } from './LogLevel.js';

/**
 * Writes log messages to stdout with ANSI color coding per log level.
 */
export class ConsoleLogger extends Logger {
  constructor(level: LogLevel = LogLevel.Information) {
    super(level);
  }

  override logMessage(level: LogLevel, message: string, ...args: unknown[]): void {
    if (!this.shouldMessageBeLogged(level)) return;
    const body = args.length > 0 ? this.safeFormat(message, args) : message;
    const line = `${this.currentDateTime()} ${LogLevel[level].toUpperCase()}: ${body}`;
    const color = this.ansiColor(level);
    process.stdout.write(`${color}${line}\x1b[0m\n`);
  }

  private ansiColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.Error:
        return '\x1b[31m'; // red
      case LogLevel.Warning:
        return '\x1b[33m'; // yellow
      case LogLevel.Success:
        return '\x1b[32m'; // green
      case LogLevel.Information:
        return '\x1b[34m'; // blue
      case LogLevel.Verbose:
        return '\x1b[37m'; // white
      case LogLevel.Step:
        return '\x1b[35m'; // magenta
      case LogLevel.Action:
        return '\x1b[90m'; // dark gray
      default:
        return '';
    }
  }
}
