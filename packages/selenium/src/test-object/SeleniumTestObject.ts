import type { WebDriver } from 'selenium-webdriver';
import { BaseTestObject } from '@openmaqs-typescript/core';
import type { Logger, MaqsConfig } from '@openmaqs-typescript/core';
import type { SeleniumConfig } from '../config/SeleniumConfig.js';
import { SeleniumDriverManager } from '../driver-manager/SeleniumDriverManager.js';

const SELENIUM_MANAGER_KEY = 'SeleniumDriver';

/**
 * Test object that holds all context for a single Selenium test.
 * Registers a SeleniumDriverManager under the 'SeleniumDriver' key.
 *
 * @example
 * const obj = new SeleniumTestObject(createConsoleLogger());
 * const driver = await obj.webDriver;
 * await driver.get('https://example.com');
 */
export class SeleniumTestObject extends BaseTestObject {
  constructor(logger: Logger, selConfig?: SeleniumConfig, maqsConfig?: MaqsConfig) {
    super(logger, maqsConfig);
    this.managerStore.put(SELENIUM_MANAGER_KEY, new SeleniumDriverManager(logger, selConfig));
  }

  /** Lazily initialized WebDriver for the current test. */
  get webDriver(): Promise<WebDriver> {
    return this.seleniumManager.getDriver();
  }

  /** The underlying SeleniumDriverManager, for advanced use. */
  get seleniumManager(): SeleniumDriverManager {
    return this.managerStore.get<WebDriver>(SELENIUM_MANAGER_KEY) as SeleniumDriverManager;
  }
}
