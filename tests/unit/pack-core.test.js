'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const core = require('../../skills/knowledge-handover/scripts/pack-core.js');

const ROOT = path.join(__dirname, '..', '..');
const SKILL = path.join(ROOT, 'skills', 'knowledge-handover');
const template = fs.readFileSync(path.join(SKILL, 'assets', 'start-here.template.html'), 'utf8');
const example = () => JSON.parse(fs.readFileSync(path.join(ROOT, 'examples', 'bank-reconciliation', 'knowledge.json'), 'utf8'));
const block = (k) => 'KNOWLEDGE-HANDOVER SAVE · ' + k.pack_id + ' · v' + k.version + '\n```json\n' + JSON.stringify(k, null, 2) + '\n```\n';

test('parseSave reads raw JSON', () => {
  const r = core.parseSave(JSON.stringify({ pack_id: 'KP-1', version: 1 }));
  assert.strictEqual(r.pack.pack_id, 'KP-1');
  assert.strictEqual(r.blocks, 1);
});

test('parseSave reads a save block surrounded by chat text', () => {
  const k = example();
  const r = core.parseSave('Here you go!\n\n' + block(k) + '\nKeep this somewhere safe {not json}.');
  assert.deepStrictEqual(r.pack, k);
});

test('parseSave ignores braces inside strings', () => {
  const r = core.parseSave('{"pack_id":"KP-1","title":"a } tricky { title \\" with quote"}');
  assert.strictEqual(r.pack.title, 'a } tricky { title " with quote');
});

test('parseSave merges split blocks, newest version wins', () => {
  const a = { pack_id: 'KP-1', version: 1, title: 'old', processes: [{ id: 'P01', name: 'one' }] };
  const b = { pack_id: 'KP-1', version: 2, title: 'new', processes: [{ id: 'P01', name: 'one v2' }, { id: 'P02', name: 'two' }] };
  const r = core.parseSave(block(b) + '\n' + block(a));
  assert.strictEqual(r.blocks, 2);
  assert.strictEqual(r.pack.title, 'new');
  assert.deepStrictEqual(r.pack.processes.map((p) => p.name), ['one v2', 'two']);
});

test('parseSave refuses blocks from different packs', () => {
  assert.throws(() => core.parseSave(block({ pack_id: 'KP-1', version: 1 }) + block({ pack_id: 'KP-2', version: 1 })), /different packs/);
});

test('parseSave explains what to paste when nothing is found', () => {
  assert.throws(() => core.parseSave('hello'), /Paste the whole save block/);
});

test('validate flags broken branches, missing images and fall-through', () => {
  const k = {
    pack_id: 'KP-1',
    processes: [{ id: 'P01', steps: [
      { id: 'P01.S01', branches: [{ label: 'small', goto: 'P01.S02' }, { label: 'large', goto: 'P01.S03' }, { label: 'lost', goto: 'P01.S99' }] },
      { id: 'P01.S02', image: 'P01-S02.png' },
      { id: 'P01.S03' },
    ] }],
  };
  const w = core.validate(k, []).join('\n');
  assert.match(w, /points to missing step P01\.S99/);
  assert.match(w, /image P01-S02\.png was not provided/);
  assert.match(w, /continues into P01\.S03, another option of P01\.S01/);
});

test('validate warns about unsafe diagram markup', () => {
  const k = { pack_id: 'KP-1', processes: [{ id: 'P01', diagram_svg: '<svg onload="x()"></svg>' }] };
  assert.match(core.validate(k, []).join('\n'), /P01: the diagram contains scripts/);
  const clean = { pack_id: 'KP-1', processes: [{ id: 'P01', diagram_svg: '<svg><line marker-end="url(#arrow)"/></svg>' }] };
  assert.deepStrictEqual(core.validate(clean, []), []);
});

