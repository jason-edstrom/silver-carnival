import * as fs from 'node:fs';
import * as path from 'node:path';
import { Logger } from './Logger.js';
import { LogLevel } from './LogLevel.js';
import { ConsoleLogger } from './ConsoleLogger.js';

export interface FileLoggerOptions {
  /** Directory to write the log file into. Defaults to <cwd>/logs. */
  logFolder?: string;
  /** Log file name. Defaults to 'maqs.log'. */
  logName?: string;
  /** Logging threshold. Defaults to Information. */
  level?: LogLevel;
  /** If true, appends to an existing file; otherwise overwrites on first write. */
  append?: boolean;
}

/**
 * Writes log messages to a file using appendFileSync.
 * Falls back to ConsoleLogger if the file cannot be written.
 */
export class FileLogger extends Logger {
  readonly filePath: string;
  private readonly fallback: ConsoleLogger;

  constructor(options: FileLoggerOptions = {}) {
    super(options.level ?? LogLevel.Information);
    const folder = options.logFolder ?? path.join(process.cwd(), 'logs');
    const rawName = options.logName ?? 'maqs.log';
    const name = this.sanitizeFileName(rawName.endsWith('.log') ? rawName : `${rawName}.log`);
    this.filePath = path.join(folder, name);
    this.fallback = new ConsoleLogger();
    this.ensureDirectory(folder);

    if (!(options.append ?? false) && fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, '', { encoding: 'utf8' });
    }
  }

  override logMessage(level: LogLevel, message: string, ...args: unknown[]): void {
    if (!this.shouldMessageBeLogged(level)) return;
    const body = args.length > 0 ? this.safeFormat(message, args) : message;
    const line = `${this.currentDateTime()} ${LogLevel[level].toUpperCase()}: ${body}`;
    try {
      fs.appendFileSync(this.filePath, line + '\n', { encoding: 'utf8' });
    } catch (err) {
      this.fallback.logError('FileLogger failed to write to %s: %s', this.filePath, String(err));
    }
  }

  private ensureDirectory(dir: string): void {
    fs.mkdirSync(dir, { recursive: true });
  }

  private sanitizeFileName(name: string): string {
    return name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '~');
  }
}
