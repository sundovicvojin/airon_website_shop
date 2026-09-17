export type Result<TValue, TError = Error> =
  | { ok: true; value: TValue }
  | { error: TError; ok: false };

export function success<TValue>(value: TValue): Result<TValue, never> {
  return { ok: true, value };
}

export function failure<TError>(error: TError): Result<never, TError> {
  return { error, ok: false };
}
