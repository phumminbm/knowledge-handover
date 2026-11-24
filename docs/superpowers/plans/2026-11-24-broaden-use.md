# Broaden Beyond Leaving Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the skill, page, builder and docs purpose-neutral, show handover parts only when a Pack has handover data, and mention AI reuse only in the README.

**Architecture:** Wording changes in skill text, manifests and READMEs; small behaviour changes in `pack-core.js` (`build()`, `defaultMessage()`) and the START-HERE template (`renderSide()`, `home()`). No schema change.

**Tech Stack:** Vanilla JS, Node `node:test`, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-24-broaden-use-design.md`

## Global Constraints

- Keep the name `knowledge-handover`; tagline "Your know-how, ready to pass on." / "ความรู้ในหัว ส่งต่อได้ทุกเมื่อ".
- No schema change; `giver`, `handover`, `contact_after_leaving` keep their names.
- The interview never raises training or running an AI on the Pack; only the README mentions reuse, with "confirmed items only, keep human approval".
- Never mention the brand that inspired the visual style.
- Version 0.2.2 in both plugin manifests, `package.json`, `package-lock.json` and a CHANGELOG entry.

## Review Focus

1. A Pack whose `handover` object exists but every list is empty must count as "no handover data" (hide urgent UI, skip `handover-status.md`). → Task 1, Task 2.
2. A Pack with only `handover.access` or only `handover.watch` still counts as handover data. → Task 1.
3. A Pack with a `handover_message` set by the AI keeps it unchanged. → Task 1.

---

### Task 1: Pack output without handover data

**Files:** Modify `skills/knowledge-handover/scripts/pack-core.js` (`hasHandover`, `build`, `defaultMessage`). Test: `tests/unit/pack-core.test.js`.

**Interfaces:** Produces `core.hasHandover(k) -> boolean`: true when any of `handover.in_progress`, `deadlines`, `waiting_on_us`, `watch`, `access` is non-empty.

- [ ] **Step 1: Failing tests**

```js
test('hasHandover is true only when a handover list has items', () => {
  assert.strictEqual(core.hasHandover({}), false);
  assert.strictEqual(core.hasHandover({ handover: { deadlines: [], expires: '2027-01-01' } }), false);
  assert.strictEqual(core.hasHandover({ handover: { access: [{ system: 'CRM' }] } }), true);
  assert.strictEqual(core.hasHandover({ handover: { watch: [{ what: 'x' }] } }), true);
});
test('a pack without handover data has no handover file and a neutral message', () => {
  const r = core.build({ pack_id: 'KP-1', title: 'Quotes', language: 'en', handover: { deadlines: [] } }, {}, { template, fontsCss: '' });
  const paths = r.files.map((f) => f.path);
  assert.ok(!paths.some((p) => /handover-status\.md$/.test(p)));
  const msg = r.files.find((f) => /handover-message\.txt$/.test(f.path)).data;
  assert.doesNotMatch(msg, /handover|urgent/i);
  const th = core.build({ pack_id: 'KP-1', title: 'ใบเสนอราคา', language: 'th' }, {}, { template, fontsCss: '' });
  assert.doesNotMatch(th.files.find((f) => /handover-message\.txt$/.test(f.path)).data, /ส่งต่องาน|เรื่องด่วน/);
});
test('a pack with handover data keeps the handover file and an AI-written message', () => {
  const k = { pack_id: 'KP-1', title: 'x', handover: { access: [{ system: 'CRM' }] }, handover_message: 'Hi from Sam' };
  const r = core.build(k, {}, { template, fontsCss: '' });
  assert.ok(r.files.some((f) => /handover-status\.md$/.test(f.path)));
  assert.strictEqual(r.files.find((f) => /handover-message\.txt$/.test(f.path)).data, 'Hi from Sam');
});
```

- [ ] **Step 2:** `npm test` → the three FAIL.
- [ ] **Step 3:** Add and export `hasHandover`; `build()` adds `handover-status.md` only when `hasHandover(k)`; `defaultMessage()` keeps a set `handover_message`, otherwise TH "ส่งคู่มืองาน "<title>" ให้นะครับ/ค่ะ" / EN "Here is the knowledge pack for "<title>"", and mentions urgent items only when `hasHandover(k)`. `manifest.yaml` and `PACK-FOR-AI.md` drop the handover section in the same case.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit `Leave out handover parts when a pack has no handover data`.

### Task 2: START-HERE hides urgent entry points without handover data

**Files:** Modify `skills/knowledge-handover/assets/start-here.template.html` (`T.from`, `T.aiPrompt`, `renderSide`, `home`). Test: `tests/e2e/start-here.test.js`.

**Interfaces:** Template-local `hasHandover()` with the same rule as Task 1.

- [ ] **Step 1: Failing tests**

```js
test('a pack without handover data shows no urgent entry points', { skip }, async () => {
  const k = fixture(); delete k.handover;
  const { page, errors, context } = await openPack(browser, k);
  assert.strictEqual(await page.$('nav.side [data-route="#/urgent"]') !== null, false);
  assert.strictEqual(await page.$('.hero a[href="#/urgent"]') !== null, false);
  assert.doesNotMatch(await page.textContent('#app'), /Check what is urgent|Urgent/);
  assert.match(await page.textContent('.hero .top'), /^From:/);
  assert.deepStrictEqual(errors, []);
  await context.close();
});
test('a pack with handover data still shows urgent entry points', { skip }, async () => {
  const { page, context } = await openPack(browser, fixture());
  assert.ok(await page.$('nav.side [data-route="#/urgent"]'));
  await context.close();
});
```

- [ ] **Step 2:** run the two tests → first FAILS.
- [ ] **Step 3:** `T.from` → 'จาก' / 'From'. Without handover data: skip the Urgent nav link, the hero "See urgent items" button, tile 1 (renumber the rest) and the Home urgent section; `#/urgent` still renders (empty state). `T.aiPrompt` (TH/EN) asks to start "with the urgent items, if there are any".
- [ ] **Step 4:** `python3 tools/build_dist.py && npm run test:e2e` → PASS.
- [ ] **Step 5:** Commit `Hide urgent entry points when a pack has no handover data`.

