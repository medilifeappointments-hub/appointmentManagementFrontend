import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { NotificationProvider } from "../components/NotificationProvider";
import { theme } from "../theme/theme";
import { queryClient } from "./queryClient";
import { router } from "./router";

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <RouterProvider router={router} />
        </NotificationProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
