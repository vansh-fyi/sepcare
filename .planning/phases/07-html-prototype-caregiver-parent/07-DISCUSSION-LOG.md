# Phase 7: HTML Prototype (Caregiver + Parent) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-30
**Phase:** 7-HTML Prototype (Caregiver + Parent)
**Areas discussed:** Prototype format & reuse strategy, Parent navigation flow specifics (PARENT-05), Data source: real field names vs live wiring, Caregiver Settings tab & data-contract diff scope

---

## Prototype format & reuse strategy

| Option | Description | Selected |
|--------|-------------|----------|
| New Next.js routes reusing Phase 6 components | Real routes importing existing components, fixture data not live Supabase | ✓ |
| Detached static HTML files | Like the old archived `frontend-design/` tree | |
| Something else / hybrid | User-described alternative | |

**User's choice:** New Next.js routes reusing Phase 6 components.
**Notes:** "The phase should build real routes, real [Next].js route. I think it was mentioned in the previous phase also. We are scrapping the idea of using HTML. We are making it directly in [Next].js and testing it out and then updating backend into it." This formally resolves Phase 6's 06-CONTEXT.md D-11 flag, left open since 2026-09-27.

---

## Parent navigation flow specifics (PARENT-05)

### "See All" destination

| Option | Description | Selected |
|--------|-------------|----------|
| Two tabs: Vitals and Stats | Matches caregiver's own Vitals/Stats screens | ✓ |
| Single combined screen, no tabs | One scrollable screen | |
| Different split | User-described alternative | |

**User's choice:** Two tabs: Vitals and Stats.

### Device icon destination

| Option | Description | Selected |
|--------|-------------|----------|
| Device Details only | Skip the list screen, single-device v1 demo | |
| Select Device list → Device Details | Full original two-step flow from archived Flow 4 | ✓ |
| Different destination | User-described alternative | |

**User's choice:** Select Device list → Device Details.

---

## Data source: real field names vs live wiring

**Note:** This area expanded significantly beyond the original framing once the six-vs-four-field gap and hardware-vs-firmware question surfaced. Three sequential questions were asked.

### Q1 — How should fixture data handle the 6-summary vs 4-real-field gap?

| Option | Description | Selected |
|--------|-------------|----------|
| Fixtures shaped like real API, derive what we can, flag the rest | Compute 3 real, flag 3 unavailable | (superseded by Q3, see below) |
| Keep all six illustrative | No partial derivation | |
| Different approach | User-described alternative | ✓ (routed to research question) |

**User's response:** "Can you read through the research papers?... this concept was researched back and we need to use the exact formulas using the sensor data we are given to calculate these things." Directed the discussion to read `context/implementation-plans/neonatal-sepsis-armband.md` §7.1.1 before deciding.

### Q2 — Given §7.1.1's formulas need raw PPG/IMU data the ESP32 payload doesn't send, how should Phase 7 handle the 3 ungrounded signals?

**User's response (a genuine technical question, answered before re-asking):** "How can we calculate the other [3], are we missing something in the hardware??" — answered factually: the sensors (MAX30102, MPU6050) are physically capable, but v1 firmware only extracts summary fields (`heartRate`, `spo2`, `temperature`, `activityScore`), not raw beat-intervals/PPG-amplitude-ratio/IMU-periodicity needed for HRV/Perfusion Index/Respiratory Pattern. This is a firmware+schema gap (already flagged as `RISK-V2-01` in PROJECT.md), not a missing part.

### Q3 — Given that's real firmware/backend work, how should Phase 7 proceed?

| Option | Description | Selected |
|--------|-------------|----------|
| Compute the real 3, mark other 3 unavailable, flag for Phase 8/9 | Full 6-signal UI kept, gap surfaced honestly | ✓ (via user's own framing, see notes) |
| Drop to a 3-signal vitals view for this phase | Hide the 3 ungrounded signals entirely | |

**User's choice:** Effectively the first option, reframed in the user's own words rather than picked verbatim.
**Notes:** "See this is a front-end only task, whatever we build, has to be built/updated in backend, that is the goal, to make a front end and have backend match it in next phase, we can't compromise or drop anything, you understand. We are not participating in any competition anymore and we are building this product very seriously." Locked as: full six-signal UI stays, 3 real formulas wired now, 3 ungrounded signals shown with an explicit "not yet available" state (not hidden, not faked), gap becomes Phase 8/9's headline input via the data-contract diff.

---

## Caregiver Settings tab & data-contract diff scope

### Settings tab content

| Option | Description | Selected |
|--------|-------------|----------|
| Same Device Details content as parent's device-icon flow | One shared device screen for both entry points | ✓ |
| Richer caregiver-only settings | Additional controls beyond device management | |
| Different content | User-described alternative | |

**User's choice:** Same Device Details content as the parent's device-icon flow.

### Data-contract diff format

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated markdown doc in the phase directory | e.g. `07-DATA-CONTRACT-DIFF.md`, feeds Phase 8 planning | ✓ |
| Inline TODO/gap comments in fixture files | No separate document | |

**User's choice:** A dedicated markdown doc in the phase directory.

---

## Claude's Discretion

- Exact Next.js route grouping/naming for the caregiver and parent prototype routes.
- Exact fixture-data file location/format (must match real `GET /api/readings` response shape).
- How to visually represent the Select Device list when only one device is real.
- Exact filename/structure of the data-contract diff document.
- Exact copy/wording for the "awaiting firmware/backend support" state on the 3 ungrounded vital summaries.

## Deferred Ideas

- Actually closing the HRV/Perfusion Index/Respiratory Pattern data gap (firmware + backend schema work) — Phase 8/9, not Phase 7.
- `GET /api/readings/latest` — already a named Phase 8 success criterion.
- Updating ROADMAP.md's Phase 7/10 wording to match the resolved Next.js-native format (D-01/D-02) — recommended follow-up, not blocking.
- Richer caregiver-only Settings controls beyond device management — out of scope per the Settings-tab decision above.
