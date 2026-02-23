import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Builder } from 'selenium-webdriver';
import type { WebDriver } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome';
import { Options as FirefoxOptions } from 'selenium-webdriver/firefox';
import { Options as EdgeOptions } from 'selenium-webdriver/edge';
import { writeFile, mkdir } from 'node:fs/promises';
import { ConsoleLogger } from '@openmaqs-typescript/core';
import { BaseSeleniumTest } from '../../src/base-test/BaseSeleniumTest.js';
import { SeleniumTestObject } from '../../src/test-object/SeleniumTestObject.js';

vi.mock('selenium-webdriver', () => ({ Builder: vi.fn() }));
vi.mock('selenium-webdriver/chrome', () => ({ Options: vi.fn() }));
vi.mock('selenium-webdriver/firefox', () => ({ Options: vi.fn() }));
vi.mock('selenium-webdriver/edge', () => ({ Options: vi.fn() }));
vi.mock('node:fs/promises', () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
}));

// Concrete subclass to exercise the abstract base
class ConcreteSeleniumTest extends BaseSeleniumTest {
  async exposeCaptureScreenshot(name?: string): Promise<string> {
    return this.captureScreenshot(name);
  }
}

describe('BaseSeleniumTest', () => {
  let mockWebDriver: WebDriver;

  beforeEach(() => {
    vi.clearAllMocks();
    mockWebDriver = {
      quit: vi.fn().mockResolvedValue(undefined),
      takeScreenshot: vi.fn().mockResolvedValue('base64data'),
    } as unknown as WebDriver;
    const mockBuilder = {
      forBrowser: vi.fn().mockReturnThis(),
      usingServer: vi.fn().mockReturnThis(),
      setChromeOptions: vi.fn().mockReturnThis(),
      setFirefoxOptions: vi.fn().mockReturnThis(),
      setEdgeOptions: vi.fn().mockReturnThis(),
      build: vi.fn().mockResolvedValue(mockWebDriver),
    };
    vi.mocked(Builder).mockImplementation(function () {
      return mockBuilder as unknown as Builder;
    });
    vi.mocked(ChromeOptions).mockImplementation(function () {
      return { addArguments: vi.fn().mockReturnThis() } as unknown as ChromeOptions;
    });
    vi.mocked(FirefoxOptions).mockImplementation(function () {
      return { addArguments: vi.fn().mockReturnThis() } as unknown as FirefoxOptions;
    });
    vi.mocked(EdgeOptions).mockImplementation(function () {
      return { addArguments: vi.fn().mockReturnThis() } as unknown as EdgeOptions;
    });
  });

  it('setup() creates a SeleniumTestObject', async () => {
    const test = new ConcreteSeleniumTest();
    await test.setup('myTest');
    expect(test.testObject).toBeInstanceOf(SeleniumTestObject);
    await test.teardown();
  });

  it('testObject is accessible after setup()', async () => {
    const test = new ConcreteSeleniumTest();
    await test.setup();
    expect(test.testObject).toBeDefined();
    await test.teardown();
  });

  it('accessing testObject before setup() throws', () => {
    const test = new ConcreteSeleniumTest();
    expect(() => test.testObject).toThrow(/before setup/);
  });

  it('captureScreenshot calls driver.takeScreenshot() and writes the file', async () => {
    const test = new ConcreteSeleniumTest();
    await test.setup('screenshotTest');
    const path = await test.exposeCaptureScreenshot('my-screenshot');
    expect(path).toBe('screenshots/my-screenshot.png');
    expect(mockWebDriver.takeScreenshot).toHaveBeenCalledOnce();
    expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
      'screenshots/my-screenshot.png',
      'base64data',
      'base64',
    );
    await test.teardown();
  });

  it('captureScreenshot calls mkdir with the screenshots directory', async () => {
    const test = new ConcreteSeleniumTest();
    await test.setup();
    await test.exposeCaptureScreenshot('capture');
    expect(vi.mocked(mkdir)).toHaveBeenCalledWith('screenshots', { recursive: true });
    await test.teardown();
  });

  it('captureScreenshot adds the path to associatedFiles', async () => {
    const test = new ConcreteSeleniumTest();
    await test.setup();
    const path = await test.exposeCaptureScreenshot('capture');
    expect(test.testObject.containsAssociatedFile(path)).toBe(true);
    await test.teardown();
  });

  it('captureScreenshot uses a timestamp when no name is given', async () => {
    const test = new ConcreteSeleniumTest();
    await test.setup();
    const path = await test.exposeCaptureScreenshot();
    expect(path).toMatch(/^screenshots\/\d+\.png$/);
    await test.teardown();
  });

  it('createLogger() produces a ConsoleLogger-backed object', async () => {
    const test = new ConcreteSeleniumTest();
    await test.setup('logTest');
    expect(test.testObject.logger).toBeInstanceOf(ConsoleLogger);
    await test.teardown();
  });

  it('full lifecycle: setup → assert → teardown succeeds', async () => {
    const test = new ConcreteSeleniumTest();
    await test.setup('lifecycle');
    test.softAssert.assert('ok', () => {});
    await expect(test.teardown()).resolves.toBeUndefined();
  });

  it('teardown() throws when soft assertions failed', async () => {
    const test = new ConcreteSeleniumTest();
    await test.setup();
    test.softAssert.assertFail('fail', 'intentional');
    await expect(test.teardown()).rejects.toThrow(/Soft assert failures/);
  });

  it('teardown() closes testObject even when softAssert throws', async () => {
    const test = new ConcreteSeleniumTest();
    await test.setup();
    const closeSpy = vi.spyOn(test.testObject, 'close').mockResolvedValue();
    test.softAssert.assertFail('fail', 'boom');
    await expect(test.teardown()).rejects.toThrow();
    expect(closeSpy).toHaveBeenCalledOnce();
  });
});
