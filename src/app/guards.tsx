import { Alert, AlertTitle, Box, Button } from "@mui/material";
import type { ReactNode } from "react";
import { Navigate, Outlet, Link as RouterLink, useLocation } from "react-router";
import { ErrorAlert } from "../components/ErrorAlert";
import { LoadingScreen } from "../components/LoadingScreen";
import { useSessionQuery } from "../features/auth/hooks/useAuth";
import type { Role } from "../features/auth/types";

/** Waits for the session check, then renders children with a guaranteed session. */
function SessionGate({ children }: { children: (signedIn: boolean, mustChangePassword: boolean) => ReactNode }) {
  const { data: session, isPending, error, refetch } = useSessionQuery();
  if (isPending) return <LoadingScreen label="Checking your session…" />;
  if (error) {
    return (
      <Box sx={{ maxWidth: 480, mx: "auto", mt: 8, px: 2 }}>
        <ErrorAlert error={error} title="Could not reach the server" onRetry={() => void refetch()} />
      </Box>
    );
  }
  return <>{children(Boolean(session), Boolean(session?.user.mustChangePassword))}</>;
}

/** Signed-in staff only; users with an admin-reset password are sent to change it first. */
export function RequireSession() {
  const location = useLocation();
  return (
    <SessionGate>
      {(signedIn, mustChangePassword) => {
        if (!signedIn) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
        if (mustChangePassword) return <Navigate to="/change-password" replace />;
        return <Outlet />;
      }}
    </SessionGate>
  );
}

/** The forced password-change page: signed-in users only. */
export function RequireSignedIn() {
  return <SessionGate>{(signedIn) => (signedIn ? <Outlet /> : <Navigate to="/login" replace />)}</SessionGate>;
}

/** Login page: redirect away when already signed in. */
export function PublicOnly() {
  return (
    <SessionGate>
      {(signedIn, mustChangePassword) =>
        signedIn ? <Navigate to={mustChangePassword ? "/change-password" : "/appointments"} replace /> : <Outlet />
      }
    </SessionGate>
  );
}

/** Must be nested inside RequireSession. The server enforces the same rule. */
export function RequireRole({ role }: { role: Role }) {
  const { data: session } = useSessionQuery();
  if (session?.user.role !== role) return <AccessDenied />;
  return <Outlet />;
}

function AccessDenied() {
  return (
    <Box sx={{ maxWidth: 480, mx: "auto", mt: 8 }}>
      <Alert
        severity="warning"
        action={
          <Button component={RouterLink} to="/appointments" color="inherit" size="small">
            Appointments
          </Button>
        }
      >
        <AlertTitle>Access denied</AlertTitle>
        This page is available to super admins only.
      </Alert>
    </Box>
  );
}
