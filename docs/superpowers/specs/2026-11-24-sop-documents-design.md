# Task documents by line of work — design

Approved by the owner on 2026-11-24: first "Word + PDF" for SOPs, then "4 types, the AI chooses" so that engineering, software and developer work get the documents those fields use.

## Why

A Pack has a page for learning (`START-HERE.html`), a file for AI (`PACK-FOR-AI.md`) and Markdown working files. None of these is a document a team can file, print, sign, or keep in its repo or wiki. Fields also differ in what they use:

| `doc_type` | For | Their usual home | Files |
|---|---|---|---|
| `sop` (default) | office, service, admin, care | document system, shared drive | `.docx` + `.html` (print / PDF) |
| `work_instruction` | engineering, maintenance, production, labs, on-site | quality system, the station | `.docx` + `.html` |
| `runbook` | IT operations, DevOps, support, on-call | repo or wiki | `.md` + `.html` |
| `dev_guide` | software development | repo or wiki | `.md` + `.html` |

The AI chooses `doc_type` for each task from the line of work, and tells the giver in one line, the same way it chooses `view`. Files go to `documents/<id>-<slug>.<ext>`.

## New optional fields

Every new field is optional, and nothing is invented to fill one.

- Task: `doc_type`, `prerequisites[]` (access, approvals, state before starting), `tools[]` (tools and materials), `ppe[]` (protective equipment), `rollback` (how to undo the whole task), `escalation` (who to call and when).
- Step: `command` (exact command, code or query, with placeholders such as `<DB_NAME>` for anything secret or environment-specific), `expected` (what you should see), `spec` (value or tolerance, e.g. "25 ± 2 N·m"), `rollback` (how to undo this step).

They appear in `START-HERE.html`, in the Markdown files and `PACK-FOR-AI.md`, and in every document type that uses them.

## Sections

All types share a header and the same procedure shapes: steps (with screenshots and pins), checklist, timeline, decision table, and symptom table. The diagram appears in the print version.

- **SOP**:
  - header: document no., version, status, described by, effective date, approved by, prepared from
  - sections: purpose, scope, responsibilities, definitions, before you start, systems and equipment, procedure, rules, troubleshooting, safety and risk, records, open questions, revision history
- **Work instruction**:
  - header: as the SOP
  - sections: purpose, scope, safety and PPE (placed first), tools and materials, before you start, responsibilities, procedure (spec and quality check on each step), rules, troubleshooting, records, open questions, sign-off table (done by / checked by / date, blank), revision history
- **Runbook**:
  - header: owner (blank), status, described by, last updated, prepared from
  - sections: when to use, before you start, escalation, steps (command, expected result, undo), rollback, risky steps, troubleshooting, rules, definitions, open questions, history
- **Developer guide**:
  - header: as the runbook
  - sections: overview, prerequisites, systems and repositories, steps (commands, expected), conventions (rules), common problems, definitions, open questions, history

## Honesty

- Status shows "Draft" unless the task is `complete`, every step, rule and fix is `validated`, every "who can do it" label and pin is confirmed, and no open question points at the task. It then shows "Ready for approval", never "Approved".
- An incomplete task says so.
- Items marked `ai_inferred`, `needs_update` or `open_question` carry "Needs confirmation". A proposed "who can do it" label says "(proposed, not confirmed)".
- Document no., owner, effective date, approver and sign-off are blank, never guessed. The giver is shown as "Described by", not as owner.
- A branch to a missing or retired step says so instead of printing a raw ID.

## Secrets

The builder scans every string for secret-shaped values:
- private key blocks
- cloud, GitHub, Slack, OpenAI and similar token formats
- `password=`, `token:`, `secret=` style assignments
- bearer tokens and credentials in URLs

It replaces each with `<REDACTED>` in every output, including the `knowledge.json` inside the zip, and warns with the item ID, telling the giver to change the secret. This backs up hard line 3, never to record secrets.

## Safety

Pack content is untrusted.
- **HTML:** every value is escaped. The diagram is only a `data:` image. Image URLs are allow-listed. There is a CSP and no script.
- **Word:** XML is escaped, characters XML forbids are removed, lone surrogates are dropped, and images are stored under fixed names. Element order follows the OOXML schema, which a test checks.
- **Markdown:** text escapes `\ ` * _ [ ] < > |`, so nothing becomes a link, HTML or a table break. Commands sit in fenced blocks whose fence is longer than any backtick run inside them.
- **File names:** come from `folderFor()`.

## Code

- `skills/knowledge-handover/scripts/documents.js` (renamed from `sop.js`; UMD, global `KHDocs`). It builds one document model per task and renders it three ways: HTML, `.docx` parts and Markdown. It also exports `docType(p)` and `DOC_TYPES`.
- `pack-core.js`: new fields in `mdWorkflow`, `mdProcedures`, `validate()` (unknown `doc_type`, secret warnings), `redactSecrets()`, and the files written in `build()`.
- The START-HERE template shows the new fields.
- `tools/build_dist.py` inlines `documents.js`.

## Review fixes folded in (from the SOP review)

- OOXML element order: Heading1 and ListBullet.
- Readiness rules, as above.
- The unconfirmed "who can do it" label.
- Tall images capped (Word 8.5 in, print 200 mm).
- Single-pass `{a}`/`{b}` formatting.
- Steps numbered by position.
- A missing or retired branch target.
- WebP screenshots noted in Word.
- Surrogate filter.
- Own-property lookups.
- Interview text no longer asks for a numbering rule.
- The `doc_` label keys listed in `pack-format.md`.
- README developer tree.

## Examples

- Bank example:
  - P03 becomes a work instruction (tools, prerequisites).
  - P05 becomes a runbook (escalation).
  - The rest stay SOPs.
- New `examples/it-operations/`, three tasks, each with a diagram and practice:
  - a runbook with commands and rollback
  - a developer guide
  - a server work instruction with PPE and specs
- Both are published on Pages (`/example/`, `/example-it/`).

## Tests

- Unit tests:
  - files per type
  - sections per type
  - Markdown escaping and fences
  - secrets redacted everywhere, with a warning
  - an OOXML order check of every `pPr`, `rPr`, `tblPr`, `tcPr` and `style`
  - the readiness path, both ways
  - the unconfirmed label
  - branch numbering with retired targets
  - `$&` in labels
  - steps without IDs
  - a tall image
  - a webp image
  - surrogates
  - prototype-name statuses
  - `ui_labels` override
  - Thai labels
- Browser tests:
  - a hostile pack runs no script in any HTML document
  - the documents print
  - START-HERE shows command, expected, spec, rollback and prerequisites
  - the Pack Builder zip contains the right files per type
