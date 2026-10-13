import { alpha, Avatar } from "@mui/material";

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? `${parts[0]![0]}${parts[parts.length - 1]![0]}` : (parts[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}

/** Initials avatar. Decorative: the name is always shown as text next to it. */
export function UserAvatar({ name, size = 32 }: { name: string; size?: number }) {
  return (
    <Avatar
      aria-hidden
      sx={(theme) => ({
        width: size,
        height: size,
        fontSize: size * 0.4,
        bgcolor: alpha(theme.palette.primary.main, 0.1),
        color: theme.palette.primary.dark,
      })}
    >
      {initials(name)}
    </Avatar>
  );
}
