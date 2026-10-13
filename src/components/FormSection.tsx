import { Box, Grid, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface FormSectionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}

/** Titled group of form fields laid out on a responsive 12-column grid. */
export function FormSection({ title, icon, children }: FormSectionProps) {
  const id = `section-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <Box
      component="fieldset"
      aria-labelledby={id}
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 2.5,
        p: { xs: 2, sm: 2.5 },
        m: 0,
        minWidth: 0,
        bgcolor: "grey.50",
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.75 }}>
        {icon && (
          <Box aria-hidden sx={{ width: 28, height: 28, borderRadius: 1.5, display: "grid", placeItems: "center", bgcolor: "action.selected", color: "primary.main" }}>
            {icon}
          </Box>
        )}
        <Typography id={id} variant="h4" component="legend" sx={{ p: 0 }}>
          {title}
        </Typography>
      </Stack>
      <Grid container spacing={2}>
        {children}
      </Grid>
    </Box>
  );
}
