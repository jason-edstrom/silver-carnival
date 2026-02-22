import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseTestObject } from '../../src/test-object/BaseTestObject.js';
import { ConsoleLogger } from '../../src/logging/ConsoleLogger.js';
import { LogLevel } from '../../src/logging/LogLevel.js';

describe('BaseTestObject', () => {
  let logger: ConsoleLogger;

  beforeEach(() => {
    logger = new ConsoleLogger(LogLevel.Suspended); // suppress output in tests
  });

  it('creates with a logger, softAssert, managerStore, and config', () => {
    const obj = new BaseTestObject(logger);
    expect(obj.logger).toBe(logger);
    expect(obj.softAssert).toBeDefined();
    expect(obj.managerStore).toBeDefined();
    expect(obj.config).toBeDefined();
  });

  it('values and objects maps start empty', () => {
    const obj = new BaseTestObject(logger);
    expect(obj.values.size).toBe(0);
    expect(obj.objects.size).toBe(0);
  });

  it('addAssociatedFile adds a file path', () => {
    const obj = new BaseTestObject(logger);
    obj.addAssociatedFile('/tmp/screenshot.png');
    expect(obj.containsAssociatedFile('/tmp/screenshot.png')).toBe(true);
  });

  it('removeAssociatedFile removes a registered file', () => {
    const obj = new BaseTestObject(logger);
    obj.addAssociatedFile('/tmp/file.png');
    const result = obj.removeAssociatedFile('/tmp/file.png');
    expect(result).toBe(true);
    expect(obj.containsAssociatedFile('/tmp/file.png')).toBe(false);
  });

  it('removeAssociatedFile returns false for unregistered file', () => {
    const obj = new BaseTestObject(logger);
    expect(obj.removeAssociatedFile('/tmp/missing.png')).toBe(false);
  });

  it('getAssociatedFiles returns all registered paths as an array', () => {
    const obj = new BaseTestObject(logger);
    obj.addAssociatedFile('/tmp/a.png');
    obj.addAssociatedFile('/tmp/b.png');
    const files = obj.getAssociatedFiles();
    expect(files).toHaveLength(2);
    expect(files).toContain('/tmp/a.png');
    expect(files).toContain('/tmp/b.png');
  });

  it('associatedFiles is a ReadonlySet', () => {
    const obj = new BaseTestObject(logger);
    obj.addAssociatedFile('/tmp/x.png');
    expect(obj.associatedFiles.has('/tmp/x.png')).toBe(true);
  });

  it('close() calls managerStore.closeAll() and logger.dispose()', async () => {
    const obj = new BaseTestObject(logger);
    const closeAllSpy = vi.spyOn(obj.managerStore, 'closeAll').mockResolvedValue();
    const disposeSpy = vi.spyOn(obj.logger, 'dispose').mockImplementation(() => {});
    await obj.close();
    expect(closeAllSpy).toHaveBeenCalledOnce();
    expect(disposeSpy).toHaveBeenCalledOnce();
  });
});
