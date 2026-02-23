import { Builder } from 'selenium-webdriver';
import type { WebDriver } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome';
import { Options as FirefoxOptions } from 'selenium-webdriver/firefox';
import { Options as EdgeOptions } from 'selenium-webdriver/edge';
import { BaseDriverManager } from '@openmaqs-typescript/core';
import type { Logger } from '@openmaqs-typescript/core';
import { SeleniumConfig } from '../config/SeleniumConfig.js';

/**
 * Manages the Selenium WebDriver lifecycle for a single test.
 *
 * Lazy initialization: no browser is launched until getDriver() / webDriver is first awaited.
 * Cleanup: close() quits the WebDriver session.
 * Grid/remote execution: set gridUrl in config to route through a Selenium Grid.
 *
 * @example
 * const mgr = new SeleniumDriverManager(logger);
 * const driver = await mgr.webDriver;
 * await driver.get('https://example.com');
 * await mgr.close();
 */
export class SeleniumDriverManager extends BaseDriverManager<WebDriver> {
  private _webDriver: WebDriver | null = null;
  private readonly _config: SeleniumConfig;

  constructor(logger: Logger, config?: SeleniumConfig) {
    super(logger);
    this._config = config ?? new SeleniumConfig();
  }

  protected override async createDriver(): Promise<WebDriver> {
    const builder = new Builder();

    const gridUrl = this._config.gridUrl;
    if (gridUrl !== undefined) {
      builder.usingServer(gridUrl);
    }

    const browser = this._config.browser;
    switch (browser) {
      case 'chrome': {
        const opts = new ChromeOptions();
        if (this._config.headless) opts.addArguments('--headless=new', '--disable-gpu');
        builder.forBrowser('chrome').setChromeOptions(opts);
        break;
      }
      case 'firefox': {
        const opts = new FirefoxOptions();
        if (this._config.headless) opts.addArguments('-headless');
        builder.forBrowser('firefox').setFirefoxOptions(opts);
        break;
      }
      case 'edge': {
        const opts = new EdgeOptions();
        if (this._config.headless) opts.addArguments('--headless=new', '--disable-gpu');
        builder.forBrowser('MicrosoftEdge').setEdgeOptions(opts);
        break;
      }
    }

    this._webDriver = await builder.build();
    return this._webDriver;
  }

  protected override async driverDispose(): Promise<void> {
    await this._webDriver?.quit();
    this._webDriver = null;
  }

  /** Convenience accessor — equivalent to getDriver(). */
  get webDriver(): Promise<WebDriver> {
    return this.getDriver();
  }
}
