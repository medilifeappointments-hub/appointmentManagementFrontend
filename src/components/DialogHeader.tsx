import { CloseRounded } from "@mui/icons-material";
import { Box, DialogTitle, IconButton, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface DialogHeaderProps {
  id: string;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Badges or chips shown next to the title. */
  adornment?: ReactNode;
  onClose?: () => void;
  closeDisabled?: boolean;
}

/** Consistent dialog title row: title, optional subtitle/badges and a close button. */
export function DialogHeader({ id, title, subtitle, adornment, onClose, closeDisabled }: DialogHeaderProps) {
  return (
    <DialogTitle component="div" sx={{ borderBottom: 1, borderColor: "divider", pr: onClose ? 7 : 3, position: "relative" }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 0.5 }}>
        <Typography id={id} variant="h2" component="h2">
          {title}
        </Typography>
        {adornment}
      </Stack>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" component="div" sx={{ mt: 0.25 }}>
          {subtitle}
        </Typography>
      )}
      {onClose && (
        <Box sx={{ position: "absolute", right: 12, top: 14 }}>
          <IconButton aria-label="Close" onClick={onClose} disabled={closeDisabled} size="small">
            <CloseRounded fontSize="small" />
          </IconButton>
        </Box>
      )}
    </DialogTitle>
  );
}
