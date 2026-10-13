import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  caption?: ReactNode;
}

/** KPI tile: label, large tabular value, icon and an explanatory caption. */
export function StatCard({ label, value, icon, caption }: StatCardProps) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {label}
            </Typography>
            <Typography
              component="p"
              sx={{ fontSize: { xs: "1.5rem", md: "1.75rem" }, fontWeight: 700, letterSpacing: "-0.02em", mt: 0.5, fontVariantNumeric: "tabular-nums", overflowWrap: "anywhere" }}
            >
              {value}
            </Typography>
          </Box>
          <Box
            aria-hidden
            sx={{ width: 40, height: 40, borderRadius: 2.5, display: "grid", placeItems: "center", flexShrink: 0, bgcolor: "action.selected", color: "primary.main" }}
          >
            {icon}
          </Box>
        </Stack>
        {caption && (
          <Typography variant="caption" component="p" sx={{ mt: 1 }}>
            {caption}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
