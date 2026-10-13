import { AlternateEmailRounded, BadgeRounded, KeyRounded } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { useState, type FormEvent } from "react";
import { DialogHeader } from "../../components/DialogHeader";
import { generateTemporaryPassword, PasswordField } from "../../components/PasswordField";
import { ApiError, errorMessage } from "../../lib/api";
import { ROLE_LABELS, type Role } from "../auth/types";
import { useCreateUser, useResetPassword, type StaffUser } from "./usersApi";

const MIN_PASSWORD = 10;
const fieldSx = {
  "& .MuiInputBase-root": { minHeight: 48 },
  "& .MuiInputAdornment-root": { color: "text.secondary" },
} as const;

function TemporaryPasswordField({ value, onChange, error }: { value: string; onChange: (value: string) => void; error?: string }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
      <PasswordField
        label="Temporary password"
        required
        autoComplete="new-password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        error={Boolean(error)}
        helperText={error ?? `At least ${MIN_PASSWORD} characters. Share it privately; the user must change it at first sign-in.`}
        sx={fieldSx}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <KeyRounded fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      <Button variant="outlined" onClick={() => onChange(generateTemporaryPassword())} sx={{ flexShrink: 0, minHeight: 48 }}>
        Generate
      </Button>
    </Stack>
  );
}

function fieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {};
  return Object.fromEntries(error.fieldIssues.map((issue) => [issue.field, issue.message]));
}

export function CreateUserDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (user: StaffUser) => void }) {
  const create = useCreateUser();
  const [values, setValues] = useState<{ name: string; email: string; temporaryPassword: string; role: Role }>({
    name: "",
    email: "",
    temporaryPassword: "",
    role: "RECEPTIONIST",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!values.name.trim()) next.name = "Name is required.";
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) next.email = "Enter a valid email address.";
    if (values.temporaryPassword.length < MIN_PASSWORD) next.temporaryPassword = `Use at least ${MIN_PASSWORD} characters.`;
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    create.mutate(values, { onSuccess: onCreated, onError: (error) => setErrors(fieldErrors(error)) });
  };

  const showGeneral = create.error && Object.keys(fieldErrors(create.error)).length === 0;

  return (
    <Dialog open onClose={create.isPending ? undefined : onClose} fullWidth maxWidth="sm" aria-labelledby="create-user-title">
      <Box component="form" noValidate onSubmit={handleSubmit}>
        <DialogHeader id="create-user-title" title="Add user" subtitle="They sign in with this email and must change the temporary password." onClose={onClose} closeDisabled={create.isPending} />
        <DialogContent>
          <Stack spacing={2.25}>
            {showGeneral && <Alert severity="error">{errorMessage(create.error)}</Alert>}
            <TextField
              label="Full name"
              required
              autoFocus
              value={values.name}
              autoComplete="name"
              onChange={(event) => {
                setValues({ ...values, name: event.target.value });
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              error={Boolean(errors.name)}
              helperText={errors.name}
              sx={fieldSx}
              slotProps={{
                htmlInput: { maxLength: 100 },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeRounded fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="Role"
              required
              select
              value={values.role}
              onChange={(event) => setValues({ ...values, role: event.target.value as Role })}
              sx={fieldSx}
            >
              {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
                <MenuItem key={role} value={role}>
                  {ROLE_LABELS[role]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Email"
              type="email"
              required
              autoComplete="email"
              value={values.email}
              onChange={(event) => {
                setValues({ ...values, email: event.target.value });
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              error={Boolean(errors.email)}
              helperText={errors.email ?? "Used to sign in."}
              sx={fieldSx}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <AlternateEmailRounded fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TemporaryPasswordField
              value={values.temporaryPassword}
              onChange={(temporaryPassword) => {
                setValues({ ...values, temporaryPassword });
                if (errors.temporaryPassword) setErrors({ ...errors, temporaryPassword: "" });
              }}
              error={errors.temporaryPassword}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ borderTop: 1, borderColor: "divider" }}>
          <Button onClick={onClose} disabled={create.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={create.isPending}
            startIcon={create.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Create account
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export function ResetPasswordDialog({ user, onClose, onDone }: { user: StaffUser; onClose: () => void; onDone: () => void }) {
  const reset = useResetPassword();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (password.length < MIN_PASSWORD) {
      setError(`Use at least ${MIN_PASSWORD} characters.`);
      return;
    }
    setError(undefined);
    reset.mutate(
      { id: user.id, temporaryPassword: password },
      { onSuccess: onDone, onError: (err) => setError(fieldErrors(err).temporaryPassword) },
    );
  };

  return (
    <Dialog open onClose={reset.isPending ? undefined : onClose} fullWidth maxWidth="sm" aria-labelledby="reset-title">
      <Box component="form" noValidate onSubmit={handleSubmit}>
        <DialogHeader id="reset-title" title="Reset password" subtitle={`${user.name} · ${user.email}`} onClose={onClose} closeDisabled={reset.isPending} />
        <DialogContent>
          <Stack spacing={2.25}>
            <Alert severity="info">
              {user.name} will be signed out everywhere and must choose a new password after signing in with this
              temporary one.
            </Alert>
            {reset.error && !fieldErrors(reset.error).temporaryPassword && <Alert severity="error">{errorMessage(reset.error)}</Alert>}
            <TemporaryPasswordField value={password} onChange={setPassword} error={error} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ borderTop: 1, borderColor: "divider" }}>
          <Button onClick={onClose} disabled={reset.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={reset.isPending}
            startIcon={reset.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Reset password
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
