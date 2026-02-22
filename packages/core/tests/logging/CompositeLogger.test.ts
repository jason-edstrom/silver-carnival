import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CompositeLogger } from '../../src/logging/CompositeLogger.js';
import { LogLevel } from '../../src/logging/LogLevel.js';
import type { Logger } from '../../src/logging/Logger.js';

function makeMockLogger(): Logger {
  return {
    logMessage: vi.fn(),
    logError: vi.fn(),
    logWarning: vi.fn(),
    logInfo: vi.fn(),
    logVerbose: vi.fn(),
    logSuccess: vi.fn(),
    getLoggingLevel: vi.fn(() => LogLevel.Verbose),
    setLoggingLevel: vi.fn(),
    suspendLogging: vi.fn(),
    continueLogging: vi.fn(),
    currentDateTime: vi.fn(() => '2024-01-01 00:00:00.000'),
    dispose: vi.fn(),
  } as unknown as Logger;
}

describe('CompositeLogger', () => {
  let child1: Logger;
  let child2: Logger;

  beforeEach(() => {
    child1 = makeMockLogger();
    child2 = makeMockLogger();
  });

  it('fans out logMessage to all child loggers', () => {
    const composite = new CompositeLogger([child1, child2], LogLevel.Verbose);
    composite.logMessage(LogLevel.Information, 'test message');
    expect(child1.logMessage).toHaveBeenCalledWith(LogLevel.Information, 'test message');
    expect(child2.logMessage).toHaveBeenCalledWith(LogLevel.Information, 'test message');
  });

  it('pre-filters messages below composite threshold', () => {
    const composite = new CompositeLogger([child1, child2], LogLevel.Warning);
    composite.logMessage(LogLevel.Information, 'filtered');
    expect(child1.logMessage).not.toHaveBeenCalled();
    expect(child2.logMessage).not.toHaveBeenCalled();
  });

  it('addLogger adds a new child', () => {
    const composite = new CompositeLogger([child1], LogLevel.Verbose);
    composite.addLogger(child2);
    composite.logMessage(LogLevel.Information, 'test');
    expect(child2.logMessage).toHaveBeenCalled();
  });

  it('dispose() calls dispose on all children', () => {
    const composite = new CompositeLogger([child1, child2], LogLevel.Verbose);
    composite.dispose();
    expect(child1.dispose).toHaveBeenCalledOnce();
    expect(child2.dispose).toHaveBeenCalledOnce();
  });

  it('passes args through to children', () => {
    const composite = new CompositeLogger([child1], LogLevel.Verbose);
    composite.logMessage(LogLevel.Information, 'hello %s', 'world');
    expect(child1.logMessage).toHaveBeenCalledWith(LogLevel.Information, 'hello %s', 'world');
  });
});
