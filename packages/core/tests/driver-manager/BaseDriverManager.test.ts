import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseDriverManager } from '../../src/driver-manager/BaseDriverManager.js';
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
    currentDateTime: vi.fn(() => ''),
    dispose: vi.fn(),
  } as unknown as Logger;
}

class TestDriverManager extends BaseDriverManager<string> {
  private readonly disposeStub: () => Promise<void>;

  constructor(logger: Logger, factory?: () => Promise<string>, disposeStub?: () => Promise<void>) {
    super(logger, factory);
    this.disposeStub = disposeStub ?? (async () => {});
  }

  protected override async driverDispose(): Promise<void> {
    await this.disposeStub();
  }
}

describe('BaseDriverManager', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = makeMockLogger();
  });

  it('getDriver() calls factory exactly once (lazy init)', async () => {
    const factory = vi.fn(async () => 'driver-instance');
    const mgr = new TestDriverManager(logger, factory);
    const d1 = await mgr.getDriver();
    const d2 = await mgr.getDriver();
    expect(factory).toHaveBeenCalledOnce();
    expect(d1).toBe('driver-instance');
    expect(d2).toBe('driver-instance');
  });

  it('isDriverInitialized() is false before first getDriver()', () => {
    const mgr = new TestDriverManager(logger, async () => 'x');
    expect(mgr.isDriverInitialized()).toBe(false);
  });

  it('isDriverInitialized() is true after getDriver()', async () => {
    const mgr = new TestDriverManager(logger, async () => 'x');
    await mgr.getDriver();
    expect(mgr.isDriverInitialized()).toBe(true);
  });

  it('close() calls driverDispose() and resets state', async () => {
    const disposeStub = vi.fn(async () => {});
    const mgr = new TestDriverManager(logger, async () => 'x', disposeStub);
    await mgr.getDriver();
    await mgr.close();
    expect(disposeStub).toHaveBeenCalledOnce();
    expect(mgr.isDriverInitialized()).toBe(false);
  });

  it('close() on uninitialized manager does not call driverDispose()', async () => {
    const disposeStub = vi.fn(async () => {});
    const mgr = new TestDriverManager(logger, async () => 'x', disposeStub);
    await mgr.close();
    expect(disposeStub).not.toHaveBeenCalled();
  });

  it('getDriver() re-initializes after close()', async () => {
    let callCount = 0;
    const factory = async (): Promise<string> => `driver-${++callCount}`;
    const mgr = new TestDriverManager(logger, factory);
    await mgr.getDriver();
    await mgr.close();
    const d2 = await mgr.getDriver();
    expect(d2).toBe('driver-2');
  });

  it('overrideDriver() closes existing driver and replaces factory', async () => {
    const disposeStub = vi.fn(async () => {});
    const mgr = new TestDriverManager(logger, async () => 'old', disposeStub);
    await mgr.getDriver();
    await mgr.overrideDriver(async () => 'new');
    expect(disposeStub).toHaveBeenCalledOnce();
    expect(await mgr.getDriver()).toBe('new');
  });

  it('throws if no factory provided and createDriver not overridden', async () => {
    const mgr = new TestDriverManager(logger);
    await expect(mgr.getDriver()).rejects.toThrow(/must implement createDriver/);
  });

  it('log property exposes the injected logger', () => {
    const mgr = new TestDriverManager(logger, async () => 'x');
    expect(mgr.log).toBe(logger);
  });
});
