import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Builder } from 'selenium-webdriver';
import type { WebDriver } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome';
import { Options as FirefoxOptions } from 'selenium-webdriver/firefox';
import { Options as EdgeOptions } from 'selenium-webdriver/edge';
import { ConsoleLogger, LogLevel } from '@openmaqs-typescript/core';
import { SeleniumDriverManager } from '../../src/driver-manager/SeleniumDriverManager.js';
import { SeleniumConfig } from '../../src/config/SeleniumConfig.js';

vi.mock('selenium-webdriver', () => ({ Builder: vi.fn() }));
vi.mock('selenium-webdriver/chrome', () => ({ Options: vi.fn() }));
vi.mock('selenium-webdriver/firefox', () => ({ Options: vi.fn() }));
vi.mock('selenium-webdriver/edge', () => ({ Options: vi.fn() }));

function makeLogger(): ConsoleLogger {
  return new ConsoleLogger(LogLevel.Suspended);
}

describe('SeleniumDriverManager', () => {
  let mockWebDriver: WebDriver;
  let mockBuilder: {
    forBrowser: ReturnType<typeof vi.fn>;
    usingServer: ReturnType<typeof vi.fn>;
    setChromeOptions: ReturnType<typeof vi.fn>;
    setFirefoxOptions: ReturnType<typeof vi.fn>;
    setEdgeOptions: ReturnType<typeof vi.fn>;
    build: ReturnType<typeof vi.fn>;
  };
  let mockChromeOptions: { addArguments: ReturnType<typeof vi.fn> };
  let mockFirefoxOptions: { addArguments: ReturnType<typeof vi.fn> };
  let mockEdgeOptions: { addArguments: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    mockWebDriver = {
      quit: vi.fn().mockResolvedValue(undefined),
      takeScreenshot: vi.fn().mockResolvedValue('base64data'),
    } as unknown as WebDriver;
    mockBuilder = {
      forBrowser: vi.fn().mockReturnThis(),
      usingServer: vi.fn().mockReturnThis(),
      setChromeOptions: vi.fn().mockReturnThis(),
      setFirefoxOptions: vi.fn().mockReturnThis(),
      setEdgeOptions: vi.fn().mockReturnThis(),
      build: vi.fn().mockResolvedValue(mockWebDriver),
    };
    mockChromeOptions = { addArguments: vi.fn().mockReturnThis() };
    mockFirefoxOptions = { addArguments: vi.fn().mockReturnThis() };
    mockEdgeOptions = { addArguments: vi.fn().mockReturnThis() };
    vi.mocked(Builder).mockImplementation(function () {
      return mockBuilder as unknown as Builder;
    });
    vi.mocked(ChromeOptions).mockImplementation(function () {
      return mockChromeOptions as unknown as ChromeOptions;
    });
    vi.mocked(FirefoxOptions).mockImplementation(function () {
      return mockFirefoxOptions as unknown as FirefoxOptions;
    });
    vi.mocked(EdgeOptions).mockImplementation(function () {
      return mockEdgeOptions as unknown as EdgeOptions;
    });
  });

  it('getDriver() creates a Builder and returns a WebDriver', async () => {
    const mgr = new SeleniumDriverManager(makeLogger());
    const driver = await mgr.getDriver();
    expect(Builder).toHaveBeenCalledOnce();
    expect(mockBuilder.build).toHaveBeenCalledOnce();
    expect(driver).toBe(mockWebDriver);
  });

  it('webDriver getter returns a promise resolving to the driver', async () => {
    const mgr = new SeleniumDriverManager(makeLogger());
    const driver = await mgr.webDriver;
    expect(driver).toBe(mockWebDriver);
  });

  it('getDriver() is called only once (lazy caching)', async () => {
    const mgr = new SeleniumDriverManager(makeLogger());
    await mgr.getDriver();
    await mgr.getDriver();
    expect(Builder).toHaveBeenCalledOnce();
  });

  it('launches chrome when config specifies chrome', async () => {
    const mgr = new SeleniumDriverManager(makeLogger());
    await mgr.getDriver();
    expect(mockBuilder.forBrowser).toHaveBeenCalledWith('chrome');
    expect(mockBuilder.setChromeOptions).toHaveBeenCalledOnce();
  });

  it('launches firefox when config specifies firefox', async () => {
    const config = new SeleniumConfig();
    vi.spyOn(config, 'browser', 'get').mockReturnValue('firefox');
    const mgr = new SeleniumDriverManager(makeLogger(), config);
    await mgr.getDriver();
    expect(mockBuilder.forBrowser).toHaveBeenCalledWith('firefox');
    expect(mockBuilder.setFirefoxOptions).toHaveBeenCalledOnce();
    expect(mockBuilder.setChromeOptions).not.toHaveBeenCalled();
  });

  it('launches edge when config specifies edge', async () => {
    const config = new SeleniumConfig();
    vi.spyOn(config, 'browser', 'get').mockReturnValue('edge');
    const mgr = new SeleniumDriverManager(makeLogger(), config);
    await mgr.getDriver();
    expect(mockBuilder.forBrowser).toHaveBeenCalledWith('MicrosoftEdge');
    expect(mockBuilder.setEdgeOptions).toHaveBeenCalledOnce();
    expect(mockBuilder.setChromeOptions).not.toHaveBeenCalled();
  });

  it('adds chrome headless args when headless is true', async () => {
    const mgr = new SeleniumDriverManager(makeLogger());
    await mgr.getDriver();
    expect(mockChromeOptions.addArguments).toHaveBeenCalledWith('--headless=new', '--disable-gpu');
  });

  it('adds firefox headless arg when headless is true', async () => {
    const config = new SeleniumConfig();
    vi.spyOn(config, 'browser', 'get').mockReturnValue('firefox');
    const mgr = new SeleniumDriverManager(makeLogger(), config);
    await mgr.getDriver();
    expect(mockFirefoxOptions.addArguments).toHaveBeenCalledWith('-headless');
  });

  it('adds edge headless args when headless is true', async () => {
    const config = new SeleniumConfig();
    vi.spyOn(config, 'browser', 'get').mockReturnValue('edge');
    const mgr = new SeleniumDriverManager(makeLogger(), config);
    await mgr.getDriver();
    expect(mockEdgeOptions.addArguments).toHaveBeenCalledWith('--headless=new', '--disable-gpu');
  });

  it('does not add headless args when headless is false', async () => {
    const config = new SeleniumConfig();
    vi.spyOn(config, 'headless', 'get').mockReturnValue(false);
    const mgr = new SeleniumDriverManager(makeLogger(), config);
    await mgr.getDriver();
    expect(mockChromeOptions.addArguments).not.toHaveBeenCalled();
  });

  it('calls usingServer when gridUrl is configured', async () => {
    const config = new SeleniumConfig();
    vi.spyOn(config, 'gridUrl', 'get').mockReturnValue('http://localhost:4444');
    const mgr = new SeleniumDriverManager(makeLogger(), config);
    await mgr.getDriver();
    expect(mockBuilder.usingServer).toHaveBeenCalledWith('http://localhost:4444');
  });

  it('does not call usingServer when gridUrl is not configured', async () => {
    const mgr = new SeleniumDriverManager(makeLogger());
    await mgr.getDriver();
    expect(mockBuilder.usingServer).not.toHaveBeenCalled();
  });

  it('close() calls quit() on the WebDriver', async () => {
    const mgr = new SeleniumDriverManager(makeLogger());
    await mgr.getDriver();
    await mgr.close();
    expect(mockWebDriver.quit).toHaveBeenCalledOnce();
  });

  it('close() before init does not throw or call quit', async () => {
    const mgr = new SeleniumDriverManager(makeLogger());
    await expect(mgr.close()).resolves.toBeUndefined();
    expect(mockWebDriver.quit).not.toHaveBeenCalled();
  });

  it('driver is re-created after close()', async () => {
    const mgr = new SeleniumDriverManager(makeLogger());
    await mgr.getDriver();
    await mgr.close();
    await mgr.getDriver();
    expect(Builder).toHaveBeenCalledTimes(2);
  });

  it('isDriverInitialized() is false before first getDriver()', () => {
    const mgr = new SeleniumDriverManager(makeLogger());
    expect(mgr.isDriverInitialized()).toBe(false);
  });

  it('isDriverInitialized() is true after getDriver()', async () => {
    const mgr = new SeleniumDriverManager(makeLogger());
    await mgr.getDriver();
    expect(mgr.isDriverInitialized()).toBe(true);
  });

  it('isDriverInitialized() is false after close()', async () => {
    const mgr = new SeleniumDriverManager(makeLogger());
    await mgr.getDriver();
    await mgr.close();
    expect(mgr.isDriverInitialized()).toBe(false);
  });
});
