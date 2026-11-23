# START-HERE and Pack Builder Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild START-HERE.html as an app with a sidebar, search, a focus-mode walk-through and five task views; restyle the Pack Builder with the same visual system; teach the skill to pick a view per task.

**Architecture:** START-HERE stays one self-contained template (`assets/start-here.template.html`, inline CSS + vanilla ES5 JS) rendered by `pack-core.js`. Data rules (`validate()`, Markdown output, the `VIEWS` list) live in `pack-core.js` and are unit-tested with `node:test`. Page behaviour is tested in Chromium through Playwright against a fixture Pack.

**Tech Stack:** Vanilla JS (ES5 style), inline CSS, Node 22 `node:test`, Playwright 1.63 (dev only), Python 3 build script.

**Spec:** `docs/superpowers/specs/2026-11-23-ui-redesign-design.md` · Mockup: `docs/superpowers/specs/2026-11-23-ui-redesign-mockup.html`

## Global Constraints

- No mention of the brand that inspired the style, anywhere: files, built output, commit messages, test names. (The executor knows the name from the conversation; it is deliberately not written here.)
- Fonts unchanged: Poppins + Prompt from `assets/fonts/poppins-prompt.css`. Only weights and sizes change.
- No dependencies, no network requests from any page; light theme only.
- All Pack text enters the DOM through `el()` / `textContent`; diagrams through `safeSvg()`; Pack Builder values through `esc()`; file paths through `safeSeg()` / `slug()`.
- Every new UI string exists in both `TXT.th` and `TXT.en` and stays overridable by `ui_labels`.
- `localStorage` access always wrapped in try/catch; the page works without it.
- Existing `#/task/<id>[/<tab>[/<step>]]` links keep working.
- Tokens: `bg #ffffff`, `surface #f6f6f5`, `ink #0b0b0b`, `muted #5f5f5c`, `hair #e6e6e4`, `accent` = Pack accent (default `#bf4520`), `on-accent #ffffff`, `ok #2f6b3a`, `bad #b42318`, `warn-bg #fff4e5`, `warn-fg #7a4a00`. Radii: 999px pills/buttons, 24px large cards and image frame, 16px small cards and list groups, 12px inputs.
- Accent is only for pins, progress fills, the current-step/nav dot, near-due dots and orbs. Primary buttons are `ink`.
- `diagram/` is not modified.
- Before every commit touching templates or `pack-core.js`: `npm test && python3 tools/build_dist.py && npm run test:e2e`, and commit the regenerated `assets/pack-builder.html`.

## Review Focus

1. **A Pack with no captured tasks** (only `tasks[]`, no `processes`) must render Home, sidebar and search without errors. → Task 3.
2. **Long unbroken Thai titles** at 360px width must wrap or truncate, never cause horizontal scroll. → Task 3.
3. **`localStorage` throwing** (private mode) must not break resume, ticks or progress. → Task 4 and Task 5.
4. **A decision finder over branches that loop or point to missing steps** must stop and show the step list, never hang. → Task 5.
5. **Deep links to a missing task or step** fall back to Home or step 1. → Task 4.

---

## File map

| File | Change |
|---|---|
| `skills/knowledge-handover/scripts/pack-core.js` | `VIEWS`, `effectiveView()`, validate rules, Markdown output for `view` and `when` |
| `skills/knowledge-handover/assets/start-here.template.html` | rewritten: tokens, shell, routes, search, walk-through, views |
| `skills/knowledge-handover/assets/pack-builder.template.html` | restyled, progress indicator |
| `skills/knowledge-handover/SKILL.md`, `references/pack-format.md`, `references/interview.md`, `references/teaching.md` | task view instructions |
| `examples/bank-reconciliation/knowledge.json` | `view` on P01/P02, `when` on P02 steps |
| `tests/unit/pack-core.test.js` | view rules |
| `tests/e2e/helpers.js` (new) | `openPack()` |
| `tests/e2e/fixtures/views.json` (new) | one task per view |
| `tests/e2e/start-here.test.js` (new) | shell, search, walk-through, views |
| `tests/e2e/pack-builder.test.js` (new) | builder flow |
| `tests/e2e/xss.test.js` | adopt helper if selectors change |
| `docs/images/*.jpg`, `README.md`, `README.th.md`, `CHANGELOG.md`, `AGENTS.md` | screenshots, docs |

