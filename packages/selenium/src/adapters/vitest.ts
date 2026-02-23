import { beforeEach, afterEach } from 'vitest';
import type { MaqsContext } from '@openmaqs-typescript/core';
import type { SeleniumConfig } from '../config/SeleniumConfig.js';
import type { SeleniumTestObject } from '../test-object/SeleniumTestObject.js';
import { createSeleniumContext } from './useMaqsSelenium.js';

export type { MaqsContext };

/**
 * Set up MAQS Selenium for a Vitest describe block.
 * Call inside describe() — beforeEach/afterEach are registered automatically.
 *
 * @example
 * import { useMaqsSelenium } from '@openmaqs-typescript/selenium/adapters/vitest';
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
  return createSeleniumContext({ beforeEach, afterEach }, config);
}
