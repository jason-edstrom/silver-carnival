import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseTest } from '../../src/base-test/BaseTest.js';
import { BaseTestObject } from '../../src/test-object/BaseTestObject.js';
import { ConsoleLogger } from '../../src/logging/ConsoleLogger.js';
import { LogLevel } from '../../src/logging/LogLevel.js';

class ConcreteTest extends BaseTest {
  public beforeTestCalled = false;
  public afterTestCalled = false;

  protected override createTestObject(): BaseTestObject {
    return new BaseTestObject(new ConsoleLogger(LogLevel.Suspended));
  }

  protected override async beforeTest(): Promise<void> {
    this.beforeTestCalled = true;
  }

  protected override async afterTest(): Promise<void> {
    this.afterTestCalled = true;
  }
}

describe('BaseTest', () => {
  let test: ConcreteTest;

  beforeEach(() => {
    test = new ConcreteTest();
  });

  it('accessing testObject before setup() throws', () => {
    expect(() => test.testObject).toThrow(/before setup/);
  });

  it('setup() creates testObject', async () => {
    await test.setup('myTest');
    expect(test.testObject).toBeDefined();
  });

  it('setup() calls beforeTest() hook', async () => {
    await test.setup();
    expect(test.beforeTestCalled).toBe(true);
  });

  it('log and softAssert are accessible after setup()', async () => {
    await test.setup();
    expect(test.log).toBeDefined();
    expect(test.softAssert).toBeDefined();
  });

  it('teardown() calls afterTest() hook', async () => {
    await test.setup();
    await test.teardown();
    expect(test.afterTestCalled).toBe(true);
  });

  it('teardown() clears testObject after running', async () => {
    await test.setup();
    await test.teardown();
    expect(() => test.testObject).toThrow(/before setup/);
  });

  it('teardown() throws SoftAssertException if soft assertions failed', async () => {
    await test.setup();
    test.softAssert.assertFail('myFail', 'intentional failure');
    await expect(test.teardown()).rejects.toThrow(/Soft assert failures/);
  });

  it('teardown() closes testObject even when softAssert throws', async () => {
    await test.setup();
    const closeSpy = vi.spyOn(test.testObject, 'close').mockResolvedValue();
    test.softAssert.assertFail('fail', 'boom');
    await expect(test.teardown()).rejects.toThrow();
    expect(closeSpy).toHaveBeenCalledOnce();
  });

  it('full setup → assert pass → teardown does not throw', async () => {
    await test.setup('cleanTest');
    test.softAssert.assert('ok', () => {});
    await expect(test.teardown()).resolves.toBeUndefined();
  });
});
