import { BaseTest } from './BaseTest.js';
import { BaseTestObject } from '../test-object/BaseTestObject.js';

/**
 * Generic extension point for technology-specific packages.
 *
 * TObject is constrained to BaseTestObject so all base properties
 * (logger, softAssert, managerStore, config) are guaranteed present.
 *
 * @example
 * // In @openmaqs-typescript/selenium:
 * class SeleniumTestObject extends BaseTestObject { ... }
 *
 * abstract class BaseSeleniumTest extends BaseExtendableTest<SeleniumTestObject> {
 *   protected createSpecificTestObject(): SeleniumTestObject { ... }
 * }
 */
export abstract class BaseExtendableTest<TObject extends BaseTestObject> extends BaseTest {
  private _specificTestObject: TObject | undefined = undefined;

  /** Typed accessor — returns TObject instead of BaseTestObject. */
  override get testObject(): TObject {
    if (!this._specificTestObject) {
      throw new Error(
        `testObject accessed before setup() was called on ${this.constructor.name}`,
      );
    }
    return this._specificTestObject;
  }

  /**
   * Bridges BaseTest.createTestObject() → createSpecificTestObject()
   * so technology packages remain fully typed.
   */
  protected override createTestObject(): BaseTestObject {
    this._specificTestObject = this.createSpecificTestObject();
    return this._specificTestObject;
  }

  /**
   * Technology-specific packages implement this to return their custom TestObject.
   */
  protected abstract createSpecificTestObject(): TObject;
}
