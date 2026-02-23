import { describe, it, expect, afterEach } from 'vitest';
import { PlaywrightConfig } from '../../src/config/PlaywrightConfig.js';

describe('PlaywrightConfig', () => {
  afterEach(() => {
    delete process.env['MAQS_PLAYWRIGHT_BROWSER'];
    delete process.env['MAQS_PLAYWRIGHT_HEADLESS'];
    delete process.env['MAQS_PLAYWRIGHT_TIMEOUT'];
    delete process.env['MAQS_PLAYWRIGHT_BASEURL'];
    delete process.env['MAQS_PLAYWRIGHT_SLOWMO'];
  });

  it('returns chromium as the default browser', () => {
    const config = new PlaywrightConfig();
    expect(config.browser).toBe('chromium');
  });

  it('returns true as the default headless value', () => {
    const config = new PlaywrightConfig();
    expect(config.headless).toBe(true);
  });

  it('returns 30000 as the default timeout', () => {
    const config = new PlaywrightConfig();
    expect(config.timeout).toBe(30000);
  });

  it('returns undefined as the default baseUrl', () => {
    const config = new PlaywrightConfig();
    expect(config.baseUrl).toBeUndefined();
  });

  it('returns 0 as the default slowMo', () => {
    const config = new PlaywrightConfig();
    expect(config.slowMo).toBe(0);
  });

  it('reads firefox browser from env var', () => {
    process.env['MAQS_PLAYWRIGHT_BROWSER'] = 'firefox';
    const config = new PlaywrightConfig();
    expect(config.browser).toBe('firefox');
  });

  it('reads webkit browser from env var', () => {
    process.env['MAQS_PLAYWRIGHT_BROWSER'] = 'webkit';
    const config = new PlaywrightConfig();
    expect(config.browser).toBe('webkit');
  });

  it('falls back to chromium for unknown browser value', () => {
    process.env['MAQS_PLAYWRIGHT_BROWSER'] = 'edge';
    const config = new PlaywrightConfig();
    expect(config.browser).toBe('chromium');
  });

  it('reads headless=false from env var', () => {
    process.env['MAQS_PLAYWRIGHT_HEADLESS'] = 'false';
    const config = new PlaywrightConfig();
    expect(config.headless).toBe(false);
  });

  it('treats any value other than "false" as headless=true', () => {
    process.env['MAQS_PLAYWRIGHT_HEADLESS'] = 'yes';
    const config = new PlaywrightConfig();
    expect(config.headless).toBe(true);
  });

  it('reads timeout from env var', () => {
    process.env['MAQS_PLAYWRIGHT_TIMEOUT'] = '60000';
    const config = new PlaywrightConfig();
    expect(config.timeout).toBe(60000);
  });

  it('falls back to 30000 for non-numeric timeout', () => {
    process.env['MAQS_PLAYWRIGHT_TIMEOUT'] = 'not-a-number';
    const config = new PlaywrightConfig();
    expect(config.timeout).toBe(30000);
  });

  it('reads baseUrl from env var', () => {
    process.env['MAQS_PLAYWRIGHT_BASEURL'] = 'https://example.com';
    const config = new PlaywrightConfig();
    expect(config.baseUrl).toBe('https://example.com');
  });

  it('reads slowMo from env var', () => {
    process.env['MAQS_PLAYWRIGHT_SLOWMO'] = '250';
    const config = new PlaywrightConfig();
    expect(config.slowMo).toBe(250);
  });

  it('falls back to 0 for non-numeric slowMo', () => {
    process.env['MAQS_PLAYWRIGHT_SLOWMO'] = 'fast';
    const config = new PlaywrightConfig();
    expect(config.slowMo).toBe(0);
  });
});
