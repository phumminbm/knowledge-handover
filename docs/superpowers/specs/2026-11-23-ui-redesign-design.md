# UI redesign: START-HERE and Pack Builder

Status: approved by the owner · 2026-11-23

Mockup: [`2026-11-23-ui-redesign-mockup.html`](2026-11-23-ui-redesign-mockup.html) (open in a browser; desktop home, desktop walk-through, two phone screens).

## Intent

The owner wants the receiver-facing pages to feel modern, calm and easy to use, with a new layout and a new visual system. The receiver uses a Pack in two phases:

1. **Learning:** go through the urgent items, then each task step by step, in order.
2. **Reference:** weeks later, come back to look up one rule, one troubleshooting fix, a term, or who to ask.

Today's page serves phase 1 reasonably and phase 2 poorly. The home page is one long scroll, switching tasks means going back to home, there is no search, and open questions, glossary and change log are buried in collapsed boxes at the bottom.

## Goals

- A layout that serves both phases: always-visible navigation and search for reference, and a distraction-free step player for learning.
- A visual system that is monochrome, airy and soft: near-white surfaces, near-black text, pill-shaped buttons, large rounded cards, hairline borders, light-weight large headings, and colour used only as soft decorative gradient "orbs" plus a few small functional marks.
- Each Pack still looks like its own: the giver's chosen accent colour drives the orbs and the functional marks.
- Each task is shown in the layout that fits its kind of work (steps, checklist, timeline, decision, troubleshooting), chosen by the AI and confirmed by the giver, inside the same tested template.
- Works on a phone as well as a desktop.
- The Pack Builder uses the same system and becomes a clear 1-2-3 flow.

## Non-goals

