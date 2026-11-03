/**
 * Error logging for server code paths.
 *
 * The site ships no error-reporting service, so this writes to the platform
 * log and nothing else. It exists so route handlers and server actions report
 * failures in one shape rather than scattering bare console calls, and so a
 * reporter can later be added in exactly one place.
 */

type ErrorContext = Record<string, unknown>;

export function logError(
  context: string,
  error: unknown,
  metadata?: ErrorContext
): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error(
    `[${context}] ${message}`,
    JSON.stringify({ stack, ...metadata })
  );
}
