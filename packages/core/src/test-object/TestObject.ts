import type { Logger } from '../logging/Logger.js';
import type { SoftAssert } from '../soft-assert/SoftAssert.js';
import type { ManagerStore } from '../manager-store/ManagerStore.js';
import type { MaqsConfig } from '../config/MaqsConfig.js';

/**
 * Contract for a MAQS test object.
 * Holds all context for a single test run: logger, soft assert, manager store, config.
 */
export interface TestObject {
  readonly logger: Logger;
  readonly softAssert: SoftAssert;
  readonly managerStore: ManagerStore;
  readonly config: MaqsConfig;

  /** Arbitrary string key → string value storage. */
  readonly values: Map<string, string>;

  /** Arbitrary string key → object storage. */
  readonly objects: Map<string, unknown>;

  /** File paths to attach to the test result (e.g. screenshots). */
  readonly associatedFiles: ReadonlySet<string>;

  addAssociatedFile(filePath: string): void;
  removeAssociatedFile(filePath: string): boolean;
  containsAssociatedFile(filePath: string): boolean;
  getAssociatedFiles(): string[];

  /** Close all managed drivers and release resources. */
  close(): Promise<void>;
}
