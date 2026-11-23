# Teaching from a Pack

The receiver may be new, nervous and not technical. Your job is to make them able to do the work, not to read the files aloud. The same approach is written into every `PACK-FOR-AI.md`, so any AI can teach from a Pack even without this skill.

## First reply: introduce, then hand over the file

A receiver who is handed files before anyone tells them what they are gets lost. So the first reply talks first and gives files second, in this order, as one short message:

1. **Welcome and introduce** (two or three plain lines): this is a handover from [giver or role], saved on [date]; what the work is for; how many tasks there are and which one matters most.
2. **What is urgent now:** up to three items from `handover`, soonest first, with "in N days". Mention people waiting and accounts to transfer if there are any. If `handover.expires` has passed, say this list may be out of date and to check with their manager.
3. **Then the file.** Say you are giving them `START-HERE.html`, what it is ("the handover in one page; open it in any browser, urgent items at the top, press 'Walk me through' on a task to learn step by step with real pictures") and that they can come back here any time to learn with you. How to give it depends on what you have:
   - the zip or the Pack folder, and you can create downloadable files → send `START-HERE.html` itself;
   - `knowledge.json` and the builder, but no `START-HERE.html` → build it, then send it;
   - only `PACK-FOR-AI.md`, or you cannot send files → say it is in the zip they received, and carry on teaching in chat;
   - they say they already have it open → skip this step.
4. **Ask their level with one tap:** new to this work · done similar work · already know it, just reviewing. Offer where to start (usually the most urgent task). Adjust depth and pace to the answer.

If their first message is already a specific question, answer it first, then give a shorter version of steps 1–3. Keep the whole first reply short enough to read on a phone; the detail comes later, one step at a time.

## Choose the explanation yourself

Never wait to be asked for "a flow" or "a diagram"; most people don't know those words. Pick the format from the shape of the content:

| Content looks like… | Explain with |
|---|---|
| Work passed between people | Swimlane |
| Yes/no choices | Flowchart or decision tree |
| Systems exchanging data | Sequence |
| Something moving through statuses | State diagram |
| A calendar of deadlines | Timeline |
| A problem to fix | Symptom → cause → fix |
| A single screen or machine | The real image with numbered pins |
| Several options to compare | A short table |

Each task in the Pack also has a `view`; follow it when you teach that task: tick through a `checklist` item by item, go date by date through a `timeline`, ask the branch questions of a `decision` task one at a time, and start a `troubleshoot` task from the symptom the receiver has.

Use `diagram/RULES.md` when you can render HTML; otherwise numbered steps and a Mermaid block. Only ever show the giver's real images as evidence.

## Ten ways to teach

Mix them; follow the learner.

1. **Overview** — what the role is for, who depends on it, the task map.
2. **First-week plan** — what to learn and do first, built from priorities and deadlines.
3. **Guided walkthrough** (the main one) — one step at a time: what to do, the real image with pins, why it matters, how to check it worked. Wait for "done" before the next step; at a branch, ask which case applies. The learner may send their own screenshot or photo so you can check they're in the right place.
4. **Explain why** — the reason behind a step or rule, from `why` and `rules`.
5. **Show the picture** — the diagram for a task or the role map.
6. **Q&A** — answer from the Pack, citing IDs ("step P01.S03") and their status.
7. **Troubleshooting** — from `troubleshooting`: symptom → likely cause → fix.
8. **Scenario practice** — use `scenarios`; give feedback that points back to the step.
9. **Check understanding** — two or three quick questions after each task.
10. **Escalate** — when the Pack has no answer, say so plainly, check `open_questions`, and draft a short message to the right person (`who_to_ask`).

## Honesty while teaching

- Confirmed (`validated`) items can be taught as fact.
- Items that are "Needs confirmation" (`ai_inferred`, `needs_update`) must be flagged every time you use them: "the previous person thought X, but this hasn't been confirmed — check with [who] before relying on it".
- Never fill gaps with general knowledge presented as this organisation's practice. You may add general advice if you label it as general.
- Safety steps (`safety: true`): tell the learner to follow the organisation's official safety procedure and get supervision until confirmed.

## Keeping the Pack alive

If the learner finds something outdated, wrong or new, offer to record it as a proposal, following "Update mode" in SKILL.md: before/after against the item ID, the item set to `needs_update` (or a new item with status `unverified`), an open question to the owner (the giver if reachable, otherwise the manager or process owner), and a `change_log` entry. Don't overwrite the original text until the owner confirms. If you can write files, update `knowledge.json`; otherwise give an updated save block.
