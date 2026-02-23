# OpenMAQS TypeScript

A TypeScript port of the [OpenMAQS .NET framework](https://github.com/OpenMAQS/openmaqs-dotnet) — modular test automation helpers that bring consistent lifecycle management, logging, configuration, and soft assertions to any test suite.

[![CI](https://github.com/OpenMAQS/openmaqs-typescript/actions/workflows/ci.yml/badge.svg)](https://github.com/OpenMAQS/openmaqs-typescript/actions/workflows/ci.yml)
![Node](https://img.shields.io/badge/node-%3E%3D18.20-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## Packages

| Package | Description |
|---|---|
| [`@openmaqs-typescript/core`](./packages/core) | Logging, config, soft assert, driver manager base, test object base, base test classes |
| [`@openmaqs-typescript/playwright`](./packages/playwright) | Playwright browser driver, test object, and base test built on core |

---

## Quick start

### Functional API (recommended)

Use `useMaqs` / `useMaqsPlaywright` inside a `describe` block. Lifecycle hooks are registered automatically.

```ts
// Vitest — plain core
import { useMaqs } from '@openmaqs-typescript/core/adapters/vitest';
import { BaseTestObject, createConsoleLogger } from '@openmaqs-typescript/core';

describe('My Suite', () => {
  const ctx = useMaqs(() => new BaseTestObject(createConsoleLogger()));

  it('logs a message', () => {
    ctx.log.logInfo('Hello from MAQS!');
  });
});
```

```ts
// Vitest — with Playwright
import { useMaqsPlaywright } from '@openmaqs-typescript/playwright/adapters/vitest';

describe('My Playwright Suite', () => {
  const ctx = useMaqsPlaywright();

  it('navigates to the home page', async () => {
    const page = await ctx.testObject.page;
    await page.goto('https://example.com');
    await expect(page).toHaveTitle(/Example/);
  });
});
```

Jest and Mocha adapters are available at `.../adapters/jest` and `.../adapters/mocha`.

### Class-based API

For complex suites that need shared page objects or class-level state, extend `BasePlaywrightTest` (or `BaseTest` for non-browser tests) and call `setup()` / `teardown()` manually or via your runner's hooks.

```ts
import { BasePlaywrightTest } from '@openmaqs-typescript/playwright';

class LoginTest extends BasePlaywrightTest {
  protected override async beforeTest(): Promise<void> {
    const page = await this.testObject.page;
    await page.goto('https://myapp.com/login');
  }

  protected override async afterTest(): Promise<void> {
    // capture a screenshot on failure, attach to report, etc.
    await this.captureScreenshot('after-test');
  }
}
```

---

## Configuration

MAQS reads from `maqs.config.json` (searched upward from `cwd`, monorepo-friendly), environment variables, or programmatic overrides. Priority order:

1. `config.addOverride(key, value)` — highest priority
2. `MAQS_*` environment variables
3. `maqs.config.json`
4. Defaults

### Example `maqs.config.json`

```json
{
  "GlobalMaqs": {
    "LogLevel": "Information",
    "LogType": "console"
  },
  "Playwright": {
    "Browser": "chromium",
    "Headless": "true",
    "Timeout": "30000",
    "BaseUrl": "https://myapp.com",
    "SlowMo": "0"
  }
}
```

### Playwright environment variables

| Variable | Default | Description |
|---|---|---|
| `MAQS_PLAYWRIGHT_BROWSER` | `chromium` | `chromium`, `firefox`, or `webkit` |
| `MAQS_PLAYWRIGHT_HEADLESS` | `true` | `false` to show the browser |
| `MAQS_PLAYWRIGHT_TIMEOUT` | `30000` | Launch timeout in ms |
| `MAQS_PLAYWRIGHT_BASEURL` | — | Base URL injected into every page context |
| `MAQS_PLAYWRIGHT_SLOWMO` | `0` | Slow-mo delay in ms between actions |

---

## Soft assertions

Soft assertions collect failures without stopping the test immediately. The suite fails at the end of the test with a summary of all failures.

```ts
it('checks multiple fields', () => {
  ctx.softAssert.assert('title check', () => expect(title).toBe('Home'));
  ctx.softAssert.assert('header check', () => expect(header).toBe('Welcome'));
  // both assertions run; any failures are reported together at teardown
});
```

---

## Logging

```ts
import { createLogger, createConsoleLogger, LogLevel } from '@openmaqs-typescript/core';

// Console logger
const log = createConsoleLogger(LogLevel.Verbose);

// File logger
const log = createLogger({ logType: 'txt', logName: 'my-test', level: LogLevel.Information });

log.logInfo('Navigating to home page');
log.logWarning('Element not yet visible, retrying');
log.logError('Unexpected status code');
```

---

## Monorepo commands

Run from the repo root — npm workspaces propagate to all packages automatically.

```bash
npm test              # vitest run (all packages)
npm run test:watch    # vitest watch
npm run build         # tsup in every package
npm run lint          # ESLint (flat config, typed rules)
npm run format        # Prettier write
npm run format:check  # Prettier check (runs in CI)
```

To target a single package:

```bash
npm test --workspace packages/core
npm run build --workspace packages/playwright
```

---

## Adding a new technology package

1. Create `packages/<name>/` mirroring the `playwright` layout.
2. Extend `BaseTestObject` for package-specific state (e.g. hold a `WebDriver`).
3. Extend `BaseDriverManager<T>` — implement `createDriver()` and `driverDispose()`.
4. Extend `BaseExtendableTest<YourTestObject>` for the class-based API.
5. Export a `useMaqs<Name>()` adapter that calls `createMaqsContext()` from core.

---

## Requirements

- **Node.js** ≥ 18.20
- **TypeScript** ≥ 5.4
- Peer dependencies vary by package — `playwright` ≥ 1.40 for the playwright package

## License

MIT
