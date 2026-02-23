/**
 * Ambient module declarations for selenium-webdriver browser subpath imports.
 *
 * selenium-webdriver is a CommonJS package with no `exports` field, so TypeScript
 * with `moduleResolution: "NodeNext"` cannot auto-resolve subpaths like
 * 'selenium-webdriver/chrome'. These declarations mirror the @types/selenium-webdriver
 * subpath types so our source code is fully typed with no unsafe-* rules triggered.
 */

declare module 'selenium-webdriver/chrome' {
  import * as webdriver from 'selenium-webdriver';

  export class Options extends webdriver.chromium.Options {
    setChromeBinaryPath(path: string): Options;
    androidChrome(): Options;
    setChromeLogFile(path: string): Options;
    setChromeMinidumpPath(path: string): Options;
  }

  export class Driver extends webdriver.chromium.ChromiumWebDriver {
    static createSession(opt_config?: Options | webdriver.Capabilities): Driver;
    static getDefaultService(): webdriver.chromium.ServiceBuilder;
  }

  export class ServiceBuilder extends webdriver.chromium.ServiceBuilder {
    constructor(opt_exe?: string);
  }
}

declare module 'selenium-webdriver/firefox' {
  import * as webdriver from 'selenium-webdriver';

  export enum Context {
    CONTENT = 'content',
    CHROME = 'chrome',
  }

  export class Options extends webdriver.Capabilities {
    constructor(other?: webdriver.Capabilities | Map<string, unknown> | object);
    firefoxOptions_(): object;
    setProfile(profile: string | object): Options;
    setPreference(key: string, value: string | number | boolean): Options;
    addExtensions(...paths: string[]): Options;
    windowSize(size: { width: number; height: number }): Options;
    addArguments(...args: string[]): Options;
    setBinary(binary: string): Options;
    enableMobile(androidPackage: string, androidActivity: string, deviceSerial: string): Options;
    enableDebugger(): void;
    enableBidi(): webdriver.Capabilities;
  }

  export class Driver extends webdriver.WebDriver {
    static createSession(
      opt_config?: Options | webdriver.Capabilities | object,
      opt_executor?: unknown,
    ): Driver;
    setFileDetector(): void;
    getContext(): Promise<Context>;
  }

  export class ServiceBuilder {}
}

declare module 'selenium-webdriver/edge' {
  import * as webdriver from 'selenium-webdriver';

  export class Options extends webdriver.chromium.Options {
    setEdgeChromiumBinaryPath(path: string): Options;
    useWebView(enable: boolean): void;
  }

  export class Driver extends webdriver.chromium.ChromiumWebDriver {
    static createSession(opt_config?: webdriver.Capabilities | Options): Driver;
    static getDefaultService(): webdriver.chromium.ServiceBuilder;
    setFileDetector(): void;
  }

  export class ServiceBuilder extends webdriver.chromium.ServiceBuilder {
    constructor(opt_exe?: string);
  }
}
