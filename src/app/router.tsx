import { createBrowserRouter, Navigate } from "react-router";
import { AppointmentsPage } from "../features/appointments/pages/AppointmentsPage";
import { ChangePasswordPage } from "../features/auth/pages/ChangePasswordPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { UsersPage } from "../features/users/pages/UsersPage";
import { AppLayout } from "./AppLayout";
import { PublicOnly, RequireRole, RequireSession, RequireSignedIn } from "./guards";
import { NotFoundPage } from "./NotFoundPage";

export const router = createBrowserRouter([
  {
    element: <PublicOnly />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
  {
    element: <RequireSignedIn />,
    children: [{ path: "/change-password", element: <ChangePasswordPage /> }],
  },
  {
    element: <RequireSession />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/appointments" replace /> },
          { path: "/appointments", element: <AppointmentsPage /> },
          {
            path: "/admin",
            element: <RequireRole role="SUPER_ADMIN" />,
            children: [
              { index: true, element: <Navigate to="/admin/dashboard" replace /> },
              { path: "dashboard", element: <DashboardPage /> },
              { path: "users", element: <UsersPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
