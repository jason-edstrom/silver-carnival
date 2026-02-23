import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Browser, BrowserContext, Page } from 'playwright';
import { chromium, firefox, webkit } from 'playwright';
import { ConsoleLogger, LogLevel } from '@openmaqs-typescript/core';
import { PlaywrightDriverManager } from '../../src/driver-manager/PlaywrightDriverManager.js';
import { PlaywrightConfig } from '../../src/config/PlaywrightConfig.js';

vi.mock('playwright', () => ({
  chromium: { launch: vi.fn() },
  firefox: { launch: vi.fn() },
  webkit: { launch: vi.fn() },
}));

function makeLogger(): ConsoleLogger {
  return new ConsoleLogger(LogLevel.Suspended);
}

describe('PlaywrightDriverManager', () => {
  let mockPage: Page;
  let mockContext: BrowserContext;
  let mockBrowser: Browser;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPage = { screenshot: vi.fn(), close: vi.fn() } as unknown as Page;
    mockContext = {
      newPage: vi.fn().mockResolvedValue(mockPage),
      close: vi.fn().mockResolvedValue(undefined),
    } as unknown as BrowserContext;
    mockBrowser = {
      newContext: vi.fn().mockResolvedValue(mockContext),
      close: vi.fn().mockResolvedValue(undefined),
    } as unknown as Browser;
    vi.mocked(chromium.launch).mockResolvedValue(mockBrowser);
    vi.mocked(firefox.launch).mockResolvedValue(mockBrowser);
    vi.mocked(webkit.launch).mockResolvedValue(mockBrowser);
  });

  it('getDriver() launches chromium and returns a page', async () => {
    const mgr = new PlaywrightDriverManager(makeLogger());
    const page = await mgr.getDriver();
    expect(chromium.launch).toHaveBeenCalledOnce();
    expect(mockBrowser.newContext).toHaveBeenCalledOnce();
    expect(mockContext.newPage).toHaveBeenCalledOnce();
    expect(page).toBe(mockPage);
  });

  it('page getter returns a promise resolving to the page', async () => {
    const mgr = new PlaywrightDriverManager(makeLogger());
    const page = await mgr.page;
    expect(page).toBe(mockPage);
  });

  it('getDriver() is called only once (lazy caching)', async () => {
    const mgr = new PlaywrightDriverManager(makeLogger());
    await mgr.getDriver();
    await mgr.getDriver();
    expect(chromium.launch).toHaveBeenCalledOnce();
  });

  it('launches firefox when config specifies firefox', async () => {
    const config = new PlaywrightConfig();
    vi.spyOn(config, 'browser', 'get').mockReturnValue('firefox');
    const mgr = new PlaywrightDriverManager(makeLogger(), config);
    await mgr.getDriver();
    expect(firefox.launch).toHaveBeenCalledOnce();
    expect(chromium.launch).not.toHaveBeenCalled();
  });

  it('launches webkit when config specifies webkit', async () => {
    const config = new PlaywrightConfig();
    vi.spyOn(config, 'browser', 'get').mockReturnValue('webkit');
    const mgr = new PlaywrightDriverManager(makeLogger(), config);
    await mgr.getDriver();
    expect(webkit.launch).toHaveBeenCalledOnce();
    expect(chromium.launch).not.toHaveBeenCalled();
  });

  it('passes headless:false to launch when configured', async () => {
    const config = new PlaywrightConfig();
    vi.spyOn(config, 'headless', 'get').mockReturnValue(false);
    const mgr = new PlaywrightDriverManager(makeLogger(), config);
    await mgr.getDriver();
    expect(chromium.launch).toHaveBeenCalledWith(expect.objectContaining({ headless: false }));
  });

  it('passes slowMo to launch options', async () => {
    const config = new PlaywrightConfig();
    vi.spyOn(config, 'slowMo', 'get').mockReturnValue(100);
    const mgr = new PlaywrightDriverManager(makeLogger(), config);
    await mgr.getDriver();
    expect(chromium.launch).toHaveBeenCalledWith(expect.objectContaining({ slowMo: 100 }));
  });

  it('includes baseURL in newContext when configured', async () => {
    const config = new PlaywrightConfig();
    vi.spyOn(config, 'baseUrl', 'get').mockReturnValue('https://example.com');
    const mgr = new PlaywrightDriverManager(makeLogger(), config);
    await mgr.getDriver();
    expect(mockBrowser.newContext).toHaveBeenCalledWith(
      expect.objectContaining({ baseURL: 'https://example.com' }),
    );
  });

  it('does not include baseURL in newContext when not configured', async () => {
    const mgr = new PlaywrightDriverManager(makeLogger());
    await mgr.getDriver();
    const callArg = vi.mocked(mockBrowser.newContext).mock.calls[0]?.[0] ?? {};
    expect(callArg).not.toHaveProperty('baseURL');
  });

  it('close() disposes context and browser', async () => {
    const mgr = new PlaywrightDriverManager(makeLogger());
    await mgr.getDriver();
    await mgr.close();
    expect(mockContext.close).toHaveBeenCalledOnce();
    expect(mockBrowser.close).toHaveBeenCalledOnce();
  });

  it('close() before init does not throw or call dispose', async () => {
    const mgr = new PlaywrightDriverManager(makeLogger());
    await expect(mgr.close()).resolves.toBeUndefined();
    expect(mockContext.close).not.toHaveBeenCalled();
    expect(mockBrowser.close).not.toHaveBeenCalled();
  });

  it('driver is re-created after close()', async () => {
    const mgr = new PlaywrightDriverManager(makeLogger());
    await mgr.getDriver();
    await mgr.close();
    await mgr.getDriver();
    expect(chromium.launch).toHaveBeenCalledTimes(2);
  });

  it('isDriverInitialized() is false before first getDriver()', () => {
    const mgr = new PlaywrightDriverManager(makeLogger());
    expect(mgr.isDriverInitialized()).toBe(false);
  });

  it('isDriverInitialized() is true after getDriver()', async () => {
    const mgr = new PlaywrightDriverManager(makeLogger());
    await mgr.getDriver();
    expect(mgr.isDriverInitialized()).toBe(true);
  });

  it('isDriverInitialized() is false after close()', async () => {
    const mgr = new PlaywrightDriverManager(makeLogger());
    await mgr.getDriver();
    await mgr.close();
    expect(mgr.isDriverInitialized()).toBe(false);
  });
});
