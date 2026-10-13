import { LocalHospitalRounded } from "@mui/icons-material";
import { Box, Stack, Typography } from "@mui/material";

interface BrandMarkProps {
  /** "light" renders white text for use on the primary-coloured login panel. */
  tone?: "default" | "light";
  subtitle?: string;
}

export function BrandMark({ tone = "default", subtitle = "Appointment records" }: BrandMarkProps) {
  const light = tone === "light";
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", minWidth: 0 }}>
      <Box
        aria-hidden
        sx={{
          width: 36,
          height: 36,
          flexShrink: 0,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          bgcolor: light ? "rgba(255,255,255,0.16)" : "primary.main",
          color: "common.white",
        }}
      >
        <LocalHospitalRounded fontSize="small" />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          component="span"
          sx={{ display: "block", fontWeight: 700, fontSize: "0.9375rem", lineHeight: 1.2, color: light ? "common.white" : "text.primary" }}
        >
          Clinic Desk
        </Typography>
        <Typography
          component="span"
          variant="caption"
          sx={{ display: "block", lineHeight: 1.2, color: light ? "rgba(255,255,255,0.75)" : "text.secondary" }}
        >
          {subtitle}
        </Typography>
      </Box>
    </Stack>
  );
}
