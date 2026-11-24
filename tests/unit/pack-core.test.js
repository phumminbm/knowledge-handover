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
  assert.match(r.zipName, /^knowledge-handover_KP-2026-0001_\d{4}-\d{2}-\d{2}\.zip$/);
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
  const dirs = [path.join(ROOT, 'examples', 'bank-reconciliation'), path.join(ROOT, 'examples', 'it-operations')].concat(
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
  const ai = r.files.find((f) => /PACK-FOR-AI\.md$/.test(f.path)).data;
  assert.doesNotMatch(ai, /Handover status/);
  const th = core.build({ pack_id: 'KP-1', title: 'ใบเสนอราคา', language: 'th' }, {}, { template, fontsCss: '' });
  assert.doesNotMatch(th.files.find((f) => /handover-message\.txt$/.test(f.path)).data, /ส่งต่องาน|เรื่องด่วน/);
});

test('validate does not warn about an expired handover status when there is no handover data', () => {
  const w = core.validate({ pack_id: 'KP-1', handover: { expires: '2000-01-01', deadlines: [] } }, []);
  assert.deepStrictEqual(w.filter((x) => /expired/.test(x)), []);
  const w2 = core.validate({ pack_id: 'KP-1', handover: { expires: '2000-01-01', access: [{ system: 'CRM' }] } }, []);
  assert.ok(w2.some((x) => /expired/.test(x)));
});

test('a pack with handover data keeps the handover file and an AI-written message', () => {
  const k = { pack_id: 'KP-1', title: 'x', handover: { access: [{ system: 'CRM' }] }, handover_message: 'Hi from Sam' };
  const r = core.build(k, {}, { template, fontsCss: '' });
  assert.ok(r.files.some((f) => /handover-status\.md$/.test(f.path)));
  assert.strictEqual(r.files.find((f) => /handover-message\.txt$/.test(f.path)).data, 'Hi from Sam');
});

// ── Fields for engineering, IT and software work ───────────────────────────
const techPack = () => ({
  pack_id: 'KP-T', version: 1, language: 'en', processes: [{
    id: 'P01', slug: 'restore', name: 'Restore the database', doc_type: 'runbook',
    prerequisites: ['VPN access'], tools: ['Laptop with psql'], ppe: ['None'], rollback: 'Point the app back at the old database', escalation: 'Call the on-call DBA',
    steps: [{ id: 'P01.S01', title: 'Restore', command: 'pg_restore -d <DB_NAME> nightly.dump', expected: 'No errors', spec: 'Under 10 minutes', rollback: 'Drop the new database', status: 'employee_provided' }],
  }],
});

test('workflow and procedure files carry commands, expected results, specs, undo and task setup', () => {
  const r = core.build(techPack(), {}, { template, fontsCss: '' });
  const f = (rel) => r.files.find((x) => x.path === 'KP-T/processes/P01-restore/' + rel).data;
  const proc = f('procedures.md');
  assert.match(proc, /```\npg_restore -d <DB_NAME> nightly\.dump\n```/);
  assert.match(proc, /\*\*Expected result:\*\* No errors/);
  assert.match(proc, /\*\*Spec:\*\* Under 10 minutes/);
  assert.match(proc, /\*\*Undo:\*\* Drop the new database/);
  const wf = f('workflow.md');
  for (const re of [/\*\*Document type:\*\* runbook/, /## Before you start\n\n- VPN access/, /## Tools and materials\n\n- Laptop with psql/, /## Protective equipment\n\n- None/, /\*\*Rollback:\*\* Point the app back/, /\*\*Escalation:\*\* Call the on-call DBA/]) assert.match(wf, re);
  assert.match(core.mdForAI(techPack()), /pg_restore -d <DB_NAME>/);
});

test('validate warns about an unknown document type', () => {
  const k = techPack(); k.processes[0].doc_type = 'novel';
  assert.ok(core.validate(k).some((w) => /P01: unknown doc_type "novel"/.test(w)));
});

test('secret-looking values are replaced in every output, with a warning to change them', () => {
  const SECRETS = {
    github: 'ghp_' + 'a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8',
    aws: 'AKIA' + 'IOSFODNN7EXAMPLE',
    slack: 'xoxb-' + '123456789012-abcdefABCDEF',
    openai: 'sk-' + 'proj-abcdefghijklmnopqrstuvwx12',
    password: 'hunter2xyz9',
    urlpass: 's3cr3tPass',
    bearer: 'eyJhbGciOiJIUzI1NiJ9abcdefghijklmnop',
  };
  const k = techPack();
  const s = k.processes[0].steps[0];
  s.command = 'export GITHUB_TOKEN=' + SECRETS.github + ' && aws configure set aws_access_key_id ' + SECRETS.aws;
  s.detail = 'Post to Slack with ' + SECRETS.slack + ' and OpenAI key ' + SECRETS.openai;
  s.expected = 'mysql --password=' + SECRETS.password + ' works; or https://admin:' + SECRETS.urlpass + '@db.example.com';
  k.processes[0].rollback = 'curl -H "Authorization: Bearer ' + SECRETS.bearer + '" ...';
  k.processes[0].escalation = '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA\n-----END RSA PRIVATE KEY-----';
  assert.ok(core.validate(k).some((w) => /P01\.S01: looks like a secret/.test(w)), 'warned before building');
  const r = core.build(k, {}, { template, fontsCss: '' });
  assert.ok(r.warnings.some((w) => /P01\.S01: looks like a secret.*<REDACTED>.*[Cc]hange/.test(w)));
  assert.ok(r.warnings.some((w) => /^P01: looks like a secret/.test(w)));
  const all = r.files.map((f) => (typeof f.data === 'string' ? f.data : Buffer.from(f.data).toString('latin1'))).join('\n');
  for (const [name, secret] of Object.entries(SECRETS)) assert.ok(!all.includes(secret), name + ' leaked');
  assert.ok(!all.includes('MIIEowIBAAKCAQEA'), 'private key leaked');
  assert.match(all, /<REDACTED>/);
  assert.match(all, /pg_restore|GITHUB_TOKEN=<REDACTED>/);
});

test('ordinary text and placeholders are not mistaken for secrets', () => {
  const k = techPack();
  k.processes[0].steps[0].detail = 'The password: ask the chief accountant. Token: required. Use <API_TOKEN> or $API_TOKEN or ${DB_PASSWORD}. Set password=<YOUR_PASSWORD>.';
  const r = core.build(k, {}, { template, fontsCss: '' });
  assert.ok(!r.warnings.some((w) => /secret/.test(w)), r.warnings.join('\n'));
  assert.match(r.files.find((f) => f.path.endsWith('knowledge.json')).data, /ask the chief accountant\. Token: required\. Use <API_TOKEN>/);
});
