export type AppErrorCode =
  | "AUTH_REQUIRED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_FAILED"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

type AppErrorOptions = Readonly<{
  cause?: unknown;
  context?: Readonly<Record<string, string | number | boolean>>;
}>;

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly context?: AppErrorOptions["context"];

  constructor(code: AppErrorCode, message: string, options: AppErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = "AppError";
    this.code = code;
    this.context = options.context;
  }
}
