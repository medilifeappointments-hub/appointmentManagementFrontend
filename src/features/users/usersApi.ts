import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { Role } from "../auth/types";

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
}

const usersKey = ["admin", "users"] as const;

export function useUsers() {
  return useQuery({
    queryKey: usersKey,
    queryFn: () => api.get<StaffUser[]>("/admin/users").then((result) => result.data),
  });
}

function useUsersMutation<TInput>(request: (input: TInput) => Promise<StaffUser>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: request,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: usersKey }),
  });
}

export const useCreateReceptionist = () =>
  useUsersMutation((input: { name: string; email: string; temporaryPassword: string }) =>
    api.post<StaffUser>("/admin/users", input).then((result) => result.data),
  );

export const useSetUserActive = () =>
  useUsersMutation(({ id, isActive }: { id: string; isActive: boolean }) =>
    api.patch<StaffUser>(`/admin/users/${id}/status`, { isActive }).then((result) => result.data),
  );

export const useResetPassword = () =>
  useUsersMutation(({ id, temporaryPassword }: { id: string; temporaryPassword: string }) =>
    api.post<StaffUser>(`/admin/users/${id}/reset-password`, { temporaryPassword }).then((result) => result.data),
  );
