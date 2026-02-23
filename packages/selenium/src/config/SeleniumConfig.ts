import { MaqsConfig } from '@openmaqs-typescript/core';

/**
 * Typed configuration wrapper for the Selenium section of maqs.config.json.
 *
 * Config keys (maqs.config.json):
 * ```json
 * { "Selenium": { "Browser": "chrome", "Headless": "true", "Timeout": "30000",
 *                 "BaseUrl": "https://example.com", "GridUrl": "http://localhost:4444" } }
 * ```
 *
 * Env var equivalents: MAQS_SELENIUM_BROWSER, MAQS_SELENIUM_HEADLESS,
 * MAQS_SELENIUM_TIMEOUT, MAQS_SELENIUM_BASEURL, MAQS_SELENIUM_GRIDURL
 */
export class SeleniumConfig {
  private readonly _section: Record<string, string | undefined>;

  constructor(config?: MaqsConfig) {
    const raw = (config ?? new MaqsConfig()).getSection('Selenium');
    // Normalize all keys to lowercase so file keys (e.g. "Browser") and
    // env var keys (e.g. "browser") resolve uniformly.
    this._section = {};
    for (const [key, val] of Object.entries(raw)) {
      this._section[key.toLowerCase()] = val;
    }
  }

  /** 'chrome' | 'firefox' | 'edge' — default: 'chrome' */
  get browser(): 'chrome' | 'firefox' | 'edge' {
    const val = this._section['browser'] ?? 'chrome';
    if (val === 'firefox' || val === 'edge') return val;
    return 'chrome';
  }

  /** Whether to run headless — default: true */
  get headless(): boolean {
    const val = this._section['headless'] ?? 'true';
    return val !== 'false';
  }

  /** Driver timeout in ms — default: 30000 */
  get timeout(): number {
    const val = this._section['timeout'] ?? '30000';
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? 30000 : parsed;
  }

  /** Base URL for tests — default: undefined */
  get baseUrl(): string | undefined {
    return this._section['baseurl'];
  }

  /** Selenium Grid / remote WebDriver URL — default: undefined */
  get gridUrl(): string | undefined {
    return this._section['gridurl'];
  }
}
