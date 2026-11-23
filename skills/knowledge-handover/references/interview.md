# Going deep on a task

You are trying to make one task learnable by someone who can never ask the giver. Adapt to the person: follow their answers, skip what is already known, and stop when a topic is clear. Nothing here is a questionnaire.

## Coverage map (12 topics)

Track these per task in `processes[].coverage` as `done`, `skipped` or `missing`, and show progress now and then.

| Key | Topic | What a successor needs |
|---|---|---|
| `trigger` | What starts it, how often | When to do it without being told |
| `steps` | The steps, in order | Something to follow |
| `inputs_outputs` | What goes in, what comes out | What to gather, what "done" looks like |
| `systems` | Systems, files, equipment, source of truth | Where to look and which copy wins |
| `people` | Who is involved, who must be told | Whom to contact and notify |
| `decisions` | Decision points and the reasons | How to choose, not just what to click |
| `exceptions` | Exceptions and workarounds | What to do when reality differs |
| `checks` | How you know it's right | How to catch mistakes before they spread |
| `failures` | What goes wrong, how to spot and fix it | Calm recovery instead of panic |
| `deadlines` | Deadlines and the cost of missing them | What can wait and what can't |
| `risk` | Approvals, risk, safety, confidentiality | What needs permission or care |
| `wish_known` | What they wish they'd known on day one | The shortcut to competence |

A task can be packed with topics missing. Mark it `complete: false`, move the gaps to `open_questions`, and tell the giver in one line.

## Useful questions people forget to ask

Use, rephrase or ignore. Ask only what is relevant.

- What happens if this value is missing or late?
- How do you know the result is correct? What would make you suspicious?
- What if the result differs from what you expected?
- Who needs to be told, and how?
- Why this option and not the other one?
- Is this a company rule or just how you do it?
- Is there an exception? When did it last happen?
- Where is the source of truth if two places disagree?
- What happens if this isn't done, or is done late?
- Which step would you warn a new person about?
- Can you show me? (a screenshot or a photo)

## Probing signals

When you hear these, ask one more question:

- **Vague words** — "normally", "it depends", "you just look", "you'll know", "ปกติ", "แล้วแต่", "ดูเอา", "ก็รู้ๆ กัน": ask what it depends on, or what they look at.
- **A number with no source**: ask where it comes from and who set it.
- **"Must" / "have to" / "ต้อง"**: ask whether it's a policy or a habit, and who owns it.
- **A system, form, machine or place mentioned with no picture**: ask for a screenshot or photo.
- **A shortcut or workaround**: ask why the official way doesn't work.
- **Something contradicting an earlier answer or a document**: see below.
- **Anything with money, safety, patients, customers or legal exposure**: slow down and confirm.

## Contradictions

Don't silently pick one version. Keep both with their sources, ask the giver which is current, and if they don't know, set `needs_update` and add an open question naming who could decide.

## Show, don't make them write

Whenever the work has a shape, draw it and ask "Is this right?" (`diagram/RULES.md` for choosing the picture). People correct a picture far more easily than they write prose. On text-only hosts, show numbered steps and a short Mermaid block.

## Structured fields per step

As you go, fill each step's fields (`references/pack-format.md`): actor, system, inputs, outputs, check, risk, safety. Propose `who_can_do` for each step (human only / AI with human approval / AI alone) based on judgement, risk and access needed. Show the whole task's list and let the giver confirm it in one tap, changing only the exceptions; keep `who_can_do_confirmed` false until they do. For hands-on work, propose "human only" throughout and ask one question instead: could any part (an email, a report, a check of records) be drafted by AI?

## Practice scenarios

For each important task, write 1–3 realistic scenarios with one clearly correct answer drawn from what the giver said (e.g. "The amounts differ by 5,000 — where do you look first?"). They become the receiver's quizzes and reusable test cases. Never invent an answer the giver didn't give.

## Pacing

- One question at a time when it needs thought; several taps at once when they're quick.
- Offer a break and a save block after each task, or every 20–30 minutes.
- If the giver is tired or short of time, capture the urgent items and the highest-priority task well rather than everything badly.
