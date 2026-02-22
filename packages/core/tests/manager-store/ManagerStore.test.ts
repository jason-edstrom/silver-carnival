import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ManagerStore } from '../../src/manager-store/ManagerStore.js';
import type { DriverManager } from '../../src/driver-manager/DriverManager.js';
import { LogLevel } from '../../src/logging/LogLevel.js';
import type { Logger } from '../../src/logging/Logger.js';

function makeMockLogger(): Logger {
  return {
    logMessage: vi.fn(),
    logError: vi.fn(),
    logWarning: vi.fn(),
    logInfo: vi.fn(),
    logVerbose: vi.fn(),
    logSuccess: vi.fn(),
    getLoggingLevel: vi.fn(() => LogLevel.Verbose),
    setLoggingLevel: vi.fn(),
    suspendLogging: vi.fn(),
    continueLogging: vi.fn(),
    currentDateTime: vi.fn(() => ''),
    dispose: vi.fn(),
  } as unknown as Logger;
}

function makeMockManager(driverValue = 'driver'): DriverManager<string> {
  return {
    getDriver: vi.fn(async () => driverValue),
    isDriverInitialized: vi.fn(() => false),
    close: vi.fn(async () => {}),
    log: makeMockLogger(),
  };
}

describe('ManagerStore', () => {
  let store: ManagerStore;

  beforeEach(() => {
    store = new ManagerStore();
  });

  it('put() adds a manager and size increments', () => {
    store.put('key1', makeMockManager());
    expect(store.size).toBe(1);
  });

  it('put() throws when key already exists', () => {
    store.put('key', makeMockManager());
    expect(() => store.put('key', makeMockManager())).toThrow(/already contains/);
  });

  it('get() retrieves a previously stored manager', () => {
    const mgr = makeMockManager();
    store.put('myKey', mgr);
    expect(store.get('myKey')).toBe(mgr);
  });

  it('get() throws when key is not found', () => {
    expect(() => store.get('missing')).toThrow(/No manager registered/);
  });

  it('contains() returns true for registered key', () => {
    store.put('k', makeMockManager());
    expect(store.contains('k')).toBe(true);
  });

  it('contains() returns false for unregistered key', () => {
    expect(store.contains('nope')).toBe(false);
  });

  it('addOrOverride() replaces existing manager and calls close on old one', async () => {
    const old = makeMockManager('old');
    store.put('k', old);
    const replacement = makeMockManager('new');
    await store.addOrOverride('k', replacement);
    expect(old.close).toHaveBeenCalledOnce();
    expect(store.get('k')).toBe(replacement);
  });

  it('addOrOverride() adds new manager when key does not exist', async () => {
    await store.addOrOverride('newKey', makeMockManager());
    expect(store.contains('newKey')).toBe(true);
  });

  it('remove() closes the manager and removes it', async () => {
    const mgr = makeMockManager();
    store.put('k', mgr);
    const result = await store.remove('k');
    expect(result).toBe(true);
    expect(mgr.close).toHaveBeenCalledOnce();
    expect(store.contains('k')).toBe(false);
  });

  it('remove() returns false for missing key', async () => {
    expect(await store.remove('missing')).toBe(false);
  });

  it('closeAll() closes all managers and clears the store', async () => {
    const mgr1 = makeMockManager();
    const mgr2 = makeMockManager();
    store.put('a', mgr1);
    store.put('b', mgr2);
    await store.closeAll();
    expect(mgr1.close).toHaveBeenCalledOnce();
    expect(mgr2.close).toHaveBeenCalledOnce();
    expect(store.size).toBe(0);
  });

  it('closeAll() re-throws the first rejection after all managers close', async () => {
    const failing = makeMockManager();
    vi.mocked(failing.close).mockRejectedValue(new Error('driver error'));
    const good = makeMockManager();
    store.put('fail', failing);
    store.put('good', good);
    await expect(store.closeAll()).rejects.toThrow('driver error');
    expect(good.close).toHaveBeenCalledOnce();
  });

  it('[Symbol.iterator] iterates all entries', () => {
    store.put('a', makeMockManager());
    store.put('b', makeMockManager());
    const entries = [...store];
    expect(entries).toHaveLength(2);
    expect(entries.map(([k]) => k).sort()).toEqual(['a', 'b']);
  });
});
