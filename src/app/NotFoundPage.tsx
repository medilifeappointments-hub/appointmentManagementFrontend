import { ArrowBackRounded, HomeRounded } from "@mui/icons-material";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router";
import { BrandMark } from "../components/BrandMark";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box
      component="main"
      sx={{ minHeight: "100dvh", display: "grid", placeItems: "center", p: 2, bgcolor: "background.default" }}
    >
      <Paper variant="outlined" sx={{ width: "100%", maxWidth: 480, p: { xs: 3, sm: 4 } }}>
        <Stack spacing={3} sx={{ alignItems: "flex-start" }}>
          <BrandMark />
          <Box>
            <Typography variant="overline" color="primary.main">
              Error 404
            </Typography>
            <Typography variant="h1" sx={{ mt: 0.5 }}>
              Page not found
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              The page you requested does not exist or may have moved.
            </Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: "100%" }}>
            <Button variant="contained" component={RouterLink} to="/" startIcon={<HomeRounded />}>
              Go to home
            </Button>
            <Button variant="outlined" onClick={() => navigate(-1)} startIcon={<ArrowBackRounded />}>
              Go back
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
