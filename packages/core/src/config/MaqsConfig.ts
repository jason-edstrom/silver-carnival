import * as fs from 'node:fs';
import * as path from 'node:path';
import { MaqsConfigException } from './MaqsConfigException.js';

export interface MaqsConfigFile {
  GlobalMaqs?: Record<string, string>;
  [section: string]: Record<string, string> | undefined;
}

/**
 * Reads MAQS configuration from:
 *   1. maqs.config.json (searched from cwd upward, so it works in monorepos)
 *   2. MAQS_* environment variables (override config file)
 *   3. Programmatic overrides via addOverride() (highest priority)
 *
 * Use createConfig() to create an instance.
 *
 * @example
 * const config = createConfig();
 * const browser = config.getValue('Browser', 'Chrome');
 *
 * @example
 * // Section support with env override pattern MAQS_SELENIUM_BROWSER=Firefox
 * const seleniumConfig = config.getSection('Selenium');
 */
export class MaqsConfig {
  private readonly fileConfig: MaqsConfigFile;
  private readonly overrides = new Map<string, string>();

  constructor(configFilePath?: string) {
    this.fileConfig = MaqsConfig.loadFile(configFilePath);
  }

  /**
   * Get a value from GlobalMaqs, with env var and programmatic override support.
   * Priority: addOverride() > MAQS_{KEY} env var > maqs.config.json > defaultValue
   */
  getValue(key: string, defaultValue?: string): string | undefined {
    if (this.overrides.has(key)) return this.overrides.get(key);
    const envKey = `MAQS_${key.toUpperCase()}`;
    if (process.env[envKey] !== undefined) return process.env[envKey];
    return this.fileConfig['GlobalMaqs']?.[key] ?? defaultValue;
  }

  /**
   * Get all key/value pairs for a named config section.
   * Environment variables with prefix MAQS_{SECTION}_ override file values.
   */
  getSection<T extends Record<string, string>>(section: string): Partial<T> {
    const base: Record<string, string> = { ...(this.fileConfig[section] ?? {}) };
    const prefix = `MAQS_${section.toUpperCase()}_`;
    for (const [envKey, val] of Object.entries(process.env)) {
      if (envKey.startsWith(prefix) && val !== undefined) {
        const shortKey = envKey.slice(prefix.length).toLowerCase();
        base[shortKey] = val;
      }
    }
    return base as Partial<T>;
  }

  /** Set a value programmatically. Highest priority; overrides env vars and config file. */
  addOverride(key: string, value: string): void {
    this.overrides.set(key, value);
  }

  /** Returns the raw loaded file config (useful for debugging). */
  getRawConfig(): Readonly<MaqsConfigFile> {
    return this.fileConfig;
  }

  // ---------------------------------------------------------------------------

  private static loadFile(filePath?: string): MaqsConfigFile {
    const resolved = filePath ?? MaqsConfig.findConfigFile();
    if (!resolved || !fs.existsSync(resolved)) return {};
    try {
      const raw = fs.readFileSync(resolved, 'utf8');
      return JSON.parse(raw) as MaqsConfigFile;
    } catch (err) {
      throw new MaqsConfigException(`Failed to parse config file at ${resolved}`, err);
    }
  }

  /** Walk up from cwd to find maqs.config.json (supports monorepo layouts). */
  private static findConfigFile(): string | undefined {
    let dir = process.cwd();
    while (true) {
      const candidate = path.join(dir, 'maqs.config.json');
      if (fs.existsSync(candidate)) return candidate;
      const parent = path.dirname(dir);
      if (parent === dir) return undefined;
      dir = parent;
    }
  }
}

/**
 * Create a MaqsConfig instance.
 *
 * @param configFilePath Optional explicit path to maqs.config.json.
 *   If omitted, the file is searched upward from cwd.
 */
export function createConfig(configFilePath?: string): MaqsConfig {
  return new MaqsConfig(configFilePath);
}
