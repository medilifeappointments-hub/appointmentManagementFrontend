import { ChevronLeftRounded, ChevronRightRounded } from "@mui/icons-material";
import { Box, IconButton, List, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Stack, Tooltip, Typography } from "@mui/material";
import { NavLink } from "react-router";
import { BrandMark } from "../components/BrandMark";
import { UserAvatar } from "../components/UserAvatar";
import { ROLE_LABELS } from "../features/auth/types";
import { useSession } from "../features/auth/useSession";
import { layout } from "../theme/theme";
import { NAV_ITEMS } from "./navigation";

/** Sidebar content shared by the permanent (desktop) and temporary (mobile) drawers. */
export function SideNav({ onNavigate, collapsed = false, onToggle }: { onNavigate?: () => void; collapsed?: boolean; onToggle?: () => void }) {
  const { user, isAdmin } = useSession();
  const workItems = NAV_ITEMS.filter((item) => !item.adminOnly);
  const adminItems = NAV_ITEMS.filter((item) => item.adminOnly && isAdmin);

  const renderItems = (items: typeof NAV_ITEMS) =>
    items.map((item) => (
      <Tooltip key={item.to} title={collapsed ? item.label : ""} placement="right">
        <ListItemButton
          component={NavLink}
          to={item.to}
          onClick={onNavigate}
          aria-label={collapsed ? item.label : undefined}
          sx={{
            mb: 0.5,
            minHeight: 42,
            justifyContent: collapsed ? "center" : "flex-start",
            px: collapsed ? 1 : 2,
            color: "text.secondary",
            "& .MuiListItemIcon-root": { color: "inherit", minWidth: collapsed ? 0 : 34, justifyContent: "center" },
            "&.active": { bgcolor: "action.selected", color: "primary.main" },
            "&.active .MuiListItemText-primary": { fontWeight: 650 },
          }}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          {!collapsed && <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontSize: "0.875rem", fontWeight: 550 } } }} />}
        </ListItemButton>
      </Tooltip>
    ));

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", overflowX: "hidden" }}>
      <Box sx={{ height: layout.topBarHeight, px: collapsed ? 1 : 2.5, display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", flexShrink: 0 }}>
        {!collapsed && <BrandMark />}
        {onToggle && (
          <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"} placement="right">
            <IconButton size="small" onClick={onToggle} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
              {collapsed ? <ChevronRightRounded /> : <ChevronLeftRounded />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Box component="nav" aria-label="Main" sx={{ flexGrow: 1, overflowY: "auto", px: collapsed ? 1 : 1.5, pt: 1 }}>
        <List disablePadding subheader={collapsed ? undefined : <SectionLabel>Workspace</SectionLabel>}>
          {renderItems(workItems)}
        </List>
        {adminItems.length > 0 && (
          <List disablePadding subheader={collapsed ? undefined : <SectionLabel>Administration</SectionLabel>} sx={{ mt: collapsed ? 0.5 : 1.5 }}>
            {renderItems(adminItems)}
          </List>
        )}
      </Box>

      <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", p: collapsed ? 1 : 2, m: collapsed ? 1 : 1.5, borderRadius: 2.5, bgcolor: "grey.50", border: 1, borderColor: "divider" }}>
        <UserAvatar name={user.name} size={34} />
        {!collapsed && <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap>
            {user.name}
          </Typography>
          <Typography variant="caption" component="div" noWrap>
            {ROLE_LABELS[user.role]}
          </Typography>
        </Box>}
      </Stack>
    </Box>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <ListSubheader disableSticky sx={{ bgcolor: "transparent", lineHeight: 2.5, px: 1.5, fontSize: "0.6875rem", fontWeight: 650, letterSpacing: "0.08em", textTransform: "uppercase", color: "text.disabled" }}>
      {children}
    </ListSubheader>
  );
}
