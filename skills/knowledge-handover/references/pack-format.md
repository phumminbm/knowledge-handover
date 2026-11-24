# Pack format

The whole Pack is one JSON document, `knowledge.json`. Save blocks carry it between chats; `scripts/build_pack.js` and the Pack Builder turn it (plus images) into the Pack files. Keep it valid JSON: double quotes, no comments, no trailing commas.

## Contents

1. Statuses
2. IDs
3. `knowledge.json` fields
4. Minimal example
5. What the builder produces

## 1. Statuses

Every knowledge item carries `status`. The `.md` files keep all eight; `START-HERE.html` shows four badges.

| `status` | Meaning | Page badge |
|---|---|---|
| `employee_provided` | The giver said it | Not yet reviewed |
| `source_supported` | Backed by a supplied file, image or document | Not yet reviewed |
| `ai_organized` | Restructured or summarised by you without changing meaning | Not yet reviewed |
| `ai_inferred` | Your inference; must be confirmed | **Needs confirmation** (accent) |
| `validated` | Confirmed by an appropriate person (record `validated_by` and `validated_at` if known) | Confirmed |
| `unverified` | Not reviewed yet | Not yet reviewed |
| `needs_update` | Possibly stale or conflicting | **Needs confirmation** (accent) |
| `open_question` | Unresolved | Open question |

Optional `source` says where it came from ("interview 2026-11-23", "screenshot P01-S03.jpg", "SOP-FIN-07 rev 3").

Two things are never inferred and always need confirmation: physical-safety steps and "who can do it" labels.

## 2. IDs

IDs are permanent. Never renumber; retire an item by setting `"retired": true`.

| Item | Pattern | Example |
|---|---|---|
| Task / process | `P` + 2 digits | `P03` |
| Step | process ID + `.S` + 2 digits | `P03.S07` |
| Rule, decision or exception | `R-` + 3 digits | `R-012` |
| Troubleshooting entry | `T-` + 3 digits | `T-004` |
| Practice scenario | `Q-` + 3 digits | `Q-002` |
| Open question | `OQ-` + 3 digits | `OQ-009` |

Image file names follow the step: `P03-S07.jpg` (a second image: `P03-S07-b.jpg`).

## 3. Fields

Unknown values stay empty strings or are left out. Never fill them with guesses.

```text
schema_version   "1.0"
pack_id          "KP-<Buddhist or Gregorian year>-<4 digits>", generated once
version          integer, +1 every save
saved_at         ISO date of this save
language         content language code, e.g. "th", "en"
accent           hex colour chosen by the giver (default "#bf4520")
title            e.g. "งานบัญชีเจ้าหนี้ · ฝ่ายการเงิน"
confidentiality  "public" | "internal" | "confidential" | "unset"
ui_labels        optional object to translate page labels for languages other than th/en;
                 document labels use the same object with a `doc_` prefix (e.g. "doc_purpose",
                 "doc_ifGo": "If {a}: go to step {b}"); keys are listed in scripts/documents.js
giver            { name, role_title, team, organization, contact_after_leaving }   all optional; contact_after_leaving = how to reach them later, when they are moving on
stage            "discovery" | "interview" | "review" | "complete"
role             { summary, context, stakeholders: [{ name, relationship }], status }
tasks            task inventory from discovery:
                 [{ id, name, frequency, priority (1 = first), why_priority,
                    captured: "not_started" | "partial" | "complete" }]
handover         { snapshot_date, expires,
                   in_progress:  [{ item, state, next_step, due, status }],
                   deadlines:    [{ what, when, status }],
                   waiting_on_us:[{ who, what, status }],
                   watch:        [{ what, why, status }],
                   access:       [{ system, account_or_role, action: "transfer"|"revoke"|"request", status }] }
processes        [{ id, name, summary, trigger, frequency, complete (bool),
                    view: "steps"|"checklist"|"timeline"|"decision"|"troubleshoot",   optional, default "steps"
                    view_confirmed (bool),
                    doc_type: "sop"|"work_instruction"|"runbook"|"dev_guide",           optional, default "sop"
                    prerequisites: [],                   optional: access, approvals or state needed before starting
                    tools: [],                           optional: tools and materials
                    ppe: [],                             optional: protective equipment
                    rollback,                            optional: how to undo the whole task
                    escalation,                          optional: who to call, and when
                    coverage: { trigger, steps, inputs_outputs, systems, people, decisions,
                                exceptions, checks, failures, deadlines, risk, wish_known }
                              each "done" | "skipped" | "missing",
                    people:  [{ name_or_role, involvement }],
                    systems: [{ name, purpose, source_of_truth (bool) }],
                    mermaid: "flowchart TD ...",         optional, plain-text diagram
                    diagram_svg: "<svg ...>...</svg>",   optional, from diagram/RULES.md
                    steps: [{ id, title, detail, why, actor, system, inputs: [], outputs: [],
                              check, risk: "low"|"medium"|"high", safety (bool),
                              who_can_do: "human_only"|"ai_with_approval"|"ai_alone",
                              who_can_do_confirmed (bool),
                              image, pins: [{ n, x, y, label, confirmed (bool) }],
                              branches: [{ label, goto }],          goto = a step ID
                              when,                                 optional: when the step happens ("Day 1", "Before 10:00")
                              branch_question,                      optional: the question shown above the branch buttons
                              next,                                 optional: step ID (or "end") to go to after this step
                              command,                              optional: the exact command, code or query; placeholders like <DB_NAME> for anything secret or local
                              expected,                             optional: what you should see when it worked
                              spec,                                 optional: a value or tolerance ("25 ± 2 N·m", "pH 6.5–7.0")
                              rollback,                             optional: how to undo this step
                              status, source }],
                    rules: [{ id, text, why, applies_when, status, source }],
                    troubleshooting: [{ id, symptom, cause, fix, status }],
                    scenarios: [{ id, situation, question, options: [], answer (index),
                                  explanation, refs: [] }],
                    status }]
open_questions   [{ id, question, who_to_ask, refs: [], origin: "skipped"|"inferred"|"receiver"|"conflict" }]
glossary         [{ term, meaning }]
images           { "<file name>": { caption, captured_at, sensitive_checked (bool) } }
change_log       [{ date, version, change, by }]
handover_message text the giver can send with the zip (written in the giver's language)
```

