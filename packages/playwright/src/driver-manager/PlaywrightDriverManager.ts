import { chromium, firefox, webkit } from 'playwright';
import type { Browser, BrowserContext, Page } from 'playwright';
import { BaseDriverManager } from '@openmaqs-typescript/core';
import type { Logger } from '@openmaqs-typescript/core';
import { PlaywrightConfig } from '../config/PlaywrightConfig.js';

/**
 * Manages the Playwright Browser + BrowserContext + Page lifecycle for a single test.
 *
 * Lazy initialization: no browser is launched until getDriver() / page is first awaited.
 * Cleanup: close() shuts down the context and browser in the correct order.
 *
 * @example
 * const mgr = new PlaywrightDriverManager(logger);
 * const page = await mgr.page;
 * await page.goto('https://example.com');
 * await mgr.close();
 */
export class PlaywrightDriverManager extends BaseDriverManager<Page> {
  private _browser: Browser | null = null;
  private _context: BrowserContext | null = null;
  private readonly _config: PlaywrightConfig;

  constructor(logger: Logger, config?: PlaywrightConfig) {
    super(logger);
    this._config = config ?? new PlaywrightConfig();
  }

  protected override async createDriver(): Promise<Page> {
    const launchers = { chromium, firefox, webkit };
    const launcher = launchers[this._config.browser];
    this._browser = await launcher.launch({
      headless: this._config.headless,
      slowMo: this._config.slowMo,
    });
    const baseUrl = this._config.baseUrl;
    this._context = await this._browser.newContext(
      baseUrl !== undefined ? { baseURL: baseUrl } : {},
    );
    return this._context.newPage();
  }

  protected override async driverDispose(): Promise<void> {
    await this._context?.close();
    await this._browser?.close();
    this._context = null;
    this._browser = null;
  }

  /** Convenience accessor — equivalent to getDriver(). */
  get page(): Promise<Page> {
    return this.getDriver();
  }
}
