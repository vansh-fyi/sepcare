# Pitfalls Research

**Domain:** Frontend rebuild (first-time UI) on an existing Next.js 16/Supabase backend, Tailwind v4 design system from salvaged assets, static-HTML-first prototyping, Supabase Realtime, and live ESP32 hardware integration — under a ~2-day hackathon deadline
**Researched:** 2026-09-25
**Confidence:** MEDIUM (cross-checked web sources for framework-specific pitfalls; domain-expertise/pattern-matching for hackathon demo-day and hardware-integration pitfalls, which are thin in the literature and treated as MEDIUM/LOW accordingly)

## Critical Pitfalls

### Pitfall 1: The static HTML prototype becomes a second app to maintain, not a step toward the first

**What goes wrong:**
Team builds the caregiver/parent HTML prototype with real interactivity (JS fetch calls, state, chart libraries wired directly), it "works," and demo pressure pushes everyone to keep iterating on it instead of porting to Next.js — because the port always looks like it can happen "after one more feature." Two-day deadline arrives with a polished static prototype and an unported, undeployed Next.js app, or a rushed last-minute port that skips verification.

**Why it happens:**
Static HTML has no build step, so visible progress is faster and more satisfying than working inside Next.js/React conventions (Server/Client Components, App Router file conventions). Under time pressure, the team optimizes for the metric they can see (does it look right in the browser) over the metric that matters (is it merged and deployed).

**How to avoid:**
Timebox the static-prototype phase explicitly and treat it as a design/interaction spec, not a shippable artifact — cap it at validating layout, component states, and the two role-based flows, not building full data-fetching logic. Decide the HTML→Next.js port cutover time before starting the prototype (e.g., "port begins at the midpoint of day 2, no matter what"), and build the prototype's markup using the same component boundaries (shadcn/ui primitives, same className patterns) it will have in React, so porting is a copy-and-wire-up job, not a rewrite.

**Warning signs:**
Prototype gaining new features/pages in the second half of the timeline; nobody has started the Next.js port by the midpoint; prototype JS growing complex state/fetch logic instead of static markup with placeholder data.

**Phase to address:**
Prototype phase (target phase 3) — enforce scope cap in the plan itself; Port phase (target phase 6) — start early, not "after prototype is done."

---

### Pitfall 2: Tailwind v4's `@theme` token bundle silently balloons or the old `tailwind.config.ts` mental model gets copy-pasted in and does nothing

**What goes wrong:**
Tailwind v4 removed the JS config file as the source of truth — tokens live in CSS via `@theme` in the global stylesheet. Teams that salvage a messy existing (AI-generated-looking) design system often bring over old `tailwind.config.ts` color/spacing definitions and are confused when they have no effect, or duplicate the same token in both `@config`-style JS and `@theme` CSS (CSS `@theme` wins silently, so half the palette looks wrong with no error). Separately, `@theme` block emits ~14kB of every default Tailwind CSS variable into the built CSS if the block isn't scoped down, so the "validated with sample HTML pages" bundle looks fine at prototype scale but bloats before demo.

**Why it happens:**
Tailwind v4 is a genuinely different config model from v3, and most existing tutorials, AI-generated boilerplate, and the "salvaged pieces of the messy AI-generic design system" mentioned in scope were almost certainly written for v3 patterns (JS config, `theme.extend`). Mixing paradigms produces no build error — it just silently doesn't apply.

**How to avoid:**
Before salvaging anything from the existing design system, confirm it targets Tailwind v4's CSS-first `@theme` syntax; if it's v3-style JS config, treat it as a reference for *values* (hex codes, spacing scale) to hand-copy into `@theme`, not a file to import. Keep `@theme` scoped to only the tokens the design system actually defines (colors, spacing, radii, font stacks) rather than re-declaring all Tailwind defaults. Validate with the sample HTML pages using an actual production build (`next build`), not just dev mode, since dev mode is more forgiving about unused/duplicate tokens.

