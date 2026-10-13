import { Box, List, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Stack, Typography } from "@mui/material";
import { NavLink } from "react-router";
import { BrandMark } from "../components/BrandMark";
import { UserAvatar } from "../components/UserAvatar";
import { ROLE_LABELS } from "../features/auth/types";
import { useSession } from "../features/auth/useSession";
import { layout } from "../theme/theme";
import { NAV_ITEMS } from "./navigation";

/** Sidebar content shared by the permanent (desktop) and temporary (mobile) drawers. */
export function SideNav({ onNavigate }: { onNavigate?: () => void }) {
  const { user, isAdmin } = useSession();
  const workItems = NAV_ITEMS.filter((item) => !item.adminOnly);
  const adminItems = NAV_ITEMS.filter((item) => item.adminOnly && isAdmin);

  const renderItems = (items: typeof NAV_ITEMS) =>
    items.map((item) => (
      <ListItemButton
        key={item.to}
        component={NavLink}
        to={item.to}
        onClick={onNavigate}
        sx={{
          mb: 0.5,
          color: "text.secondary",
          "& .MuiListItemIcon-root": { color: "inherit", minWidth: 34 },
          "&.active": { bgcolor: "action.selected", color: "primary.main" },
          "&.active .MuiListItemText-primary": { fontWeight: 650 },
        }}
      >
        <ListItemIcon>{item.icon}</ListItemIcon>
        <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontSize: "0.875rem", fontWeight: 550 } } }} />
      </ListItemButton>
    ));

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", overflowX: "hidden" }}>
      <Box sx={{ height: layout.topBarHeight, px: 2.5, display: "flex", alignItems: "center", flexShrink: 0 }}>
        <BrandMark />
      </Box>

      <Box component="nav" aria-label="Main" sx={{ flexGrow: 1, overflowY: "auto", px: 1.5, pt: 1 }}>
        <List disablePadding subheader={<SectionLabel>Workspace</SectionLabel>}>
          {renderItems(workItems)}
        </List>
        {adminItems.length > 0 && (
          <List disablePadding subheader={<SectionLabel>Administration</SectionLabel>} sx={{ mt: 1.5 }}>
            {renderItems(adminItems)}
          </List>
        )}
      </Box>

      <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", p: 2, m: 1.5, borderRadius: 2.5, bgcolor: "grey.50", border: 1, borderColor: "divider" }}>
        <UserAvatar name={user.name} size={34} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap>
            {user.name}
          </Typography>
          <Typography variant="caption" component="div" noWrap>
            {ROLE_LABELS[user.role]}
          </Typography>
        </Box>
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