---

### Task 1: Task views in the data layer

**Files:**
- Modify: `skills/knowledge-handover/scripts/pack-core.js` (`validate()`, `mdWorkflow()`, `mdProcedures()`, `mdForAI()`, exports)
- Test: `tests/unit/pack-core.test.js`

**Interfaces:**
- Produces: `core.VIEWS = ['steps','checklist','timeline','decision','troubleshoot']`; `core.effectiveView(process) -> string` (returns `process.view` when it is in `VIEWS` and has its data, else `'steps'`). Data needed: `checklist`/`timeline` → ≥1 step; `decision` → ≥1 step with branches **or** ≥1 rule; `troubleshoot` → ≥1 troubleshooting entry.

- [ ] **Step 1: Write failing tests**

```js
test('effectiveView falls back to steps', () => {
  assert.strictEqual(core.effectiveView({ steps: [{ id: 'S1' }] }), 'steps');
  assert.strictEqual(core.effectiveView({ view: 'checklist', steps: [{ id: 'S1' }] }), 'checklist');
  assert.strictEqual(core.effectiveView({ view: 'troubleshoot', steps: [{ id: 'S1' }] }), 'steps');
  assert.strictEqual(core.effectiveView({ view: 'troubleshoot', troubleshooting: [{ id: 'T1' }] }), 'troubleshoot');
  assert.strictEqual(core.effectiveView({ view: 'decision', rules: [{ id: 'R1' }] }), 'decision');
  assert.strictEqual(core.effectiveView({ view: 'banana', steps: [{ id: 'S1' }] }), 'steps');
});
test('validate warns about unknown views and views without data', () => {
  const w = core.validate({ pack_id: 'KP-1', processes: [
    { id: 'P01', view: 'banana', steps: [{ id: 'P01.S01' }] },
    { id: 'P02', view: 'troubleshoot', steps: [{ id: 'P02.S01' }] }] }, []).join('\n');
  assert.match(w, /P01: unknown view "banana"/);
  assert.match(w, /P02: view "troubleshoot" needs troubleshooting entries; showing steps instead/);
});
test('Markdown output names the view and step timing', () => {
  const k = { pack_id: 'KP-1', title: 'x', processes: [{ id: 'P01', name: 'Close', view: 'timeline',
    steps: [{ id: 'P01.S01', title: 'Export', when: 'Day 1' }] }] };
  const r = core.build(k, {}, { template, fontsCss: '' });
  const wf = r.files.find((f) => /workflow\.md$/.test(f.path)).data;
  const ai = r.files.find((f) => /PACK-FOR-AI\.md$/.test(f.path)).data;
  assert.match(wf, /View: timeline/);
  assert.match(ai, /View: timeline/);
  assert.match(ai, /Day 1/);
});
```

- [ ] **Step 2:** Run `node --test tests/unit/pack-core.test.js` → the three tests FAIL (`effectiveView is not a function`).
- [ ] **Step 3:** Implement `VIEWS`, `effectiveView()`, the two warnings (exact wording above; for `checklist`/`timeline` "needs steps", for `decision` "needs branching steps or rules"), add `View: <effectiveView>` to `workflow.md` and to each process section of `PACK-FOR-AI.md`, and print `when` beside each step title in `procedures.md` and `PACK-FOR-AI.md` (`— when: Day 1`). Export both names.
- [ ] **Step 4:** Run `npm test` → all PASS.
- [ ] **Step 5:** Commit `Add task views to the pack data rules`.

---

