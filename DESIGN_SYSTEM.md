# PodcastPro Design System

Status: In-progress (foundational tokens + initial component convergence complete)

## 1. Token Architecture
- Semantic layer: `--semantic-*` (colors, surfaces, text, borders, feedback) – never hardcode hex in components.
- Scales: spacing (`--space-*`), radius (`--radius-*`), elevation (`--elevation-*`), typography scale (`--font-size-*`).
- Semantic typography: `--font-heading-*`, `--font-body*` mapping for global tuning.
- Motion: `--motion-duration-{xs|sm|md|lg}`, `--motion-ease-{standard|emphasized}` (replace ad-hoc durations).

## 2. Elevation Ladder
Tier | Attribute | Usage | Shadow
---- | --------- | ----- | ------
0 | none | flat background sections | none
1 | `data-elevation-tier="1"` | base content cards | `--elevation-1`
2 | `data-elevation-tier="2"` | interactive clusters / selectable cards | `--elevation-2` (+ hover → 3)
3 | `data-elevation-tier="3"` | overlays, dialogs, modals | `--elevation-3` (optionally escalate to 4 on emphasis)

Hover escalation applied via `.interactive` class.

## 3. Spacing & Vertical Rhythm
Use stack utilities:
- `.stack-sm`, `.stack-md`, `.stack-lg`, `.stack-xl` for vertical spacing inside sections.
Avoid ad-hoc `space-y-*` except in transitional code.

## 4. Skeleton Loading
Component: `components/ui/skeleton.tsx`
Variants: `text`, `title`, `block`, `circle` with shimmer (disabled via reduced-motion media query).
Guidelines:
- Always pair with `aria-busy` and screen reader live message if >1.5s.
- Group structure should approximate final layout.

## 5. Accessibility Infrastructure
- Central live announcements: `LiveStatusProvider` (`announce(message, politeness?)`).
- Skip link: `SkipLink` pointing at `#main-content`.
- Focus halo via `--focus-halo-shadow` applied on focus-visible for custom elements.

## 6. Theming Modes
Mode | Class | Notes
---- | ----- | -----
Light | (default) | Soft neutral surfaces.
Dark | `.dark` | Elevated contrast, mixed accent surfaces.
High Contrast | `.hc` | Strong borders, increased delineation, modified accent.

`ThemeToggle` cycles Light → Dark → High Contrast.

## 7. Motion Guidelines
- Use tokenized durations & easings.
- Avoid transform jiggle for reduced motion: check media query `motion-reduce`.
- Prefer subtle elevation & color change vs. large translate.

## 8. Buttons
- Variants: `default` (primary accent, glossy), `soft` (low emphasis accent), `outline`, `ghost`, `link`, feedback (`success|warning|info|destructive`).
- Sizes: `xs|sm|compact|default|lg|icon`.
- Radius: `sm|md|lg|pill` (mapped to tokens not raw tailwind classes where possible).
- Elevation handled via variant + subtle shadow ramp; avoid arbitrary shadows.
- Outline & ghost now use accent soft hover background for consistent affordance.

## 9. Pending / Next
Planned:
- Form density variants & inline validation pattern.
- Navigation collapse with progress indicators.
- Optimistic micro feedback (flash highlight) tokenized.
- Prefetch / code-split heuristics.
- Personalization layer: user preferences overriding theme/density/motion.

## 9a. Phase 4 Theming Depth (Implemented)
New tokens & utilities:
- Accent tiers: `--accent-soft-bg`, `--accent-subtle-border`, gradient fade (`--gradient-accent-fade`).
- Elevated neutral surfaces: `--surface-elev-1`, `--surface-elev-2` (light/dark/high-contrast tuned).
- Brand alias hooks: `--brand-accent*` for future palette swapping.
- Utility classes: `.surface-accent-soft`, `.surface-elev-1`, `.surface-elev-2`, `.border-accent-subtle`, `.bg-accent-fade`.
- Button primary now applies subtle top gloss gradient; added `soft` variant using accent soft background.

Usage guidance:
- Use `soft` button variant for low-emphasis accent actions within accent-surface contexts to avoid stacking strong chroma.
- Apply `.surface-elev-1` / `-2` sparingly to nested panels (analysis sidebars, secondary meta blocks) instead of arbitrary neutral tints.
- Gradient fade utility suitable behind hero/empty states (pair with reduced motion fade-in).
- For outlining accent emphasis without fill, combine `border-accent-subtle` + `text-[var(--semantic-accent)]`.

Do NOT mix raw Tailwind bg-* accent shades with these utilities—prefer semantic tokens for consistency across themes.

## 9b. Phase 2 Component Visual Polish (Completed)
Scope Delivered:
- Tabs: animated underline + soft accent hover/active background + weight ramp.
- Buttons: primary gloss overlay, added `soft` + `compact` size, outline/ghost soft hover background.
- Cards: unified padding scale (sm:16 / md:20 / lg:24) + optional inset divider in headers.
- Badges/Chips: new system (`solid|soft|outline|success|warning|critical|info`) with density + interactive states (legacy `default|secondary|destructive` removed).
- Empty State: gradient fade overlay (toggle), illustration sizing (sm/md/lg) + monochrome mode, motion-safe fade.
- Accent surfaces & elevation utilities applied consistently.

Badge Migration Mapping:
- `default` → `solid`
- `secondary` → `soft`
- `destructive` → `critical`
- Manual success/warning/info background classes → use `variant="success|warning|info"` unless specialized styling required.

Usage Notes:
- Prefer `soft` badges for meta attributes; reserve `solid` for high-signal status.
- For interactive badge chips, pass `interactive` to enable focus ring + hover brightness.
- Empty states: disable gradient with `subtleGradient={false}` if nested inside already accented surfaces.

Post-Phase Guardrails:
- Do not reintroduce old badge variants.
- New components must choose an elevation tier + provide an empty state using the standardized component.
- All future motion patterns must reference `--motion-*` tokens.

## 10. Contribution Rules
- Do not hardcode hex or spacing; use tokens.
- New components must document elevation tier + loading & empty states.
- All async UX must expose accessible status via live region.
- Add examples to forthcoming internal preview page before broad usage.

## 11. Linting (Planned)
Custom ESLint rules to flag: raw color hex, disallowed `space-y-*` values, arbitrary shadows.

---
Incremental adoption strategy: finish replacing legacy spinners → add form standardization → navigation enhancements → performance clean-up → personalization.