test('build produces every Pack file', () => {
  const r = core.build(example(), {}, { template, fontsCss: '' });
  const paths = r.files.map((f) => f.path.replace(/^[^/]+\//, ''));
  for (const p of ['START-HERE.html', 'PACK-FOR-AI.md', 'knowledge.json', 'README.md', 'handover-status.md',
    'open-questions.md', 'change-log.md', 'manifest.yaml', 'profile/role-and-context.md']) {
    assert.ok(paths.includes(p), 'missing ' + p);
  }
  assert.ok(paths.some((p) => /^processes\/P01-[^/]+\/workflow\.md$/.test(p)));
  assert.match(r.zipName, /^knowledge-handover_KP-2569-0001_\d{4}-\d{2}-\d{2}\.zip$/);
});

test('START-HERE.html keeps pack text inside its data script', () => {
  const k = example();
  k.title = '</script><script>window.__pwned=1</script>';
  const html = core.renderStartHere(k, {}, template, '');
  assert.strictEqual(html.split('</script>').length, template.split('</script>').length);
  assert.ok(!html.includes('<title></script>'));
});

test('build never writes outside the pack folder', () => {
  const k = example();
  k.pack_id = '../../evil';
  k.processes[0].id = '../../../etc';
  k.processes[0].slug = '../x';
  const r = core.build(k, { '../../escape.png': new Uint8Array([1, 2, 3]) }, { template, fontsCss: '' });
  for (const f of r.files) {
    assert.ok(!f.path.split('/').some((seg) => seg === '..' || seg === ''), 'unsafe path ' + f.path);
    assert.ok(!path.isAbsolute(f.path));
  }
  assert.ok(!r.zipName.includes('/') && !r.zipName.includes('..'));
});

test('zip output is a valid archive', () => {
  const r = core.build(example(), { 'P01-S01.png': new Uint8Array(fs.readFileSync(path.join(ROOT, 'examples', 'bank-reconciliation', 'images', 'P01-S01.png'))) }, { template, fontsCss: '' });
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'kh-zip-')), 'p.zip');
  fs.writeFileSync(file, Buffer.from(core.zip(r.files)));
  const out = execFileSync('python3', ['-c', 'import sys,zipfile;z=zipfile.ZipFile(sys.argv[1]);print(z.testzip() or "ok",len(z.namelist()))', file]).toString().trim();
  assert.strictEqual(out, 'ok ' + r.files.length);
});

test('crc32 and base64 match reference values', () => {
  assert.strictEqual(core.crc32(new TextEncoder().encode('123456789')), 0xCBF43926);
  for (const s of ['', 'a', 'ab', 'abc', 'สวัสดี']) {
    const bytes = new TextEncoder().encode(s);
    assert.strictEqual(core.base64(bytes), Buffer.from(bytes).toString('base64'));
  }
});

test('autoMermaid draws branches', () => {
  const m = core.autoMermaid({ steps: [{ id: 'S1', title: 'Check', branches: [{ label: 'ok', goto: 'S2' }] }, { id: 'S2', title: 'Done' }] });
  assert.match(m, /S1 -->\|ok\| S2|S1 -- ok --> S2|S1 -->.*S2/);
});

test('example and recorded test packs build without broken links', () => {
  const dirs = [path.join(ROOT, 'examples', 'bank-reconciliation')].concat(
    fs.readdirSync(path.join(ROOT, 'tests', 'runs')).map((d) => path.join(ROOT, 'tests', 'runs', d))
      .filter((d) => fs.existsSync(path.join(d, 'knowledge.json'))));
  assert.ok(dirs.length >= 6);
  for (const d of dirs) {
    const k = core.parseSave(fs.readFileSync(path.join(d, 'knowledge.json'), 'utf8')).pack;
    const imgDir = path.join(d, 'images');
    const names = fs.existsSync(imgDir) ? fs.readdirSync(imgDir) : [];
    const w = core.validate(k, names).filter((x) => /missing step|continues into|unknown status|has no id/.test(x));
    assert.deepStrictEqual(w, [], path.relative(ROOT, d));
  }
});

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
  assert.match(wf, /\*\*View:\*\* timeline/);
  assert.match(ai, /\*\*View:\*\* timeline/);
  assert.match(ai, /Day 1/);
});
