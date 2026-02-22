import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { MaqsConfig, createConfig } from '../../src/config/MaqsConfig.js';

describe('MaqsConfig', () => {
  let tmpDir: string;
  let configPath: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'maqs-config-test-'));
    configPath = path.join(tmpDir, 'maqs.config.json');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    for (const key of Object.keys(process.env)) {
      if (key.startsWith('MAQS_TEST_') || key.startsWith('MAQS_SELENIUM_') || key === 'MAQS_MYKEY') {
        delete process.env[key];
      }
    }
  });

  it('returns undefined for a missing key with no default', () => {
    const config = new MaqsConfig(configPath);
    expect(config.getValue('NONEXISTENT')).toBeUndefined();
  });

  it('returns default value for a missing key', () => {
    const config = new MaqsConfig(configPath);
    expect(config.getValue('NONEXISTENT', 'fallback')).toBe('fallback');
  });

  it('reads values from GlobalMaqs section in config file', () => {
    fs.writeFileSync(configPath, JSON.stringify({ GlobalMaqs: { MyKey: 'fileValue' } }), 'utf8');
    const config = new MaqsConfig(configPath);
    expect(config.getValue('MyKey')).toBe('fileValue');
  });

  it('env var overrides config file value', () => {
    fs.writeFileSync(configPath, JSON.stringify({ GlobalMaqs: { MyKey: 'fileValue' } }), 'utf8');
    process.env['MAQS_MYKEY'] = 'envValue';
    const config = new MaqsConfig(configPath);
    expect(config.getValue('MyKey')).toBe('envValue');
  });

  it('programmatic override has highest priority', () => {
    fs.writeFileSync(configPath, JSON.stringify({ GlobalMaqs: { MyKey: 'fileValue' } }), 'utf8');
    process.env['MAQS_MYKEY'] = 'envValue';
    const config = new MaqsConfig(configPath);
    config.addOverride('MyKey', 'programmaticValue');
    expect(config.getValue('MyKey')).toBe('programmaticValue');
  });

  it('getSection returns section keys from config file', () => {
    fs.writeFileSync(
      configPath,
      JSON.stringify({ Selenium: { Browser: 'Chrome', Timeout: '30' } }),
      'utf8',
    );
    const config = new MaqsConfig(configPath);
    const section = config.getSection('Selenium');
    expect(section['Browser']).toBe('Chrome');
    expect(section['Timeout']).toBe('30');
  });

  it('getSection overlays MAQS_{SECTION}_ env vars', () => {
    fs.writeFileSync(configPath, JSON.stringify({ Selenium: { Browser: 'Chrome' } }), 'utf8');
    process.env['MAQS_SELENIUM_BROWSER'] = 'Firefox';
    const config = new MaqsConfig(configPath);
    const section = config.getSection('Selenium');
    expect(section['browser']).toBe('Firefox');
  });

  it('returns empty config for missing file', () => {
    const config = new MaqsConfig('/nonexistent/maqs.config.json');
    expect(config.getRawConfig()).toEqual({});
  });

  it('getRawConfig returns the raw loaded data', () => {
    const data = { GlobalMaqs: { Key: 'val' }, Custom: { X: '1' } };
    fs.writeFileSync(configPath, JSON.stringify(data), 'utf8');
    const config = new MaqsConfig(configPath);
    expect(config.getRawConfig()).toEqual(data);
  });

  it('createConfig() factory function creates a MaqsConfig instance', () => {
    const config = createConfig(configPath);
    expect(config).toBeInstanceOf(MaqsConfig);
  });
});
