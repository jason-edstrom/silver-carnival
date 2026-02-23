import { BaseExtendableTest } from '@openmaqs-typescript/core';
import { PlaywrightTestObject } from '../test-object/PlaywrightTestObject.js';

/**
 * Abstract base class for Playwright test suites using the class-based MAQS API.
 *
 * Prefer useMaqsPlaywright() for most suites. Extend BasePlaywrightTest when you
 * need shared class state or a complex page-object model.
 *
 * @example
 * class MyPlaywrightTest extends BasePlaywrightTest {
 *   protected override async beforeTest(): Promise<void> {
 *     await (await this.testObject.page).goto('https://example.com');
 *   }
 *   protected override async afterTest(): Promise<void> {
 *     if (this.testFailed) await this.captureScreenshot();
 *   }
 * }
 */
export abstract class BasePlaywrightTest extends BaseExtendableTest<PlaywrightTestObject> {
  protected override createSpecificTestObject(): PlaywrightTestObject {
    return new PlaywrightTestObject(this.createLogger());
  }

  /**
   * Takes a screenshot of the current page and registers it as an associated file.
   *
   * @param name Optional filename (without extension). Defaults to the current timestamp.
   * @returns The path the screenshot was saved to.
   */
  protected async captureScreenshot(name?: string): Promise<string> {
    const page = await this.testObject.page;
    const filePath = `screenshots/${name ?? Date.now()}.png`;
    await page.screenshot({ path: filePath });
    this.testObject.addAssociatedFile(filePath);
    return filePath;
  }
}
