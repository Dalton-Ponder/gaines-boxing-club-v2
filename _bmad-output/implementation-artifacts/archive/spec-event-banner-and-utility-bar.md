---
title: 'Event Banner and Utility Bar'
type: 'feature'
created: '2026-04-10T04:42:00'
status: 'in-review'
baseline_commit: 'd876bfab09f76528a3997f8d6a35108a53d814e2'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The website lacks a persistent way to broadcast short, important messages (alert banners) and a dedicated high-visibility area to display the training schedule above the main navigation.

**Approach:** Implement a new Payload CMS collection (`alert-banners`) to manage multiple alerts with icons and copy content. Add a Utility Bar component at the very top of the page (above the main `<Header>`) to stack and render both the alert banners (which alternate background colors starting with the brand orange) and the training schedule.

## Boundaries & Constraints

**Always:**
- Fetch data using React Server Components or the current Next.js data fetching paradigm.
- Maintain responsive design (stacking properly on mobile).
- Keep banners accessible (ARIA roles for alerts, screen reader text for icons).

**Ask First:**
- Hardcoding any banner content outside of the CMS.
- Overriding the `DESIGN.md` tokens for the alert backgrounds (need to use the official brand orange).

**Never:**
- Move the `Header` layout outside the overarching layout without ensuring `z-index` and position fixed still function appropriately.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Active Banners | CMS returns 2 alert banners | Both banners render sequentially in the top bar. First banner has an orange background, second has a contrasting color. | N/A |
| No Banners | CMS returns 0 alert banners | The banner section is not rendered, only the Training Schedule shows in the utility bar. | N/A |
| Schedule Data | Training Schedule exists in CMS | Render the schedule seamlessly in the utility bar. | Handle empty schedule securely. |

</frozen-after-approval>

## Code Map

- `website/payload.config.ts` -- Register the new `alert-banners` collection.
- `website/collections/AlertBanners.ts` -- Define the new `AlertBanners` schema containing `icon`, `copy`, and `isActive` boolean.
- `website/app/(frontend)/layout.tsx` -- Update to import and render the `UtilityBar` component above the `Header`.
- `website/components/UtilityBar.tsx` -- NEW file: Server component that fetches `alert-banners` and `training-schedule` to render the persistent bar above `Header.tsx`.
- `website/components/Header.tsx` -- Ensure the `Header` accounts for the `UtilityBar` in its `fixed` positioning, likely wrapping `UtilityBar` and `Header` in a unified `fixed` top container.

## Tasks & Acceptance

**Execution:**
- [x] `website/collections/AlertBanners.ts` -- Create the new collection schema for `alert-banners` with `icon` (text), `copy` (textarea), and `isActive` (checkbox).
- [x] `website/payload.config.ts` -- Add `alert-banners` to Payload `collections` array and MCP plugin configuration.
- [x] `website/components/UtilityBar.tsx` -- Create Server Component to fetch active `alert-banners` and `training-schedule`. Map over banners applying alternating background colors (index 0 = bg-primary, index 1 = bg-secondary, etc.). Render the training schedules prominently beneath/beside banners.
- [x] `website/components/Header.tsx` -- Adjust css positioning. With `UtilityBar`, both might need to be sticky/fixed, or wrapped in a `TopNavigationLayout` so that `fixed top-0 z-50` pushes the rest of the page down properly.
- [x] `website/app/(frontend)/layout.tsx` -- Render the updated navigation structure.

**Acceptance Criteria:**
- Given a user visits the homepage, when alert banners and training schedules are present in the DB, then they see the Utility Bar at the top of the viewport above the main Header.
- Given 3 active alert banners, when they render, then banner 1 uses the branded Orange background (`bg-primary`), banner 2 uses a contrasting brand background, and banner 3 alternates again.

## Design Notes
The Utility Bar should be composed of stacked horizontal bands:
1. Event Banners (stacking vertically if multiple, or a single sliding display if desired, though requirements suggest multiple banners stack with alternating colors).
2. The Training Schedule, possibly rendered as a slim marquee or inline list of items `Day: Time - Time` to keep vertical height manageable.

## Verification

**Commands:**
- `pnpm dev` -- expected: App compiles successfully.

**Manual checks (if no CLI):**
- Create multiple Alert Banners in the local Payload CMS. Check if the alternating colors apply correctly.
- Ensure the sticky Header behavior isn't broken and the Training Schedule is cleanly visible above it.
