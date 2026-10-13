import { Alert, Snackbar, type AlertColor } from "@mui/material";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

interface Notification {
  id: number;
  message: string;
  severity: AlertColor;
}

type Notify = (message: string, severity?: AlertColor) => void;

const NotificationContext = createContext<Notify | null>(null);

/** App-wide toast messages for completed actions. */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<Notification | null>(null);

  const notify = useCallback<Notify>((message, severity = "success") => {
    setCurrent({ id: Date.now(), message, severity });
  }, []);

  const value = useMemo(() => notify, [notify]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        key={current?.id}
        open={current !== null}
        autoHideDuration={5000}
        onClose={(_event, reason) => reason !== "clickaway" && setCurrent(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={current?.severity ?? "success"}
          variant="filled"
          onClose={() => setCurrent(null)}
          sx={{ width: "100%", alignItems: "center" }}
        >
          {current?.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

export function useNotify(): Notify {
  const notify = useContext(NotificationContext);
  if (!notify) throw new Error("useNotify must be used inside <NotificationProvider>.");
  return notify;
}
