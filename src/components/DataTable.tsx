import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import type { ReactNode } from "react";

export interface DataTableColumn<Row, SortKey extends string = string> {
  id: string;
  label: string;
  render: (row: Row) => ReactNode;
  sortKey?: SortKey;
  align?: "left" | "center" | "right";
  minWidth?: number;
}

interface DataTableProps<Row, SortKey extends string = string> {
  ariaLabel: string;
  rows: Row[];
  columns: DataTableColumn<Row, SortKey>[];
  getRowId: (row: Row) => string | number;
  minWidth?: number;
  maxHeight?: string | number;
  sortBy?: SortKey;
  sortOrder?: "asc" | "desc";
  onSort?: (field: SortKey) => void;
  onRowClick?: (row: Row) => void;
  getRowOpacity?: (row: Row) => number;
  renderActions?: (row: Row) => ReactNode;
  actionsWidth?: number;
}

/** Reusable data table with sorting, row actions and responsive overflow. */
export function DataTable<Row, SortKey extends string = string>({
  ariaLabel,
  rows,
  columns,
  getRowId,
  minWidth = 960,
  maxHeight,
  sortBy,
  sortOrder = "asc",
  onSort,
  onRowClick,
  getRowOpacity,
  renderActions,
  actionsWidth = 88,
}: DataTableProps<Row, SortKey>) {
  return (
    <TableContainer
      sx={{
        width: "100%",
        maxWidth: "100%",
        maxHeight,
        overflow: "auto",
        scrollbarGutter: "stable",
        scrollbarWidth: "thin",
        scrollbarColor: (theme) => `${theme.palette.grey[400]} ${theme.palette.grey[100]}`,
        "&::-webkit-scrollbar": { width: 10, height: 10 },
        "&::-webkit-scrollbar-track": { bgcolor: "grey.100", borderRadius: 999 },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: "grey.400",
          border: (theme) => `2px solid ${theme.palette.grey[100]}`,
          borderRadius: 999,
        },
        "&::-webkit-scrollbar-thumb:hover": { bgcolor: "grey.500" },
        "&::-webkit-scrollbar-corner": { bgcolor: "grey.100" },
      }}
    >
      <Table
        stickyHeader
        size="small"
        aria-label={ariaLabel}
        sx={{ width: "100%", minWidth, "& .MuiTableCell-root": { px: 1 } }}
      >
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align}
                sx={{ minWidth: column.minWidth }}
                sortDirection={column.sortKey && sortBy === column.sortKey ? sortOrder : false}
              >
                {column.sortKey && onSort ? (
                  <TableSortLabel
                    active={sortBy === column.sortKey}
                    direction={sortBy === column.sortKey ? sortOrder : "asc"}
                    onClick={() => onSort(column.sortKey!)}
                  >
                    {column.label}
                  </TableSortLabel>
                ) : (
                  column.label
                )}
              </TableCell>
            ))}
            {renderActions && (
              <TableCell align="right" sx={{ width: actionsWidth, minWidth: actionsWidth, maxWidth: actionsWidth }}>
                <Box component="span" sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                  Actions
                </Box>
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={getRowId(row)}
              hover={Boolean(onRowClick)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              sx={{ cursor: onRowClick ? "pointer" : "default", opacity: getRowOpacity?.(row) ?? 1 }}
            >
              {columns.map((column) => (
                <TableCell key={column.id} align={column.align} sx={{ whiteSpace: "nowrap" }}>
                  {column.render(row)}
                </TableCell>
              ))}
              {renderActions && (
                <TableCell
                  align="right"
                  onClick={(event) => event.stopPropagation()}
                  sx={{ width: actionsWidth, minWidth: actionsWidth, maxWidth: actionsWidth, py: 0.5 }}
                >
                  {renderActions(row)}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
