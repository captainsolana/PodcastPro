# Accessibility Additions

This document tracks recent accessibility infrastructure improvements.

## Live Status Provider
Centralized `aria-live` region management via `LiveStatusProvider` (`components/accessibility/live-status.tsx`).
Use the `useLiveStatus()` hook: `announce(message, politeness?)` where politeness defaults to `polite`.
Avoid creating multiple scattered `aria-live` regions that can overwhelm assistive tech.

## Skip Link
A keyboard-accessible skip link is injected at the top of the Project page layout via the `SkipLink` component. It targets the `#main-content` container. Appears on focus (Tab from top of page). Improves navigation efficiency for screen reader and keyboard-only users.

## Skeleton Loading
Structured skeleton placeholders replaced spinners in:
- Script Generation (Research & Insights Suspense fallbacks)
- Audio Generation (during audio creation)

Guidelines:
- Always pair visually rich skeleton loading with a live status announcement if loading lasts > 1.5s.
- Use `aria-busy="true"` on container elements while loading.

## Next Recommendations
- Migrate remaining `LoadingState` uses to Skeleton (retain tiny inline save spinner if desired).
- Add focus outline tokens to any remaining interactive plain div wrappers.
- Provide reduced motion preference: wrap intensive shimmer transitions with `@media (prefers-reduced-motion: reduce)` fallback that disables animation.

## Reduced Motion (Planned)
Add in `tokens.css`:
```
@media (prefers-reduced-motion: reduce) {
  .skeleton-shimmer { animation: none; opacity: .6; }
}
```

## Testing Checklist
- Tab to page: first interactive focus should reveal Skip Link.
- Trigger long running action: verify polite announcement in screen reader (VoiceOver rotor / output).
- Ensure no duplicate announcements on repeated quick updates.