**Warning signs:**
A color or spacing value defined in one place "doesn't show up"; CSS output size is much larger than the token list would suggest; sample HTML pages render correctly in dev but look different after a production build.

**Phase to address:**
Design system phase (target phase 2) — validate token application with a real build, not just live-reload, before moving to the prototype phase.

---

### Pitfall 3: `@apply`-based component abstractions from the salvaged design system break under Tailwind v4

**What goes wrong:**
If the messy existing design system used `@apply` inside custom CSS classes to compose component styles (common in AI-generated Tailwind output), Tailwind v4 handles `@apply` differently and these compositions can silently fail to include expected utilities, especially ones that reference theme values.

**Why it happens:**
Tailwind v4's engine and theme-resolution order changed; utility classes composed via `@apply` in custom CSS files no longer reliably resolve against `@theme` tokens the way v3's JS config did.

**How to avoid:**
Prefer component-level composition (React components wrapping Tailwind classNames, or `class-variance-authority`/`tailwind-variants` which is what shadcn/ui uses) over `@apply`-heavy custom CSS when porting salvaged pieces. Treat any `@apply` blocks found in the salvaged system as something to reimplement as component variants, not something to keep as-is.

**Warning signs:**
A "component class" applies fewer styles than expected; visual diffs between the salvaged system's original screenshots and the rebuilt version.

**Phase to address:**
Design system phase (target phase 2).

---

### Pitfall 4: Supabase Realtime subscriptions leak or silently stop delivering in App Router, and it's invisible until the live demo

**What goes wrong:**
This is a genuinely new integration for the frontend (backend so far only used Realtime server-side/for tests). Two related failure modes are common: (1) subscriptions created in a Client Component's `useEffect` without a cleanup function accumulate every time the component remounts (common during App Router navigation, since layouts/pages remount more than teams expect), leaking connections and eventually hitting free-tier connection limits; (2) a channel's subscription status flips to effectively-dead (e.g., after a backgrounded browser tab, laptop sleep, or brief WiFi drop) but the client-side state doesn't reflect it — the UI keeps showing the last value with no "disconnected" indicator, so a caregiver dashboard looks live but is frozen.

**Why it happens:**
`useEffect` cleanup (`return () => supabase.removeChannel(channel)`) is easy to forget under time pressure, and nothing fails loudly when it's missing — it just slowly degrades. Tab visibility changes and network blips are exactly the kind of edge case that never shows up in a quick manual test but reliably shows up during a real conference-room/demo-hall WiFi environment. The project's own known-flake note (`tests/realtime.subscribe.test.ts` intermittently timing out) is a preview of this exact class of problem.

**How to avoid:**
Every Realtime subscription in the new frontend must have a `useEffect` cleanup that calls `removeChannel`/`unsubscribe`, and subscriptions should be scoped to the component that owns them (not app-wide singletons unless deliberately built that way). Add an explicit, visible "live/stale" connection indicator on the caregiver view driven by the channel's actual subscribe/close/error status (not just "did we ever get a message") so a silent disconnect is visible to the person watching it, not just to the code. Test by deliberately toggling WiFi off/on and backgrounding the browser tab during a subscription, not just leaving it open on a fast connection.

**Warning signs:**
Dashboard shows a vitals reading that hasn't updated in an implausibly long time with no visual difference from "actually live"; browser dev tools show growing numbers of WebSocket connections after navigating between pages a few times.

**Phase to address:**
Port phase (target phase 6), when Realtime is first wired into the Next.js frontend — but the connection-status UI pattern should be designed during the prototype phase (target phase 3) so it isn't an afterthought bolted on at the end.

---

### Pitfall 5: Hydration mismatches from porting static HTML markup that used browser-only APIs or non-deterministic values

**What goes wrong:**
The static prototype likely uses vanilla JS or inline scripts touching `window`, `document`, `localStorage`, `Date.now()`/relative timestamps ("3 min ago"), or `Math.random()` for demo placeholder data. Ported into Next.js as-is, anything rendered on the server (the App Router default) that depends on these produces a server/client mismatch — React discards the server HTML and re-renders, which is slow and can cause a visible flash or layout jump exactly on the parts of the UI (risk badge color, timestamps) that matter most for a judge glancing at the screen.

