import type { TestObject } from './TestObject.js';
import type { Logger } from '../logging/Logger.js';
import { SoftAssert } from '../soft-assert/SoftAssert.js';
import { ManagerStore } from '../manager-store/ManagerStore.js';
import { MaqsConfig } from '../config/MaqsConfig.js';

/**
 * Holds all context for a single test run.
 * Extended by technology-specific packages (e.g. SeleniumTestObject).
 */
export class BaseTestObject implements TestObject {
  readonly logger: Logger;
  readonly softAssert: SoftAssert;
  readonly managerStore: ManagerStore;
  readonly config: MaqsConfig;
  readonly values = new Map<string, string>();
  readonly objects = new Map<string, unknown>();
  private readonly _associatedFiles = new Set<string>();

  constructor(logger: Logger, config?: MaqsConfig) {
    this.logger = logger;
    this.softAssert = new SoftAssert(logger);
    this.managerStore = new ManagerStore();
    this.config = config ?? new MaqsConfig();
  }

  get associatedFiles(): ReadonlySet<string> {
    return this._associatedFiles;
  }

  addAssociatedFile(filePath: string): void {
    this._associatedFiles.add(filePath);
  }

  removeAssociatedFile(filePath: string): boolean {
    return this._associatedFiles.delete(filePath);
  }

  containsAssociatedFile(filePath: string): boolean {
    return this._associatedFiles.has(filePath);
  }

  getAssociatedFiles(): string[] {
    return [...this._associatedFiles];
  }

  async close(): Promise<void> {
    await this.managerStore.closeAll();
    this.logger.dispose();
  }
}
