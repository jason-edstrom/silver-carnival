import type { DriverManager } from '../driver-manager/DriverManager.js';

/**
 * Stores named driver managers for a single test.
 * closeAll() uses Promise.allSettled so a single driver failure
 * does not prevent the remaining drivers from being closed.
 */
export class ManagerStore implements Iterable<[string, DriverManager<unknown>]> {
  private readonly store = new Map<string, DriverManager<unknown>>();

  get size(): number {
    return this.store.size;
  }

  /**
   * Add a manager under the given key.
   * Throws if a manager with that key already exists — use addOrOverride() to replace.
   */
  put(key: string, manager: DriverManager<unknown>): void {
    if (this.store.has(key)) {
      throw new Error(
        `ManagerStore already contains a manager for key '${key}'. ` +
          `Use addOrOverride() to replace it.`,
      );
    }
    this.store.set(key, manager);
  }

  /**
   * Add or replace a manager. If replacing, the old manager's close() is called first.
   */
  async addOrOverride(key: string, manager: DriverManager<unknown>): Promise<void> {
    const existing = this.store.get(key);
    if (existing) {
      await existing.close();
    }
    this.store.set(key, manager);
  }

  /** Retrieve a manager by key. Throws if the key is not registered. */
  get<T>(key: string): DriverManager<T> {
    const manager = this.store.get(key);
    if (!manager) {
      throw new Error(`No manager registered for key '${key}'`);
    }
    return manager as DriverManager<T>;
  }

  /** True if a manager is registered under the given key. */
  contains(key: string): boolean {
    return this.store.has(key);
  }

  /** Close and remove the manager for the given key. Returns false if key not found. */
  async remove(key: string): Promise<boolean> {
    const manager = this.store.get(key);
    if (!manager) return false;
    await manager.close();
    this.store.delete(key);
    return true;
  }

  /**
   * Close and remove all managers.
   * Uses Promise.allSettled so a partial failure doesn't block other drivers from closing.
   */
  async closeAll(): Promise<void> {
    const results = await Promise.allSettled(
      [...this.store.values()].map((m) => m.close()),
    );
    this.store.clear();
    const firstRejection = results.find((r) => r.status === 'rejected');
    if (firstRejection && firstRejection.status === 'rejected') {
      throw firstRejection.reason;
    }
  }

  [Symbol.iterator](): Iterator<[string, DriverManager<unknown>]> {
    return this.store.entries();
  }
}