- No font change. Poppins and Prompt stay, embedded as today. Only weights and sizes change.
- No breaking change to `knowledge.json` or the save-block format. The only additions are the optional task-view fields below, and the skill text that tells the AI how to choose a view.
- No dark theme in this round. (Considered and set aside: givers' screenshots are mostly white and glare on dark; offices print. Can be added later as a toggle.)
- No new runtime dependencies or external requests. Pages stay single self-contained HTML files that work offline.
- No change to the bundled diagram engine (`diagram/`) in this round. Diagrams keep their current skin and are shown inside a 24px-radius card on the new page. Existing Packs' `diagram_svg` is shown as-is, with no colour remapping.

## Anti-goals (a failure even if it works)

- Any mention of, or asset from, the brand this style was inspired by, anywhere in the repo, the built files or commit messages.
- Colour used for primary buttons or body text. Primary actions are black.
- Decoration that slows reading: animated or busy orbs, orbs behind text that reduce contrast, motion that ignores `prefers-reduced-motion`.
- Weakening the security model: all Pack text still enters the DOM as text (`el()`, `textContent`), diagrams still go through `safeSvg()`, and the page still makes no network requests.
- Breaking existing links: `#/task/<id>/<tab>/<step>` URLs must keep working, since AI prompts and people may share them.

## Constraints

- Single file, vanilla JS (ES5 style as today, no build step for the template), inline CSS. The template is rendered by `pack-core.js` (`renderStartHere`) and inlined into the Pack Builder by `tools/build_dist.py`.
- All UI strings exist in Thai and English in the `TXT` table and remain overridable through `ui_labels`.
- Learning progress stays in `localStorage` only, guarded with try/catch.
- WCAG AA: 4.5:1 for text, 3:1 for UI marks. Keyboard reachable, visible focus.
- The e2e security tests (`tests/e2e/xss.test.js`) must keep passing; their selectors (`.panel`, `.diagram svg`, `#save`, `#sum`) may be updated together with the tests.

## Approaches considered

1. **App shell with sidebar, plus a focus mode for steps (chosen).** Persistent navigation and search for the reference phase; a step player that hides everything else for the learning phase. Costs the most rework of the page structure.
2. **Single guided path.** Home becomes a linear learning path; no sidebar. Simple and phone-first, but reference lookups mean scrolling through the path again.
3. **Reskin only.** Keep the current structure and apply the new visual system. Cheapest, but leaves the long home page, no search and the task-switching problem.

The owner handed the choice over; approach 1 was picked because it is the only one that serves both phases. Visual system "B" from the mockups (monochrome with orbs derived from the Pack accent) was picked for the same reason: it keeps each Pack distinct.

## Visual system

**Tokens** (light only):

| Token | Value | Use |
|---|---|---|
| `bg` | `#ffffff` | page |
| `surface` | `#f6f6f5` | sidebar, soft cards, segmented control track |
| `ink` | `#0b0b0b` | text, primary buttons |
| `muted` | `#5f5f5c` | secondary text (≥ 4.5:1 on `bg` and `surface`) |
| `hair` | `#e6e6e4` | borders and dividers |
| `accent` | Pack accent, default `#bf4520` | functional marks only |
| `on-accent` | `#ffffff` | numbers inside pins |
| `ok`, `bad` | `#2f6b3a`, `#b42318` | status text, safety notice |
| `warn-bg`, `warn-fg` | `#fff4e5`, `#7a4a00` | "Needs confirmation" chips and notices |

- Radius: 999px for buttons, pills and segmented controls; 24px for large cards and the image frame; 16px for small cards and list groups; 12px for inputs.
- Shadow: none on cards. One soft shadow only for floating layers (search dialog, sticky action bar, the selected segment).
- Type: Poppins + Prompt as today. Page title 300–400 weight, `clamp(2rem, 3vw + 1rem, 3rem)`, slight negative tracking. Section labels small, muted, sentence case. Body 16px, line-height 1.6.
- Buttons: primary = black pill, white text. Secondary = white pill, hairline border. Tertiary = text button. Minimum height 44px.

**Accent handling.** On load, the page checks the accent against white. If a white number on it is under 4.5:1, it darkens the accent (same hue) until it passes, as `style-guide.md` already requires for diagrams. The accent is used only for: image pins, progress fills, the "current" dot in navigation, the dot on near-due urgent items, and the orbs. It is never a button fill or text colour.

**Status markers** (semantic colour, separate from the accent; builder's call, settled after review). Every item keeps a visible status:

| Status | Look |
|---|---|
| Confirmed | small chip, `ok` dot and text |
| Not yet reviewed | small chip, grey dot, `muted` text |
| Needs confirmation (`ai_inferred`, `needs_update`) | chip and notice on `warn-bg` with `warn-fg` text and an amber dot; the notice keeps the "who to ask" line |
| Open question | chip with a dashed `hair` outline, `muted` text, "?" mark |
| Safety step not confirmed | notice on a light red background with `bad` border, as today |

Pins whose position is not confirmed stay as today in shape (white fill, dashed accent ring, accent number); this is an accent mark, so it is allowed.

**Orbs.** Two or three soft radial gradients, blurred, placed behind the home hero and behind the Pack Builder header only. Colours are derived from the accent hue: a light tint of the accent, plus two pastel companions at roughly +40° and −60° hue with high lightness. Static (no animation). Never behind body text below the hero. Hidden in print.

## Layout and navigation

### App shell (≥ 960px)

```text
┌───────────────┬──────────────────────────────────────────────┐
│ Pack title    │  [Search Pack…  /]                 [Ask AI]  │
│ from · date   ├──────────────────────────────────────────────┤
│               │                                              │
│ Home          │   page content (max ~760px reading width)    │
│ Urgent     3  │                                              │
│ Tasks         │                                              │
│  ◔ Task one   │                                              │
│  ○ Task two   │                                              │
│ Open questions│                                              │
│ Glossary      │                                              │
│ Changes       │                                              │
│               │                                              │
│ KP-… · v5     │                                              │
└───────────────┴──────────────────────────────────────────────┘
```

- Sidebar 260px, `surface` background, sticky full height, its own scroll. Each task shows a small progress ring (accent) and its name; tasks not captured are listed greyed with "not captured yet".
- Top bar: search field and an "Ask AI" button that opens the existing copy-a-prompt panel as a small popover/dialog.

### Phone (< 960px)

- Top app bar: menu button, Pack title (truncated), search button.
- The sidebar becomes a sheet that slides from the left over a dimmed page; Esc, a close button or tapping outside closes it.
- No horizontal scrolling at 360px width.

### Views and routes

| Route | View |
|---|---|
| `#/` (or empty) | Home |
| `#/urgent` | Urgent: all handover items (deadlines, in progress, waiting on us, watch list, accounts) grouped |
| `#/task/<id>[/<tab>[/<step>]]` | Task (unchanged URL scheme) |
| `#/questions` | Open questions, with who to ask |
| `#/glossary` | Glossary, alphabetical |
| `#/changes` | Change log |

Unknown routes fall back to Home.

### Home

1. Hero with orbs: meta line (from, saved date, confidentiality pill), title, role summary, overall progress ("learned 2 of 8 steps"), primary button **Continue where you left off** (or **Start with the first task** when nothing is seen yet), secondary **See urgent items**.
2. "Start here" as three compact numbered tiles (as today, restyled).
3. Urgent: top three items, with "see all" linking to `#/urgent`.
4. Tasks: card grid, each card with name, frequency, step count, progress bar, and one primary action (Walk me through / Continue) plus a text link to the overview.
5. No more collapsed boxes: questions, glossary and changes move to their own views.

### Task

- Header: task name, frequency/trigger chips, ID.
- Segmented control (pill track) for the tabs that exist: Walk through · Overview · Rules · Troubleshooting · Practice. Scrolls horizontally on phones with a fade edge.
- Overview, Rules, Troubleshooting and Practice keep their current content, restyled into the new cards and lists.

### Walk-through (focus mode)

```text
┌──────────────┬───────────────────────────────────────────────┐
│ ‹ All tasks  │  Step 1 of 6                        P01.S01   │
│              │  ━━━━━━━━──────────────────────────────────   │
│ 1 ✓ Download │  Download last month's statement             │
│ 2 ● Import   │  ┌───────────────────────┐  Why: …            │
│ 3   Match    │  │  real screenshot      │  Check: …          │
│ 4   Explain  │  │      (1)       (2)    │  Who: …            │
│ 5   Save     │  └───────────────────────┘  [Needs confirm.]   │
│ 6   Send     │  1 Pick the current account                  │
│              │  2 Download as PDF                           │
├──────────────┴───────────────────────────────────────────────┤
│ ‹ Back            [ Done, next › ]         [Ask AI about this]│
└──────────────────────────────────────────────────────────────┘
```

- Routing (settled after review): `#/task/<id>` with no tab still opens the walk-through, so existing links behave as before. A sidebar task click and a home card's primary button open the walk-through at the step last seen for that task (or step 1); the card's text link opens the Overview tab.
- On desktop, while the Walk through tab is active, the app sidebar is replaced by the task's step rail (step titles, ✓ for seen, ● for current, branch steps marked). The top bar stays and holds the tab segmented control plus a compact search field (as in the mockup). On the other tabs of a task, the normal app sidebar is shown. "‹ All tasks" goes to Home. Clicking a step jumps to it.
- On phones, the step rail is a "Step 3 of 6 ▾" button that opens the list as a sheet.
- Sticky bottom action bar (with safe-area padding): Back (when there is history), the primary Done/next or Finish button, and Ask AI. Branch steps show their choices as large option cards in the content, and the primary button is hidden until a choice is made.
- Clicking the screenshot opens it full screen (dialog) with pins, Esc to close.
- Arrow keys keep working; hint shown only on devices with hover.
- The current step per task is remembered in `localStorage` for **Continue where you left off**.

### Task views: a layout chosen to fit each task

Added at the owner's request: different kinds of work need different pages. The page stays a fixed, tested template, but each task can be shown in one of five **views**, and the AI picks the view per task from the shape of the work. A view only changes how the same `knowledge.json` data is laid out; no view needs new required fields, so every existing Pack still works.

New optional fields:
- `processes[].view`: `"steps"` (default) | `"checklist"` | `"timeline"` | `"decision"` | `"troubleshoot"`.
- `processes[].view_confirmed` (bool): the giver confirmed the view.
- `steps[].when` (optional text): when this step happens, for example "Day 1", "Before 10:00", "Every Friday". Used by the timeline view.

| View | For work like | Main tab shows | Built from |
|---|---|---|---|
| `steps` | software procedures, anything done in order on a screen | the focus-mode walk-through (above) | steps, images, pins, branches |
| `checklist` | shift handovers, opening/closing routines, maintenance rounds, safety checks | every step on one page as a tick list; safety steps pinned to the top with the safety notice; each item expands to show its image, why and check; ticks kept in this browser with a "Clear ticks" button | steps |
| `timeline` | month-end close, payroll, anything driven by the calendar or clock | a vertical timeline grouped by `when`, today's group highlighted when `when` is a date; steps without `when` grouped under "Any time" | steps (`when`), handover deadlines for this task |
| `decision` | approvals, credit and eligibility checks, triage, "it depends" judgement | rules first as "the rules of thumb", then a question-by-question finder that walks only the branch questions and lands on the step to do | rules, steps with branches |
| `troubleshoot` | on-call, repairs, IT support, anything driven by "what went wrong" | a symptom list with its own filter field; each card shows symptom → likely cause → fix and links to related steps | troubleshooting, steps |

- The tab order follows the view: the view's main page comes first and gets the view's name ("Checklist", "Timeline", "Find what to do", "What's wrong?"). The other tabs (Walk through, Overview, Rules, Troubleshooting, Practice) stay available when their data exists, so a receiver can always fall back to the step-by-step walk-through.
- Home task cards and the sidebar show a small view label, and the card's primary button names the action ("Open checklist", "See timeline", "Find what to do", "What's wrong?", "Walk me through").
- `#/task/<id>` with no tab opens the view's main tab. Old Packs have no `view`, so they open the walk-through as before.
- A view with too little data for it falls back to `steps` and the builder warns (for example `troubleshoot` with no troubleshooting entries, `decision` with no branches or rules).

**How the AI picks the view (skill text).** In giver mode, when a task's steps are captured, the AI proposes a view in plain words with a one-line reason ("This is a routine you run every shift, so I'll show it as a checklist"), with the other views as tappable alternatives, and records `view_confirmed`. Physical and clinical routines lean to `checklist`; calendar-driven work to `timeline`; judgement work to `decision`; reactive work to `troubleshoot`; screen procedures to `steps`. Changes:
- `references/pack-format.md`: the three fields, the table above in short form.
- `references/interview.md`: when and how to propose the view, and to ask for `when` on calendar-driven steps.
- `SKILL.md` giver mode step 4: one line to propose a view per task.
- `references/teaching.md`: when teaching from a Pack, follow the task's view (tick through a checklist, go by date for a timeline, ask the branch questions for a decision task, start from the symptom for troubleshooting).
- `pack-core.js`: `validate()` warns on an unknown view and on a view without the data it needs; `workflow.md` and `PACK-FOR-AI.md` state the view and include `when`.
- The example Pack sets `view` on its two captured tasks (`steps` and `timeline`); the e2e fixture Pack has one task per view, so all five are tested.

### Search

- Opens from the top bar field, the phone search button, or the `/` and Ctrl/⌘+K keys. A centred dialog on desktop, full screen on phones.
- Searches, case-insensitive and Thai-safe (plain substring match on normalised text), across: task names, step titles and text, rules, troubleshooting, glossary terms and meanings, open questions, urgent items.
- Results grouped by type, each showing the matched text and where it lives; Enter or click navigates to the route (step results open the walk-through at that step). Arrow keys move through results.
- Results are built with `el()`/`textContent` only.

### Ask AI

The existing "copy this prompt" feature, moved from a home section into a popover from the top bar, and kept per step in the action bar (existing per-step prompt).

## Pack Builder

Same tokens and components. Single centred column (max 720px) with an orb header. It stays one page: all three cards are always visible and usable in any order (images can be added before the save block, as today). A progress indicator at the top shows **1 Paste save block → 2 Add images → 3 Build** with a done mark when: 1 a pack was read; 2 every image the pack expects is added, or at least one image is added when it expects none; 3 a file was built. The summary line (`#sum`), warnings and image list keep their roles and ids. The language switch becomes a small segmented control. Build buttons are black pills; the accent colour picker stays in step 3.

## Diagrams

`diagram/references/style-guide.md` and the bundled templates align their neutral tokens (`paper`, `ink`, `muted`, `rule`) with the new system so diagrams sit naturally on the page. Accent rules and the contrast contract are unchanged.

## Other changes

- README and README.th screenshots regenerated (`docs/images/`).
- Print: sidebar, top bar, action bar and orbs hidden; content full width.
- `prefers-reduced-motion`: no transitions on sheets and dialogs.
- e2e tests: keep the XSS suite passing; add a smoke test that every route renders, search finds a known glossary term and step, and there is no horizontal overflow at 360px.

## Left to the builder

- Exact spacing scale, transition timings, icon drawing (simple inline SVG strokes, no icon library).
- How the orb colours are computed from the accent, within the rules above.
- Internal code structure of the template, as long as the security helpers are used and the file stays dependency-free.
- Wording of new UI strings, in both languages, in the existing plain style.
