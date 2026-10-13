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
