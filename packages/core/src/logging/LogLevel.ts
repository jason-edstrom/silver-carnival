/**
 * Logging level enum. Numeric ordering mirrors the .NET MessageType ordering:
 * lower ordinal = higher severity. Level filtering uses `messageLevel <= threshold`.
 * Suspended (-1) is an internal sentinel that suppresses all output.
 */
export enum LogLevel {
  Suspended = -1,
  Error = 0,
  Warning = 1,
  Success = 2,
  Generic = 3,
  Step = 4,
  Action = 5,
  Information = 6,
  Verbose = 7,
}
