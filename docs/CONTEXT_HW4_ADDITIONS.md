# HW4 Additions for Your Context Files

This is reference material from the template, kept here in case it is useful to compare against. The actual context/ARCHITECTURE.md, context/FEATURES.md, context/STANDARDS.md, and context/CLAUDE.md in this repository already have these additions applied, adapted to the evidence-log feature rather than the template's generic "entries" example.

## ARCHITECTURE.md: pasted above ADR-001

The Gate rerun table and ADR-002 are already in context/ARCHITECTURE.md, above ADR-001. ADR-001's status line reads `Superseded by ADR-002`; nothing else in it was edited.

## FEATURES.md: added to the Verification table

The new HW4 Verification rows (survive cleared cache, server unreachable, server returns 400, server returns 500, second client writes to the same table) are already in context/FEATURES.md, along with the new EARS statement (AC-8) for the evidence-length validation rule added to worker.js.

## STANDARDS.md: three new rules

Already added as rules 7 through 9 in context/STANDARDS.md: no string-concatenated SQL, no credential in the repository, and failed requests shown on the page rather than thrown to the console.

## CLAUDE.md: restated for the agent

Already restated in context/CLAUDE.md's Rules section.