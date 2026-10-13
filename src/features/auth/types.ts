export type Role = "SUPER_ADMIN" | "RECEPTIONIST";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  mustChangePassword: boolean;
}

export interface Session {
  user: SessionUser;
  csrfToken: string;
  clinic: { timezone: string; today: string };
}

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super admin",
  RECEPTIONIST: "Receptionist",
};
