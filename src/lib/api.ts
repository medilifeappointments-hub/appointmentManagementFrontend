/**
 * Thin fetch wrapper for the /api/v1 JSON API.
 * - Sends cookies (session) and the session-bound CSRF token on mutations.
 * - Unwraps { data, meta } and turns { error } envelopes into ApiError.
 */
const API_BASE = "/api/v1";

export interface FieldIssue {
  field: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** Per-field validation messages from a 400 VALIDATION_ERROR. */
  get fieldIssues(): FieldIssue[] {
    const issues = (this.details as { issues?: FieldIssue[] } | undefined)?.issues;
    return Array.isArray(issues) ? issues : [];
  }

  get isNetworkError() {
    return this.status === 0;
  }
}

let csrfToken: string | null = null;
export function setCsrfToken(token: string | null) {
  csrfToken = token;
}

type QueryValue = string | number | boolean | null | undefined;

export interface ApiResult<T, M = undefined> {
  data: T;
  meta: M;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH";
  body?: unknown;
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return `${API_BASE}${path}${qs ? `?${qs}` : ""}`;
}

export async function apiRequest<T, M = undefined>(path: string, options: RequestOptions = {}): Promise<ApiResult<T, M>> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (method !== "GET" && csrfToken) headers["X-CSRF-Token"] = csrfToken;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), {
      method,
      headers,
      credentials: "include",
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    });
  } catch (error) {
    if ((error as Error)?.name === "AbortError") throw error;
    throw new ApiError(0, "NETWORK_ERROR", "Could not reach the server. Check your connection and try again.");
  }

  if (response.status === 204) return { data: undefined as T, meta: undefined as M };

  const payload = (await response.json().catch(() => null)) as
    | { data: T; meta?: M; error?: { code: string; message: string; details?: unknown } }
    | null;

  if (!response.ok || !payload || payload.error) {
    const error = payload?.error;
    throw new ApiError(
      response.status,
      error?.code ?? "HTTP_ERROR",
      error?.message ?? `The server returned an unexpected response (${response.status}).`,
      error?.details,
    );
  }
  return { data: payload.data, meta: payload.meta as M };
}

export const api = {
  get: <T, M = undefined>(path: string, query?: Record<string, QueryValue>, signal?: AbortSignal) =>
    apiRequest<T, M>(path, { query, signal }),
  post: <T, M = undefined>(path: string, body?: unknown) => apiRequest<T, M>(path, { method: "POST", body }),
  put: <T, M = undefined>(path: string, body?: unknown) => apiRequest<T, M>(path, { method: "PUT", body }),
  patch: <T, M = undefined>(path: string, body?: unknown) => apiRequest<T, M>(path, { method: "PATCH", body }),
};

/** Human-readable message for any thrown value. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Something went wrong. Please try again.";
}
