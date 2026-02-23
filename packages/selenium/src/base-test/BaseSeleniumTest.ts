import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { BaseExtendableTest } from '@openmaqs-typescript/core';
import { SeleniumTestObject } from '../test-object/SeleniumTestObject.js';

/**
 * Abstract base class for Selenium test suites using the class-based MAQS API.
 *
 * Prefer useMaqsSelenium() for most suites. Extend BaseSeleniumTest when you
 * need shared class state or a complex page-object model.
 *
 * @example
 * class MySeleniumTest extends BaseSeleniumTest {
 *   protected override async beforeTest(): Promise<void> {
 *     await (await this.testObject.webDriver).get('https://example.com');
 *   }
 *   protected override async afterTest(): Promise<void> {
 *     if (this.testFailed) await this.captureScreenshot();
 *   }
 * }
 */
export abstract class BaseSeleniumTest extends BaseExtendableTest<SeleniumTestObject> {
  protected override createSpecificTestObject(): SeleniumTestObject {
    return new SeleniumTestObject(this.createLogger());
  }

  /**
   * Takes a screenshot of the current browser and registers it as an associated file.
   * The base64 string from takeScreenshot() is decoded and written to disk as a PNG.
   *
   * @param name Optional filename (without extension). Defaults to the current timestamp.
   * @returns The path the screenshot was saved to.
   */
  protected async captureScreenshot(name?: string): Promise<string> {
    const driver = await this.testObject.webDriver;
    const filePath = `screenshots/${name ?? Date.now()}.png`;
    const screenshot = await driver.takeScreenshot();
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, screenshot, 'base64');
    this.testObject.addAssociatedFile(filePath);
    return filePath;
  }
}
