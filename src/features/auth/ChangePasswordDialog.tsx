import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, Stack } from "@mui/material";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { DialogHeader } from "../../components/DialogHeader";
import { useNotify } from "../../components/NotificationProvider";
import { PasswordField } from "../../components/PasswordField";
import { ApiError, errorMessage } from "../../api/client";
import { useChangePassword, useLogout } from "./hooks/useAuth";
import { useSession } from "./useSession";

type Field = "currentPassword" | "newPassword" | "confirmPassword";
type Errors = Partial<Record<Field, string>>;

interface ChangePasswordDialogProps {
  open: boolean;
  onClose?: () => void;
}

const MIN_LENGTH = 10;

export function ChangePasswordDialog({ open, onClose }: ChangePasswordDialogProps) {
  const { user } = useSession();
  const navigate = useNavigate();
  const notify = useNotify();
  const changePassword = useChangePassword();
  const logout = useLogout();
  const forced = user.mustChangePassword;
  const pending = changePassword.isPending || logout.isPending;

  const [values, setValues] = useState<Record<Field, string>>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Errors>({});

  const close = forced || pending ? undefined : onClose;
  const set = (field: Field) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!values.currentPassword) {
      next.currentPassword = forced ? "Enter the temporary password you were given." : "Enter your current password.";
    }
    if (values.newPassword.length < MIN_LENGTH) next.newPassword = `Use at least ${MIN_LENGTH} characters.`;
    else if (values.newPassword.length > 128) next.newPassword = "Use at most 128 characters.";
    else if (values.newPassword === values.currentPassword) next.newPassword = "Choose a password different from the current one.";
    if (values.confirmPassword !== values.newPassword) next.confirmPassword = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    changePassword.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      {
        onSuccess: () => {
          notify("Password changed. Other devices have been signed out.");
          if (forced) navigate("/appointments", { replace: true });
          else onClose?.();
        },
        onError: (error) => {
          if (error instanceof ApiError) {
            const fieldErrors: Errors = {};
            for (const issue of error.fieldIssues) {
              if (issue.field === "currentPassword" || issue.field === "newPassword") fieldErrors[issue.field] = issue.message;
            }
            setErrors(fieldErrors);
          }
        },
      },
    );
  };

  const generalError =
    changePassword.error && !(changePassword.error instanceof ApiError && changePassword.error.fieldIssues.length > 0)
      ? errorMessage(changePassword.error)
      : null;

  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth
      maxWidth="xs"
      aria-labelledby="change-password-title"
    >
      <Box component="form" noValidate onSubmit={handleSubmit} sx={{ display: "contents" }}>
        <DialogHeader
          id="change-password-title"
          title={forced ? "Set a new password" : "Change password"}
          subtitle={
            forced
              ? `Welcome, ${user.name}. An administrator set a temporary password for your account. Choose your own password to continue.`
              : "Changing your password signs out your other devices."
          }
          onClose={close}
          closeDisabled={pending}
        />
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {generalError && <Alert severity="error">{generalError}</Alert>}
            <PasswordField
              label={forced ? "Temporary password" : "Current password"}
              autoComplete="current-password"
              required
              autoFocus
              value={values.currentPassword}
              onChange={set("currentPassword")}
              error={Boolean(errors.currentPassword)}
              helperText={errors.currentPassword}
            />
            <PasswordField
              label="New password"
              autoComplete="new-password"
              required
              value={values.newPassword}
              onChange={set("newPassword")}
              error={Boolean(errors.newPassword)}
              helperText={errors.newPassword ?? `At least ${MIN_LENGTH} characters. A short phrase works well.`}
            />
            <PasswordField
              label="Confirm new password"
              autoComplete="new-password"
              required
              value={values.confirmPassword}
              onChange={set("confirmPassword")}
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          {forced ? (
            <Button
              onClick={() => logout.mutate(undefined, { onSettled: () => navigate("/login", { replace: true }) })}
              disabled={pending}
            >
              Sign out
            </Button>
          ) : (
            <Button onClick={onClose} disabled={pending}>
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={pending}
            startIcon={changePassword.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Save password
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
