import { api } from "../../../api/client";
import type { Role } from "../../auth/types";
import type { StaffUser } from "../types";

export const usersService = {
  list: () => api.get<StaffUser[]>("/admin/users").then((result) => result.data),
  create: (input: { name: string; email: string; temporaryPassword: string; role: Role }) =>
    api.post<StaffUser>("/admin/users", input).then((result) => result.data),
  setActive: ({ id, isActive }: { id: string; isActive: boolean }) =>
    api.patch<StaffUser>(`/admin/users/${id}/status`, { isActive }).then((result) => result.data),
  resetPassword: ({ id, temporaryPassword }: { id: string; temporaryPassword: string }) =>
    api.post<StaffUser>(`/admin/users/${id}/reset-password`, { temporaryPassword }).then((result) => result.data),
};
