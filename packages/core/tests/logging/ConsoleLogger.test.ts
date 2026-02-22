import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConsoleLogger } from '../../src/logging/ConsoleLogger.js';
import { LogLevel } from '../../src/logging/LogLevel.js';

describe('ConsoleLogger', () => {
  let writeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('writes a message at Information level by default', () => {
    const logger = new ConsoleLogger();
    logger.logInfo('hello');
    expect(writeSpy).toHaveBeenCalledOnce();
    const output = String(writeSpy.mock.calls[0]?.[0] ?? '');
    expect(output).toContain('INFORMATION');
    expect(output).toContain('hello');
  });

  it('suppresses messages below the current threshold', () => {
    const logger = new ConsoleLogger(LogLevel.Warning);
    logger.logInfo('should be suppressed');
    expect(writeSpy).not.toHaveBeenCalled();
  });

  it('writes messages at or above the threshold', () => {
    const logger = new ConsoleLogger(LogLevel.Warning);
    logger.logError('error message');
    logger.logWarning('warning message');
    expect(writeSpy).toHaveBeenCalledTimes(2);
  });

  it('suspendLogging prevents all output', () => {
    const logger = new ConsoleLogger(LogLevel.Verbose);
    logger.suspendLogging();
    logger.logError('should not appear');
    expect(writeSpy).not.toHaveBeenCalled();
  });

  it('continueLogging restores output after suspend', () => {
    const logger = new ConsoleLogger(LogLevel.Verbose);
    logger.suspendLogging();
    logger.logError('suppressed');
    expect(writeSpy).not.toHaveBeenCalled();
    logger.continueLogging();
    logger.logError('visible');
    expect(writeSpy).toHaveBeenCalledOnce();
  });

  it('applies printf-style formatting', () => {
    const logger = new ConsoleLogger();
    logger.logInfo('hello %s, you are %d years old', 'world', 42);
    const output = String(writeSpy.mock.calls[0]?.[0] ?? '');
    expect(output).toContain('hello world, you are 42 years old');
  });

  it('applies %j JSON formatting', () => {
    const logger = new ConsoleLogger();
    logger.logInfo('data: %j', { key: 'value' });
    const output = String(writeSpy.mock.calls[0]?.[0] ?? '');
    expect(output).toContain('{"key":"value"}');
  });

  it('currentDateTime returns a non-empty string', () => {
    const logger = new ConsoleLogger();
    const ts = logger.currentDateTime();
    expect(ts).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}$/);
  });

  it('getLoggingLevel and setLoggingLevel work correctly', () => {
    const logger = new ConsoleLogger(LogLevel.Information);
    expect(logger.getLoggingLevel()).toBe(LogLevel.Information);
    logger.setLoggingLevel(LogLevel.Verbose);
    expect(logger.getLoggingLevel()).toBe(LogLevel.Verbose);
  });

  it('dispose() does not throw', () => {
    const logger = new ConsoleLogger();
    expect(() => logger.dispose()).not.toThrow();
  });
});
