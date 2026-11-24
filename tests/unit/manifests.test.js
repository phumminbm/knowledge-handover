'use strict';
// Every host manifest describes the same plugin and points at the one skill folder.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const PLUGINS = ['.claude-plugin/plugin.json', '.codex-plugin/plugin.json'];
const SHARED = ['name', 'description', 'version', 'author', 'homepage', 'repository', 'license', 'keywords'];

test('plugin manifests share identity, description and version', () => {
  const [first, ...rest] = PLUGINS.map(read);
  for (const [i, m] of rest.entries()) {
    for (const key of SHARED) assert.deepStrictEqual(m[key], first[key], PLUGINS[i + 1] + ' ' + key);
  }
  assert.match(first.version, /^\d+\.\d+\.\d+$/);
});

test('package.json version matches the plugins', () => {
  assert.strictEqual(read('package.json').version, read('.claude-plugin/plugin.json').version);
});

test('marketplaces point at the repository root', () => {
  const claude = read('.claude-plugin/marketplace.json');
  assert.deepStrictEqual(claude.plugins.map((p) => [p.name, p.source]), [['knowledge-handover', './']]);
  const agents = read('.agents/plugins/marketplace.json');
  assert.deepStrictEqual(agents.plugins.map((p) => [p.name, p.source.path]), [['knowledge-handover', './']]);
});

test('the skill the manifests point to exists and is named the same', () => {
  const skill = fs.readFileSync(path.join(ROOT, 'skills', 'knowledge-handover', 'SKILL.md'), 'utf8');
  const fm = skill.match(/^---\n([\s\S]*?)\n---/)[1];
  assert.match(fm, /^name: knowledge-handover$/m);
  const desc = fm.match(/^description: (.*)$/m)[1];
  assert.ok(desc.length <= 1024, 'SKILL.md description is ' + desc.length + ' characters; hosts cap it at 1024');
});

test('icons referenced by manifests exist', () => {
  const claude = read('.claude-plugin/plugin.json');
  const codex = read('.codex-plugin/plugin.json').interface;
  for (const p of [claude.icon, codex.logo, codex.composerIcon]) assert.ok(fs.existsSync(path.join(ROOT, p)), p);
});

test('CHANGELOG has an entry for the current version', () => {
  const v = read('.claude-plugin/plugin.json').version;
  assert.match(fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8'), new RegExp('^## \\[' + v.replace(/\./g, '\\.') + '\\]', 'm'));
});

test('pack-format.md documents every task view', () => {
  const doc = fs.readFileSync(path.join(ROOT, 'skills/knowledge-handover/references/pack-format.md'), 'utf8');
  const core = require('../../skills/knowledge-handover/scripts/pack-core.js');
  for (const v of core.VIEWS) assert.match(doc, new RegExp('`' + v + '`'));
  assert.match(doc, /view_confirmed/);
  assert.match(doc, /`when`/);
});

test('example pack has a real diagram that passes validation', () => {
  const core = require('../../skills/knowledge-handover/scripts/pack-core.js');
  const k = read('examples/bank-reconciliation/knowledge.json');
  assert.match(k.processes[0].diagram_svg || '', /^<svg[\s\S]*role="img"[\s\S]*<title id=[\s\S]*<\/svg>$/);
  assert.deepStrictEqual(core.validate(k, ['P01-S01.png', 'P01-S02.png']).filter((w) => /diagram/.test(w)), []);
});

test('example pack is in English and shows every view, each task with its own diagram and practice', () => {
  const core = require('../../skills/knowledge-handover/scripts/pack-core.js');
  const k = read('examples/bank-reconciliation/knowledge.json');
  assert.strictEqual(k.language, 'en');
  assert.doesNotMatch(JSON.stringify(k), /[\u0E00-\u0E7F]/, 'no Thai text left');
  assert.deepStrictEqual([...new Set(k.processes.map((p) => p.view))].sort(), ['checklist', 'decision', 'steps', 'timeline', 'troubleshoot']);
  const kinds = k.processes.map((p) => (p.diagram_svg.match(/<title id="p\d+-([a-z]+)-title"/) || [])[1]);
  assert.deepStrictEqual(kinds, ['flow', 'time', 'lanes', 'tree', 'fix', 'state'], 'six different kinds of diagram');
  for (const p of k.processes) {
    assert.strictEqual(core.effectiveView(p), p.view, p.id + ' has the data its view needs');
    assert.match(p.diagram_svg || '', /^<svg[\s\S]*role="img"[\s\S]*<title id=[\s\S]*<\/svg>$/, p.id + ' has a diagram');
    assert.ok((p.scenarios || []).length >= 1, p.id + ' has a practice question');
  }
  const byView = Object.fromEntries(k.processes.map((p) => [p.view, p]));
  assert.ok(byView.timeline.steps.length >= 4 && byView.timeline.steps.every((s) => s.when));
  assert.ok(byView.checklist.steps.some((s) => s.safety && s.status === 'validated'), 'a confirmed safety step');
  assert.ok(byView.decision.rules.length >= 2 && byView.decision.steps.filter((s) => s.branches).length >= 2);
  assert.ok(byView.troubleshoot.troubleshooting.length >= 3);
  const ids = k.processes.map((p) => p.id);
  for (const t of k.tasks) if (t.captured !== 'not_started') assert.ok(ids.includes(t.id), t.id + ' is captured');
  const images = require('fs').readdirSync(path.join(ROOT, 'examples', 'bank-reconciliation', 'images'));
  const w = core.validate(k, images);
  assert.deepStrictEqual(w.filter((x) => /diagram|missing step|continues into|unknown status|has no id|view/.test(x)), []);
});

test('the two examples together use all four document types, and the IT one is complete', () => {
  const core = require('../../skills/knowledge-handover/scripts/pack-core.js');
  const docs = require('../../skills/knowledge-handover/scripts/documents.js');
  const bank = read('examples/bank-reconciliation/knowledge.json');
  const it = read('examples/it-operations/knowledge.json');
  const types = new Set(bank.processes.concat(it.processes).map((p) => docs.docType(p)));
  assert.deepStrictEqual([...types].sort(), ['dev_guide', 'runbook', 'sop', 'work_instruction']);
  assert.strictEqual(it.language, 'en');
  for (const p of it.processes) {
    assert.match(p.diagram_svg || '', /^<svg[\s\S]*role="img"[\s\S]*<\/svg>$/, p.id + ' has a diagram');
    assert.ok((p.scenarios || []).length >= 1, p.id + ' has practice');
    assert.strictEqual(core.effectiveView(p), p.view, p.id + ' view has its data');
  }
  assert.ok(it.processes.some((p) => (p.steps || []).some((s) => s.command)), 'commands');
  assert.ok(it.processes.some((p) => (p.ppe || []).length && (p.steps || []).some((s) => s.spec)), 'PPE and specs');
  assert.deepStrictEqual(core.validate(it).filter((w) => !/not yet confirmed/.test(w)), []);
});
