import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiError, setCsrfToken } from "../lib/api";
import { sessionQueryKey } from "../features/auth/authApi";

/**
 * Session-level reactions to API errors, wherever they happen:
 * - 401: the session ended (expired, revoked, account disabled) → show the login page.
 * - 403 PASSWORD_CHANGE_REQUIRED: refresh the session so the guard redirects.
 */
function handleAuthErrors(error: unknown) {
  if (!(error instanceof ApiError)) return;
  if (error.status === 401) {
    setCsrfToken(null);
    queryClient.setQueryData(sessionQueryKey, null);
  } else if (error.code === "PASSWORD_CHANGE_REQUIRED") {
    void queryClient.invalidateQueries({ queryKey: sessionQueryKey });
  }
}

export const queryClient: QueryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleAuthErrors }),
  mutationCache: new MutationCache({ onError: handleAuthErrors }),
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      refetchOnWindowFocus: true,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status > 0 && error.status < 500) return false;
        return failureCount < 2;
      },
    },
    mutations: { retry: false },
  },
});
