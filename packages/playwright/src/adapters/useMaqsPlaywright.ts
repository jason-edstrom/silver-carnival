import { createMaqsContext, createConsoleLogger } from '@openmaqs-typescript/core';
import type { TestHooks, MaqsContext } from '@openmaqs-typescript/core';
import type { PlaywrightConfig } from '../config/PlaywrightConfig.js';
import { PlaywrightTestObject } from '../test-object/PlaywrightTestObject.js';

/**
 * Framework-agnostic factory for a MAQS Playwright context.
 * Runner adapters (vitest, jest, mocha) call this with their own beforeEach/afterEach.
 *
 * @param hooks   { beforeEach, afterEach } from the test runner.
 * @param config  Optional PlaywrightConfig; uses defaults if omitted.
 */
export function createPlaywrightContext(
  hooks: TestHooks,
  config?: PlaywrightConfig,
): MaqsContext<PlaywrightTestObject> {
  return createMaqsContext(() => new PlaywrightTestObject(createConsoleLogger(), config), hooks);
}
