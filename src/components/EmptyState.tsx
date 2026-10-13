import { InboxRounded } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon = <InboxRounded /> }: EmptyStateProps) {
  return (
    <Box sx={{ py: { xs: 6, md: 8 }, px: 2, textAlign: "center" }}>
      <Box
        aria-hidden
        sx={{ width: 48, height: 48, mx: "auto", mb: 2, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: "grey.100", color: "text.secondary" }}
      >
        {icon}
      </Box>
      <Typography variant="h3" component="p">
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 420, mx: "auto" }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 2.5 }}>{action}</Box>}
    </Box>
  );
}
