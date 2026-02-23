import type { MaqsContext } from '@openmaqs-typescript/core';
import type { PlaywrightConfig } from '../config/PlaywrightConfig.js';
import type { PlaywrightTestObject } from '../test-object/PlaywrightTestObject.js';
import { createPlaywrightContext } from './useMaqsPlaywright.js';

export type { MaqsContext };

/**
 * Set up MAQS Playwright for a Mocha describe block.
 * Call inside describe() — beforeEach/afterEach are registered automatically.
 *
 * Mocha's beforeEach/afterEach are globals, so no import is required.
 *
 * @example
 * import { useMaqsPlaywright } from '@openmaqs-typescript/playwright/adapters/mocha';
 *
 * describe('My Playwright Suite', function () {
 *   const ctx = useMaqsPlaywright();
 *
 *   it('navigates to the app', async function () {
 *     const page = await ctx.testObject.page;
 *     await page.goto('https://example.com');
 *   });
 * });
 */
export function useMaqsPlaywright(config?: PlaywrightConfig): MaqsContext<PlaywrightTestObject> {
  const g = globalThis as {
    beforeEach?: (fn: () => Promise<void>) => void;
    afterEach?: (fn: () => Promise<void>) => void;
  };

  if (!g.beforeEach || !g.afterEach) {
    throw new Error(
      'useMaqsPlaywright() must be called inside a Mocha describe() block where beforeEach/afterEach are available.',
    );
  }

  return createPlaywrightContext(
    { beforeEach: g.beforeEach, afterEach: g.afterEach },
    config,
  );
}
