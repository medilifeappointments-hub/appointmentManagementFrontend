import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, setCsrfToken } from "../../../api/client";
import { authService } from "../services/authService";

export const sessionQueryKey = ["session"] as const;

/** Current session, or null when signed out. */
export function useSessionQuery() {
  return useQuery({
    queryKey: sessionQueryKey,
    queryFn: authService.session,
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
    mutationFn: authService.login,
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
    mutationFn: authService.logout,
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
    mutationFn: authService.changePassword,
    onSuccess: ({ data }) => {
      setCsrfToken(data.csrfToken);
      queryClient.setQueryData(sessionQueryKey, data);
    },
  });
}
