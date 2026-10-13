import { EventNoteRounded, GroupRounded, InsightsRounded } from "@mui/icons-material";
import type { ReactNode } from "react";

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  adminOnly?: boolean;
}

/** Main sections, in sidebar order. */
export const NAV_ITEMS: NavItem[] = [
  { to: "/appointments", label: "Appointments", icon: <EventNoteRounded fontSize="small" /> },
  { to: "/admin/dashboard", label: "Dashboard", icon: <InsightsRounded fontSize="small" />, adminOnly: true },
  { to: "/admin/users", label: "Users", icon: <GroupRounded fontSize="small" />, adminOnly: true },
];
