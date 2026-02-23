import { createMaqsContext, createConsoleLogger } from '@openmaqs-typescript/core';
import type { TestHooks, MaqsContext } from '@openmaqs-typescript/core';
import type { SeleniumConfig } from '../config/SeleniumConfig.js';
import { SeleniumTestObject } from '../test-object/SeleniumTestObject.js';

/**
 * Framework-agnostic factory for a MAQS Selenium context.
 * Runner adapters (vitest, jest, mocha) call this with their own beforeEach/afterEach.
 *
 * @param hooks   { beforeEach, afterEach } from the test runner.
 * @param config  Optional SeleniumConfig; uses defaults if omitted.
 */
export function createSeleniumContext(
  hooks: TestHooks,
  config?: SeleniumConfig,
): MaqsContext<SeleniumTestObject> {
  return createMaqsContext(() => new SeleniumTestObject(createConsoleLogger(), config), hooks);
}
