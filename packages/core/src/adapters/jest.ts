import type { BaseTestObject } from '../test-object/BaseTestObject.js';
import { createMaqsContext } from './useMaqsCore.js';
import type { MaqsContext } from './useMaqsCore.js';

export type { MaqsContext };

/**
 * Set up MAQS for a Jest describe block.
 * Call inside describe() — beforeEach/afterEach are registered automatically.
 *
 * Jest's beforeEach/afterEach are globals, so no import is required.
 *
 * @example
 * import { useMaqs } from '@openmaqs-typescript/core/adapters/jest';
 * import { BaseTestObject, createConsoleLogger } from '@openmaqs-typescript/core';
 *
 * describe('My Suite', () => {
 *   const ctx = useMaqs(() => new BaseTestObject(createConsoleLogger()));
 *
 *   it('logs a message', () => {
 *     ctx.log.logInfo('Hello from MAQS!');
 *   });
 * });
 */
export function useMaqs<T extends BaseTestObject>(
  createTestObject: (testName?: string) => T,
): MaqsContext<T> {
  const g = globalThis as {
    beforeEach?: (fn: () => Promise<void>) => void;
    afterEach?: (fn: () => Promise<void>) => void;
  };

  if (!g.beforeEach || !g.afterEach) {
    throw new Error(
      'useMaqs() must be called inside a Jest describe() block where beforeEach/afterEach are available.',
    );
  }

  return createMaqsContext(createTestObject, {
    beforeEach: g.beforeEach,
    afterEach: g.afterEach,
  });
}
