import { describe, it, expect, afterEach } from 'vitest';
import { SeleniumConfig } from '../../src/config/SeleniumConfig.js';

describe('SeleniumConfig', () => {
  afterEach(() => {
    delete process.env['MAQS_SELENIUM_BROWSER'];
    delete process.env['MAQS_SELENIUM_HEADLESS'];
    delete process.env['MAQS_SELENIUM_TIMEOUT'];
    delete process.env['MAQS_SELENIUM_BASEURL'];
    delete process.env['MAQS_SELENIUM_GRIDURL'];
  });

  it('returns chrome as the default browser', () => {
    const config = new SeleniumConfig();
    expect(config.browser).toBe('chrome');
  });

  it('returns true as the default headless value', () => {
    const config = new SeleniumConfig();
    expect(config.headless).toBe(true);
  });

  it('returns 30000 as the default timeout', () => {
    const config = new SeleniumConfig();
    expect(config.timeout).toBe(30000);
  });

  it('returns undefined as the default baseUrl', () => {
    const config = new SeleniumConfig();
    expect(config.baseUrl).toBeUndefined();
  });

  it('returns undefined as the default gridUrl', () => {
    const config = new SeleniumConfig();
    expect(config.gridUrl).toBeUndefined();
  });

  it('reads firefox browser from env var', () => {
    process.env['MAQS_SELENIUM_BROWSER'] = 'firefox';
    const config = new SeleniumConfig();
    expect(config.browser).toBe('firefox');
  });

  it('reads edge browser from env var', () => {
    process.env['MAQS_SELENIUM_BROWSER'] = 'edge';
    const config = new SeleniumConfig();
    expect(config.browser).toBe('edge');
  });

  it('falls back to chrome for unknown browser value', () => {
    process.env['MAQS_SELENIUM_BROWSER'] = 'safari';
    const config = new SeleniumConfig();
    expect(config.browser).toBe('chrome');
  });

  it('reads headless=false from env var', () => {
    process.env['MAQS_SELENIUM_HEADLESS'] = 'false';
    const config = new SeleniumConfig();
    expect(config.headless).toBe(false);
  });

  it('treats any value other than "false" as headless=true', () => {
    process.env['MAQS_SELENIUM_HEADLESS'] = 'yes';
    const config = new SeleniumConfig();
    expect(config.headless).toBe(true);
  });

  it('reads timeout from env var', () => {
    process.env['MAQS_SELENIUM_TIMEOUT'] = '60000';
    const config = new SeleniumConfig();
    expect(config.timeout).toBe(60000);
  });

  it('falls back to 30000 for non-numeric timeout', () => {
    process.env['MAQS_SELENIUM_TIMEOUT'] = 'not-a-number';
    const config = new SeleniumConfig();
    expect(config.timeout).toBe(30000);
  });

  it('reads baseUrl from env var', () => {
    process.env['MAQS_SELENIUM_BASEURL'] = 'https://example.com';
    const config = new SeleniumConfig();
    expect(config.baseUrl).toBe('https://example.com');
  });

  it('reads gridUrl from env var', () => {
    process.env['MAQS_SELENIUM_GRIDURL'] = 'http://localhost:4444';
    const config = new SeleniumConfig();
    expect(config.gridUrl).toBe('http://localhost:4444');
  });
});
