# Changelog

All notable changes to this project are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed
- READMEs: a one-line prompt that lets an AI which can run commands (Claude Code, Codex, Cursor, Gemini CLI) install the skill and start right away, with a note that web and app chats still need the zip upload.
- READMEs: the starting examples now lead with manuals and training; handing over before leaving is one example among them.

## [0.3.0] - 2026-11-24

### Added
- Task documents for every line of work. Each task is also written to `documents/` as the document its field uses, chosen by the AI (`doc_type`):
  - **SOP** (office, service, care): Word file + print page.
  - **Work instruction** (engineering, maintenance, production, labs): Word file + print page, with safety and PPE first, tools, specs, quality checks and a blank sign-off.
  - **Runbook** (IT operations, on-call): Markdown + print page, with exact commands, expected results, undo, escalation and rollback.
  - **Developer guide** (software): Markdown + print page, with prerequisites, setup commands, conventions and common problems.

  Every document has the procedure in the shape of the task's view and, in the print version, the diagram. English and Thai labels.
- New optional fields:
  - On a task: `doc_type`, `prerequisites`, `tools`, `ppe`, `rollback`, `escalation`.
  - On a step: `command`, `expected`, `spec`, `rollback`.

  They are shown in `START-HERE.html`, the Markdown files and `PACK-FOR-AI.md`.
- Secrets are caught by the builder. Anything that looks like a password, key or token (private keys, cloud, GitHub, Slack and API tokens, bearer tokens, credentials in URLs, `password=` style values) is replaced with `<REDACTED>` in every file. The builder names the item and tells the giver to change the secret.
- A second example Pack, `examples/it-operations/`: a runbook with commands, a developer guide, a work instruction with PPE and torque specs, and a troubleshooting runbook. It is published at `/example-it/`.
- The AI asks for the organisation's own template and fills it when it can edit documents. For technical work it asks for exact commands, expected results, tolerances and how to undo, with placeholders for anything secret.

### Honesty in documents
- Status stays "Draft" until all of these hold, and is never "Approved":
  - the task is complete;
  - every item is confirmed;
  - every "who can do it" label and pin is confirmed;
  - no open question points at the task.
- An incomplete task says so.
- A proposed "who can do it" label is marked "proposed, not confirmed".
- The giver is shown as "Described by", not as the owner.
- Document number, owner, effective date, approver and sign-off stay blank.
- The READMEs show an illustrated interview (English and Thai): options to tap, asking for the real form, asking only about the gap, a diagram to check, and the save block.

### Fixed
- A release created on the GitHub web page no longer gets its notes twice; the Release workflow writes notes only when the release has none.

## [0.2.4] - 2026-11-24

### Changed
- The example Pack is now in English and covers every layout: six tasks (step by step, timeline, checklist, find what to do, what's wrong, and a second step-by-step task), each with a different kind of diagram (flowchart, timeline, swimlane, decision tree, symptom → cause → fix, state diagram) and practice questions.
- The READMEs have a "See the example from every angle" section with direct links to each layout, the practice questions, the open questions and the example's files (`example-pack.zip` on the project site).
- Diagrams draw anything that rests on an unconfirmed item with a dashed outline and a legend, so a picture never makes a guess look settled.

### Fixed
- A task with one step said "1 steps".

## [0.2.3] - 2026-11-24

### Changed
- New icon: a step-by-step manual card being passed on, on the same dark, softly lit background as the pages. Its source is `docs/images/icon.svg`.

## [0.2.2] - 2026-11-24

### Changed
- The skill is no longer only for people leaving: it covers new-hire manuals, stand-ins for leave, team SOPs and personal know-how as well as handovers. New tagline "Your know-how, ready to pass on."
- Pending work, deadlines and accounts to transfer are captured only when the work is changing hands. Packs without them have no urgent section, no `handover-status.md`, and neutral messages and teaching instructions.
- "Handed over by" on the page is now "From".
- The README explains that a Pack's structured data can be used by its holder to set up an AI assistant for parts of the work.

## [0.2.1] - 2026-11-24

### Changed
- The AI asks for the real thing as it goes: at the start of each task, and whenever the giver mentions a program, file, form or chat, it asks in the same reply for a screenshot, the file or template, a finished example or a link. It reads what arrives, drafts the steps from it and asks only about the gaps. Files and links are read and recorded, not shipped in the Pack; personal data and prices are covered first.

## [0.2.0] - 2026-11-23

### Added
- START-HERE.html is rebuilt as an app: a sidebar with every task and its progress, search across the whole Pack (`/` or Ctrl+K), a focus mode for walk-throughs with a step list and an action bar that stays on screen, full-screen images, and "continue where you left off".
- Task views: each task can be shown as a step-by-step walk-through, a checklist, a timeline, a decision finder or a troubleshooting list. New optional fields `view`, `view_confirmed` and `steps[].when`; the skill proposes a view per task and the giver confirms it.
- Pages for all urgent items, open questions, glossary and change history.

### Changed
- The skill now picks each task's view and draws its diagram on its own, and tells the giver what it chose, instead of asking them to choose.
- Diagrams use the same monochrome palette as START-HERE.html (white paper, near-black ink, neutral grey).
- The example Pack includes a flowchart for its main task.
- New visual system for START-HERE.html and the Pack Builder: white surfaces, near-black text, pill buttons, rounded cards, and soft colour orbs made from the Pack's accent. The accent is darkened automatically when white numbers on it would be hard to read.
- The Pack Builder shows progress through its three steps.

### Fixed
- GitHub Pages deploys from `main` instead of from release tags, which the `github-pages` environment refuses.

## [0.1.0] - 2026-11-23

First public release.

### Added
- The `knowledge-handover` skill: giver interview, receiver teaching and update mode, with save blocks so a handover can continue across chats.
- Knowledge Pack builder shared by the Node CLI (`build_pack.js`) and the in-browser Pack Builder.
- `START-HERE.html`: urgent items, work map, step-by-step walkthroughs with the giver's real images, quizzes. Works offline.
- Plugin manifests for Claude Code (`.claude-plugin/`), Codex (`.codex-plugin/`) and other Agent Skills hosts (`.agents/plugins/`).
- `PROMPT.md` for AI chats without skill support.
- Unit tests, browser security tests and CI on every pull request.

### Security
- `START-HERE.html` now parses diagrams in an inert document and keeps only drawing elements, so a crafted save block cannot run code when a receiver opens the Pack.
- The Pack Builder shows pasted values and file names as text.
- Pack, process and image names are cleaned before they become file paths, so a save block cannot write outside the Pack folder or add `../` entries to the zip.

[Unreleased]: https://github.com/phumminbm/knowledge-handover/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/phumminbm/knowledge-handover/compare/v0.2.4...v0.3.0
[0.2.4]: https://github.com/phumminbm/knowledge-handover/compare/v0.2.3...v0.2.4
[0.2.3]: https://github.com/phumminbm/knowledge-handover/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/phumminbm/knowledge-handover/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/phumminbm/knowledge-handover/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/phumminbm/knowledge-handover/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/phumminbm/knowledge-handover/releases/tag/v0.1.0
