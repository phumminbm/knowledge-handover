# Test run 1 — 2026-11-23

**How this was run.** All 20 scenarios were simulated by the same model that wrote the skill: it played both the user (from the persona notes) and the AI (following SKILL.md and the references as written). That makes this a check that the instructions cover each situation, not proof that a real model on another host behaves the same. Real-host runs with real people are still needed.

Packs were built with the real builder for six professions, and every walkthrough path was clicked through in a headless browser at 1280px and 390px.

## Summary

| # | Scenario | Result | Gap found |
|---|---|---|---|
| 1 | Expense claims clerk | Pass | — |
| 2 | Order-to-invoice, 3 systems | Pass | — |
| 3 | Tax invoice with screenshots | Pass | — |
| 4 | Credit limits, "judgement" | Pass | — |
| 5 | Interview stops midway | Pass | — |
| 6 | Month-end, old SOP conflicts | Pass | — |
| 7 | Payroll, password offered | Pass | — |
| 8 | Receiver, PACK-FOR-AI.md only | Pass | — |
| 9 | Air-con technician | Pass | Colour asked first; per-step "who can do it" taps; image saving |
| 10 | OR nurse | Pass | Point to official records; "who can do it" taps |
| 11 | Resume from save block | Pass | — |
| 12 | Update mode | Pass (behaviour) | SKILL.md and teaching.md contradicted each other; "owner" undefined |
| 13 | Receiver uploads the zip | Pass | — |
| 14 | Head cook | Pass | Colour first; needed vs private data (supplier) |
| 15 | Warehouse stock controller | **Fail → fixed** | Walkthrough fell from "small difference" into the "large difference" steps |
| 16 | Medical device sales | Pass (improvised) | Needed vs private data (customers, discounts) |
| 17 | Teacher | Pass (improvised) | Pupils' health details |
| 18 | Sole sysadmin | Pass | Rotate a pasted secret |
| 19 | Convenience store supervisor | Pass (improvised) | Staff phone numbers |
| 20 | QC inspector | Pass | Same branch problem as 15 (avoided only by step order) |

## Fixes made

1. **New step field `next`** (step ID or `"end"`): branches can now rejoin or end early. The page, Mermaid output, Markdown files and validator all use it. The builder now warns when a branch option falls straight into a sibling option without `next`. The example pack sets `next` explicitly.
2. **Needed vs private data:** keep what the successor needs (which customers, suppliers, systems); for personal contacts, health or family details about anyone, prices and salaries, point to the official record (CRM, register, patient system, shift app) instead of copying. (SKILL.md hard line 5, `images-and-safety.md`.)
3. **Pasted secrets:** leave them out and tell the giver to change them.
4. **Colour question moved** from the opening to just before the first build (still asked for every pack). Diagrams during the interview use the default orange.
5. **"Who can do it" labels:** confirmed as one list per task; for hands-on work, propose "human only" and ask one question about what AI could draft.
6. **Update mode:** one rule everywhere — propose before/after, mark `needs_update`, open question to the owner (the giver if reachable, else manager or process owner), apply only after confirmation.
7. **File-capable hosts** save uploaded images under step names themselves.
8. **Default expiry** for the urgent list: two weeks after the giver's last day.
9. Page: overview no longer draws a connecting line between steps that don't follow each other; the active tab scrolls fully into view on phones.

## Still to do with real people
- Run at least scenarios 1, 9, 13 and 16 on Claude, ChatGPT and a free text-only chat, with a real person typing.
- Check save-block length on free chats with 5+ tasks.
- Open a generated START-HERE.html on a real phone.