### Task 2: Skill text and example Pack

**Files:**
- Modify: `skills/knowledge-handover/references/pack-format.md` (schema block lines ~73–98, new "Task views" subsection after "Branches")
- Modify: `skills/knowledge-handover/references/interview.md` ("Structured fields per step")
- Modify: `skills/knowledge-handover/SKILL.md` (giver mode step 4, one sentence)
- Modify: `skills/knowledge-handover/references/teaching.md` ("Choose the explanation yourself")
- Modify: `examples/bank-reconciliation/knowledge.json`
- Test: `tests/unit/manifests.test.js`

**Interfaces:**
- Consumes: `core.VIEWS` (Task 1).

- [ ] **Step 1: Write failing test**

```js
test('pack-format.md documents every task view', () => {
  const doc = fs.readFileSync(path.join(ROOT, 'skills/knowledge-handover/references/pack-format.md'), 'utf8');
  const core = require('../../skills/knowledge-handover/scripts/pack-core.js');
  for (const v of core.VIEWS) assert.match(doc, new RegExp('`' + v + '`'));
  assert.match(doc, /view_confirmed/);
  assert.match(doc, /`when`/);
});
test('example pack uses two views', () => {
  const k = read('examples/bank-reconciliation/knowledge.json');
  assert.deepStrictEqual(k.processes.map((p) => p.view), ['steps', 'timeline']);
  assert.ok(k.processes[1].steps.every((s) => s.when));
});
```

- [ ] **Step 2:** Run `npm test` → FAIL.
- [ ] **Step 3:** Write the docs from the spec's "Task views" section: schema fields `view`, `view_confirmed`, `when`; a 5-row table (view → kinds of work → what the receiver sees); interview guidance (propose a view with a one-line reason once steps are captured, alternatives as taps, ask for `when` on calendar-driven steps, record `view_confirmed`); SKILL.md step 4 gets "Propose a view for each task (`references/pack-format.md`) and let the giver confirm it in one tap."; teaching.md gets one paragraph on following the view. In the example set P01 `view: "steps"`, P02 `view: "timeline"`, `view_confirmed: true` on both, and P02 steps `when: "วันที่ 1–3 ของเดือน"` / `"ภายในวันที่ 10"` (match the P02 deadline in `handover.deadlines`).
- [ ] **Step 4:** Run `npm test && python3 tools/build_dist.py` → PASS; `dist/PROMPT.md` contains "view_confirmed".
- [ ] **Step 5:** Commit `Teach the skill to choose a view per task`.

---

### Task 3: New shell: tokens, sidebar, top bar, Home and reference views

**Files:**
- Modify: `skills/knowledge-handover/assets/start-here.template.html` (CSS block, `home()`, `footer()`, `route()`, new `shell()`, `urgentView()`, `questionsView()`, `glossaryView()`, `changesView()`)
- Create: `tests/e2e/helpers.js`, `tests/e2e/fixtures/views.json`, `tests/e2e/start-here.test.js`
- Modify: `tests/e2e/xss.test.js` (use helper; keep all payload cases)

**Interfaces:**
- Produces (helpers.js): `openPack(browser, pack, { hash = '', viewport = { width: 1280, height: 900 }, images = {} }) -> Promise<{ page, errors: string[], external: string[] }>`; it renders with `core.renderStartHere`, writes to a temp file, records console errors, page errors and non-file requests.
- Produces (fixture): `views.json` = valid Pack `KP-TEST-0001`, language `en`, processes `P01` steps (with an image-less branch step and `next`), `P02` checklist (one `safety: true` step), `P03` timeline (`when` on 3 of 4 steps), `P04` decision (2 branch steps + 2 rules, one branch looping back to its own question), `P05` troubleshoot (3 troubleshooting entries), plus `tasks` P01–P06 where P06 has no process; glossary with term `Reconcile`; 2 open questions; handover with 4 deadlines.
- Produces (DOM contract used by later tasks and tests): `#app` root; `.shell` grid; `nav.side` with `a[data-route]`; `.topbar` with `#search-open`; `#menu-open` (phones); `.panel` for a task tab's content; `.hero` with `.orb` elements; CSS custom properties `--accent`, `--accent-tint` on `:root`.
- Produces (template functions): `safeAccent(hex) -> hex` (darken in HSL until white text has contrast ≥ 4.5:1), `orbColors(hex) -> [string,string,string]`, `go(route)`, `T` keys for new strings.

