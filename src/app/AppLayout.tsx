import { LockResetRounded, LogoutRounded, MenuRounded, ScheduleRounded } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { BrandMark } from "../components/BrandMark";
import { UserAvatar } from "../components/UserAvatar";
import { ChangePasswordDialog } from "../features/auth/ChangePasswordDialog";
import { useLogout } from "../features/auth/authApi";
import { ROLE_LABELS } from "../features/auth/types";
import { useSession } from "../features/auth/useSession";
import { clinicToday, formatLocalDate } from "../lib/clinicTime";
import { layout } from "../theme/theme";
import { SideNav } from "./SideNav";

/** Responsive shell: permanent sidebar from md up, slide-out drawer below. */
export function AppLayout() {
  const { user, clinic } = useSession();
  const logout = useLogout();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const closeMenu = () => setMenuAnchor(null);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box
        component="a"
        href="#main"
        sx={{ position: "absolute", left: -9999, "&:focus": { left: 16, top: 8, zIndex: 2000, bgcolor: "background.paper", p: 1, borderRadius: 1 } }}
      >
        Skip to content
      </Box>

      <Drawer
        variant="permanent"
        sx={{ display: { xs: "none", md: "block" }, width: layout.sidebarWidth, flexShrink: 0 }}
        slotProps={{ paper: { sx: { width: layout.sidebarWidth } } }}
      >
        <SideNav />
      </Drawer>
      <Drawer
        variant="temporary"
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        sx={{ display: { md: "none" } }}
        slotProps={{ root: { keepMounted: true }, paper: { sx: { width: layout.sidebarWidth, maxWidth: "85vw" } } }}
      >
        <SideNav onNavigate={() => setMobileNavOpen(false)} />
      </Drawer>

      <Box sx={{ flexGrow: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <AppBar position="sticky">
          <Toolbar sx={{ minHeight: { xs: layout.topBarHeight }, gap: 1.5, px: { xs: 2, sm: 3 } }}>
            <IconButton
              aria-label="Open navigation"
              onClick={() => setMobileNavOpen(true)}
              edge="start"
              sx={{ display: { md: "none" } }}
            >
              <MenuRounded />
            </IconButton>
            <Box sx={{ display: { md: "none" }, minWidth: 0 }}>
              <BrandMark />
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Tooltip title={`All times use the clinic timezone (${clinic.timezone})`}>
              <Chip
                icon={<ScheduleRounded />}
                label={`${formatLocalDate(clinicToday(clinic.timezone))} · ${clinic.timezone}`}
                variant="outlined"
                size="small"
                sx={{ display: { xs: "none", sm: "inline-flex" }, fontWeight: 500, color: "text.secondary", borderColor: "divider" }}
              />
            </Tooltip>

            <IconButton
              onClick={(event) => setMenuAnchor(event.currentTarget)}
              aria-label="Open account menu"
              aria-controls={menuAnchor ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={Boolean(menuAnchor)}
              sx={{ p: 0.5 }}
            >
              <UserAvatar name={user.name} size={34} />
            </IconButton>
            <Menu
              id="account-menu"
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={closeMenu}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{ paper: { sx: { mt: 1, minWidth: 240 } } }}
            >
              <Box sx={{ px: 2, py: 1.25 }}>
                <Typography variant="subtitle2">{user.name}</Typography>
                <Typography variant="caption" component="div" noWrap>
                  {user.email}
                </Typography>
                <Chip label={ROLE_LABELS[user.role]} size="small" sx={{ mt: 1 }} />
              </Box>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem
                onClick={() => {
                  closeMenu();
                  setChangePasswordOpen(true);
                }}
              >
                <ListItemIcon>
                  <LockResetRounded fontSize="small" />
                </ListItemIcon>
                <ListItemText>Change password</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  closeMenu();
                  logout.mutate(undefined, { onSettled: () => navigate("/login", { replace: true }) });
                }}
                sx={{ color: "error.main", "& .MuiListItemIcon-root": { color: "error.main" } }}
              >
                <ListItemIcon>
                  <LogoutRounded fontSize="small" />
                </ListItemIcon>
                <ListItemText>Sign out</ListItemText>
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box component="main" id="main" tabIndex={-1} sx={{ flexGrow: 1, px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 2.5, sm: 3 }, width: "100%", maxWidth: 1680, mx: "auto", outline: "none" }}>
          <Outlet />
        </Box>
      </Box>
      {changePasswordOpen && (
        <ChangePasswordDialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
      )}
    </Box>
  );
}
