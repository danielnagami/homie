# Plan: Fix Create/Edit Task Dialog Unreachable Title Field on Mobile Safari

## Overview
On Mobile Safari, the "Create Task" / "Edit Task" bottom-sheet dialog renders
with the **Task Name** field (and drag handle / header) pushed above the
visible viewport, with no way to scroll it into view. Users can't tap into
the title input at all. This plan traces the root cause in the shared
`Modal` component and `CreateTaskForm`, and lays out a fix.

## Root Cause Analysis

The dialog is rendered by [web/src/components/Modal.tsx](web/src/components/Modal.tsx):

```tsx
<div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/35 px-4 backdrop-blur-sm sm:items-center">
  ...
  <section className="relative w-full max-w-md rounded-t-[2.25rem] rounded-b-4xl bg-white p-5 shadow-soft sm:rounded-4xl">
    ...
    {children}
  </section>
</div>
```

Key problems:

1. **No `max-height` / internal scroll on the sheet.** The `<section>` panel
   has no `max-h-*` and no `overflow-y-auto`. It sizes to its content's
   natural height. `CreateTaskForm` ([web/src/features/tasks/CreateTaskForm.tsx](web/src/features/tasks/CreateTaskForm.tsx))
   is a long form (title input, points stepper, recurrence, assignee picker,
   icon grid, room input, two buttons) — its rendered height regularly
   exceeds a phone's viewport height. Because the parent is `items-end`
   (bottom-sheet anchored to the bottom edge), a too-tall panel overflows
   **upward past the top of the screen**, and since neither the flex
   container nor the panel scrolls, the overflowed portion — which includes
   the drag handle, dialog title, and the very first field, **Task Name** —
   is simply unreachable. There is no scrollbar and no touch-scroll target
   that would bring it into view.
2. **Mobile Safari's on-screen keyboard makes it worse.** When the user taps
   any input, Safari's keyboard consumes a large portion of the viewport.
   Because the layout uses `fixed inset-0` (viewport-relative, not adjusted
   for the keyboard) and the page has no dynamic-viewport-aware sizing
   (`index.html` sets `viewport-fit=cover`, but nothing reacts to the
   keyboard), the effective visible area shrinks further, pushing even more
   of the sheet — including the title field — off-screen.
3. **No scroll escape hatch.** The backdrop button
   (`absolute inset-0`) closes the modal on tap but provides no scroll
   affordance, and the app shell's own scroll container
   ([web/src/app/AppLayout.tsx](web/src/app/AppLayout.tsx), `overflow-hidden`)
   is irrelevant here since the modal portals directly to `document.body`
   — but that also means there's no ancestor that could rescue the layout by
   scrolling.

This reproduces on any small-viewport browser in principle, but it's most
visible on Mobile Safari because of how aggressively its keyboard shrinks
the visual viewport and because Safari doesn't auto-scroll fixed-position
ancestors the way some browsers attempt to.

## Architecture / Approach

Constrain the modal panel to a safe maximum height and make it internally
scrollable, so long forms (like `CreateTaskForm`) always keep their full
content — including the first field — reachable regardless of keyboard
state or viewport size.

1. **Cap panel height and enable internal scroll** in `Modal.tsx`:
   - Add `max-h-[85dvh]` (dynamic viewport height, Safari-aware) or a safer
     `max-h-[calc(100dvh-2rem)]` to the `<section>` panel.
   - Add `overflow-y-auto overscroll-contain` to the panel so its content
     scrolls independently of the backdrop when it exceeds the cap.
   - Keep the drag handle / header inside the scroll region (simplest), or
     optionally split the panel into a fixed header + scrollable body if we
     want the header always pinned — start with the simpler full-scroll
     approach since it directly fixes the reachability bug.
2. **Verify the outer flex container still centers/anchors correctly** once
   the panel has a capped height — `items-end` on mobile should still look
   like a bottom sheet, just one that scrolls internally instead of
   overflowing off-screen.
3. **Sanity-check `dvh` fallback.** `dvh` is supported in modern Mobile
   Safari (iOS 15.4+) and already used elsewhere in the codebase
   (`min-h-dvh`, `min-h-[calc(100dvh-4rem)]` in `AppLayout.tsx`), so this is
   consistent with existing conventions and needs no additional polyfill.
4. **No changes needed in `CreateTaskForm.tsx` itself** — the fix is
   isolated to the shared `Modal` component and will apply to every dialog
   in the app (task create/edit, and any future modals), not just this one.

## File/Folder Structure

No new files. Modified:
- [web/src/components/Modal.tsx](web/src/components/Modal.tsx) — add capped
  height + internal scroll to the panel.

## Task Breakdown

1. **Update `Modal.tsx` panel styling** to add `max-h-[85dvh]` (or
   `calc(100dvh-2rem)`), `overflow-y-auto`, and `overscroll-contain` on the
   `<section>` element.
2. **Manually verify on a real Mobile Safari device/simulator** (not just
   Chrome DevTools device emulation, which doesn't reproduce Safari's
   viewport/keyboard quirks) that:
   - Opening "Create Task" shows the Task Name field immediately.
   - Tapping into Task Name to bring up the keyboard still leaves the field
     visible/scrollable into view.
   - The rest of the form (points, recurrence, assignee, icons, room,
     buttons) remains reachable by scrolling within the sheet.
3. **Spot-check other `Modal` consumers** in the app (search for `<Modal`
   usages beyond `ManageTasksPage.tsx`) to confirm the height cap doesn't
   visually regress any shorter dialogs (should be a no-op for them since
   `max-h` only constrains, it doesn't force a fixed height).
4. **Regression-check desktop (`sm:` breakpoint)** where the modal is
   centered rather than bottom-anchored, to ensure the max-height/scroll
   behavior looks acceptable there too (large screens are unlikely to hit
   the cap, but worth a quick visual check).

## Risks / Open Questions

- **`dvh` browser support**: fine for target Mobile Safari versions and
  already relied upon elsewhere in the app; no action needed.
- **Visual regression risk**: adding `overflow-y-auto` could introduce a
  visible scrollbar or clip rounded corners on some browsers if not paired
  correctly with `rounded-t-[2.25rem]`/`rounded-b-4xl` — verify the scroll
  region doesn't visually cut off the rounded corners (may need to move the
  scroll to an inner wrapper div if so, keeping the rounded corners on the
  outer `<section>`).
- **Keyboard-avoidance beyond scroll**: this fix guarantees the field is
  *reachable* via scroll, but doesn't auto-scroll the focused input above
  the keyboard. If further testing shows Safari doesn't auto-scroll focused
  inputs into view within the new scrollable region, a follow-up may be
  needed (e.g. `element.scrollIntoView()` on focus), but this is likely
  unnecessary since Safari does this natively for scrollable ancestors,
  which the current fix introduces for the first time.
