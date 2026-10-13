import { SearchRounded, TuneRounded } from "@mui/icons-material";
import { Badge, Box, Button, Chip, Collapse, InputAdornment, MenuItem, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { DateRangeFields } from "../../components/DateRangeFields";
import { FreeSoloField } from "../../components/FreeSoloField";
import { useDebouncedValue } from "../../lib/useDebouncedValue";
import { useFilterOptions } from "./hooks/useAppointments";
import type { AppointmentFilters as Filters } from "./types";

interface AppointmentFiltersProps {
  filters: Filters;
  onChange: (changes: Partial<Filters>) => void;
  onReset: () => void;
  today: string;
  isAdmin: boolean;
}

/** Text filters are typed into local state and applied after a short pause. */
function useDebouncedFilter(applied: string, apply: (value: string) => void) {
  const [draft, setDraft] = useState(applied);
  const debounced = useDebouncedValue(draft, 350);
  useEffect(() => setDraft(applied), [applied]);
  useEffect(() => {
    if (debounced !== applied) apply(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the debounced value
  }, [debounced]);
  return [draft, setDraft] as const;
}

const ARCHIVED_LABELS = { active: "Active", archived: "Archived", all: "All" } as const;

export function AppointmentFilters({ filters, onChange, onReset, today, isAdmin }: AppointmentFiltersProps) {
  const options = useFilterOptions().data;
  const [search, setSearch] = useDebouncedFilter(filters.q, (q) => onChange({ q }));
  const [team, setTeam] = useDebouncedFilter(filters.team, (value) => onChange({ team: value }));
  const [location, setLocation] = useDebouncedFilter(filters.location, (value) => onChange({ location: value }));
  const [status, setStatus] = useDebouncedFilter(filters.status, (value) => onChange({ status: value }));

  const activeChips = [
    filters.team && { key: "team", label: `Team: ${filters.team}`, clear: () => onChange({ team: "" }) },
    filters.location && { key: "location", label: `Location: ${filters.location}`, clear: () => onChange({ location: "" }) },
    filters.status && { key: "status", label: `Status: ${filters.status}`, clear: () => onChange({ status: "" }) },
    filters.archived !== "active" && {
      key: "archived",
      label: `Records: ${ARCHIVED_LABELS[filters.archived]}`,
      clear: () => onChange({ archived: "active" }),
    },
  ].filter((chip): chip is { key: string; label: string; clear: () => void } => Boolean(chip));

  const [expanded, setExpanded] = useState(activeChips.length > 0);
  const datesChanged = filters.from !== today || filters.to !== today;
  const canReset = activeChips.length > 0 || Boolean(filters.q) || datesChanged;

  return (
    <Box component="section" aria-label="Filters">
      <Stack direction={{ xs: "column", lg: "row" }} spacing={1.5} sx={{ alignItems: { lg: "flex-start" } }}>
        <TextField
          placeholder="Search patient name, mobile no or record number"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ flex: { lg: "1 1 320px" } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded fontSize="small" />
                </InputAdornment>
              ),
            },
            htmlInput: { maxLength: 100, "aria-label": "Search patient name, mobile number or record number" },
          }}
        />
        <DateRangeFields
          value={{ from: filters.from, to: filters.to }}
          onChange={onChange}
          today={today}
          actions={
          <Badge badgeContent={activeChips.length} color="primary" invisible={activeChips.length === 0}>
            <Button
              variant="outlined"
              startIcon={<TuneRounded fontSize="small" />}
              onClick={() => setExpanded((open) => !open)}
              aria-expanded={expanded}
              aria-controls="more-filters"
              sx={{ height: 40 }}
            >
              Filters
            </Button>
          </Badge>
          }
        />
      </Stack>

      <Collapse in={expanded} id="more-filters">
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ pt: 2 }}>
          <FreeSoloField label="Team" value={team} onChange={setTeam} options={options?.teams ?? []} />
          <FreeSoloField label="Location" value={location} onChange={setLocation} options={options?.locations ?? []} />
          <FreeSoloField label="Status" value={status} onChange={setStatus} options={options?.statuses ?? []} />
          {isAdmin && (
            <TextField
              select
              label="Records"
              value={filters.archived}
              onChange={(event) => onChange({ archived: event.target.value as Filters["archived"] })}
              sx={{ minWidth: { sm: 160 } }}
            >
              {(Object.keys(ARCHIVED_LABELS) as Array<Filters["archived"]>).map((key) => (
                <MenuItem key={key} value={key}>
                  {ARCHIVED_LABELS[key]}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Stack>
      </Collapse>

      {(activeChips.length > 0 || canReset) && (
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", alignItems: "center", pt: 1.5 }}>
          {activeChips.map((chip) => (
            <Chip key={chip.key} label={chip.label} onDelete={chip.clear} size="small" variant="outlined" />
          ))}
          {canReset && (
            <Button size="small" onClick={onReset} sx={{ minHeight: 26 }}>
              Clear all
            </Button>
          )}
        </Stack>
      )}
    </Box>
  );
}
