import { beforeEach, afterEach } from 'vitest';
import type { MaqsContext } from '@jason-edstrom/core';
import type { PlaywrightConfig } from '../config/PlaywrightConfig.js';
import type { PlaywrightTestObject } from '../test-object/PlaywrightTestObject.js';
import { createPlaywrightContext } from './useMaqsPlaywright.js';

export type { MaqsContext };

/**
 * Set up MAQS Playwright for a Vitest describe block.
 * Call inside describe() — beforeEach/afterEach are registered automatically.
 *
 * @example
 * import { useMaqsPlaywright } from '@jason-edstrom/playwright/adapters/vitest';
 *
 * describe('My Playwright Suite', () => {
 *   const ctx = useMaqsPlaywright();
 *
 *   it('navigates to the app', async () => {
 *     const page = await ctx.testObject.page;
 *     await page.goto('https://example.com');
 *   });
 * });
 */
export function useMaqsPlaywright(config?: PlaywrightConfig): MaqsContext<PlaywrightTestObject> {
  return createPlaywrightContext({ beforeEach, afterEach }, config);
}
