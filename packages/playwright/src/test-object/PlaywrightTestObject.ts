import type { Page } from 'playwright';
import { BaseTestObject } from '@openmaqs-typescript/core';
import type { Logger, MaqsConfig } from '@openmaqs-typescript/core';
import type { PlaywrightConfig } from '../config/PlaywrightConfig.js';
import { PlaywrightDriverManager } from '../driver-manager/PlaywrightDriverManager.js';

const PLAYWRIGHT_MANAGER_KEY = 'PlaywrightDriver';

/**
 * Test object that holds all context for a single Playwright test.
 * Registers a PlaywrightDriverManager under the 'PlaywrightDriver' key.
 *
 * @example
 * const obj = new PlaywrightTestObject(createConsoleLogger());
 * const page = await obj.page;
 * await page.goto('https://example.com');
 */
export class PlaywrightTestObject extends BaseTestObject {
  constructor(logger: Logger, pwConfig?: PlaywrightConfig, maqsConfig?: MaqsConfig) {
    super(logger, maqsConfig);
    this.managerStore.put(PLAYWRIGHT_MANAGER_KEY, new PlaywrightDriverManager(logger, pwConfig));
  }

  /** Lazily initialized Playwright Page for the current test. */
  get page(): Promise<Page> {
    return this.playwrightManager.getDriver();
  }

  /** The underlying PlaywrightDriverManager, for advanced use. */
  get playwrightManager(): PlaywrightDriverManager {
    return this.managerStore.get<Page>(PLAYWRIGHT_MANAGER_KEY) as PlaywrightDriverManager;
  }
}
