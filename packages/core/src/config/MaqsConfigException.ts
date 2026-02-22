/**
 * Thrown when the MAQS configuration cannot be read or parsed.
 */
export class MaqsConfigException extends Error {
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'MaqsConfigException';
    if (cause !== undefined) {
      this.cause = cause;
    }
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MaqsConfigException);
    }
  }
}
