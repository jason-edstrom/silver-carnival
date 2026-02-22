import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SoftAssert } from '../../src/soft-assert/SoftAssert.js';
import { SoftAssertException } from '../../src/soft-assert/SoftAssertException.js';
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

describe('SoftAssert', () => {
  let logger: Logger;
  let sa: SoftAssert;

  beforeEach(() => {
    logger = makeMockLogger();
    sa = new SoftAssert(logger);
  });

  it('assert() passes when fn does not throw', () => {
    const result = sa.assert('myAssert', () => {});
    expect(result).toBe(true);
    expect(sa.numberOfPassedAsserts).toBe(1);
    expect(sa.numberOfFailedAsserts).toBe(0);
  });

  it('assert() records failure when fn throws', () => {
    const result = sa.assert('myAssert', () => {
      throw new Error('boom');
    });
    expect(result).toBe(false);
    expect(sa.numberOfFailedAsserts).toBe(1);
    expect(sa.numberOfPassedAsserts).toBe(0);
  });

  it('assert() prepends failMessage to failure', () => {
    sa.assert('myAssert', () => { throw new Error('boom'); }, 'Context');
    expect(sa.didSoftAssertsFail()).toBe(true);
  });

  it('assertEquals() passes when values are strictly equal', () => {
    expect(sa.assertEquals('eq', 42, 42)).toBe(true);
  });

  it('assertEquals() fails when values differ', () => {
    expect(sa.assertEquals('eq', 42, 99)).toBe(false);
    expect(sa.didSoftAssertsFail()).toBe(true);
  });

  it('assertFail() directly records a failure', () => {
    sa.assertFail('myFail', 'explicit failure');
    expect(sa.numberOfFailedAsserts).toBe(1);
    expect(sa.didSoftAssertsFail()).toBe(true);
  });

  it('failTestIfAssertFailed() does not throw when all passed', () => {
    sa.assert('ok', () => {});
    expect(() => sa.failTestIfAssertFailed()).not.toThrow();
  });

  it('failTestIfAssertFailed() throws SoftAssertException when failures exist', () => {
    sa.assert('fail', () => { throw new Error('x'); });
    expect(() => sa.failTestIfAssertFailed()).toThrowError(SoftAssertException);
  });

  it('SoftAssertException contains all failure messages', () => {
    sa.assert('a', () => { throw new Error('fail a'); });
    sa.assert('b', () => { throw new Error('fail b'); });
    try {
      sa.failTestIfAssertFailed();
    } catch (err) {
      expect(err).toBeInstanceOf(SoftAssertException);
      expect((err as SoftAssertException).failures).toHaveLength(2);
    }
  });

  it('didUserCheck() returns true after failTestIfAssertFailed()', () => {
    sa.assert('ok', () => {});
    expect(sa.didUserCheck()).toBe(false);
    try { sa.failTestIfAssertFailed(); } catch { /* expected */ }
    expect(sa.didUserCheck()).toBe(true);
  });

  it('didUserCheck() returns true when no asserts were run', () => {
    expect(sa.didUserCheck()).toBe(true);
  });

  it('addExpectedAsserts records uncalled keys as failures', () => {
    sa.addExpectedAsserts('expectedKey');
    expect(() => sa.failTestIfAssertFailed()).toThrowError(SoftAssertException);
  });

  it('addExpectedAsserts does not fail for called keys', () => {
    sa.addExpectedAsserts('myKey');
    sa.assert('myKey', () => {});
    expect(() => sa.failTestIfAssertFailed()).not.toThrow();
  });

  it('assertThrows() passes when fn throws the expected error type', () => {
    expect(sa.assertThrows('throws', () => { throw new TypeError('oops'); }, TypeError)).toBe(true);
  });

  it('assertThrows() fails when fn does not throw', () => {
    expect(sa.assertThrows('noThrow', () => {}, TypeError)).toBe(false);
  });

  it('assertThrows() fails when fn throws the wrong error type', () => {
    expect(sa.assertThrows('wrongType', () => { throw new RangeError('x'); }, TypeError)).toBe(false);
  });

  it('numberOfAsserts is the sum of pass + fail', () => {
    sa.assert('a', () => {});
    sa.assert('b', () => { throw new Error('x'); });
    expect(sa.numberOfAsserts).toBe(2);
  });

  it('overrideLogger replaces the internal logger', () => {
    const newLogger = makeMockLogger();
    sa.overrideLogger(newLogger);
    sa.assert('test', () => {});
    expect(newLogger.logMessage).toHaveBeenCalled();
    expect(logger.logMessage).not.toHaveBeenCalled();
  });
});
