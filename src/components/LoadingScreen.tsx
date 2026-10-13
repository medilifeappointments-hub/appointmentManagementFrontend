import { Box, CircularProgress, Typography } from "@mui/material";

export function LoadingScreen({ label = "Loading…" }: { label?: string }) {
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{ minHeight: "60vh", display: "grid", placeItems: "center", gap: 2, alignContent: "center" }}
    >
      <CircularProgress size={32} />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}
