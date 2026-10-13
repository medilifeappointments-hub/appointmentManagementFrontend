import { useSessionQuery } from "./authApi";
import type { Session } from "./types";

/**
 * The signed-in session. Only call inside routes wrapped by <RequireSession>,
 * which guarantees it has loaded and is not null.
 */
export function useSession(): Session & { isAdmin: boolean } {
  const { data } = useSessionQuery();
  if (!data) throw new Error("useSession must be used inside <RequireSession>.");
  return { ...data, isAdmin: data.user.role === "SUPER_ADMIN" };
}

/** Clinic IANA timezone used for every date/time display and input. */
export function useClinicTimeZone(): string {
  return useSession().clinic.timezone;
}
