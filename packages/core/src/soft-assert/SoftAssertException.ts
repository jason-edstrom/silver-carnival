/**
 * Thrown by SoftAssert.failTestIfAssertFailed() when one or more
 * soft assertions have failed. Contains all collected failure messages.
 */
export class SoftAssertException extends Error {
  readonly failures: ReadonlyArray<string>;

  constructor(failures: string[]) {
    const message = [
      `Soft assert failures (${failures.length}):`,
      ...failures.map((f, i) => `  ${i + 1}. ${f}`),
    ].join('\n');
    super(message);
    this.name = 'SoftAssertException';
    this.failures = Object.freeze([...failures]);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SoftAssertException);
    }
  }
}
