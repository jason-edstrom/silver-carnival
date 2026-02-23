import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Builder } from 'selenium-webdriver';
import type { WebDriver } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome';
import { Options as FirefoxOptions } from 'selenium-webdriver/firefox';
import { Options as EdgeOptions } from 'selenium-webdriver/edge';
import { SeleniumTestObject } from '../../src/test-object/SeleniumTestObject.js';
import { createSeleniumContext } from '../../src/adapters/useMaqsSelenium.js';
import { useMaqsSelenium } from '../../src/adapters/vitest.js';

vi.mock('selenium-webdriver', () => ({ Builder: vi.fn() }));
vi.mock('selenium-webdriver/chrome', () => ({ Options: vi.fn() }));
vi.mock('selenium-webdriver/firefox', () => ({ Options: vi.fn() }));
vi.mock('selenium-webdriver/edge', () => ({ Options: vi.fn() }));

describe('createSeleniumContext', () => {
  it('registers beforeEach and afterEach hooks', () => {
    const beforeEachFn = vi.fn();
    const afterEachFn = vi.fn();
    createSeleniumContext({ beforeEach: beforeEachFn, afterEach: afterEachFn });
    expect(beforeEachFn).toHaveBeenCalledOnce();
    expect(afterEachFn).toHaveBeenCalledOnce();
  });

  it('throws when testObject is accessed outside a test body', () => {
    const ctx = createSeleniumContext({ beforeEach: vi.fn(), afterEach: vi.fn() });
    expect(() => ctx.testObject).toThrow(/outside a test body/);
  });

  it('testObject becomes accessible after the beforeEach hook fires', async () => {
    let beforeFn: (() => Promise<void>) | undefined;
    const beforeEachFn = vi.fn((fn: () => Promise<void>) => {
      beforeFn = fn;
    });
    const ctx = createSeleniumContext({ beforeEach: beforeEachFn, afterEach: vi.fn() });
    await beforeFn?.();
    expect(ctx.testObject).toBeInstanceOf(SeleniumTestObject);
  });
});

describe('useMaqsSelenium (vitest adapter)', () => {
  beforeEach(() => {
    const mockWebDriver: WebDriver = {
      quit: vi.fn().mockResolvedValue(undefined),
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

  // useMaqsSelenium() called inside describe registers Vitest's beforeEach/afterEach
  const ctx = useMaqsSelenium();

  it('provides a SeleniumTestObject as testObject', () => {
    expect(ctx.testObject).toBeInstanceOf(SeleniumTestObject);
  });

  it('provides log shortcut pointing to testObject.logger', () => {
    expect(ctx.log).toBe(ctx.testObject.logger);
  });

  it('provides softAssert shortcut', () => {
    expect(ctx.softAssert).toBe(ctx.testObject.softAssert);
  });
});