Pins use fractions of the image size: `x` and `y` from 0 (left/top) to 1 (right/bottom). Ask the giver to confirm pin positions; unconfirmed pins are drawn dashed.

Branches make the walkthrough interactive: a step with `branches` shows one button per branch and jumps to its `goto` step. Add `branch_question` (for example "Do the two totals match?") so the receiver knows what they are choosing; without it the page shows a generic "Which case are you in?". After a step without branches, the walkthrough goes to the following step in the array, unless the step has `next`: a step ID to jump to, or `"end"` to finish the task. Set `next` wherever a branch option rejoins the main path or should end the task early (for example, "small difference → adjust → done" must not fall through into the "large difference" steps); the builder warns when a branch option falls straight into a sibling option without `next`. Walk every branch path once before building.

### Task views

Each task has a `view`: how START-HERE.html lays it out. Pick it yourself from the shape of the work and tell the giver in one line what you picked and why; change it only if they object, and set `view_confirmed` only when they say it is right. Do not ask them to choose. The receiver can always switch to the step-by-step walk-through.

| `view` | Fits work like | The receiver sees |
|---|---|---|
| `steps` | software procedures, anything done in order on a screen | one step at a time with the real image and pins |
| `checklist` | shift handovers, opening and closing routines, maintenance rounds, safety checks | every step as a tick list, safety steps first |
| `timeline` | month-end close, payroll, work driven by the calendar or the clock | steps grouped by their `when` |
| `decision` | approvals, eligibility checks, triage, "it depends" judgement | the rules of thumb, then the branch questions one by one |
| `troubleshoot` | on-call, repairs, IT support, "something went wrong" | symptoms first, each with cause and fix |

A view needs its data: `checklist` and `timeline` need steps, `decision` needs branching steps or rules, `troubleshoot` needs troubleshooting entries. Without it the page falls back to `steps` and the builder warns. For a `timeline`, give every step a `when`.
### Document types

Each task also has a `doc_type`: the document its line of work uses. Pick it yourself, like the view, and tell the giver in one line ("This is server maintenance, so it becomes a work instruction with the PPE and torque values up front"). Change it only if they object.

| `doc_type` | For | Written as |
|---|---|---|
| `sop` (default) | office, service, admin, care | Word (`.docx`) + print page |
| `work_instruction` | engineering, maintenance, production, labs, on-site work | Word (`.docx`) + print page; safety and PPE first, tools, specs, quality checks, sign-off |
| `runbook` | IT operations, DevOps, support, on-call | Markdown (`.md`) + print page; commands, expected results, undo, escalation, rollback |
| `dev_guide` | software development | Markdown (`.md`) + print page; prerequisites, commands, conventions, common problems |

