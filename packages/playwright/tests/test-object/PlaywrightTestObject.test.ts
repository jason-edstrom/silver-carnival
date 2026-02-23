import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Browser, BrowserContext, Page } from 'playwright';
import { chromium } from 'playwright';
import { ConsoleLogger, LogLevel } from '@openmaqs-typescript/core';
import { PlaywrightTestObject } from '../../src/test-object/PlaywrightTestObject.js';
import { PlaywrightDriverManager } from '../../src/driver-manager/PlaywrightDriverManager.js';

vi.mock('playwright', () => ({
  chromium: { launch: vi.fn() },
  firefox: { launch: vi.fn() },
  webkit: { launch: vi.fn() },
}));

function makeLogger(): ConsoleLogger {
  return new ConsoleLogger(LogLevel.Suspended);
}

describe('PlaywrightTestObject', () => {
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
  });

  it('creates with logger, softAssert, managerStore, and config', () => {
    const obj = new PlaywrightTestObject(makeLogger());
    expect(obj.logger).toBeDefined();
    expect(obj.softAssert).toBeDefined();
    expect(obj.managerStore).toBeDefined();
    expect(obj.config).toBeDefined();
  });

  it('playwrightManager is a PlaywrightDriverManager', () => {
    const obj = new PlaywrightTestObject(makeLogger());
    expect(obj.playwrightManager).toBeInstanceOf(PlaywrightDriverManager);
  });

  it('managerStore contains the PlaywrightDriver key', () => {
    const obj = new PlaywrightTestObject(makeLogger());
    expect(obj.managerStore.contains('PlaywrightDriver')).toBe(true);
  });

  it('page getter returns the mocked Page', async () => {
    const obj = new PlaywrightTestObject(makeLogger());
    const page = await obj.page;
    expect(page).toBe(mockPage);
  });

  it('close() shuts down the playwright manager', async () => {
    const obj = new PlaywrightTestObject(makeLogger());
    await obj.page; // initialize the driver
    const closeSpy = vi.spyOn(obj.playwrightManager, 'close').mockResolvedValue();
    await obj.close();
    expect(closeSpy).toHaveBeenCalledOnce();
  });

  it('close() before page access does not throw', async () => {
    const obj = new PlaywrightTestObject(makeLogger());
    await expect(obj.close()).resolves.toBeUndefined();
  });

  it('associatedFiles starts empty', () => {
    const obj = new PlaywrightTestObject(makeLogger());
    expect(obj.associatedFiles.size).toBe(0);
  });
});
