import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, setCsrfToken } from "../../lib/api";
import type { Session } from "./types";

export const sessionQueryKey = ["session"] as const;

/** Current session, or null when signed out. */
async function fetchSession(): Promise<Session | null> {
  try {
    const { data } = await api.get<Session>("/auth/me");
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export function useSessionQuery() {
  return useQuery({
    queryKey: sessionQueryKey,
    queryFn: fetchSession,
    staleTime: Infinity,
    retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 2,
    select: (session) => {
      setCsrfToken(session?.csrfToken ?? null);
      return session;
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; password: string }) => api.post<Session>("/auth/login", input),
    onSuccess: ({ data }) => {
      setCsrfToken(data.csrfToken);
      // Start from a clean cache so nothing from a previous user is shown.
      queryClient.clear();
      queryClient.setQueryData(sessionQueryKey, data);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<void>("/auth/logout"),
    onSettled: () => {
      setCsrfToken(null);
      queryClient.clear();
      queryClient.setQueryData(sessionQueryKey, null);
    },
  });
}

export function useChangePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) => api.post<Session>("/auth/password", input),
    onSuccess: ({ data }) => {
      setCsrfToken(data.csrfToken);
      queryClient.setQueryData(sessionQueryKey, data);
    },
  });
}
