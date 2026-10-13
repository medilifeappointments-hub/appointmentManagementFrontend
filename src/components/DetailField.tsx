import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

/** Read-only label/value pair for details views with an explicit empty state. */
export function DetailField({ label, value }: { label: string; value: ReactNode }) {
  const empty = value === null || value === undefined || value === "";
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" component="div" sx={{ fontWeight: 600, mb: 0.25 }}>
        {label}
      </Typography>
      <Typography variant="body2" component="div" sx={{ overflowWrap: "anywhere", fontWeight: 500 }}>
        {empty ? (
          <Box component="span" sx={{ color: "text.disabled", fontWeight: 400 }}>
            Not provided
          </Box>
        ) : (
          value
        )}
      </Typography>
    </Box>
  );
}
