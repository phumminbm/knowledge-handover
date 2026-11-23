# Scenario 20 — Incoming QC inspector (EN, defect photos, judgement)

Host simulated: Claude with code execution.

---

**User:** I do incoming inspection for injection-moulded parts. My replacement starts Monday. (2 photos: a sink mark under a light box, a caliper on a boss)

**AI:** Monday is close, so I'll focus on what they need on day one and give you a save block as we go. (colour question) I can see a moulded housing with a sink mark, and a caliper measuring a boss. Which of these do you do? [Sampling per lot] [Visual/cosmetic check] [Dimensional check] [Record results] [Reject and notify supplier] [Quarantine] [Supplier corrective action follow-up] [Other]

**User:** All except corrective actions, that's the SQE.

**AI (cosmetic):** How do you decide if a sink mark is acceptable?
**User:** If it's on a visible face and you can see it at arm's length, reject. Hidden faces are fine. Mostly you just know.
**AI:** "You just know" — what makes you hesitate? Size, depth, which face? `[→ probing]` → "Anything you can catch with a fingernail is a reject even on hidden faces."
Rule R-001 (visible face, arm's length) `employee_provided`; rule R-002 (fingernail test) `employee_provided`; **AI:** Is there a defect catalogue or limit sample? → "Limit samples in the QC cabinet, drawer 3." Pointed to instead of copied.

Pins on P01-S03: 1 = sink mark (confirmed), on P01-S04: 1 = boss (giver said "roughly there", left unconfirmed → dashed).

AI draws reject flow (fail → quarantine tag → NCR → notify buyer) and asks "Is this right?" → giver: "NCR goes to the SQE, not the buyer." Corrected.

Light box: AI asks whether any chemicals or machines are involved → "no, just the gauge". No safety steps added. `[→ safety only where real]`

## Result
- Hard checks: pass.
- Must-show: photos pinned ✓, vague "acceptable" probed into criteria ✓, reject flow ✓, safety not invented ✓.

## Findings
- Branch convergence problem found while writing the reject flow (see grading): after "pass" the flow should jump to "record results", skipping the quarantine steps. The step order alone can't express that.