- [ ] **Step 1: Write failing tests** in `start-here.test.js`

```js
for (const hash of ['', '#/urgent', '#/questions', '#/glossary', '#/changes', '#/nope'])
  test(`route ${hash || 'home'} renders without errors`, async () => {
    const { page, errors, external } = await openPack(browser, fixture, { hash });
    assert.ok(await page.$('nav.side'));
    assert.deepStrictEqual(errors, []); assert.deepStrictEqual(external, []);
  });
test('unknown route shows home', …expect(await page.$('.hero')).toBeTruthy());
test('light accent is darkened to keep pins readable', async () => {
  const { page } = await openPack(browser, { ...fixture, accent: '#ffd400' });
  const ratio = await page.evaluate(() => contrastWithWhite(getComputedStyle(document.documentElement).getPropertyValue('--accent')));
  assert.ok(ratio >= 4.5);
});
test('no horizontal scroll at 360px on every route, long Thai title included', async () => {
  const pack = { ...fixture, title: 'งานกระทบยอดบัญชีธนาคารและเงินสดย่อยประจำเดือนสำหรับทุกสาขาทั่วประเทศ'.repeat(2) };
  for (const hash of ['', '#/urgent', '#/task/P01/walk', '#/task/P02']) {
    const { page } = await openPack(browser, pack, { hash, viewport: { width: 360, height: 780 } });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= 360), hash);
  }
});
test('pack with no processes renders home and sidebar', … processes: [] … no errors);
test('phone menu opens the sidebar sheet and Esc closes it', …);
test('primary buttons are ink, not accent', … getComputedStyle('.btn.pri').backgroundColor === 'rgb(11, 11, 11)');
```
(`contrastWithWhite` is defined in the test file and passed via `page.evaluate` source.)

- [ ] **Step 2:** Run `npm run test:e2e` → new tests FAIL.
- [ ] **Step 3:** Implement per spec "Visual system", "App shell", "Views and routes", "Home", status markers table. Home hero: meta, title (300–400 weight, `clamp(2rem,3vw+1rem,3rem)`), lede, overall progress, primary "Continue where you left off"/"Start with the first task", secondary "See urgent items", orbs from `orbColors()`. Sidebar groups: Home, Urgent (count), Tasks (progress ring per process; tasks without a process greyed with `T.notCaptured`), Reference (Open questions count, Glossary, Changes), footer with pack id/version. Top bar: search field (button `#search-open`, wired in Task 4), Ask AI popover with the existing copy-prompt content. Phones < 960px: `#menu-open` opens the sidebar as a sheet with a dimmed backdrop; Esc / backdrop / close button closes it. Print CSS hides sidebar, top bar, action bar, orbs. Under `prefers-reduced-motion: reduce`, sheets, dialogs and progress fills have no transitions. Keep the existing `safeSvg()` and `el()` unchanged.
- [ ] **Step 4:** `npm test && python3 tools/build_dist.py && npm run test:e2e` → all PASS (XSS suite included).
- [ ] **Step 5:** Commit `Rebuild START-HERE home on a sidebar app shell`.

---

### Task 4: Search and the focus-mode walk-through

**Files:**
- Modify: `skills/knowledge-handover/assets/start-here.template.html` (`task()`, `walk()`, new `searchIndex()`, `openSearch()`, `lightbox()`, `lastStep()`, `setLastStep()`)
- Test: `tests/e2e/start-here.test.js`