**Why it happens:**
Static HTML has no server/client distinction, so nothing about it warns you which pieces are unsafe to server-render. This is invisible in `next dev` in many cases and only shows as a console warning, easy to miss under deadline pressure, but it degrades exactly the "trustworthy at a glance" quality the product depends on.

**How to avoid:**
Before porting, walk the prototype and flag every use of `window`, `document`, relative-time formatting, and random/mock data generation. Push those into Client Components (`'use client'`) placed as low in the tree as possible, or replace them with server-computed equivalents (compute the relative timestamp server-side, pass it down as a prop) where possible. Default everything else to Server Components per Next.js 16's App Router model.

**Warning signs:**
Console warnings about text/attribute mismatches between server and client render; a flash of different content (timestamp, risk color) right after page load.

**Phase to address:**
Port phase (target phase 6).

---

### Pitfall 6: shadcn/ui + Radix components ported from static HTML produce invalid HTML nesting or broken exit animations

**What goes wrong:**
Two specific, well-documented failure patterns recur when adding shadcn/ui to an App Router project: (1) composing shadcn's `Button`/`asChild` pattern incorrectly nests interactive elements (e.g., a `<button>` inside a `<button>`), which is invalid HTML and triggers hydration errors; (2) Radix primitives (Dialog, Popover, Tooltip, Sheet used for caregiver detail views) unmount from the DOM immediately on close by default, so Framer Motion exit animations never get a chance to play — the UI just "snaps" shut instead of animating, unless `forceMount` is used deliberately with the animation library.

