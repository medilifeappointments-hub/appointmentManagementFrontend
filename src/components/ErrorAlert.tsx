import { Alert, AlertTitle, Button } from "@mui/material";
import { errorMessage } from "../api/client";

interface ErrorAlertProps {
  error: unknown;
  title?: string;
  onRetry?: () => void;
}

export function ErrorAlert({ error, title = "Could not load data", onRetry }: ErrorAlertProps) {
  return (
    <Alert
      severity="error"
      action={
        onRetry ? (
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        ) : undefined
      }
    >
      <AlertTitle>{title}</AlertTitle>
      {errorMessage(error)}
    </Alert>
  );
}
