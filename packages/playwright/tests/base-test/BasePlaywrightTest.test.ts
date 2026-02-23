import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Browser, BrowserContext, Page } from 'playwright';
import { chromium } from 'playwright';
import { ConsoleLogger } from '@openmaqs-typescript/core';
import { BasePlaywrightTest } from '../../src/base-test/BasePlaywrightTest.js';
import { PlaywrightTestObject } from '../../src/test-object/PlaywrightTestObject.js';

vi.mock('playwright', () => ({
  chromium: { launch: vi.fn() },
  firefox: { launch: vi.fn() },
  webkit: { launch: vi.fn() },
}));

// Concrete subclass to exercise the abstract base
class ConcretePlaywrightTest extends BasePlaywrightTest {
  async exposeCaptureScreenshot(name?: string): Promise<string> {
    return this.captureScreenshot(name);
  }
}

describe('BasePlaywrightTest', () => {
  let mockPage: Page;
  let mockContext: BrowserContext;
  let mockBrowser: Browser;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPage = {
      screenshot: vi.fn().mockResolvedValue(undefined),
      close: vi.fn(),
    } as unknown as Page;
    mockContext = {
      newPage: vi.fn().mockResolvedValue(mockPage),
      close: vi.fn().mockResolvedValue(undefined),
    } as unknown as BrowserContext;
    mockBrowser = {
      newContext: vi.fn().mockResolvedValue(mockContext),
      close: vi.fn().mockResolvedValue(undefined),
    } as unknown as Browser;
    vi.mocked(chromium.launch).mockResolvedValue(mockBrowser);
  });

  it('setup() creates a PlaywrightTestObject', async () => {
    const test = new ConcretePlaywrightTest();
    await test.setup('myTest');
    expect(test.testObject).toBeInstanceOf(PlaywrightTestObject);
    await test.teardown();
  });

  it('testObject is accessible after setup()', async () => {
    const test = new ConcretePlaywrightTest();
    await test.setup();
    expect(test.testObject).toBeDefined();
    await test.teardown();
  });

  it('accessing testObject before setup() throws', () => {
    const test = new ConcretePlaywrightTest();
    expect(() => test.testObject).toThrow(/before setup/);
  });

  it('captureScreenshot calls page.screenshot with the given name', async () => {
    const test = new ConcretePlaywrightTest();
    await test.setup('screenshotTest');
    const path = await test.exposeCaptureScreenshot('my-screenshot');
    expect(path).toBe('screenshots/my-screenshot.png');
    expect(mockPage.screenshot).toHaveBeenCalledWith({ path: 'screenshots/my-screenshot.png' });
    await test.teardown();
  });

  it('captureScreenshot adds the path to associatedFiles', async () => {
    const test = new ConcretePlaywrightTest();
    await test.setup();
    const path = await test.exposeCaptureScreenshot('capture');
    expect(test.testObject.containsAssociatedFile(path)).toBe(true);
    await test.teardown();
  });

  it('captureScreenshot uses a timestamp when no name is given', async () => {
    const test = new ConcretePlaywrightTest();
    await test.setup();
    const path = await test.exposeCaptureScreenshot();
    expect(path).toMatch(/^screenshots\/\d+\.png$/);
    await test.teardown();
  });

  it('createLogger() uses LogLevel.Suspended in test (via override)', async () => {
    const test = new ConcretePlaywrightTest();
    await test.setup('logTest');
    expect(test.log).toBeDefined();
    await test.teardown();
  });

  it('full lifecycle: setup → assert → teardown succeeds', async () => {
    const test = new ConcretePlaywrightTest();
    await test.setup('lifecycle');
    test.softAssert.assert('ok', () => {});
    await expect(test.teardown()).resolves.toBeUndefined();
  });

  it('teardown() throws when soft assertions failed', async () => {
    const test = new ConcretePlaywrightTest();
    await test.setup();
    test.softAssert.assertFail('fail', 'intentional');
    await expect(test.teardown()).rejects.toThrow(/Soft assert failures/);
  });

  it('teardown() closes testObject even when softAssert throws', async () => {
    const test = new ConcretePlaywrightTest();
    await test.setup();
    const closeSpy = vi.spyOn(test.testObject, 'close').mockResolvedValue();
    test.softAssert.assertFail('fail', 'boom');
    await expect(test.teardown()).rejects.toThrow();
    expect(closeSpy).toHaveBeenCalledOnce();
  });

  it('createSpecificTestObject() produces a ConsoleLogger-backed object', async () => {
    const test = new ConcretePlaywrightTest();
    await test.setup();
    expect(test.testObject.logger).toBeInstanceOf(ConsoleLogger);
    await test.teardown();
  });
});