**Why it happens:**
These are subtle API contracts specific to Radix's composition model that aren't obvious from reading the static HTML being ported (the prototype likely doesn't have this problem because it's not using Radix's actual mount/unmount lifecycle, just CSS transitions or nothing).

**How to avoid:**
When porting nav/modal/sheet/tooltip components from static HTML into their shadcn/Radix equivalents, check each for accidental nested-interactive-element markup, and explicitly decide (don't default-assume) whether exit animations are wanted — if so, wire `forceMount` + `AnimatePresence` deliberately rather than expecting it to work out of the box.

**Warning signs:**
Console hydration warnings mentioning invalid HTML nesting; a dialog/sheet that opens with an animation but closes instantly.

**Phase to address:**
Port phase (target phase 6); worth a quick check during the prototype phase (target phase 3) too if Radix components are used there directly rather than plain HTML.

---

### Pitfall 7: The repo-cleanup pass under-archives, and an AI coding agent (or a rushed human) still gets confused mid-build

**What goes wrong:**
Cleanup phase 1 is explicitly meant to prevent stale context from confusing agents during the remaining 5 phases. If cleanup is shallow — e.g., archiving obviously-named duplicate folders but leaving stale docs referencing the old nRF52840/BLE/Raspberry Pi architecture, or leaving multiple partially-overlapping "frontend-design" folders where only one is canonical — later phases (especially the design-system and prototype phases, run under time pressure) end up citing or importing from the wrong source, costing more time than the cleanup saved.

**Why it happens:**
Cleanup is boring and low-visibility compared to building features, so it's the phase most likely to get truncated when the 2-day clock is already ticking. "Archive the obvious stuff" is a much lower bar than "confirm nothing stale remains referenceable."

**How to avoid:**
Explicitly enumerate which single folder/file is canonical for each of: design reference (Figma export or notes), existing design-system CSS to salvage from, and any prior frontend prototype attempts — then archive everything else, including partial duplicates, rather than just the most obviously off-topic material (unrelated SDG brainstorm docs). Leave a short pointer note (even one line in CLAUDE.md or a README) stating which folder is canonical, since "it's just archived, not deleted" doesn't stop an agent from finding and citing the archived copy if it's still in a discoverable path.

**Warning signs:**
More than one folder plausibly named "design system" or "frontend" remains un-archived; grep for "Raspberry Pi" or "nRF52840" or "BLE" still returns hits outside `context/` historical docs and hardware SOT superseded-decision notes.

**Phase to address:**
Cleanup phase (target phase 1) — treat "single canonical source per concern" as the actual success criterion, not "some things got archived."

---

### Pitfall 8: Backend gap-fill built reactively, one field at a time, instead of against the prototype's actual data contract

**What goes wrong:**
Phase 4 (backend gap-fill) is scoped to happen *after* the prototype exists, driven by "whatever the prototype needs." Under time pressure this tends to become a series of small, uncoordinated additions (add a field here, a new endpoint there) discovered one broken prototype screen at a time, rather than a single reviewed pass — increasing total round-trips and risking a late-discovered gap (e.g., a chart needing a data shape the API can't produce) that lands after the hardware-integration phase has already assumed a fixed API surface.

**Why it happens:**
The ordering in the milestone (prototype → gap-fill → hardware → port) is sound, but "whatever the prototype needs" is easy to interpret as "fix it when it breaks" instead of "extract a complete list from the finished prototype before touching the backend."

**How to avoid:**
At the end of the prototype phase, produce one explicit list of every data point, field, and query pattern both views (caregiver + parent) require, diffed against what the existing API (`GET /api/readings`, Realtime channels, risk_scores join) already provides — then do gap-fill as one deliberate pass against that list, not many small reactive patches. This also naturally produces the check the milestone goal calls for ("checked against what the backend can realistically supply") before hardware and port phases lock in assumptions.

**Warning signs:**
Gap-fill commits with messages like "oops, also need X" appearing during the hardware or port phases rather than during the dedicated gap-fill phase.

**Phase to address:**
Prototype phase (target phase 3, as an explicit output) feeding gap-fill phase (target phase 4).

---

### Pitfall 9: Hardware integration happens against a moving frontend/backend target, and failures get misattributed

**What goes wrong:**
Phase 5 (hardware integration) lands after the design system and prototype are built but before the Next.js port (phase 6) — meaning the live ESP32 is validated against the *old* frontend/API surface, then the port happens afterward and re-touches the same ingest/read paths. If something breaks post-port (e.g., a schema tweak made during gap-fill, or a Realtime channel name/shape change made while porting), it's easy to misattribute the failure to "the hardware" (flaky sensor, bad solder joint) when it's actually a software regression, wasting debugging time on the wrong layer right before the demo.

**Why it happens:**
Hardware bugs and software regressions produce similar symptoms (no data arriving, stale dashboard, wrong values) and the team has less intuition for debugging embedded/WiFi issues than web issues, so the instinct under pressure is to blame the newer/less-familiar layer.

**How to avoid:**
After the Next.js port (phase 6) is deployed, re-run the exact same hardware-validation checklist used in phase 5 (not just "it looks fine") before calling the milestone done — the milestone description already says "hardware-validated against the live deployment," so treat that as a mandatory final gate, not optional polish. Keep a one-page checklist from phase 5 (device boots, connects to WiFi, POSTs successfully, appears in DB, computes risk score, appears in dashboard) and re-run it verbatim post-port. When something breaks post-port, check API/schema diffs from the gap-fill and port phases first before assuming a hardware fault.

**Warning signs:**
"No data since the deploy" reported as a hardware issue without first checking Vercel/Supabase logs for the ingest request actually arriving and succeeding.

**Phase to address:**
Hardware phase (target phase 5, define the checklist) — Port phase (target phase 6, mandatory re-run of that same checklist before demo).

---

### Pitfall 10: Demo-day environment (venue WiFi, device power, screen sharing) isn't the same environment anything was tested in

**What goes wrong:**
The most common cause of IoT hackathon demo failure is not the code or the device itself but the live venue's network: conference/hackathon WiFi is frequently congested, captive-portal-gated, or on a guest VLAN that blocks the device-to-cloud traffic pattern that worked fine on a home/office network. Separately, a laptop switching from the dev WiFi network to venue WiFi for the live demo can silently break a cached Supabase session, a hardcoded local API URL, or trigger the stale-Realtime-connection issue from Pitfall 4 at the worst possible moment. Device battery/power (LiPo charge state, USB power bank reliability) is a second common, boring failure mode that gets deprioritized under software time pressure.

**Why it happens:**
Teams test extensively on networks they control and rarely rehearse the exact demo setup (venue WiFi, projector/screen-share, cold device boot) until it's too late to fix anything discovered.

**How to avoid:**
Rehearse the actual demo sequence — cold-boot the device, connect to whatever network will be used (or a worst-case simulated flaky one), load the live Vercel URL fresh (not a cached tab), and let it run for several minutes — at least once before the judged demo, not just "it worked when I was building it." Have a fallback: a short pre-recorded clip or a set of static screenshots of the dashboard mid-Red-alert state, so a live WiFi failure doesn't end the demo. Confirm the device's power source (charged battery + verified backup) independent of the software work. If the venue network is unknown/unreliable, test whether the device can use a phone hotspot as a fallback WiFi credential, since ESP32 WiFi setup is typically hardcoded per-network.

**Warning signs:**
The only successful end-to-end test happened on home/lab WiFi; nobody has done a full cold-boot dry run within 24 hours of the demo slot; no fallback visual exists if live data doesn't arrive.

**Phase to address:**
Hardware phase (target phase 5) and Port phase (target phase 6) should both budget explicit time for a dry-run rehearsal on demo-like conditions, not just feature completion.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|-----------------|------------------|
| Hardcoding demo device ID / single-baby profile in frontend components | Saves building device-switching UI nobody needs for v1.1 | Blocks multi-device support (already deferred to v2) without a refactor | Acceptable for this milestone — matches existing single-device backend scope |
| Skipping the connection-status/stale-data indicator on the Realtime feed | One less UI state to design under deadline | Silent-freeze failure mode (Pitfall 4) becomes a real demo-day risk | Never acceptable given the demo-day stakes — cheap to add, high cost to skip |
| Copying shadcn/ui components without reading their Radix composition contract | Fast to drop in and move on | Hydration/animation bugs (Pitfall 6) surface late, often during final integration | Acceptable only if a quick post-port visual/console check is still done |
| Leaving `GET /api/readings` without an auth gate (existing tech debt) | No new auth work needed for demo | Data is publicly readable if the URL leaks; irrelevant to judges but a real gap | Acceptable for a judged single-device demo; must be closed before any real deployment |
| Building the static prototype with real fetch/Realtime wiring instead of mock data | Prototype feels "real" sooner | Blurs the prototype/port line (Pitfall 1), wastes port-phase time re-verifying logic already built once | Never — prototype should use static/mock data by design |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|-----------------|-------------------|
| Supabase Realtime (Client Components) | Subscribing in `useEffect` without a cleanup/`removeChannel` call; assuming "last message received" means "connected" | Always cleanup on unmount; drive a visible connection-status UI off actual channel status events, not just message receipt |
| Tailwind v4 `@theme` + salvaged CSS | Bringing over v3-style `tailwind.config.ts` token definitions and expecting them to apply, or duplicating a token in both places | Treat old config as a values reference only; define all tokens once, in `@theme`, in the CSS-first model |
| shadcn/ui + Radix + Framer Motion | Assuming exit animations "just work" once Framer Motion is installed | Explicitly wire `forceMount` on Radix primitives when an exit animation is required; test unmount behavior, not just mount |
| Static HTML → Next.js port | Porting inline `<script>` DOM logic verbatim into Server Components | Audit for `window`/`document`/`Date.now()`/`Math.random()` first; isolate into `'use client'` leaves or precompute server-side |
| ESP32 → deployed Vercel/Supabase pipeline | Validating hardware only against `localhost`/dev API URL, not the actual deployed Vercel URL and production Supabase project | Point the device at the real deployed endpoint during phase 5 validation, and re-validate after the phase 6 port/redeploy |
| Vercel free-tier deploy of a data-heavier frontend | Adding heavy client bundles (charting lib + Framer Motion + Radix full set) without checking bundle size until deploy day | Check `next build` output size during the port phase, not only at final deploy, given the free-tier's function/edge limits and demo-day load-time stakes |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|-----------------|
| Unscoped `@theme` block pulling in all Tailwind v4 default tokens | Larger-than-expected CSS bundle, slower first paint on demo WiFi | Scope `@theme` to only tokens the design system defines | Noticeable once venue WiFi is slow — exactly demo conditions |
| Charting library (Recharts/Tremor) re-rendering on every Realtime tick without memoization | Chart stutters or CPU spikes as data streams in live during the demo | Debounce/throttle Realtime-driven chart updates; memoize chart data transforms | Becomes visible the moment live hardware starts streaming continuously, which is exactly demo day |
| Framer Motion animating layout-affecting properties (width/height) instead of transform/opacity | Janky transitions on the caregiver view's frequent state changes (risk color, vitals updates) | Animate transform/opacity; reserve layout animation for deliberate, infrequent transitions | Shows up under any sustained live-data load, i.e. the actual demo |
| Multiple independent Realtime subscriptions per page instead of one shared channel | Extra WebSocket connections, more surface for the free-tier connection-limit issue in Pitfall 4 | Consolidate subscriptions per page/view where the schema allows it | Free-tier connection caps or accumulated leaked channels during navigation-heavy demo clicking |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Reusing the existing device API key pattern for any new frontend-facing write path added during gap-fill | Frontend build could accidentally expose or hardcode the device secret in client bundle | Keep device auth server-side only; any new frontend writes should go through a route handler, never call a device-authenticated endpoint directly from the client |
| Leaving `GET /api/readings` unauthenticated (existing tech debt) while now exposing a public, judge-visible URL | Third parties at a public demo event could hit the endpoint directly, though impact is low for a single-device demo | Acceptable to leave for demo, but don't compound it — new endpoints added in gap-fill should not repeat the same pattern without a deliberate reason |
| Supabase Realtime channels scoped too broadly (e.g., subscribing to entire tables instead of filtered per-device) | Not a real privacy issue for a single-device demo, but sets a bad pattern that would leak cross-device data in the deferred multi-device v2 | Filter Realtime subscriptions by device/reading scope now, so the pattern is already correct when multi-device support is built later |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-------------------|
| Risk badge (Green/Amber/Red) freezing on a stale value with no visual "last updated" cue | Caregiver/judge can't tell whether the system is live or dead — undermines the entire "trustworthy signal" value proposition | Pair every risk status with a visible timestamp and a connection-status indicator (Pitfall 4) |
| Parent view inheriting caregiver-view density because it reuses the same components without deliberate abstraction | Parent view stops being "abstracted, no nav" and just becomes a worse caregiver view | Design parent-view components as intentionally reduced variants (fewer data points, no nav, "See All" links out), not the caregiver view with things hidden via CSS |
| Chart/animation flourishes (Framer Motion) competing with the risk signal for attention | Distracts from the one thing that matters in a 2-minute judged demo — the traffic-light status | Reserve motion for state transitions on the risk indicator itself; keep everything else understated per the animation skill's restraint guidance |
| No offline/error state designed for when Realtime or the API is unreachable | Blank or broken-looking screen if WiFi hiccups mid-demo, reading as "the product is broken" rather than "network blip" | Design an explicit, calm "reconnecting…" state as a first-class UI state, not an afterthought |

## "Looks Done But Isn't" Checklist

- [ ] **Realtime dashboard:** Often missing a genuine disconnect test — verify by toggling WiFi off/on mid-session and confirming the UI shows a stale/reconnecting state, not a silently frozen "live" one.
- [ ] **Tailwind v4 design system:** Often validated only in `next dev` — verify token application survives a full `next build` (production CSS output).
- [ ] **Ported prototype pages:** Often missing a check for hydration warnings — verify by checking the browser console on first load of each ported page, not just visual appearance.
- [ ] **Hardware-to-cloud pipeline:** Often validated only against a dev/local API URL — verify the physical device is pointed at and successfully posting to the actual deployed Vercel + Supabase production endpoint.
- [ ] **Caregiver vs. parent views:** Often the parent view is "caregiver view with nav hidden" rather than a genuinely reduced information set — verify against the milestone's explicit "abstracted, no nav, See All links" intent.
- [ ] **Repo cleanup:** Often archives the obviously off-topic material but leaves stale duplicates of the design-system/frontend-handoff folders discoverable — verify only one canonical folder per concern remains reachable.
- [ ] **Demo dry run:** Often skipped entirely under time pressure — verify a full cold-boot-to-dashboard rehearsal has happened at least once on demo-like network conditions before the judged slot.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|----------------|------------------|
| Prototype/port line blurred (Pitfall 1) | MEDIUM | Freeze the prototype immediately, extract its component markup/classNames as the port's starting point rather than rewriting from scratch, and treat any remaining prototype-only interactivity as out of scope for the port |
| Tailwind v4 token confusion (Pitfall 2/3) | LOW | Grep the codebase for `tailwind.config` remnants and `@apply` blocks referencing salvaged classes; move values into `@theme`, replace `@apply` compositions with component variants one at a time |
| Realtime leak/stale-connection discovered late (Pitfall 4) | LOW–MEDIUM | Add cleanup functions and a status-driven UI indicator; this is a contained, mechanical fix once diagnosed, but diagnosis itself can eat time if discovered during the live demo rather than beforehand |
| Hydration mismatches after port (Pitfall 5/6) | LOW | Console errors point directly at the offending component; wrap in `'use client'` or move the non-deterministic logic server-side |
| Hardware validated pre-port only, breaks post-port (Pitfall 9) | MEDIUM | Re-run the phase 5 hardware checklist immediately after the phase 6 deploy; diff recent gap-fill/port commits against the API surface the device expects before assuming a hardware fault |
| Demo-day WiFi failure with no fallback (Pitfall 10) | HIGH (if no fallback exists) / LOW (if one does) | If prepared: switch to the pre-recorded clip or static screenshots seamlessly; if not prepared, narrate through the architecture using the code/dashboard from a screen recording taken during a successful earlier test run |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|-------------------|----------------|
| Prototype becomes a second app (1) | Prototype phase (3) | Explicit timebox and mock-data-only rule stated in the phase plan; port phase (6) start date fixed in advance |
| Tailwind v4 `@theme` token confusion (2) | Design system phase (2) | Production `next build` run against the sample HTML pages before calling the design system validated |
| `@apply`-based salvage breaks (3) | Design system phase (2) | Visual diff of salvaged components pre/post-rebuild |
| Supabase Realtime leaks/stale connection (4) | Port phase (6), UI pattern designed in phase (3) | Manual WiFi-toggle test against the live dashboard; connection-status indicator present and correct |
| Hydration mismatches on port (5) | Port phase (6) | Browser console clean of hydration warnings on every ported page |
| shadcn/Radix/Framer Motion composition bugs (6) | Port phase (6) | No invalid HTML nesting warnings; exit animations behave as designed on Dialog/Sheet/Popover components |
| Under-archived repo cleanup (7) | Cleanup phase (1) | Single canonical folder per concern (design reference, salvaged CSS, prior prototypes); grep for stale architecture terms returns no live hits |
| Reactive, piecemeal backend gap-fill (8) | Prototype phase (3) output → Gap-fill phase (4) | One consolidated data-contract diff produced at end of phase 3, used as the phase 4 task list |
| Hardware validated against a moving target (9) | Hardware phase (5), re-verified in Port phase (6) | Same hardware checklist passes both before and after the phase 6 deploy |
| Demo-day WiFi/power/environment failure (10) | Hardware phase (5) and Port phase (6) | At least one full dry run on demo-like network conditions with a fallback (recording/screenshots) prepared |

## Sources

- [Tailwind CSS v3 to v4 Migration Guide: Next.js Steps & Gotchas](https://dev.to/nayankyada/how-i-migrated-a-large-nextjs-project-from-tailwind-css-v3-to-v4-133e) — MEDIUM confidence (cross-checked against multiple independent migration write-ups)
- [Upgrading to Tailwind v4: Missing Defaults, Broken Dark Mode, and Config Issues (tailwindlabs/tailwindcss Discussion #16517)](https://github.com/tailwindlabs/tailwindcss/discussions/16517) — MEDIUM confidence (official repo discussion thread)
- [Fix: Tailwind v4 Not Working — @theme, CSS-First Config, PostCSS vs Vite](https://fixdevs.com/blog/tailwind-v4-not-working/) — MEDIUM confidence
- [Supabase Realtime Not Receiving Events: Complete Fix](https://www.iloveblogs.blog/post/supabase-realtime-subscription-not-receiving-events) — MEDIUM confidence
- [10 Common Mistakes Building with Next.js and Supabase](https://www.iloveblogs.blog/post/nextjs-supabase-common-mistakes) — MEDIUM confidence
- [Supabase Realtime Gotchas: 7 Issues and How to Fix Them](https://dev.to/mahdi_benrhouma_fe1c6005/supabase-realtime-gotchas-7-issues-and-how-to-fix-them-1hmp) — MEDIUM confidence
- [My realtime subscriptions get terminated and I cannot recover them (supabase/discussions#5312)](https://github.com/orgs/supabase/discussions/5312) — MEDIUM confidence (official repo discussion, corroborates project's own known Realtime test flake)
- [Next.js App Router: common mistakes and how to fix them](https://upsun.com/blog/avoid-common-mistakes-with-next-js-app-router/) — MEDIUM confidence
- [The Good, The Bad, and The Hydration Errors: Migrating a Production React SPA to Next.js App Router](https://dev.to/mhk_sameera/the-good-the-bad-and-the-hydration-errors-migrating-a-production-react-spa-to-nextjs-app-router-2hmd) — MEDIUM confidence
- [Migrating: App Router (official Next.js docs)](https://nextjs.org/docs/app/guides/migrating/app-router-migration) — HIGH confidence (official documentation)
- [[bug]: Hydration failed in Next.js SSR when using shadcn/ui Button (shadcn-ui/ui#8930)](https://github.com/shadcn-ui/ui/issues/8930) — MEDIUM confidence (official repo issue)
- [How I use Framer Motion with Next.js App Router without layout shift](https://dev.to/nayankyada/how-i-use-framer-motion-with-nextjs-app-router-without-layout-shift-4378) — MEDIUM confidence
- [Master Shadcn Framer Motion: Animate Components in 5 Steps](https://shadcnstudio.com/blog/shadcn-framer-motion/) — MEDIUM confidence
- [10 IoT Mistakes Even Smart Teams Keep Making](https://www.iotforall.com/common-iot-mistakes) — LOW–MEDIUM confidence (general IoT-deployment pattern, not hackathon-specific; applied here by inference)
- [Gautier DI FOLCO — How to fail a hackathon](https://gautier.difolco.dev/2026-07/hackathon) — LOW confidence (single-author personal account, used only for general demo-day-pressure framing, not technical claims)
- Project-internal source: `.planning/PROJECT.md` known tech debt (unauthenticated `GET /api/readings`, known Realtime test flake) — HIGH confidence (first-party project record)

---
*Pitfalls research for: Next.js/Supabase frontend rebuild + Tailwind v4 design system + static-HTML prototyping + Supabase Realtime + ESP32 hardware integration, hackathon timeline*
*Researched: 2026-09-25*
