# Scenario 15 — Warehouse stock controller (EN, two systems, forklift area)

Host simulated: Claude with code execution.

---

**User:** I'm the only one who does cycle counts and handles stock discrepancies in our warehouse. Leaving in 3 weeks.

**AI:** Three weeks is enough to do this properly. I'll ask short questions and build a pack your successor can open on any device; I'll save files as we go and give you a save block for new chats. `[→ start]` (colour question asked here too)

**AI:** Which of these do you do? [Cycle counts] [Investigate discrepancies] [Adjust stock in the system] [Receiving checks] [Returns] [Month-end stock report] [Slow-mover review] [Other] → giver ticks counts, discrepancies, adjustments, month-end report.

**AI:** Where is stock recorded? → "The WMS, plus my spreadsheet of known issues." **AI:** If they disagree, which one wins? `[→ source of truth]` → "WMS for quantities; spreadsheet only explains why." Recorded with `source_of_truth`.

**AI:** When a count differs, what do you do? → "It depends on the value." **AI:** On what exactly — a value, a percentage, the item type? `[→ probing "it depends"]` → "Over 5,000 baht or any serialised item, I recount and tell the manager; under that I adjust myself."
**AI:** Is 5,000 a company threshold or yours? `[→ number with no source]` → "Company policy, SOP-WH-12." Rule R-001 `source_supported`.

AI draws a decision tree (difference → value/serialised? → recount → still wrong? → manager) and asks "Is this right?" → giver adds "check the putaway log for the last 7 days before recounting".

Upper racking counts need a forklift → **AI** marks step as safety and asks: who is licensed? → "Only licensed drivers; I ask Somchai." Recorded as `safety: true`, actor "licensed forklift driver".

Two practice scenarios written from what the giver said. Review, build, handover message.

## Result
- Hard checks: pass.
- Must-show: source of truth ✓, decision tree drawn unprompted ✓, forklift step safety ✓, quizzes ✓.

## Findings
- No new gaps. Colour-first again felt slightly off but less so for an office-adjacent giver.