**Interfaces:**
- Consumes: DOM contract and `openPack()` from Task 3.
- Produces: `searchIndex() -> [{ type: 'task'|'step'|'rule'|'trouble'|'term'|'question'|'urgent', title: string, text: string, route: string }]`; `#search` dialog with `input#search-q` and `[role=option]` results; `lastStep(pid) -> stepId|null`, `setLastStep(pid, stepId)` (localStorage key `kh-last-<pack_id>`); walk DOM: `.rail` step list with `a[data-step]`, `.actionbar` with `#next`, `#back`, `#ask-step`; `.shot` opens `#lightbox`.

- [ ] **Step 1: Write failing tests**

```js
test('/ opens search; a glossary term and a step title are found and open their place', …
  page.keyboard.press('/'); fill('#search-q','reconcile') → first option text includes 'Reconcile'; Enter → location.hash === '#/glossary';
  reopen with Control+K, search a P01 step title → Enter → hash === '#/task/P01/walk/<that step id>');
test('search shows pack text as text', … fixture term '<b>x</b>' appears literally, no <b> element in results);
test('#/task/P01 opens the walk-through with the step rail and sticky action bar', …);
test('clicking a rail step jumps to it; arrow keys move; Back returns', …);
test('branch step hides Next until a choice is made', …);
test('continue button resumes at the last seen step', … visit P01 step 3, go home, click hero primary → hash ends with P01's 3rd step id);
test('resume and progress work when localStorage throws', … page.addInitScript(() => { Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked')}}) }) … no errors, walk works);
test('missing task falls back to home, missing step to step 1', … '#/task/NOPE' → .hero; '#/task/P01/walk/NOPE' → rail current is first step);
test('image opens full screen and Esc closes it', … uses fixture image P01-S01.png from examples);
```

- [ ] **Step 2:** `npm run test:e2e` → new tests FAIL.
- [ ] **Step 3:** Implement per spec "Task", "Walk-through (focus mode)", "Search", "Ask AI". Search: normalise with `toLowerCase()` and `normalize('NFC')`, plain substring match, results grouped by type in the order of the `type` union above, max 8 per group, arrow keys + Enter, Esc closes; full screen under 960px. Walk-through: while the walk tab is active on ≥ 960px the sidebar shows `.rail` instead of app navigation, with "‹ All tasks" → `#/`; on phones a "Step n of m ▾" button opens the rail as a sheet. `.actionbar` is `position: sticky; bottom: 0` with `env(safe-area-inset-bottom)` padding. Record `setLastStep()` on every draw. Tabs become a pill segmented control (`role=tablist`). The Overview tab shows `diagram_svg` (still through `safeSvg()`) inside a 24px-radius card.
- [ ] **Step 4:** `npm test && python3 tools/build_dist.py && npm run test:e2e` → PASS.
- [ ] **Step 5:** Commit `Add search and a focus-mode walk-through`.

---

### Task 5: The four new task views

**Files:**
- Modify: `skills/knowledge-handover/assets/start-here.template.html` (new `checklist()`, `timeline()`, `decision()`, `troubleshootView()`; `task()` tab order; home cards and sidebar labels)
- Test: `tests/e2e/start-here.test.js`

**Interfaces:**
- Consumes: `effectiveView` rules from Task 1 (re-implemented in the template as `viewOf(p)` with identical logic, since the page does not load `pack-core.js`); task shell from Task 4.
- Produces: tab ids `checklist`, `timeline`, `decide`, `fix` (main tab per view; `walk` stays for `steps`); `#/task/<id>` with no tab opens `mainTab(p)`; ticks in localStorage key `kh-ticks-<pack_id>`.

- [ ] **Step 1: Write failing tests**

