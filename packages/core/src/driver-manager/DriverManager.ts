import type { Logger } from '../logging/Logger.js';

/**
 * Contract for all MAQS driver managers.
 * Technology packages (Selenium, Playwright, etc.) implement this via BaseDriverManager<T>.
 */
export interface DriverManager<T = unknown> {
  /**
   * Returns the driver instance, lazily initializing it on first call.
   * Subsequent calls return the same cached instance until close() is called.
   */
  getDriver(): Promise<T>;

  /** True if the driver has been initialized (getDriver called at least once). */
  isDriverInitialized(): boolean;

  /** Shut down the driver and release all resources. */
  close(): Promise<void>;

  /** Reference to the test logger, injected at construction time. */
  readonly log: Logger;
}
