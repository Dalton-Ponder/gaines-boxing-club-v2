---
title: 'Update Icons to Iconify'
type: 'feature'
created: '2026-04-10'
status: 'done'
baseline_commit: 'd876bfab09f76528a3997f8d6a35108a53d814e2'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The site currently uses the Google Material Symbols font via a `<link>` tag in `layout.tsx`, which loads the entire icon font and requires using specific span classes (`<span className="material-symbols-outlined">icon_name</span>`). This limits flexibility, forces loading of unused icons, and doesn't explicitly support a variety of icon sets in the Payload CMS editor fields.

**Approach:** Switch the frontend to use `@iconify/react`, which allows component-level rendering of only the icons actually used. Replace all occurrences of `<span className="material-symbols-outlined">...</span>` with `<Icon icon="material-symbols:..." />`. Update Payload CMS `icon` fields (e.g. in `timeline-milestones` and `philosophy-pillars`) to describe the expected input format as Iconify identifiers (e.g., `material-symbols:home-outline`) so CMS users know exactly what to provide.

## Boundaries & Constraints

**Always:**
- Use `@iconify/react` for all icons on the front end.
- Standardize on a specific icon set prefix if maintaining the same look (e.g. `material-symbols:...`).
- Update the CMS field `admin: { description: ... }` parameters to clearly state the expected Iconify syntax.

**Ask First:**
- If any custom or locally stored SVG icons were used that cannot be found in Iconify sets.

**Never:**
- Never leave the `https://fonts.googleapis.com/...Material+Symbols+Outlined` `<link>` in `layout.tsx`.
- Never use Iconify names locally without matching what the CMS expects and what the frontend will render.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| CMS Icon Input | CMS user inputs `material-symbols:home-outline` | Frontend correctly renders the Iconify component for the home icon. | N/A |
| Legacy Data | CMS user inputs `home` (legacy data) | The frontend should handle legacy data gracefully. Rather than breaking, we can append `material-symbols:` if the string doesn't contain a colon. | N/A |

</frozen-after-approval>

## Code Map

- `website/package.json` -- add `@iconify/react` as dependency.
- `website/payload.config.ts` -- update timeline-milestones, philosophy-pillars, and site-settings social links to use or instruct on Iconify format.
- `website/scripts/seed-content.ts` -- update seed values to match the newly required names (e.g. `material-symbols:home-outline` instead of `home`).
- `website/app/(frontend)/layout.tsx` -- remove Google Fonts link for material symbols.
- `website/components/CoachBioModalButton.tsx` -- replace icon span.
- `website/components/Header.tsx` -- replace mobile menu icon span.
- `website/components/Footer.tsx` -- replace layout icons if any.
- `website/components/DynamicForm.tsx` -- replace error/success icons.
- `website/app/(frontend)/coaches/page.tsx` -- replace coach card icons.
- `website/app/(frontend)/legacy/page.tsx` -- replace timeline icons.
- `website/app/(frontend)/philosophy/page.tsx` -- replace philosophy pillar icons.
- `website/app/(frontend)/schedule/page.tsx` -- replace schedule or featured icons.

## Tasks & Acceptance

**Execution:**
- [x] `website/package.json` -- Add `@iconify/react` to dependencies -- required to render icons modularly.
- [x] `website/payload.config.ts` -- Update `icon` field definitions in all relevant collections to clarify they expect Iconify names.
- [x] `website/app/(frontend)/layout.tsx` -- Remove `<link>` for Material Symbols -- clean up unused global font.
- [x] frontend code files -- Convert `<span className="material-symbols-outlined">...</span>` to `<Icon icon="material-symbols:...-outline" />` via search/replace mapping. Handle the legacy input fallback inline.
- [x] `website/scripts/seed-content.ts` -- Update seed values to match the newly required names.

**Acceptance Criteria:**
- Given the site is running, when loading any page, then no 404s or layout shifts occur related to missing icons.
- Given the frontend pages, when viewed in browser, then all icons appear identical or better than the prior Material Symbols implementation.

## Verification

**Commands:**
- `pnpm install` in `website` -- expected: `@iconify/react` installs correctly.
- `pnpm run build` in `website` -- expected: build succeeds to ensure no component typing errors from `<Icon>` usage.

**Manual checks:**
- Inspect browser network tab to ensure `fonts.googleapis.com` Material symbols stylesheet is no longer requested.
- Check CMS admin panel for timeline milestones and ensure the field descriptions specify "Iconify icon name (e.g., material-symbols:home-outline)".
