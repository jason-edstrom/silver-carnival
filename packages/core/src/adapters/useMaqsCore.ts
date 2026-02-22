import type { BaseTestObject } from '../test-object/BaseTestObject.js';
import type { Logger } from '../logging/Logger.js';
import type { SoftAssert } from '../soft-assert/SoftAssert.js';

export interface TestHooks {
  beforeEach: (fn: () => Promise<void>) => void;
  afterEach: (fn: () => Promise<void>) => void;
}

/**
 * The object returned by useMaqs(). Provides stable accessors for the
 * current test's context — safe to destructure at the describe() level.
 */
export interface MaqsContext<T extends BaseTestObject> {
  /** The current test's TestObject. Throws if accessed outside a test body. */
  readonly testObject: T;
  /** Shortcut for testObject.logger */
  readonly log: Logger;
  /** Shortcut for testObject.softAssert */
  readonly softAssert: SoftAssert;
}

/**
 * Framework-agnostic core of useMaqs().
 * Adapter packages (vitest, jest, mocha) call this with their runner's hooks.
 *
 * @param createTestObject  Factory called once per test to create the TestObject.
 * @param hooks             { beforeEach, afterEach } from the test runner.
 */
export function createMaqsContext<T extends BaseTestObject>(
  createTestObject: (testName?: string) => T,
  hooks: TestHooks,
): MaqsContext<T> {
  let _current: T | undefined;

  hooks.beforeEach(async () => {
    _current = createTestObject();
  });

  hooks.afterEach(async () => {
    try {
      _current?.softAssert.failTestIfAssertFailed();
    } finally {
      await _current?.close();
      _current = undefined;
    }
  });

  return {
    get testObject(): T {
      if (!_current) {
        throw new Error(
          'testObject accessed outside a test body. ' +
            'Make sure useMaqs() was called inside a describe() block.',
        );
      }
      return _current;
    },
    get log(): Logger {
      return this.testObject.logger;
    },
    get softAssert(): SoftAssert {
      return this.testObject.softAssert;
    },
  };
}
