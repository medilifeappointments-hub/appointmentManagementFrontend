import { Alert, Box, Button, CircularProgress, Stack, TextField } from "@mui/material";
import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import { PasswordField } from "../../../components/PasswordField";
import { ApiError, errorMessage } from "../../../api/client";
import { AuthLayout } from "../components/AuthLayout";
import { useLogin } from "../hooks/useAuth";

interface LoginErrors {
  email?: string;
  password?: string;
}

function validate(email: string, password: string): LoginErrors {
  const errors: LoginErrors = {};
  if (!email.trim()) errors.email = "Enter your email address.";
  else if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Enter your password.";
  return errors;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});

  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/appointments";

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validate(email, password);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    login.mutate(
      { email: email.trim(), password },
      {
        onSuccess: ({ data }) =>
          navigate(data.user.mustChangePassword ? "/change-password" : redirectTo, { replace: true }),
        onError: () => setPassword(""),
      },
    );
  };

  const serverError =
    login.error instanceof ApiError && login.error.code === "VALIDATION_ERROR"
      ? "Check your email and password."
      : login.error
        ? errorMessage(login.error)
        : null;

  return (
    <AuthLayout title="Sign in" description="Use the account your clinic administrator created for you.">
      <Box component="form" noValidate onSubmit={handleSubmit}>
        <Stack spacing={2.25}>
          {serverError && (
            <Alert severity="error" role="alert">
              {serverError}
            </Alert>
          )}
          <TextField
            label="Email"
            type="email"
            autoComplete="username"
            autoFocus
            required
            size="medium"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={Boolean(errors.email)}
            helperText={errors.email}
          />
          <PasswordField
            label="Password"
            autoComplete="current-password"
            required
            size="medium"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={Boolean(errors.password)}
            helperText={errors.password}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={login.isPending}
            startIcon={login.isPending ? <CircularProgress size={18} color="inherit" /> : undefined}
          >
            {login.isPending ? "Signing in…" : "Sign in"}
          </Button>
        </Stack>
      </Box>
    </AuthLayout>
  );
}
