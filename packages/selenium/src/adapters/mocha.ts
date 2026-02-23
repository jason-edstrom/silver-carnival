import type { MaqsContext } from '@openmaqs-typescript/core';
import type { SeleniumConfig } from '../config/SeleniumConfig.js';
import type { SeleniumTestObject } from '../test-object/SeleniumTestObject.js';
import { createSeleniumContext } from './useMaqsSelenium.js';

export type { MaqsContext };

/**
 * Set up MAQS Selenium for a Mocha describe block.
 * Call inside describe() — beforeEach/afterEach are registered automatically.
 *
 * Mocha's beforeEach/afterEach are globals, so no import is required.
 *
 * @example
 * import { useMaqsSelenium } from '@openmaqs-typescript/selenium/adapters/mocha';
 *
 * describe('My Selenium Suite', function () {
 *   const ctx = useMaqsSelenium();
 *
 *   it('navigates to the app', async function () {
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
      'useMaqsSelenium() must be called inside a Mocha describe() block where beforeEach/afterEach are available.',
    );
  }

  return createSeleniumContext({ beforeEach: g.beforeEach, afterEach: g.afterEach }, config);
}
