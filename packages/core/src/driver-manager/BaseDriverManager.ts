import type { DriverManager } from './DriverManager.js';
import type { Logger } from '../logging/Logger.js';

/**
 * Abstract base for all MAQS driver managers.
 * Implements lazy initialization and caching of the driver instance.
 *
 * Subclasses must implement:
 *   - createDriver()   — instantiates and returns the driver
 *   - driverDispose()  — cleans up the driver on close()
 *
 * @example
 * // In @openmaqs-typescript/selenium:
 * class SeleniumDriverManager extends BaseDriverManager<WebDriver> {
 *   protected async createDriver(): Promise<WebDriver> { ... }
 *   protected async driverDispose(): Promise<void> { await this.driver?.quit(); }
 * }
 */
export abstract class BaseDriverManager<T> implements DriverManager<T> {
  readonly log: Logger;
  private _driver: T | null = null;
  private _initialized = false;
  private _driverFactory: (() => Promise<T>) | undefined;

  protected constructor(logger: Logger, driverFactory?: () => Promise<T>) {
    this.log = logger;
    this._driverFactory = driverFactory;
  }

  async getDriver(): Promise<T> {
    if (!this._initialized) {
      this._driver = await this.createDriver();
      this._initialized = true;
    }
    return this._driver as T;
  }

  isDriverInitialized(): boolean {
    return this._initialized;
  }

  async close(): Promise<void> {
    if (this._initialized) {
      await this.driverDispose();
      this._driver = null;
      this._initialized = false;
    }
  }

  /**
   * Override to provide custom driver initialization.
   * Called once; result is cached until close() is called.
   * If a driverFactory was passed to the constructor, it is used here by default.
   */
  protected async createDriver(): Promise<T> {
    if (this._driverFactory) return this._driverFactory();
    throw new Error(
      `${this.constructor.name} must implement createDriver() or provide a driverFactory`,
    );
  }

  /** Override to clean up the driver when close() is called. */
  protected abstract driverDispose(): Promise<void>;

  /**
   * Replace the driver factory at runtime, closing any existing driver first.
   * Mirrors .NET OverrideDriverGet.
   */
  async overrideDriver(newFactory: () => Promise<T>): Promise<void> {
    await this.close();
    this._driverFactory = newFactory;
  }
}
