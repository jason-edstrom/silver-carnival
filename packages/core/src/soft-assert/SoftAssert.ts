import { SoftAssertException } from './SoftAssertException.js';
import type { Logger } from '../logging/Logger.js';
import { LogLevel } from '../logging/LogLevel.js';

/**
 * Collects assertion failures without immediately throwing, then surfaces them all at once.
 *
 * Most useful in end-to-end / UI tests where you want to check multiple page states
 * in a single test without stopping on the first failure.
 *
 * For unit or integration tests, prefer native assertions from your test runner
 * (Jest matchers, Vitest expect, Chai) — they provide better error messages and
 * are natively understood by the runner's reporter.
 *
 * Call failTestIfAssertFailed() at the end of each test (done automatically by
 * BaseTest.teardown() and useMaqs()).
 */
export class SoftAssert {
  private readonly failures: string[] = [];
  private readonly expectedKeys = new Set<string>();
  private readonly calledKeys = new Set<string>();
  private passCount = 0;
  private failCount = 0;
  private userChecked = false;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  assert(assertName: string, fn: () => void, failMessage?: string): boolean {
    this.calledKeys.add(assertName);
    try {
      fn();
      this.passCount++;
      this.logger.logMessage(LogLevel.Success, `SOFT ASSERT PASS [${assertName}]`);
      return true;
    } catch (err) {
      this.failCount++;
      const errMsg = err instanceof Error ? err.message : String(err);
      const full = failMessage ? `${failMessage}: ${errMsg}` : errMsg;
      this.failures.push(`[${assertName}] ${full}`);
      this.logger.logMessage(LogLevel.Error, `SOFT ASSERT FAIL [${assertName}]: ${full}`);
      return false;
    }
  }

  assertThrows<E extends Error>(
    assertName: string,
    fn: () => void,
    expectedErrorType: new (...args: unknown[]) => E,
    failMessage?: string,
  ): boolean {
    return this.assert(
      assertName,
      () => {
        let threw = false;
        try {
          fn();
        } catch (err) {
          if (err instanceof expectedErrorType) {
            threw = true;
          } else {
            throw new Error(
              `Expected ${expectedErrorType.name} but got ${err instanceof Error ? err.constructor.name : String(err)}`,
            );
          }
        }
        if (!threw) throw new Error(`Expected ${expectedErrorType.name} to be thrown`);
      },
      failMessage,
    );
  }

  assertEquals<T>(assertName: string, expected: T, actual: T, failMessage?: string): boolean {
    return this.assert(
      assertName,
      () => {
        if (expected !== actual) {
          throw new Error(`Expected <${String(expected)}> but was <${String(actual)}>`);
        }
      },
      failMessage,
    );
  }

  assertFail(assertName: string, failMessage: string): void {
    this.calledKeys.add(assertName);
    this.failCount++;
    const msg = `[${assertName}] ${failMessage}`;
    this.failures.push(msg);
    this.logger.logMessage(LogLevel.Error, `SOFT ASSERT FAIL: ${msg}`);
  }

  failTestIfAssertFailed(): void {
    this.userChecked = true;
    this.logFinalAssertData();
    this.checkForExpectedAsserts();
    if (this.failures.length > 0) {
      throw new SoftAssertException([...this.failures]);
    }
  }

  didSoftAssertsFail(): boolean {
    return this.failCount > 0;
  }

  didUserCheck(): boolean {
    if (this.passCount + this.failCount === 0) return true;
    return this.userChecked;
  }

  addExpectedAsserts(...assertNames: string[]): void {
    for (const name of assertNames) this.expectedKeys.add(name);
  }

  checkForExpectedAsserts(): void {
    for (const key of this.expectedKeys) {
      if (!this.calledKeys.has(key)) {
        const msg = `Expected assert '${key}' was never called`;
        this.failures.push(msg);
        this.failCount++;
        this.logger.logMessage(LogLevel.Error, `SOFT ASSERT: ${msg}`);
      }
    }
  }

  logFinalAssertData(): void {
    this.logger.logMessage(
      LogLevel.Information,
      `Soft Assert Summary — Pass: ${this.passCount}, Fail: ${this.failCount}, Total: ${this.passCount + this.failCount}`,
    );
  }

  overrideLogger(logger: Logger): void {
    this.logger = logger;
  }

  get numberOfAsserts(): number {
    return this.passCount + this.failCount;
  }

  get numberOfPassedAsserts(): number {
    return this.passCount;
  }

  get numberOfFailedAsserts(): number {
    return this.failCount;
  }
}
