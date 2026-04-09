import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Up to two letters for avatar placeholders (e.g. "Jane Q. Public" → "JP"). */
export function initialsFromDisplayName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) {
    const w = parts[0]
    if (w.length >= 2) return w.slice(0, 2).toUpperCase()
    return `${(w[0]?.toUpperCase() ?? "?")}?`
  }
  const first = parts[0][0]
  const last = parts[parts.length - 1][0]
  return `${first}${last}`.toUpperCase()
}