For technical work, record `command` exactly as typed and `expected` as it appears on screen; use `spec` for a measured value or tolerance and `rollback` for how to undo a step or the whole task. On the task, fill `prerequisites`, `tools`, `ppe` and `escalation` when they apply; leave them out otherwise. Anything secret or environment-specific becomes a placeholder such as `<DB_NAME>` or `<API_TOKEN>`; never a real value. The builder replaces anything that still looks like a password, key or token with `<REDACTED>` in every file, and warns the giver to change it.

## 4. Minimal example

```json
{
  "schema_version": "1.0",
  "pack_id": "KP-2569-0042",
  "version": 2,
  "saved_at": "2026-11-23",
  "language": "th",
  "accent": "#bf4520",
  "title": "งานกระทบยอดธนาคาร · ฝ่ายบัญชี",
  "confidentiality": "internal",
  "stage": "interview",
  "role": { "summary": "ดูแลบัญชีเงินสดและเจ้าหนี้", "status": "employee_provided" },
  "tasks": [{ "id": "P01", "name": "กระทบยอดธนาคารสิ้นเดือน", "frequency": "monthly", "priority": 1, "captured": "partial" }],
  "handover": { "snapshot_date": "2026-11-23", "expires": "2026-12-07", "deadlines": [{ "what": "ปิดงวด พ.ย.", "when": "2026-12-03", "status": "employee_provided" }] },
  "processes": [{
    "id": "P01", "name": "กระทบยอดธนาคารสิ้นเดือน", "frequency": "monthly", "complete": false,
    "coverage": { "trigger": "done", "steps": "done", "checks": "skipped" },
    "steps": [
      { "id": "P01.S01", "title": "เปิด statement ธนาคาร", "why": "ใช้ยอดจริงเป็นตัวตั้ง", "image": "P01-S01.jpg",
        "pins": [{ "n": 1, "x": 0.31, "y": 0.42, "label": "ไฟล์เดือนนี้", "confirmed": true }],
        "who_can_do": "ai_with_approval", "who_can_do_confirmed": false, "status": "employee_provided" },
      { "id": "P01.S02", "title": "เทียบยอดคงเหลือ", "branches": [{ "label": "ตรง", "goto": "P01.S04" }, { "label": "ไม่ตรง", "goto": "P01.S03" }], "status": "employee_provided" }
    ],
    "rules": [{ "id": "R-001", "text": "ต่างไม่เกิน 100 บาทไม่ต้องไล่", "status": "ai_inferred" }],
    "status": "employee_provided"
  }],
  "open_questions": [{ "id": "OQ-001", "question": "เกณฑ์ยอดต่างที่ต้องไล่หาคือเท่าไร", "who_to_ask": "หัวหน้าบัญชี", "refs": ["R-001"], "origin": "inferred" }],
  "change_log": [{ "date": "2026-11-23", "version": 2, "change": "เพิ่มขั้นตอน P01", "by": "giver" }]
}
```

## 5. What the builder produces

```text
<pack-id>/                        zipped as knowledge-handover_<pack-id>_<date>.zip
├── START-HERE.html               self-contained page: urgent items, work map, walkthroughs, quizzes
├── PACK-FOR-AI.md                teaching instructions + the whole pack as text, for any AI
├── knowledge.json                the source of truth (also the latest save block)
├── handover-status.md            only when handing over: pending work, deadlines, accounts
├── handover-message.txt
├── profile/role-and-context.md
├── processes/<id>-<slug>/
│   ├── workflow.md               summary, Mermaid, plain-text flow
│   ├── procedures.md             every step with its structured fields
│   ├── decisions.md              rules, decisions, exceptions
│   ├── troubleshooting.md
│   └── scenarios.md
├── documents/
│   ├── <id>-<slug>.docx          SOP or work instruction, to edit or file
│   ├── <id>-<slug>.md            runbook or developer guide, for a repo or wiki
│   └── <id>-<slug>.html          the same document, print-ready (Ctrl+P / ⌘P → Save as PDF)
├── visuals/                      original images, untouched
├── open-questions.md
├── glossary.md
├── change-log.md
├── manifest.yaml
└── README.md                     how to open and use the pack
```

Only files with content are written. `START-HERE.html` embeds the images, so it can be sent alone; very large photo sets may make it heavy, so prefer a few clear images per task. Every task gets `documents/<id>-<slug>.html` plus a `.docx` (SOP, work instruction) or `.md` (runbook, developer guide). Each has the sections of its type and the procedure in the shape of the task's view. Status stays "Draft" until the task is complete, every item is `validated`, every "who can do it" label and pin is confirmed, and no open question points at it. Unconfirmed items are flagged. Document number, owner, effective date, approver and sign-off are left blank.
