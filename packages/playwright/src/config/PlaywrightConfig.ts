import { MaqsConfig } from '@openmaqs-typescript/core';

/**
 * Typed configuration wrapper for the Playwright section of maqs.config.json.
 *
 * Config keys (maqs.config.json):
 * ```json
 * { "Playwright": { "Browser": "chromium", "Headless": "true", "Timeout": "30000",
 *                   "BaseUrl": "https://example.com", "SlowMo": "0" } }
 * ```
 *
 * Env var equivalents: MAQS_PLAYWRIGHT_BROWSER, MAQS_PLAYWRIGHT_HEADLESS,
 * MAQS_PLAYWRIGHT_TIMEOUT, MAQS_PLAYWRIGHT_BASEURL, MAQS_PLAYWRIGHT_SLOWMO
 */
export class PlaywrightConfig {
  private readonly _section: Record<string, string | undefined>;

  constructor(config?: MaqsConfig) {
    const raw = (config ?? new MaqsConfig()).getSection('Playwright');
    // Normalize all keys to lowercase so file keys (e.g. "Browser") and
    // env var keys (e.g. "browser") resolve uniformly.
    this._section = {};
    for (const [key, val] of Object.entries(raw)) {
      this._section[key.toLowerCase()] = val;
    }
  }

  /** 'chromium' | 'firefox' | 'webkit' — default: 'chromium' */
  get browser(): 'chromium' | 'firefox' | 'webkit' {
    const val = this._section['browser'] ?? 'chromium';
    if (val === 'firefox' || val === 'webkit') return val;
    return 'chromium';
  }

  /** Whether to run headless — default: true */
  get headless(): boolean {
    const val = this._section['headless'] ?? 'true';
    return val !== 'false';
  }

  /** Launch timeout in ms — default: 30000 */
  get timeout(): number {
    const val = this._section['timeout'] ?? '30000';
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? 30000 : parsed;
  }

  /** Base URL injected into the browser context — default: undefined */
  get baseUrl(): string | undefined {
    return this._section['baseurl'];
  }

  /** Slow-mo delay in ms applied between Playwright actions — default: 0 */
  get slowMo(): number {
    const val = this._section['slowmo'] ?? '0';
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
}
