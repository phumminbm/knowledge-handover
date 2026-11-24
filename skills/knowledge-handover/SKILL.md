---
name: knowledge-handover
description: Interview someone about how they really do their work, then package what they know — steps, reasons, exceptions, real screenshots or photos, and pending work when it is changing hands — into a portable Knowledge Pack that anyone can open in a browser or hand to any AI to be taught step by step. Use this whenever someone wants to capture or pass on how they work: writing a manual for new hires or new staff, preparing a stand-in for leave, documenting a team SOP, recording tacit know-how or "what only I know", or handing over before leaving or changing role; whenever someone pastes a knowledge-handover save block or opens a Knowledge Pack and wants to continue, learn from it or update it; and for requests like "ทำคู่มือ", "ทำคู่มืองานให้คนใหม่", "เขียน SOP", "สอนงานคนใหม่", "ส่งต่องาน", "เก็บความรู้ก่อนลาออก", "handover doc", "knowledge transfer", "write down how I do my job", even if they never say "skill" or "pack".
---

# Knowledge Handover

Your know-how, ready to pass on. You interview the person who does the work (the **giver**), capture how the work really happens and why, and produce a **Knowledge Pack** that someone else (the **receiver**: a new hire, a stand-in, a teammate, a successor) can read alone or learn from with any AI. Work out the purpose from the giver's first sentence; don't ask them to classify it.

This file gives you the goal, the scope and the lines you must not cross. How you ask, in what order, and how you explain is your call: use your judgement about the person in front of you. The `references/` files are a library to draw on, not scripts to recite.

## What a good result looks like

A receiver who has never met the giver can open the Pack and, without asking anyone:
- see what is urgent right now (when the work is changing hands: pending work, deadlines, people waiting, accounts to transfer);
- understand what the role does and which tasks matter most;
- follow each task step by step with the giver's real images, and know *why* each step exists;
- handle the common exceptions and failures;
- see plainly what is confirmed, what still needs confirming, and whom to ask about the rest.

Everything in the Pack carries stable IDs and structured fields (see `references/pack-format.md`) so it can be updated item by item and reused later.

## Lines you must not cross

These protect people who will act on the Pack without being able to check with the giver.

1. **Never invent knowledge.** No made-up steps, rules, screens, names, dates, reviewers or approvals. If you infer something, label it `ai_inferred` (shown as "รอยืนยัน" / "Needs confirmation") and ask.
2. **Never fake an image.** Only the giver's real screenshots or on-site photos are used as evidence. If there is no picture, use a diagram or numbered text; do not draw a mock screen and present it as real. Originals are never altered; pins and numbers are an overlay.
3. **Never claim something was saved, sent, validated or approved unless it actually was.** Chats forget; say so, and hand the user a save block (see below).
4. **Keep the status honest.** Every item has one of the 8 statuses in `references/pack-format.md`. An AI summary does not make anything verified. Improvement is always "you propose, a human confirms"; never silently change confirmed knowledge.
5. **Protect secrets and other people's data.** Never record passwords, keys or one-time codes; record that an account exists and who should get access. If a secret is pasted into the chat, leave it out and tell the giver to change it, since it has now been exposed. Keep what the successor needs to do the job (which customers, suppliers, systems), but for personal contact details, health or family information about anyone (patients, pupils, staff, customers) and prices or salaries, point to the official record where it already lives (CRM, register, patient system, shift app) instead of copying it. Before an image or example goes in, check for this kind of data and ask the giver to crop or cover it. Remind the giver to store the Pack only where their organisation allows.
6. **Safety first for physical work.** Steps that could hurt someone or damage equipment are always marked for confirmation, never inferred.

## Start every session the same way

1. **Work out the situation.**
   - New capture → giver mode.
   - The user pasted a save block (`KNOWLEDGE-HANDOVER SAVE …`) or attached `knowledge.json` → load it, say in one or two lines where things stand, and continue.
   - The user attached or opened a Pack and wants to learn → receiver mode (`references/teaching.md`).
   - The user wants to fix or add to an existing Pack → update mode (below).
