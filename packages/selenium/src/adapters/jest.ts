import type { MaqsContext } from '@openmaqs-typescript/core';
import type { SeleniumConfig } from '../config/SeleniumConfig.js';
import type { SeleniumTestObject } from '../test-object/SeleniumTestObject.js';
import { createSeleniumContext } from './useMaqsSelenium.js';

export type { MaqsContext };

/**
 * Set up MAQS Selenium for a Jest describe block.
 * Call inside describe() — beforeEach/afterEach are registered automatically.
 *
 * Jest's beforeEach/afterEach are globals, so no import is required.
 *
 * @example
 * import { useMaqsSelenium } from '@openmaqs-typescript/selenium/adapters/jest';
 *
 * describe('My Selenium Suite', () => {
 *   const ctx = useMaqsSelenium();
 *
 *   it('navigates to the app', async () => {
 *     const driver = await ctx.testObject.webDriver;
 *     await driver.get('https://example.com');
 *   });
 * });
 */
export function useMaqsSelenium(config?: SeleniumConfig): MaqsContext<SeleniumTestObject> {
  const g = globalThis as {
    beforeEach?: (fn: () => Promise<void>) => void;
    afterEach?: (fn: () => Promise<void>) => void;
  };

  if (!g.beforeEach || !g.afterEach) {
    throw new Error(
      'useMaqsSelenium() must be called inside a Jest describe() block where beforeEach/afterEach are available.',
    );
  }

  return createSeleniumContext({ beforeEach: g.beforeEach, afterEach: g.afterEach }, config);
}
