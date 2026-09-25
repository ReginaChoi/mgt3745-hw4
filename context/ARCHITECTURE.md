# Architecture

Decisions, in order. An ADR is never edited after it is accepted; it is superseded.

## The Gate: HW4 rerun

Where should entries live now that they must survive a cleared cache?

**Feature under decision:** still F-03, the evidence log, now considering where the evidenced/not-yet-evidenced state and its attached text actually live, since ADR-001's answer (the browser) no longer holds once a student clears their cache or switches devices.

**Three concrete options, rescored:** Build (my own Cloudflare Worker and D1 database, what I actually did this week); Buy (a hosted backend-as-a-service such as Supabase or Firebase, with its own dashboard and tables); Delegate (an AI builder such as bolt.new generates and hosts the backend for me).

**Weights kept from HW3, with one change and a reason.** Switching cost moves from 2 to 4. In HW3 I was guessing at what a future migration would cost; this week I actually moved data from localStorage to D1, wrote the schema, and rewired app.js, so I now weight switching cost higher because I know a future move is real hours, not a hypothetical annoyance.

| Criterion | Weight | Build (Worker + D1) | Buy (hosted BaaS) | Delegate (AI builder hosts it) |
|---|---:|---:|---:|---:|
| Cost to start | 4 | 5 (20) | 3 (12) | 4 (16) |
| Cost to maintain | 3 | 4 (12) | 3 (9) | 3 (9) |
| Time to working | 4 | 3 (12) | 4 (16) | 5 (20) |
| Inspectability | 5 | 5 (25) | 2 (10) | 2 (10) |
| Switching cost | 4 | 4 (16) | 2 (8) | 1 (4) |
| Fit to spec | 5 | 5 (25) | 3 (15) | 3 (15) |
| **Weighted total** | | **110** | **70** | **74** |

Notes on a few scores. Build's time-to-working is only a 3, not a 5, because Session B took real troubleshooting (the D1 binding, CORS preflight, pasting the database id correctly); it worked, but not on the first try. Build's switching cost is a 4, not a 5, because D1's export format is Cloudflare's own, not a fully generic dump; leaving still takes real work, just less than rebuilding an integration against a vendor's API. Buy and Delegate both score low on inspectability for the same reason as HW3: I cannot fully verify logic I did not write and cannot see, and this course grades attestation, not confidence. Delegate scores lowest on switching cost because I do not know what format an AI-builder host would even export to; that uncertainty is itself the risk, not just a low number.

Build still wins clearly, and by a wider margin than in HW3, because the switching-cost weight increase rewards the option that gave me the most control the last time I actually had to move something.

## ADR-002: Entries move from localStorage to Cloudflare D1

**Title and date:** ADR-002: Move evidence-log entries from browser localStorage to a Cloudflare Worker with D1. 9/24/2026

**Status:** Accepted

**Supersedes:** ADR-001

**Door / concrete acquisition and execution choice:** Build. A Cloudflare Worker (worker.js) fronting a D1 database, replacing the two localStorage calls in app.js with fetch calls to the deployed Worker.

**Context:** What crosses, to whom, under what terms, and who is accountable, since ADR-001 explicitly named this decision as the thing that would eventually need revisiting. What crosses: the text a student types as evidence, plus which career path and skill it is attached to. To which vendor: Cloudflare, through a Worker I deployed and a D1 database I created. Under what terms: Cloudflare's free-tier terms for Workers and D1, which include Cloudflare logging request metadata (IP address, timestamp) by default, whether or not I asked for that. Who is accountable: I am. I hold the wrangler login for this project, I chose the free tier, and there is no other party administering this data on my behalf.

**Decision:** I will replace the two localStorage lines in app.js with fetch calls to a Worker I deploy, storing evidence in a D1 table with one row per piece of evidence, and I will add one server-side validation rule (AC-8, evidence text length) that the client already checks but that a request could otherwise skip by reaching the Worker directly.

**Alternatives considered:** Buy scored 70 in the rerun. A hosted backend-as-a-service like Supabase would have worked, but its tables and API are shaped for its own conventions, not for the specific evidenced/not-yet-evidenced state my spec needs, and I would be trusting its dashboard rather than reading my own schema. Delegate scored 74. An AI builder such as bolt.new could likely stand up something that runs, but I would have the least ability to verify it actually enforces AC-8 or handles a failed write the way STANDARDS.md requires, and I would not know how to get my data back out if I needed to leave.

**Consequences:**

Easier: evidence now survives a cleared cache and follows the student to a different browser or device, which is the exact limitation ADR-001 named as its own weakness. I can also add a real server-side validation rule, which the browser-only version could never enforce against a request that skipped the page entirely.

Harder, and what this still does not fix: there is no per-user separation in the evidence table. Anyone who has the deployed URL can see and add to the same shared rows; nothing about this build distinguishes one student's evidence from another's. Offline use is also gone. The HW3 version worked with no network at all; this version cannot load or save anything without reaching Cloudflare, which is a real regression for a student without reliable wifi. Testing is also harder now, since triggering a failure (a bad response, an unreachable server) requires deliberately breaking something rather than just reading the code.

**Revisit trigger:** when a second real student needs their own private evidence, separate from anyone else using the deployed URL. That is ADR-003 territory: some form of per-user identity, which this build does not have and was never asked to have this week.

---

## ADR-001: Store entries in localStorage

**Status:** Superseded by ADR-002

**Title and date:** ADR-001: Hand-build the evidence log as three static files with browser localStorage. 9/17/2026

**Door / concrete acquisition and execution choice:** Build. Three files at the repository root (index.html, styles.css, app.js), no framework, no dependencies, no server, with state persisted to localStorage under a single namespaced key.

**Context:** The budget is zero and the deadline is one week. The spec needs a per-skill state that changes when evidence is attached, which a generic form-and-spreadsheet service stores only awkwardly. The data is one student's own record and never needs to leave their browser, so there is no requirement that justifies a server or an account. Against that, I am a first-time coder, which makes hand-building the slowest option and makes reviewing generated code unreliable, since I would be approving work I cannot actually check. The course also requires that I be able to inspect a delegated build later, and I have not built one yet.

**Decision:** I will hand-build the evidence log as three static files with localStorage persistence, implementing Behavior steps 1 through 5, and defer the in-progress state, the export, and the inactive-path rule.

**Consequences and revisit trigger:**

Easier: I can read and explain every line, so my verification section reports what I actually observed rather than what I hoped. Switching is nearly free, since three files with no dependencies can be discarded. Fit to the selected F-03 feature is strong because I wrote the implementation directly against the feature's required behavior. The deferred states and export are outside this build slice.

Harder, and what this fails to do: localStorage is per-browser and per-profile, so a student who uses a lab machine and then a laptop sees two unrelated records, and clearing browser data destroys everything with no recovery. That is a real failure of the tool's actual purpose, since evidence a student cannot retrieve at interview time is not evidence. The build also does not address what INT-03 identified as her real gap. She did not lack a way to record experience; she lacked the internship. A tool that logs evidence cannot create any, and no architecture choice fixes that.

Revisit trigger: when Module 4 introduces a database, or sooner if a second interview confirms that students use more than one machine. At that point this ADR is marked Superseded by ADR-002; the reasoning above was still true under a zero budget and a one-week deadline.