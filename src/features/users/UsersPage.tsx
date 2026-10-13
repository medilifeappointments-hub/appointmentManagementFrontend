import { LockResetRounded, PersonAddRounded } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  LinearProgress,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Fragment, useState } from "react";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { EmptyState } from "../../components/EmptyState";
import { ErrorAlert } from "../../components/ErrorAlert";
import { useNotify } from "../../components/NotificationProvider";
import { PageHeader } from "../../components/PageHeader";
import { UserAvatar } from "../../components/UserAvatar";
import { errorMessage } from "../../api/client";
import { formatClinicDateTime } from "../../lib/clinicTime";
import { ROLE_LABELS } from "../auth/types";
import { useSession } from "../auth/useSession";
import { CreateUserDialog, ResetPasswordDialog } from "./UserFormDialogs";
import { useSetUserActive, useUsers, type StaffUser } from "./hooks/useUsers";

type Overlay = { kind: "create" } | { kind: "reset"; user: StaffUser } | { kind: "toggle"; user: StaffUser };

function StatusChips({ user }: { user: StaffUser }) {
  return (
    <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: "wrap" }}>
      <Chip
        size="small"
        label={user.isActive ? "Active" : "Disabled"}
        sx={user.isActive ? { bgcolor: "success.light", color: "success.main" } : undefined}
      />
      {user.mustChangePassword && <Chip size="small" variant="outlined" label="Password change pending" />}
    </Stack>
  );
}

function UserIdentity({ user, isMe }: { user: StaffUser; isMe: boolean }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0 }}>
      <UserAvatar name={user.name} size={36} />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
          {user.name}
          {isMe && (
            <Typography component="span" variant="caption">
              {" "}
              (you)
            </Typography>
          )}
        </Typography>
        <Typography variant="caption" component="div" noWrap>
          {user.email}
        </Typography>
      </Box>
    </Stack>
  );
}

export function UsersPage() {
  const theme = useTheme();
  const phone = useMediaQuery(theme.breakpoints.down("md"));
  const { user: me, clinic } = useSession();
  const users = useUsers();
  const setActive = useSetUserActive();
  const notify = useNotify();
  const [overlay, setOverlay] = useState<Overlay | null>(null);

  const rows = users.data ?? [];
  const activeAdmins = rows.filter((user) => user.role === "SUPER_ADMIN" && user.isActive).length;
  const canToggle = (user: StaffUser) => user.id !== me.id && !(user.isActive && user.role === "SUPER_ADMIN" && activeAdmins <= 1);

  const confirmToggle = (user: StaffUser) => {
    setActive.mutate(
      { id: user.id, isActive: !user.isActive },
      {
        onSuccess: (updated) => {
          setOverlay(null);
          notify(updated.isActive ? `${updated.name} can sign in again.` : `${updated.name} was disabled and signed out.`);
        },
        onError: (error) => {
          setOverlay(null);
          notify(errorMessage(error), "error");
        },
      },
    );
  };

  const actions = (user: StaffUser) => (
    <Stack direction="row" spacing={1} sx={{ justifyContent: { md: "flex-end" } }}>
      {user.role === "RECEPTIONIST" && (
        <Button size="small" variant="outlined" startIcon={<LockResetRounded fontSize="small" />} onClick={() => setOverlay({ kind: "reset", user })}>
          Reset password
        </Button>
      )}
      <Button
        size="small"
        variant="outlined"
        color={user.isActive ? "warning" : "primary"}
        disabled={!canToggle(user)}
        onClick={() => setOverlay({ kind: "toggle", user })}
      >
        {user.isActive ? "Disable" : "Enable"}
      </Button>
    </Stack>
  );

  const renderUsers = () => {
    if (users.isPending) {
      return (
        <Stack spacing={1.5} sx={{ p: 2 }} aria-hidden>
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} variant="rounded" height={44} />
          ))}
        </Stack>
      );
    }
    if (rows.length === 0) return <EmptyState title="No users yet" />;

    if (phone) {
      return (
        <Box component="ul" aria-label="Users" sx={{ listStyle: "none", m: 0, p: 0 }}>
          {rows.map((user, index) => (
            <Fragment key={user.id}>
              {index > 0 && <Divider component="li" aria-hidden />}
              <Stack component="li" spacing={1.5} sx={{ p: 2 }}>
                <UserIdentity user={user} isMe={user.id === me.id} />
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Chip size="small" variant="outlined" label={ROLE_LABELS[user.role]} />
                  <StatusChips user={user} />
                </Stack>
                {actions(user)}
              </Stack>
            </Fragment>
          ))}
        </Box>
      );
    }

    return (
      <TableContainer>
        <Table aria-label="Users">
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell sx={{ maxWidth: 320 }}>
                  <UserIdentity user={user} isMe={user.id === me.id} />
                </TableCell>
                <TableCell>{ROLE_LABELS[user.role]}</TableCell>
                <TableCell>
                  <StatusChips user={user} />
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap", color: "text.secondary" }}>{formatClinicDateTime(user.createdAt, clinic.timezone)}</TableCell>
                <TableCell align="right">{actions(user)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <>
      <PageHeader
        title="Users"
        description="Staff accounts. Disabling an account signs it out immediately."
        actions={
          <Button variant="contained" startIcon={<PersonAddRounded />} onClick={() => setOverlay({ kind: "create" })}>
            Add user
          </Button>
        }
      />

      <Card sx={{ overflow: "hidden" }}>
        <Box sx={{ height: 2 }}>{users.isFetching && !users.isPending && <LinearProgress aria-label="Refreshing users" />}</Box>
        {users.error ? (
          <Box sx={{ p: 2 }}>
            <ErrorAlert error={users.error} title="Could not load users" onRetry={() => void users.refetch()} />
          </Box>
        ) : (
          renderUsers()
        )}
      </Card>

      {activeAdmins === 1 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          You are the only active super admin, so your account cannot be disabled.
        </Alert>
      )}

      {overlay?.kind === "create" && (
        <CreateUserDialog
          onClose={() => setOverlay(null)}
          onCreated={(user) => {
            setOverlay(null);
            notify(`${user.name} was added. They must change the temporary password at first sign-in.`);
          }}
        />
      )}
      {overlay?.kind === "reset" && (
        <ResetPasswordDialog
          user={overlay.user}
          onClose={() => setOverlay(null)}
          onDone={() => {
            notify(`Password reset for ${overlay.user.name}. They have been signed out.`);
            setOverlay(null);
          }}
        />
      )}
      <ConfirmDialog
        open={overlay?.kind === "toggle"}
        title={overlay?.kind === "toggle" && overlay.user.isActive ? `Disable ${overlay.user.name}?` : "Enable account?"}
        message={
          overlay?.kind === "toggle" && overlay.user.isActive
            ? "They will be signed out immediately on every device and will not be able to sign in. Their records are kept."
            : "The user will be able to sign in again with their current password."
        }
        confirmLabel={overlay?.kind === "toggle" && overlay.user.isActive ? "Disable" : "Enable"}
        destructive={overlay?.kind === "toggle" && overlay.user.isActive}
        busy={setActive.isPending}
        onCancel={() => setOverlay(null)}
        onConfirm={() => overlay?.kind === "toggle" && confirmToggle(overlay.user)}
      />
    </>
  );
}
