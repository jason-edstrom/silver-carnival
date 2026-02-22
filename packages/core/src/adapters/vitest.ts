import { beforeEach, afterEach } from 'vitest';
import type { BaseTestObject } from '../test-object/BaseTestObject.js';
import { createMaqsContext } from './useMaqsCore.js';
import type { MaqsContext } from './useMaqsCore.js';

export type { MaqsContext };

/**
 * Set up MAQS for a Vitest describe block.
 * Call inside describe() — beforeEach/afterEach are registered automatically.
 *
 * @example
 * import { useMaqs } from '@openmaqs-typescript/core/adapters/vitest';
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
  return createMaqsContext(createTestObject, { beforeEach, afterEach });
}
