# SOP documents — design

Approved by the owner on 2026-11-24 ("Word + PDF").

## Why

A Pack has a page for learning (`START-HERE.html`), a file for AI (`PACK-FOR-AI.md`) and Markdown working files per task. None of them is a document an organisation can file, print, sign or paste into its document system. People who use the skill to write SOPs need one.

## What

For every task the builder writes two files to `sop/`:

- `sop/<id>-<slug>.docx`: an editable Word document.
- `sop/<id>-<slug>.html`: a print-ready page. Open it in a browser, press Ctrl+P / ⌘P and choose "Save as PDF".

Both come from the same `knowledge.json` through the shared core, so the CLI and the Pack Builder produce the same files. No dependencies, works offline.

### Layout (one standard SOP structure)

Header table: SOP title, document no. (blank), version (Pack version), status, owner (giver's role), effective date (blank), approved by (blank, signature line), source (Pack ID and version).

1. Purpose: `summary`
2. Scope and when to use: `trigger`, `frequency`
3. Responsibilities: `people`, plus step actors not already listed
4. Definitions: glossary terms that appear in this task's text
5. Systems and equipment: `systems`
6. Procedure: shaped by the task's view
   - steps: numbered steps with detail, why, how to check, who can do it, the giver's real screenshots (pins overlaid in HTML, listed under the image in Word), and "if … go to step n" for branches
   - checklist: a tick-box table with safety steps first
   - timeline: a table grouped by `when`
   - decision: the rules, then each question with where each answer leads
   - troubleshoot: a symptom, cause and fix table
   - HTML only: the task's diagram, shown as an inert image
7. Rules and exceptions (unless the procedure already shows them)
8. Troubleshooting (unless the procedure already shows it)
9. Safety and risk: safety steps and high-risk steps
10. Records and outputs: every step output
11. Open questions about this task
12. Revision history: `change_log`

Practice scenarios are training material and are left out.

### Honesty

- Status is "Draft" while any item in the task is not `validated`. It shows "N of M items confirmed" and is never "Approved", because approval is a person's act.
- Items marked `ai_inferred`, `needs_update` or `open_question` carry a visible "Needs confirmation" flag.
- Document no., effective date and approver are blank lines to fill in, never guessed.

### Organisation templates

If the organisation has its own SOP template, the AI asks for it along with the other real material. When the AI can edit documents, it fills that template from `knowledge.json`, under the same rules: blanks stay blank, flags stay. The built-in SOP is still written to every Pack.

### Language

Labels are in English or Thai from `language`. Other languages fall back to English, and `ui_labels` can override them. Word uses Arial for Latin text and Tahoma for Thai and other complex scripts. The HTML uses the system font stack, with Poppins and Prompt first when installed. Fonts are not embedded, which keeps each file small.

## Safety

Pack content is untrusted.

- HTML: every value is escaped. The diagram is embedded as `<img src="data:image/svg+xml;base64,…">`, where scripts never run and nothing outside loads. A CSP meta tag allows only inline styles and `data:` images. There is no JavaScript.
- Word: every value is XML-escaped, and characters XML forbids are removed. Images are copied as bytes under fixed names (`media/imageN.ext`).
- File names come from `folderFor()` (`safeSeg` and `slug`).

## Code

- New `skills/knowledge-handover/scripts/sop.js` (UMD, global `KHSop`). It has no dependencies and exports `sopHtml(k, p, ctx)` and `sopDocxParts(k, p, ctx)`. `ctx` carries the view, labels, image bytes and data URLs.
- `pack-core.js` loads it (`require('./sop.js')` in Node, `root.KHSop` in the browser), zips the docx parts with its existing `zip()`, and adds the files in `build()`.
- `tools/build_dist.py` inlines `sop.js` before `pack-core.js` in the Pack Builder.

## Docs to update

`references/pack-format.md` (builder output), `SKILL.md` step 6, `references/interview.md` (ask for the SOP template), the Pack `README.md` writer, both READMEs, `AGENTS.md` (source vs built), and CHANGELOG.

## Tests

- Unit: both files exist for every example task. The docx is a valid zip, and its XML parses. It has the header fields, status and section headings, and the R-008 "Needs confirmation" flag. Each view has its procedure shape. Thai labels appear for a Thai pack. Hostile names and a hostile diagram are escaped, with no raw `<script` or inline `<svg`.
- Browser: the SOP page opens with no errors and no network requests, prints to a multi-page PDF, and a hostile pack runs no script.
- By eye: the example's docx converted to PDF with LibreOffice, and the HTML printed to PDF.
