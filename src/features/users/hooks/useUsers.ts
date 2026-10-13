import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersService } from "../services/usersService";
import type { StaffUser } from "../types";

export type { StaffUser } from "../types";

const usersKey = ["admin", "users"] as const;

export function useUsers() {
  return useQuery({
    queryKey: usersKey,
    queryFn: usersService.list,
  });
}

function useUsersMutation<TInput>(request: (input: TInput) => Promise<StaffUser>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: request,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: usersKey }),
  });
}

export const useCreateUser = () =>
  useUsersMutation(usersService.create);

export const useSetUserActive = () =>
  useUsersMutation(usersService.setActive);

export const useResetPassword = () =>
  useUsersMutation(usersService.resetPassword);
