## Feature: Work-friendly dark dashboard theme

### Goal
- Keep dashboard **dark-first** (no light flash).
- Improve readability and “work feel” via clearer hierarchy (background → surface → raised surface), stronger borders, and better muted text contrast.

### Scope
- Update theme tokens in `app/globals.css` (dark mode surface ladder, borders, muted text).
- Fix initial theme class application in `app/layout.tsx` to avoid flicker while respecting stored theme.
- Keep existing orange accent as primary action color.

### Out of scope (for now)
- Full redesign of each dashboard page layout.
- Reworking Clerk appearance to dynamically match theme.

### Test plan
- Start dev server; verify no light→dark flash on hard refresh.
- Check `Dashboard`, `New Post`, `Recent Posts`, `Templates` for clearer card/input separation.
- Run `npm run build`.

