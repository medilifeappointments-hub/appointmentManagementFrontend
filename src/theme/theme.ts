import { alpha, createTheme } from "@mui/material/styles";

/**
 * Single source of visual truth. Components use palette/typography tokens, never raw colours.
 * Direction: calm clinical UI — light canvas, white surfaces, restrained blue, slate neutrals,
 * soft borders instead of heavy shadows, no gradients.
 */
const blue = { 50: "#eef4ff", 100: "#dbe7fe", 500: "#2f6fde", 600: "#1f5bc6", 700: "#1a4aa0", 800: "#173d82" };
const slate = {
  50: "#f8fafc",
  100: "#f1f5f9",
  200: "#e2e8f0",
  300: "#cbd5e1",
  400: "#94a3b8",
  500: "#64748b",
  600: "#475569",
  700: "#334155",
  900: "#0f172a",
};

const focusRing = `0 0 0 3px ${alpha(blue[500], 0.3)}`;
const softShadow = "0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)";

export const layout = {
  sidebarWidth: 248,
  topBarHeight: 64,
} as const;

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: blue[600], light: blue[500], dark: blue[700], contrastText: "#ffffff" },
    secondary: { main: slate[600] },
    success: { main: "#15803d", light: "#dcfce7" },
    warning: { main: "#b45309", light: "#fef3c7" },
    error: { main: "#dc2626", light: "#fee2e2" },
    info: { main: "#0369a1", light: "#e0f2fe" },
    background: { default: slate[50], paper: "#ffffff" },
    text: { primary: slate[900], secondary: slate[500], disabled: slate[400] },
    divider: slate[200],
    grey: slate,
    action: { hover: alpha(slate[500], 0.06), selected: alpha(blue[500], 0.08) },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter Variable", "Segoe UI", system-ui, -apple-system, sans-serif',
    fontSize: 14,
    h1: { fontSize: "1.625rem", fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.02em" },
    h2: { fontSize: "1.25rem", fontWeight: 650, lineHeight: 1.3, letterSpacing: "-0.01em" },
    h3: { fontSize: "1rem", fontWeight: 650, lineHeight: 1.4 },
    h4: { fontSize: "0.9375rem", fontWeight: 600, lineHeight: 1.4 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600, fontSize: "0.8125rem" },
    body2: { lineHeight: 1.5 },
    caption: { color: slate[500] },
    overline: { fontWeight: 650, fontSize: "0.6875rem", letterSpacing: "0.08em", lineHeight: 1.8 },
    button: { textTransform: "none", fontWeight: 600, letterSpacing: 0 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: slate[50], WebkitFontSmoothing: "antialiased" },
        "::selection": { backgroundColor: blue[100] },
        ":focus-visible": { outline: `2px solid ${blue[500]}`, outlineOffset: 2 },
        "input[type=date], input[type=datetime-local]": { colorScheme: "light" },
      },
    },
    MuiButtonBase: {
      defaultProps: { disableRipple: false },
      styleOverrides: { root: { "&.Mui-focusVisible": { boxShadow: focusRing } } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 8,
          paddingInline: 14,
          minHeight: 38,
          variants: [
            {
              // Default outlined buttons are neutral secondary actions; coloured ones keep their colour.
              props: { variant: "outlined", color: "primary" },
              style: { borderColor: slate[300], color: slate[700], "&:hover": { borderColor: slate[400], backgroundColor: slate[50] } },
            },
          ],
        },
        sizeSmall: { minHeight: 32, paddingInline: 10 },
        sizeLarge: { minHeight: 46, fontSize: "0.9375rem" },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { borderRadius: 8, "&.Mui-focusVisible": { boxShadow: focusRing } } },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { rounded: { borderRadius: 12 }, outlined: { borderColor: slate[200] } },
    },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: { root: { borderRadius: 12, boxShadow: softShadow } },
    },
    MuiCardHeader: {
      styleOverrides: { root: { padding: "16px 20px" }, action: { alignSelf: "center", margin: 0 } },
    },
    MuiCardContent: {
      styleOverrides: { root: { padding: 20, "&:last-child": { paddingBottom: 20 } } },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: "inherit" },
      styleOverrides: {
        root: { backgroundColor: alpha("#ffffff", 0.92), backdropFilter: "blur(8px)", borderBottom: `1px solid ${slate[200]}` },
      },
    },
    MuiDrawer: {
      styleOverrides: { paper: { borderRight: `1px solid ${slate[200]}`, backgroundColor: "#ffffff" } },
    },
    MuiTextField: { defaultProps: { size: "small", fullWidth: true } },
    MuiFormControl: { defaultProps: { size: "small" } },
    MuiAutocomplete: { defaultProps: { size: "small" } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          borderRadius: 8,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: slate[300] },
          "&:hover:not(.Mui-disabled):not(.Mui-error) .MuiOutlinedInput-notchedOutline": { borderColor: slate[400] },
          "&.Mui-focused": { boxShadow: focusRing },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderWidth: 1, borderColor: blue[500] },
          "&.Mui-disabled": { backgroundColor: slate[50] },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: { root: { color: slate[600], "&.Mui-focused": { color: blue[600] } } },
    },
    MuiFormHelperText: {
      styleOverrides: { root: { marginLeft: 2, marginTop: 4, lineHeight: 1.4 } },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 14,
          boxShadow: "0 24px 48px -12px rgba(15, 23, 42, 0.25)",
          maxHeight: "calc(100dvh - 32px)",
          overflow: "hidden",
          margin: 16,
        },
      },
    },
    MuiDialogTitle: { styleOverrides: { root: { padding: "18px 24px" } } },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: "20px 24px",
          minHeight: 0,
          overflowY: "auto",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
        },
        dividers: { borderColor: slate[200] },
      },
    },
    MuiDialogActions: {
      styleOverrides: { root: { padding: "14px 24px", gap: 8, "& > :not(style) ~ :not(style)": { marginLeft: 0 } } },
    },
    MuiBackdrop: {
      styleOverrides: { root: { "&:not(.MuiBackdrop-invisible)": { backgroundColor: alpha(slate[900], 0.4) } } },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: slate[100], paddingTop: 10, paddingBottom: 10 },
        head: {
          fontSize: "0.75rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: slate[500],
          backgroundColor: slate[50],
          borderBottom: `1px solid ${slate[200]}`,
          whiteSpace: "nowrap",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: { "&.MuiTableRow-hover:hover": { backgroundColor: alpha(blue[500], 0.035) } },
      },
    },
    MuiTablePagination: {
      styleOverrides: { root: { borderTop: `1px solid ${slate[200]}` }, toolbar: { minHeight: 52 } },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 6 },
        sizeSmall: { height: 22, fontSize: "0.75rem" },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          alignItems: "flex-start",
          variants: [{ props: { variant: "standard", severity: "info" }, style: { backgroundColor: blue[50], color: blue[800] } }],
        },
      },
    },
    MuiTooltip: {
      defaultProps: { arrow: true },
      styleOverrides: { tooltip: { backgroundColor: slate[900], fontSize: "0.75rem", fontWeight: 500 }, arrow: { color: slate[900] } },
    },
    MuiMenu: {
      styleOverrides: { paper: { borderRadius: 10, border: `1px solid ${slate[200]}`, boxShadow: "0 12px 24px -6px rgba(15, 23, 42, 0.15)" } },
    },
    MuiMenuItem: {
      styleOverrides: { root: { borderRadius: 6, marginInline: 6, paddingBlock: 8 } },
    },
    MuiListItemButton: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
    MuiAvatar: {
      styleOverrides: { root: { fontWeight: 600, fontSize: "0.8125rem" } },
    },
    MuiLinearProgress: {
      styleOverrides: { root: { height: 2, backgroundColor: "transparent" } },
    },
    MuiSnackbarContent: { styleOverrides: { root: { borderRadius: 10 } } },
  },
});