### Task 3: Purpose-neutral skill text, manifests, builder and READMEs

**Files:** `SKILL.md` (description, intro, giver steps 3 and 6), `references/teaching.md`, `references/saving-and-hosts.md`, `references/pack-format.md` (`contact_after_leaving` note), `assets/pack-builder.template.html` (lede), `.claude-plugin/*.json`, `.codex-plugin/plugin.json`, `tools/build_dist.py` (PROMPT intro), `README.md`, `README.th.md`, `tests/scenarios.md` (two non-handover scenarios), `CHANGELOG.md`, version files. Test: `tests/unit/skill-text.test.js`.

- [ ] **Step 1: Failing tests**

```js
test('SKILL.md is purpose-neutral and makes handover capture conditional', () => {
  const doc = read('SKILL.md');
  assert.doesNotMatch(doc, /People leave\. Knowledge shouldn't\./);
  const step3 = doc.slice(doc.indexOf('3. **'), doc.indexOf('4. **Go deep'));
  assert.match(step3, /only when the work is changing hands/);
  assert.doesNotMatch(doc, /train(ing)? (an )?AI/i);
});
test('description triggers cover non-leaving uses', () => {
  const desc = read('SKILL.md').match(/^description: (.*)$/m)[1];
  for (const w of [/new (hire|staff|starter)/i, /SOP/, /ทำคู่มือ/]) assert.match(desc, w);
  assert.ok(desc.length <= 1024);
});
```

- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Rewrite per spec "Decisions": intro and description purpose-neutral (keep the leaving triggers, add new-hire, stand-in, SOP and "ทำคู่มือ" triggers); step 3 becomes "Capture pending work — only when the work is changing hands (someone leaving, changing role, going on leave); infer this from the opening sentence"; step 6 "Build and share". Manifest descriptions and Codex short/long description and prompts purpose-neutral and identical across manifests. READMEs (EN/TH, same content): new tagline, "Why" paragraph for any purpose, example prompts for new-hire manual and SOP, and a short "Use your Pack with your own AI" paragraph (holder can set up an AI assistant for parts of the work, confirmed items only, keep human approval). Two scenarios in `tests/scenarios.md`: new-hire manual; documenting own SOP while staying. Version 0.2.2 + CHANGELOG.
- [ ] **Step 4:** `npm test && python3 tools/build_dist.py && npm run test:e2e && claude plugin validate .` → PASS; repo has no mention of the inspiration brand.
- [ ] **Step 5:** Commit `Make the skill and docs purpose-neutral`, push, open PR, merge when CI is green.
