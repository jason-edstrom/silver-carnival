import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { FileLogger } from '../../src/logging/FileLogger.js';
import { LogLevel } from '../../src/logging/LogLevel.js';

describe('FileLogger', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'maqs-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates the log file on first write', () => {
    const logger = new FileLogger({ logFolder: tmpDir, logName: 'test.log' });
    logger.logInfo('first line');
    expect(fs.existsSync(logger.filePath)).toBe(true);
  });

  it('writes log entries to the file', () => {
    const logger = new FileLogger({ logFolder: tmpDir, logName: 'test.log' });
    logger.logInfo('hello file');
    const content = fs.readFileSync(logger.filePath, 'utf8');
    expect(content).toContain('INFORMATION');
    expect(content).toContain('hello file');
  });

  it('auto-creates missing log directory', () => {
    const nested = path.join(tmpDir, 'a', 'b', 'c');
    const logger = new FileLogger({ logFolder: nested, logName: 'test.log' });
    logger.logInfo('nested dir');
    expect(fs.existsSync(logger.filePath)).toBe(true);
  });

  it('suppresses messages below the threshold (file never created)', () => {
    const logger = new FileLogger({
      logFolder: tmpDir,
      logName: 'test.log',
      level: LogLevel.Warning,
    });
    logger.logInfo('should be filtered');
    // appendFileSync is never called when all messages are suppressed,
    // so the file itself should not exist.
    expect(fs.existsSync(logger.filePath)).toBe(false);
  });

  it('overwrites existing file when append is false', () => {
    const logFile = path.join(tmpDir, 'test.log');
    fs.writeFileSync(logFile, 'old content\n');
    const logger = new FileLogger({ logFolder: tmpDir, logName: 'test.log', append: false });
    logger.logInfo('new content');
    const content = fs.readFileSync(logFile, 'utf8');
    expect(content).not.toContain('old content');
    expect(content).toContain('new content');
  });

  it('appends to existing file when append is true', () => {
    const logFile = path.join(tmpDir, 'test.log');
    fs.writeFileSync(logFile, 'old content\n');
    const logger = new FileLogger({ logFolder: tmpDir, logName: 'test.log', append: true });
    logger.logInfo('new content');
    const content = fs.readFileSync(logFile, 'utf8');
    expect(content).toContain('old content');
    expect(content).toContain('new content');
  });

  it('appends .log extension if missing', () => {
    const logger = new FileLogger({ logFolder: tmpDir, logName: 'mylog' });
    expect(logger.filePath.endsWith('.log')).toBe(true);
  });
});
