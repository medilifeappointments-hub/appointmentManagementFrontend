import { api, ApiError } from "../../../api/client";
import type { Session } from "../types";

export const authService = {
  async session(): Promise<Session | null> {
    try {
      return (await api.get<Session>("/auth/me")).data;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null;
      throw error;
    }
  },
  login: (input: { email: string; password: string }) => api.post<Session>("/auth/login", input),
  logout: () => api.post<void>("/auth/logout"),
  changePassword: (input: { currentPassword: string; newPassword: string }) => api.post<Session>("/auth/password", input),
};
