import { Button, Stack, TextField } from "@mui/material";
import type { ReactNode } from "react";

export interface DateRange {
  from: string;
  to: string;
}

interface DateRangeFieldsProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
  /** Clinic-local "today" (YYYY-MM-DD). */
  today: string;
  required?: boolean;
  /** Extra controls kept on the same row as the Today button. */
  actions?: ReactNode;
}

/** Clinic-local calendar date range with a quick "Today" reset. */
export function DateRangeFields({ value, onChange, today, required = false, actions }: DateRangeFieldsProps) {
  const invalid = Boolean(value.from && value.to && value.from > value.to);
  return (
    <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: "flex-start", flexWrap: "wrap", rowGap: 1.5 }}>
      <TextField
        label="From"
        type="date"
        value={value.from}
        required={required}
        onChange={(event) => onChange({ ...value, from: event.target.value })}
        slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: value.to || undefined } }}
        fullWidth={false}
        sx={{ width: { xs: "calc(50% - 4px)", sm: 165 } }}
      />
      <TextField
        label="To"
        type="date"
        value={value.to}
        required={required}
        error={invalid}
        helperText={invalid ? "Must be on or after From" : undefined}
        onChange={(event) => onChange({ ...value, to: event.target.value })}
        slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: value.from || undefined } }}
        fullWidth={false}
        sx={{ width: { xs: "calc(50% - 4px)", sm: 165 } }}
      />
      <Button
        variant="outlined"
        onClick={() => onChange({ from: today, to: today })}
        disabled={value.from === today && value.to === today}
        sx={{ height: 40, flexShrink: 0 }}
      >
        Today
      </Button>
      {actions}
    </Stack>
  );
}
