import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Builder } from 'selenium-webdriver';
import type { WebDriver } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome';
import { Options as FirefoxOptions } from 'selenium-webdriver/firefox';
import { Options as EdgeOptions } from 'selenium-webdriver/edge';
import { ConsoleLogger, LogLevel } from '@openmaqs-typescript/core';
import { SeleniumTestObject } from '../../src/test-object/SeleniumTestObject.js';
import { SeleniumDriverManager } from '../../src/driver-manager/SeleniumDriverManager.js';

vi.mock('selenium-webdriver', () => ({ Builder: vi.fn() }));
vi.mock('selenium-webdriver/chrome', () => ({ Options: vi.fn() }));
vi.mock('selenium-webdriver/firefox', () => ({ Options: vi.fn() }));
vi.mock('selenium-webdriver/edge', () => ({ Options: vi.fn() }));

function makeLogger(): ConsoleLogger {
  return new ConsoleLogger(LogLevel.Suspended);
}

describe('SeleniumTestObject', () => {
  let mockWebDriver: WebDriver;

  beforeEach(() => {
    vi.clearAllMocks();
    mockWebDriver = {
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

  it('creates with logger, softAssert, managerStore, and config', () => {
    const obj = new SeleniumTestObject(makeLogger());
    expect(obj.logger).toBeDefined();
    expect(obj.softAssert).toBeDefined();
    expect(obj.managerStore).toBeDefined();
    expect(obj.config).toBeDefined();
  });

  it('seleniumManager is a SeleniumDriverManager', () => {
    const obj = new SeleniumTestObject(makeLogger());
    expect(obj.seleniumManager).toBeInstanceOf(SeleniumDriverManager);
  });

  it('managerStore contains the SeleniumDriver key', () => {
    const obj = new SeleniumTestObject(makeLogger());
    expect(obj.managerStore.contains('SeleniumDriver')).toBe(true);
  });

  it('webDriver getter returns the mocked WebDriver', async () => {
    const obj = new SeleniumTestObject(makeLogger());
    const driver = await obj.webDriver;
    expect(driver).toBe(mockWebDriver);
  });

  it('close() shuts down the selenium manager', async () => {
    const obj = new SeleniumTestObject(makeLogger());
    await obj.webDriver; // initialize the driver
    const closeSpy = vi.spyOn(obj.seleniumManager, 'close').mockResolvedValue();
    await obj.close();
    expect(closeSpy).toHaveBeenCalledOnce();
  });

  it('close() before webDriver access does not throw', async () => {
    const obj = new SeleniumTestObject(makeLogger());
    await expect(obj.close()).resolves.toBeUndefined();
  });

  it('associatedFiles starts empty', () => {
    const obj = new SeleniumTestObject(makeLogger());
    expect(obj.associatedFiles.size).toBe(0);
  });
});
