export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export class AppError extends Error {
  code: string
  details?: Record<string, unknown>

  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(message)
    this.code = code
    this.details = details
    this.name = "AppError"
  }
}

export function toApiError(err: unknown): AppError {
  if (err instanceof AppError) return err

  if (typeof err === "object" && err !== null) {
    const e = err as Record<string, unknown>
    if (e.code && e.message) {
      return new AppError(e.code as string, e.message as string, e.details as Record<string, unknown>)
    }
  }

  if (err instanceof Error) {
    return new AppError("UNKNOWN_ERROR", err.message)
  }

  return new AppError("UNKNOWN_ERROR", "Une erreur inattendue est survenue")
}

export function apiError(code: string, message: string, status = 400, details?: Record<string, unknown>) {
  return Response.json({ code, message, details } satisfies ApiError, { status })
}
