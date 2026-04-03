import { describe, it, expect } from 'vitest';
import { useMaqs } from '@jason-edstrom/core/adapters/vitest';
import { BaseTestObject, createConsoleLogger } from '@jason-edstrom/core';

describe('Example Suite', () => {
  const ctx = useMaqs(() => new BaseTestObject(createConsoleLogger()));

  it('writes log messages at different levels', () => {
    ctx.log.logInfo('Test started');
    ctx.log.logVerbose('Detailed step info');
    ctx.log.logWarning('Something to note');
    expect(ctx.log).toBe(ctx.testObject.logger);
  });

  it('collects multiple assertions before reporting', () => {
    // Soft assert keeps going even if a step fails — all failures are surfaced
    // together at the end of the test via afterEach → failTestIfAssertFailed().
    // Use named steps so the failure report identifies exactly what went wrong.
    ctx.softAssert.assert('page-title-present', () => {
      // replace with a real assertion in your tests
    });
    ctx.softAssert.assertEquals('status-code', 200, 200);
    ctx.softAssert.assert('footer-visible', () => {
      // replace with a real assertion in your tests
    });

    expect(ctx.softAssert.numberOfPassedAsserts).toBe(3);
    expect(ctx.softAssert.numberOfFailedAsserts).toBe(0);
  });

  it('reads a config section from maqs.config.json', () => {
    const section = ctx.testObject.config.getSection<Record<string, string>>('MyApp');
    const timeout = section['Timeout'] ?? '5000';
    ctx.log.logInfo(`Timeout: ${timeout}`);
    expect(timeout).toBe('5000');
  });
});