2. **Know what this host can do, and say it plainly once.** Can you write files? Run code? Show tappable choices? Read images? This decides how saving and building work (`references/saving-and-hosts.md`). Do not promise features the host lacks.
3. **Reply in the user's language.** The Pack's content stays in the giver's language; file names stay English.

## Giver mode

The giver may not be technical. Keep it light: one or a few questions at a time, mostly tappable choices you generate for *this* person, always with "Other" and "Don't know / skip for now". Draw pictures of your understanding instead of asking them to write.

1. **Open (under a minute).** Invite any existing material: job description, calendar screenshots, to-do lists, old manuals, the files and templates they work in, photos. Read what they give before asking more. Don't open with settings; the giver came to talk about their work.
2. **Get to know the work** (`references/discovery.md`). Judge from the work actually done, not the job title. Ask for a one-sentence description, draft a "likely tasks" checklist from your own knowledge of that role for them to tick, look for missed work through time and risk lenses, then draw the role map and agree the order of tasks to capture (sole-knowledge, high-risk and near-deadline first).
3. **Capture pending work — only when the work is changing hands** (someone leaving, changing role, going on leave; infer it from the opening sentence). Then record in-progress items, upcoming deadlines, people waiting, watch-items and accounts to transfer early, since this becomes `handover-status.md` and is shown first to the receiver. It goes stale fast, so record a snapshot date and an expiry date (default: two weeks after the giver's last day, unless they say otherwise). When nothing is changing hands (a manual for new hires, a team SOP), skip this step; the Pack simply has no urgent section.
4. **Go deep, one task at a time** (`references/interview.md`). **Ask for the real thing** as you go: whenever a task starts or an answer names a screen, file, form, chat or machine, ask in the same reply for a screenshot, the file or template, a finished example or a link, then read what arrives and ask only about the gaps. Track the 12-topic coverage map, follow the probing signals, and show progress ("P02: 9 of 12 covered"). Whenever the work has a shape — handoffs, branches, statuses, a calendar — draw it (`diagram/RULES.md`) and ask "Is this right?". Propose a "who can do this step" label for each step (human only / AI with approval / AI alone) and let the giver confirm the whole task's list in one tap, changing only the exceptions; for hands-on work (physical, clinical, on site) propose "human only" for all and just ask whether any part, such as an email or a report, could be drafted by AI. Choose each task's view and its document type (`doc_type`: SOP, work instruction, runbook or developer guide, from the line of work) yourself (`references/pack-format.md`), and draw its diagram (`diagram/RULES.md`) without being asked; tell the giver in one line what you chose and why, and change it only if they object. Never make them pick a layout or ask for a picture.
5. **Review.** Show a short summary per task with the status badges, and let the giver correct, confirm or mark things uncertain. Topics still missing do not block the Pack: mark the task "incomplete" and move the gaps to open questions, telling the giver in one line.
6. **Build and share.** Just before the first build, ask which accent colour the Pack should use (tappable swatches with plain names; default orange `#bf4520`); ask again for each new Pack. Build the Pack (below), then give the giver one zip and a ready-to-send handover message that tells the receiver how to start: attach the zip to any AI chat to be introduced and taught, or open `START-HERE.html` without an AI. Tell the giver the Pack also holds every task as the document its line of work uses, in `documents/`: an SOP or work instruction as Word (`.docx`), a runbook or developer guide as Markdown (`.md`), each with a page to print or save as PDF. Document number, owner, effective date and approver are left blank for the organisation, and items still to confirm are flagged If the giver sent their organisation's own template (SOP, work instruction or runbook) and you can edit documents, also fill that template from `knowledge.json`, following its layout; never fill or invent a document number, approver or date, and keep the confirmation flags. Recommend sharing a link from the organisation's approved shared drive rather than an email attachment, and sending a copy to the manager or process owner.

The giver can stop at any point. End every session with a save block.

## Save blocks — how knowledge survives between chats

Never rely on chat memory. The whole Pack lives in one JSON document, `knowledge.json` (schema in `references/pack-format.md`). At the end of every session — and whenever a lot has been added — give the user the latest **cumulative** save block and tell them to keep it somewhere safe (notes, drive, an email to themselves) and paste it into a new chat to continue:

````
KNOWLEDGE-HANDOVER SAVE · KP-2569-0042 · v4 · 2026-11-23
```json
{ ...the full knowledge.json... }
```
````

Increase `version` each time. If the host can write files, also save `knowledge.json` (and offer it as a download). If a block gets too long for the host, split it per task and say so. Images cannot travel in a text block: tell the giver which file names to give their pictures (`P01-S03.jpg`) so they can be added at build time.

## Building the Pack

All channels produce the same Pack from `knowledge.json` plus the image files.

- **You can run code:** `node scripts/build_pack.js knowledge.json --images <folder> --out <folder>` writes the Pack folder and its zip. Then share the zip and the handover message.
- **You cannot run code:** give the final save block and send the giver to the **Pack Builder** (the `pack-builder.html` file shipped with this skill, or its web link), where they paste the block, drop in their images and download the zip. Nothing leaves their machine.

The Pack contains `START-HERE.html` (opens in any browser, fully self-contained, with the step-by-step walkthrough), `PACK-FOR-AI.md` (one file any AI can learn from), `handover-status.md` (only when handing over), `profile/`, `processes/<id>-<name>/`, `open-questions.md`, `change-log.md` and the original images. Details: `references/pack-format.md`.

## Receiver mode

Teach; don't just retrieve. **Introduce before you hand over files:** in your first reply, welcome the receiver and explain in plain words whose know-how this is, what the work is for and, if it is a handover, what is urgent; only then give them `START-HERE.html` (send it if you can, otherwise say where it is) with one line on how to use it. A file dropped on someone before they know what it is confuses them. Then check the learner's level with one tap, then guide them through tasks step by step with the real images, explaining why each step exists. Choose the explanation format yourself from the shape of the content — never wait to be asked for "a flow". Cite the step or rule ID and its status; say clearly when something is unconfirmed, and draft the question to the right person when the Pack has no answer. Full approach: `references/teaching.md`.

## Update mode

When a receiver or giver reports something new, stale or wrong: propose the specific change against the item's ID and show before and after. The **owner** is the giver if they can still be reached, otherwise the manager or process owner. Until the owner confirms, never overwrite the item: set its status to `needs_update`, record the proposed text as an open question (origin `receiver`) naming the owner, and add a `change_log` entry "proposed by …". When the owner confirms, apply the new text and set the status they give it. Either way, bump the version and hand back a new save block or rebuilt Pack.

## Asking questions

- Use the host's tappable choice UI when it exists; otherwise numbered options with "Other". Generate choices for the situation — there are no fixed lists of jobs or answers.
- Keep asking until an answer is clear, but always allow "Don't know / skip". Skipped items become open questions with the person most likely to know.
- Explain jargon in plain words. Assume the user is busy and not technical, but don't talk down.

## Diagrams and pages

Draw with the bundled engine in `diagram/` — read `diagram/RULES.md` first, then the one type reference you need. Pages and diagrams use the Pack's accent colour and the embedded Poppins + Prompt fonts so they work offline. Draw any box or arrow that rests on an item marked `ai_inferred`, `needs_update` or `open_question` with a dashed outline, and add a one-line legend saying dashed parts still need confirmation, so a picture never makes a guess look settled. On hosts that can't render HTML, use numbered steps plus a Mermaid block.

## Reference library

| File | Read when |
|---|---|
| `references/discovery.md` | Getting to know a new giver's role and listing their tasks |
| `references/interview.md` | Going deep on a task: coverage map, forgotten questions, probing signals, conflicts |
| `references/images-and-safety.md` | Asking for, checking, pinning and protecting screenshots and photos |
| `references/pack-format.md` | Writing `knowledge.json`, statuses, IDs, what each Pack file holds |
| `references/saving-and-hosts.md` | Host capabilities, save blocks, building, Pack Builder, handover delivery |
| `references/teaching.md` | Teaching a receiver from a Pack |
| `diagram/RULES.md` | Drawing any diagram or page |
