import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Browser, BrowserContext, Page } from 'playwright';
import { chromium } from 'playwright';
import { PlaywrightTestObject } from '../../src/test-object/PlaywrightTestObject.js';
import { createPlaywrightContext } from '../../src/adapters/useMaqsPlaywright.js';
import { useMaqsPlaywright } from '../../src/adapters/vitest.js';

vi.mock('playwright', () => ({
  chromium: { launch: vi.fn() },
  firefox: { launch: vi.fn() },
  webkit: { launch: vi.fn() },
}));

describe('createPlaywrightContext', () => {
  it('registers beforeEach and afterEach hooks', () => {
    const beforeEachFn = vi.fn();
    const afterEachFn = vi.fn();
    createPlaywrightContext({ beforeEach: beforeEachFn, afterEach: afterEachFn });
    expect(beforeEachFn).toHaveBeenCalledOnce();
    expect(afterEachFn).toHaveBeenCalledOnce();
  });

  it('throws when testObject is accessed outside a test body', () => {
    const ctx = createPlaywrightContext({ beforeEach: vi.fn(), afterEach: vi.fn() });
    expect(() => ctx.testObject).toThrow(/outside a test body/);
  });

  it('testObject becomes accessible after the beforeEach hook fires', async () => {
    let beforeFn: (() => Promise<void>) | undefined;
    const beforeEachFn = vi.fn((fn: () => Promise<void>) => {
      beforeFn = fn;
    });
    const ctx = createPlaywrightContext({ beforeEach: beforeEachFn, afterEach: vi.fn() });
    await beforeFn?.();
    expect(ctx.testObject).toBeInstanceOf(PlaywrightTestObject);
  });
});

describe('useMaqsPlaywright (vitest adapter)', () => {
  let mockPage: Page;
  let mockContext: BrowserContext;
  let mockBrowser: Browser;

  beforeEach(() => {
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

  // useMaqsPlaywright() called inside describe registers Vitest's beforeEach/afterEach
  const ctx = useMaqsPlaywright();

  it('provides a PlaywrightTestObject as testObject', () => {
    expect(ctx.testObject).toBeInstanceOf(PlaywrightTestObject);
  });

  it('provides log shortcut pointing to testObject.logger', () => {
    expect(ctx.log).toBe(ctx.testObject.logger);
  });

  it('provides softAssert shortcut', () => {
    expect(ctx.softAssert).toBe(ctx.testObject.softAssert);
  });
});
