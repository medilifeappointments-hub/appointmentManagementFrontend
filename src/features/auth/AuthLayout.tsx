import { CheckCircleRounded } from "@mui/icons-material";
import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { BrandMark } from "../../components/BrandMark";

const HIGHLIGHTS = [
  "One shared record of every phone-in appointment",
  "Clinic-time scheduling, including overnight slots",
  "Every change tracked with who and when",
];

interface AuthLayoutProps {
  title: string;
  description: ReactNode;
  children: ReactNode;
}

/** Split screen for sign-in pages: product panel (desktop only) and a focused form column. */
export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <Box sx={{ minHeight: "100vh", display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(360px, 5fr) 7fr" } }}>
      <Box
        component="aside"
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          bgcolor: "primary.dark",
          color: "common.white",
          p: { md: 5, lg: 6 },
        }}
      >
        <BrandMark tone="light" subtitle="Front desk records" />
        <Box sx={{ maxWidth: 420 }}>
          <Typography component="p" sx={{ fontSize: { md: "1.625rem", lg: "1.875rem" }, fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.02em" }}>
            Appointment records for the whole front desk.
          </Typography>
          <Stack component="ul" spacing={1.5} sx={{ listStyle: "none", p: 0, mt: 3, mb: 0 }}>
            {HIGHLIGHTS.map((text) => (
              <Stack component="li" key={text} direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                <CheckCircleRounded fontSize="small" sx={{ color: "rgba(255,255,255,0.8)" }} />
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.88)" }}>
                  {text}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
          Internal system · Authorised staff only
        </Typography>
      </Box>

      <Box component="main" sx={{ display: "flex", alignItems: "center", justifyContent: "center", px: { xs: 2.5, sm: 4 }, py: 6, bgcolor: "background.paper" }}>
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          <Box sx={{ display: { md: "none" }, mb: 4 }}>
            <BrandMark />
          </Box>
          <Typography variant="h1" component="h1">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" component="div" sx={{ mt: 1, mb: 4 }}>
            {description}
          </Typography>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
