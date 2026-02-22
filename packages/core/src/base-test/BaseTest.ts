import type { BaseTestObject } from '../test-object/BaseTestObject.js';
import type { Logger } from '../logging/Logger.js';
import { createLogger } from '../logging/LoggerFactory.js';
import { MaqsConfig } from '../config/MaqsConfig.js';
import { LogLevel } from '../logging/LogLevel.js';

/**
 * Abstract base class for MAQS tests.
 *
 * Prefer the useMaqs() functional helpers in the adapter packages for most tests.
 * Extend BaseTest directly when you need class-based test organization with shared
 * setup across a large suite (e.g. a full Selenium page object model).
 *
 * Lifecycle:
 *   setup(testName?)    — creates testObject, calls beforeTest()
 *   [test body runs]
 *   teardown()          — calls afterTest(), checks soft asserts, closes testObject
 *
 * Override beforeTest() / afterTest() in subclasses to open/close drivers.
 */
export abstract class BaseTest {
  private _testObject: BaseTestObject | undefined = undefined;
  private _testName = 'Unknown';

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  async setup(testName?: string): Promise<void> {
    this._testName = testName ?? `${this.constructor.name}_${Date.now()}`;
    this._testObject = this.createTestObject();
    this.log.logMessage(LogLevel.Information, `----- START: ${this._testName} -----`);
    await this.beforeTest();
  }

  async teardown(): Promise<void> {
    let caughtError: Error | undefined;
    try {
      await this.afterTest();
      this.softAssert.failTestIfAssertFailed();
    } catch (err) {
      caughtError = err instanceof Error ? err : new Error(String(err));
    } finally {
      this.log.logMessage(LogLevel.Information, `----- END: ${this._testName} -----`);
      await this._testObject?.close();
      this._testObject = undefined;
    }
    if (caughtError !== undefined) throw caughtError;
  }

  // ---------------------------------------------------------------------------
  // Abstract factory
  // ---------------------------------------------------------------------------

  /** Return a new BaseTestObject (or subclass) for each test. Called once per setup(). */
  protected abstract createTestObject(): BaseTestObject;

  // ---------------------------------------------------------------------------
  // Overrideable hooks — default implementations are intentionally empty
  // ---------------------------------------------------------------------------

  /**
   * Called at the end of setup(), after testObject is created.
   * Override in subclasses to open a browser, start a driver, etc.
   */
  protected async beforeTest(): Promise<void> {}

  /**
   * Called at the start of teardown(), before soft assert check.
   * Override in subclasses to take a screenshot on failure, close connections, etc.
   */
  protected async afterTest(): Promise<void> {}

  // ---------------------------------------------------------------------------
  // Accessors
  // ---------------------------------------------------------------------------

  get testObject(): BaseTestObject {
    if (!this._testObject) {
      throw new Error(
        `testObject accessed before setup() was called on ${this.constructor.name}`,
      );
    }
    return this._testObject;
  }

  get log(): Logger {
    return this.testObject.logger;
  }

  get softAssert(): BaseTestObject['softAssert'] {
    return this.testObject.softAssert;
  }

  // ---------------------------------------------------------------------------
  // Helper for subclasses
  // ---------------------------------------------------------------------------

  protected createLogger(testName?: string): Logger {
    const config = new MaqsConfig();
    const logType = (config.getValue('LogType', 'console') ?? 'console') as
      | 'console'
      | 'txt'
      | 'text'
      | 'none';
    const levelStr = config.getValue('LogLevel', 'Information') ?? 'Information';
    const level = (LogLevel[levelStr as keyof typeof LogLevel] as LogLevel | undefined) ?? LogLevel.Information;
    return createLogger({ logType, logName: testName ?? this._testName, level });
  }
}