```js
test('each view opens on its own main tab', … for [P01,'walk'],[P02,'checklist'],[P03,'timeline'],[P04,'decide'],[P05,'fix']: open '#/task/'+id → '[role=tab][aria-selected=true]' has data-tab === expected);
test('the walk-through tab is still available on every view', …);
test('checklist: safety step first, ticks persist across reload, Clear ticks resets', …);
test('timeline groups by when and puts steps without when under "Any time"', …);
test('decision finder asks branch questions and lands on a step; a loop stops with the step list', …);
test('troubleshoot filter narrows symptoms', … fill filter 'printer' → 1 card);
test('home cards name the action of each view', … texts include 'Open checklist','See timeline','Find what to do','What's wrong?','Walk me through');
test('old pack without view opens the walk-through', … example pack with view removed);
```

- [ ] **Step 2:** `npm run test:e2e` → FAIL.
- [ ] **Step 3:** Implement per spec table "Task views". Decision finder: start at the first branch step; show its `branch_question` and options; follow `goto`; stop when reaching a step without branches (show it as the answer with "Open in walk-through"), or when a step repeats or `goto` is missing (show "Couldn't decide from the questions" plus the step list). Timeline highlights a group only when `when` parses as an ISO date equal to today. New `T` strings in both languages.
- [ ] **Step 4:** `npm test && python3 tools/build_dist.py && npm run test:e2e` → PASS.
- [ ] **Step 5:** Commit `Show each task in the view that fits its work`.

---

### Task 6: Pack Builder restyle

**Files:**
- Modify: `skills/knowledge-handover/assets/pack-builder.template.html`
- Create: `tests/e2e/pack-builder.test.js`

**Interfaces:**
- Keeps ids `#save`, `#sum`, `#err`, `#imgs`, `#warn`, `#accent`, `#shrink`, `#buildZip`, `#buildHtml`, `#buildAi`; adds `.progress [data-step="1|2|3"]` with class `done`.

- [ ] **Step 1: Write failing tests**

```js
test('progress marks step 1 when a pack is read, step 2 when expected images are added, step 3 after a build', …);
test('images can be added before the save block', … setInputFiles first, then fill #save → step 2 done);
test('language switch keeps the pasted pack', …);
test('no horizontal scroll at 360px', …);
```

- [ ] **Step 2:** Run `npm run test:e2e` → FAIL.
- [ ] **Step 3:** Restyle with the shared tokens (copy the token block from the START-HERE template), centred 720px column, orb header from the chosen accent (`orbColors` logic duplicated, 10 lines), three always-visible cards, progress rules from the spec, segmented language switch, black pill build buttons. All dynamic text still through `esc()` or `textContent`.
- [ ] **Step 4:** `python3 tools/build_dist.py && npm run test:e2e` → PASS (XSS builder test included).
- [ ] **Step 5:** Commit `Restyle the Pack Builder to match START-HERE`.

---

### Task 7: Screenshots, docs and release notes

**Files:**
- Modify: `docs/images/start-here.jpg`, `walkthrough.jpg`, `phone.jpg`, `pack-builder.jpg`; add `docs/images/views.jpg`
- Modify: `README.md`, `README.th.md` (image section + one paragraph on task views, both languages saying the same), `CHANGELOG.md` (`Unreleased › Added/Changed`), `AGENTS.md` ("Schema" bullet mentions `view`/`when`)

- [ ] **Step 1:** Build the example Pack (`npm run example`) and capture with Playwright at deviceScaleFactor 2, JPEG quality 82: home 1280×820, walk-through `#/task/P01/walk/P01.S01`, iPhone 13 walk-through, Pack Builder with the example pasted and both images added, and `views.jpg` = the fixture's checklist view.
- [ ] **Step 2:** Update both READMEs and CHANGELOG; run `npm test` → PASS.
- [ ] **Step 3:** Full check: `npm test && python3 tools/build_dist.py && npm run test:e2e && claude plugin validate .` → all PASS; then search the whole repo (and `git log` messages of this branch) for the inspiration brand name → no hits.
- [ ] **Step 4:** Commit `Update screenshots and docs for the new design`, push the branch, open a PR.
