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

## Ask for the real thing

Seeing the work beats hearing about it. The giver rarely thinks to send it, so ask every time; don't wait for them to offer.

- **When a task starts**, ask in the same message as your first question: "If you have them, send screenshots of the screens you use, the file or template itself, a finished example, or a link to where it lives. I'll read them and ask you less."
- **Whenever an answer names a program, file, form, chat, document or machine** ("I use Excel", "I send it on LINE", "the PO form"), ask for it in the same reply, as a tappable choice: send a screenshot or the file now / later / can't share. One short line; then carry on with your next question.
- **Ask for a finished example** (a sent quotation, a completed form, a closed ticket) as well as the blank template: the finished one shows what "done right" looks like. Ask the giver to cover customer names, prices, ID numbers and personal details first, or to send the blank template instead (`references/images-and-safety.md`).
- **Read what arrives before asking more.** From a spreadsheet note the sheets, columns, formulas and which cells are typed by hand; from a form, the required fields; from a screenshot, the buttons, fields and statuses. Turn what you see into draft steps marked `ai_inferred`, show them, and ask only about the gaps ("Column F looks like the discount — who decides it?").
- **Links:** record where the thing lives (the system, folder or page) in the step's `system`, `inputs` or `outputs`. Never ask for passwords or access. If you can't open a link or a file type, say so plainly and ask for a screenshot instead.
- **If they can't share,** carry on with words; never block the interview on a file.
- **If the work is going into SOPs, work instructions or runbooks**, ask once whether the organisation has its own template for them, and ask for it. The Pack always includes documents in a standard layout (`doc_type`, chosen by you from the line of work); a template lets you also fill the organisation's own.
- **For technical work** (servers, code, machines, labs), ask for the exact command or setting as typed and what the screen shows when it worked, the value or tolerance for anything measured, and how to undo a step. Record secrets and machine-specific values as placeholders such as `<DB_NAME>` or `<API_TOKEN>`; if the giver pastes a real key, leave it out and tell them to change it.

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

Whenever the work has a shape, draw it without being asked (from the real screenshots and files when you have them) and check the content with "Is this right?" (`diagram/RULES.md` for choosing the picture). People correct a picture far more easily than they write prose. You choose the kind of picture; the giver only checks that what it says is true. On text-only hosts, show numbered steps and a short Mermaid block.

## Structured fields per step

As you go, fill each step's fields (`references/pack-format.md`): actor, system, inputs, outputs, check, risk, safety. Propose `who_can_do` for each step (human only / AI with human approval / AI alone) based on judgement, risk and access needed. Show the whole task's list and let the giver confirm it in one tap, changing only the exceptions; keep `who_can_do_confirmed` false until they do. For hands-on work, propose "human only" throughout and ask one question instead: could any part (an email, a report, a check of records) be drafted by AI?

## Choosing the task's view and drawing it

When a task's steps are captured, decide yourself how the receiver should see it (`view` in `references/pack-format.md`) and draw its diagram (`diagram/RULES.md`). Do not ask the giver to choose a layout or whether they want a picture; most people don't know what to pick. Tell them in one line what you chose and why, for example "You run this every shift, so I've made it a checklist and drawn the flow below — say if you'd like it differently." Hands-on and clinical routines usually suit `checklist`; calendar-driven work `timeline` (then ask when each step happens and fill `when`); judgement work `decision`; reactive work `troubleshoot`; screen procedures `steps`. Leave `view_confirmed` false unless the giver says the choice is right.

## Practice scenarios

For each important task, write 1–3 realistic scenarios with one clearly correct answer drawn from what the giver said (e.g. "The amounts differ by 5,000 — where do you look first?"). They become the receiver's quizzes and reusable test cases. Never invent an answer the giver didn't give.

## Pacing

- One question at a time when it needs thought; several taps at once when they're quick.
- Offer a break and a save block after each task, or every 20–30 minutes.
- If the giver is tired or short of time, capture the urgent items and the highest-priority task well rather than everything badly.
