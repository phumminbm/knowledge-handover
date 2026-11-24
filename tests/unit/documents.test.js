'use strict';
// Task documents: SOP, work instruction, runbook and developer guide, from the same knowledge.json.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const core = require('../../skills/knowledge-handover/scripts/pack-core.js');
const docs = require('../../skills/knowledge-handover/scripts/documents.js');

const ROOT = path.join(__dirname, '..', '..');
const EX = path.join(ROOT, 'examples', 'bank-reconciliation');
const example = () => JSON.parse(fs.readFileSync(path.join(EX, 'knowledge.json'), 'utf8'));
const images = () => Object.fromEntries(fs.readdirSync(path.join(EX, 'images')).map((n) => [n, new Uint8Array(fs.readFileSync(path.join(EX, 'images', n)))]));
const template = fs.readFileSync(path.join(ROOT, 'skills', 'knowledge-handover', 'assets', 'start-here.template.html'), 'utf8');
const build = (k, imgs) => core.build(k, imgs || {}, { template, fontsCss: '' });
const file = (r, rel) => r.files.find((f) => f.path === r.root + '/' + rel);
const text = (f) => (typeof f.data === 'string' ? f.data : Buffer.from(f.data).toString('utf8'));
const doc = (r, base, ext) => file(r, 'documents/' + base + '.' + ext);

// A small pack from other lines of work: IT operations, software development, engineering.
const fieldwork = () => ({
  schema_version: '1.0', pack_id: 'KP-T', version: 3, saved_at: '2026-11-24', language: 'en',
  giver: { role_title: 'Platform engineer' },
  processes: [
    { id: 'P01', slug: 'restore-db', name: 'Restore the database', doc_type: 'runbook', summary: 'Bring the billing database back from last night\'s backup.',
      trigger: 'The billing database is lost or corrupted', escalation: 'Call the on-call DBA after 30 minutes', prerequisites: ['VPN access', 'Read access to the backup bucket'],
      rollback: 'Point the app back at the old database and restart it', complete: true,
      steps: [
        { id: 'P01.S01', title: 'Stop the app', command: 'systemctl stop billing', expected: 'Active: inactive (dead)', rollback: 'systemctl start billing', status: 'validated' },
        { id: 'P01.S02', title: 'Restore the dump', command: 'pg_restore -d <DB_NAME> nightly.dump', expected: 'No errors printed', risk: 'high', status: 'employee_provided' },
      ],
      troubleshooting: [{ id: 'T-001', symptom: 'pg_restore: connection refused', cause: 'VPN is off', fix: 'Connect the VPN', status: 'employee_provided' }],
      rules: [{ id: 'R-001', text: 'Never restore over production without a ticket', status: 'validated' }], status: 'employee_provided' },
    { id: 'P02', slug: 'local-setup', name: 'Set up the service locally', doc_type: 'dev_guide', summary: 'Run the billing service on your laptop.',
      prerequisites: ['Node 20', 'Docker'],
      steps: [{ id: 'P02.S01', title: 'Install dependencies', command: 'npm ci', expected: 'added 312 packages', status: 'employee_provided' }],
      rules: [{ id: 'R-002', text: 'Use a feature branch for every change', status: 'validated' }],
      troubleshooting: [{ id: 'T-002', symptom: 'Port 3000 already in use', cause: 'Another dev server is running', fix: 'Stop it or set PORT', status: 'employee_provided' }], status: 'employee_provided' },
    { id: 'P03', slug: 'replace-disk', name: 'Replace a failed disk', doc_type: 'work_instruction', summary: 'Swap a failed disk in the storage server.',
      ppe: ['ESD wrist strap', 'Safety glasses'], tools: ['Torx T10 screwdriver', 'Replacement disk, same model'], prerequisites: ['Change ticket approved'],
      steps: [
        { id: 'P03.S01', title: 'Put on the ESD strap', safety: true, status: 'validated' },
        { id: 'P03.S02', title: 'Tighten the caddy screws', spec: '0.6 ± 0.1 N·m', check: 'Disk LED turns green', status: 'employee_provided' },
      ], status: 'employee_provided' },
  ],
});

// Unzip a docx with Python; every XML part must parse, and properties must follow the OOXML schema order.
const ORDER = {
  pPr: 'pStyle keepNext keepLines pageBreakBefore framePr widowControl numPr suppressLineNumbers pBdr shd tabs suppressAutoHyphens kinsoku wordWrap overflowPunct topLinePunct autoSpaceDE autoSpaceDN bidi adjustRightInd snapToGrid spacing ind contextualSpacing mirrorIndents suppressOverlap jc textDirection textAlignment textboxTightWrap outlineLvl divId cnfStyle rPr sectPr pPrChange',
  rPr: 'rStyle rFonts b bCs i iCs caps smallCaps strike dstrike outline shadow emboss imprint noProof snapToGrid vanish webHidden color spacing w kern position sz szCs highlight u effect bdr shd fitText vertAlign rtl cs em lang eastAsianLayout specVanish oMath',
  tblPr: 'tblStyle tblpPr tblOverlap bidiVisual tblStyleRowBandSize tblStyleColBandSize tblW jc tblCellSpacing tblInd tblBorders shd tblLayout tblCellMar tblLook',
  tcPr: 'cnfStyle tcW gridSpan hMerge vMerge tcBorders shd noWrap tcMar textDirection tcFitText vAlign hideMark',
  style: 'name aliases basedOn next link autoRedefine uiPriority semiHidden unhideWhenUsed qFormat locked personal personalCompose personalReply rsid pPr rPr tblPr trPr tcPr tblStylePr',
};
function readDocx(bytes) {
  const p = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'kh-docx-')), 'doc.docx');
  fs.writeFileSync(p, Buffer.from(bytes));
  const out = execFileSync('python3', ['-c', [
    'import sys, json, zipfile, xml.etree.ElementTree as ET',
    'order = json.loads(sys.argv[2]); W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"',
    'z = zipfile.ZipFile(sys.argv[1]); assert z.testzip() is None',
    'parts = {}; bad = []',
    'for n in z.namelist():',
    '    if n.endswith(".xml") or n.endswith(".rels"):',
    '        d = z.read(n); t = ET.fromstring(d); parts[n] = d.decode("utf-8")',
    '        for el in t.iter():',
    '            ln = el.tag.replace(W, "")',
    '            if el.tag.startswith(W) and ln in order:',
    '                kids = [c.tag.replace(W, "") for c in el]',
    '                idx = [order[ln].split().index(k) if k in order[ln].split() else -1 for k in kids]',
    '                if -1 in idx or idx != sorted(idx): bad.append(n + ":" + ln + ":" + " ".join(kids))',
    '        if n == "word/document.xml":',
    '            for tc in t.iter(W + "tc"):',
    '                if tc.find(W + "p") is None: bad.append("tc without p")',
    'print(json.dumps({"names": z.namelist(), "xml": parts, "bad": bad}))',
  ].join('\n'), p, JSON.stringify(ORDER)], { maxBuffer: 64 * 1024 * 1024 }).toString();
  return JSON.parse(out);
}
const plain = (xml) => xml.replace(/<w:br\/>/g, '\n').replace(/<[^>]+>/g, '');

test('each task gets the files of its document type', () => {
  const r = build(fieldwork());
  assert.ok(doc(r, 'P01-restore-db', 'md') && doc(r, 'P01-restore-db', 'html') && !doc(r, 'P01-restore-db', 'docx'), 'runbook: md + html');
  assert.ok(doc(r, 'P02-local-setup', 'md') && doc(r, 'P02-local-setup', 'html') && !doc(r, 'P02-local-setup', 'docx'), 'dev guide: md + html');
  assert.ok(doc(r, 'P03-replace-disk', 'docx') && doc(r, 'P03-replace-disk', 'html') && !doc(r, 'P03-replace-disk', 'md'), 'work instruction: docx + html');
  const k = example();
  const rx = build(k, images());
  for (const p of k.processes) {
    const t = docs.docType(p);
    assert.ok(doc(rx, p.id + '-' + p.slug, 'html'), p.id);
    assert.ok(doc(rx, p.id + '-' + p.slug, t === 'runbook' || t === 'dev_guide' ? 'md' : 'docx'), p.id + ' ' + t);
  }
  assert.strictEqual(docs.docType({}), 'sop');
  assert.strictEqual(docs.docType({ doc_type: 'nonsense' }), 'sop');
});

test('every Word document follows the OOXML element order and has no empty cells', () => {
  for (const [k, imgs] of [[example(), images()], [fieldwork(), {}]]) {
    const r = build(k, imgs);
    for (const f of r.files.filter((x) => x.path.endsWith('.docx'))) assert.deepStrictEqual(readDocx(f.data).bad, [], f.path);
  }
});

test('the Word SOP has the standard sections, blanks and an honest status', () => {
  const r = build(example(), images());
  const d = readDocx(doc(r, 'P04-supplier-payment-approval', 'docx').data);
  for (const part of ['[Content_Types].xml', '_rels/.rels', 'word/document.xml', 'word/styles.xml', 'word/_rels/document.xml.rels', 'docProps/core.xml']) assert.ok(d.names.includes(part), part);
  const t = plain(d.xml['word/document.xml']);
  assert.match(t, /Standard operating procedure/);
  for (const h of ['Purpose', 'Scope and when to use', 'Responsibilities', 'Procedure', 'Records and outputs', 'Revision history', 'Described by']) assert.match(t, new RegExp(h));
  for (const blank of ['Document no.', 'Effective date', 'Approved by']) assert.match(t, new RegExp(blank));
  assert.match(t, /Draft/);
  assert.doesNotMatch(t, /\bApproved\b(?! by)/);
  assert.match(t, /Up to \$200 can be paid from petty cash[\s\S]{0,200}Needs confirmation/);
  assert.doesNotMatch(t, /How do you confirm\?/, 'practice questions are left out');
});

test('the Word file embeds screenshots, lists pins, and caps tall images', () => {
  const r = build(example(), images());
  const d = readDocx(doc(r, 'P01-bank-reconciliation', 'docx').data);
  assert.match(d.xml['word/_rels/document.xml.rels'], /relationships\/image" Target="media\/image1\.png"/);
  assert.match(plain(d.xml['word/document.xml']), /Choose the current account/);
  // A 1170x2532 phone screenshot must fit the page height.
  const png = Buffer.alloc(33); Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(png, 0); png.writeUInt32BE(1170, 16); png.writeUInt32BE(2532, 20);
  const k = example(); k.processes[0].steps[0].image = 'tall.png';
  const tall = readDocx(doc(build(k, { 'tall.png': new Uint8Array(png) }), 'P01-bank-reconciliation', 'docx').data);
  const ext = tall.xml['word/document.xml'].match(/<wp:extent cx="(\d+)" cy="(\d+)"\/>/);
  assert.ok(+ext[2] <= 7772400, 'height ' + ext[2]);
  assert.ok(Math.abs(+ext[1] / +ext[2] - 1170 / 2532) < 0.01, 'aspect kept');
});

test('a WebP screenshot is pointed to, not silently dropped, in Word', () => {
  const k = example(); k.processes[0].steps[0].image = 'shot.webp';
  const r = build(k, { 'shot.webp': new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]) });
  assert.match(plain(readDocx(doc(r, 'P01-bank-reconciliation', 'docx').data).xml['word/document.xml']), /screenshot is in the print version/i);
});

test('the print page shows the procedure in the shape of the task', () => {
  const r = build(example(), images());
  const html = (base) => text(doc(r, base, 'html'));
  const check = html('P03-petty-cash-close');
  assert.match(check, /☐/);
  assert.ok(check.indexOf('Close the door') < check.indexOf('Count the petty cash'), 'safety step first');
  const time = html('P02-vat-data');
  assert.ok(time.indexOf('Days 1–3') < time.indexOf('Days 4–5') && time.indexOf('Days 4–5') < time.indexOf('By day 10'));
  assert.match(html('P05-online-banking-problems'), /No one-time code arrives on the phone/);
  const steps = html('P01-bank-reconciliation');
  assert.match(steps, /data:image\/png;base64,/);
  assert.match(steps, /data:image\/svg\+xml;base64,/);
  assert.match(steps, /Save as PDF/);
});

test('status is Draft until the task is complete, confirmed, and has no open questions', () => {
  const ready = () => ({ pack_id: 'KP-R', language: 'en', version: 1, processes: [{ id: 'P01', name: 'Ready task', complete: true, status: 'validated',
    steps: [{ id: 'P01.S01', title: 'Do it', status: 'validated', who_can_do: 'human_only', who_can_do_confirmed: true, image: 'a.png', pins: [{ n: 1, x: 0.5, y: 0.5, label: 'here', confirmed: true }] }],
    rules: [{ id: 'R-001', text: 'Rule', status: 'validated' }] }], open_questions: [] });
  const status = (k) => text(doc(build(k), 'P01-ready-task', 'html')).match(/<th>Status<\/th><td>([^<]*)</)[1];
  assert.match(status(ready()), /^Ready for approval/);
  let k = ready(); k.processes[0].complete = false; assert.match(status(k), /^Draft.*Incomplete/);
  k = ready(); k.open_questions = [{ id: 'OQ-001', question: 'Q?', refs: ['P01'] }]; assert.match(status(k), /^Draft/);
  k = ready(); k.processes[0].steps[0].pins[0].confirmed = false; assert.match(status(k), /^Draft/);
  k = ready(); k.processes[0].steps[0].who_can_do_confirmed = false; assert.match(status(k), /^Draft/);
  k = ready(); k.processes[0].steps[0].status = 'employee_provided'; assert.match(status(k), /^Draft/);
});

test('a proposed "who can do it" label is marked as not confirmed', () => {
  const t = text(doc(build(example()), 'P01-bank-reconciliation', 'html'));
  assert.match(t, /AI can do it \(proposed, not confirmed\)/);
});

test('branches use step positions, and a missing or retired target says so', () => {
  const k = { pack_id: 'KP-B', language: 'en', processes: [{ id: 'P01', name: 'Branches', steps: [
    { title: 'No id one' }, { title: 'No id two' },
    { id: 'S3', title: 'Choose', branches: [{ label: 'yes $& {b}', goto: 'S4' }, { label: 'no', goto: 'GONE' }] },
    { id: 'S4', title: 'Fourth' }, { id: 'S5', title: 'Retired', retired: true }, { id: 'S6', title: 'Sixth', next: 'S5' }] }] };
  const t = text(doc(build(k), 'P01-branches', 'html'));
  assert.match(t, /<span class="n">1<\/span> No id one/);
  assert.match(t, /<span class="n">2<\/span> No id two/);
  assert.match(t, /If yes \$&amp; \{b\}: go to step 4/);
  assert.match(t, /If no: go to step GONE \(missing step\)/);
  assert.match(t, /Then go to step S5 \(missing step\)/);
});

test('odd statuses and labels never leak object internals', () => {
  const k = example();
  k.processes[0].steps[0].status = 'constructor';
  k.processes[0].steps[0].who_can_do = '__proto__';
  const t = text(doc(build(k), 'P01-bank-reconciliation', 'html'));
  assert.doesNotMatch(t, /function Object|\[object Object\]/);
});

test('labels can be translated with doc_ keys in ui_labels', () => {
  const k = example(); k.ui_labels = { doc_purpose: 'Zweck', doc_ifGo: 'Wenn {a}: weiter mit {b}' };
  const t = text(doc(build(k), 'P01-bank-reconciliation', 'html'));
  assert.match(t, /1\. Zweck/);
  assert.match(t, /Wenn They match: weiter mit 6/);
});

test('a Thai pack gets Thai labels', () => {
  const k = example(); k.language = 'th';
  const t = text(doc(build(k), 'P04-supplier-payment-approval', 'html'));
  assert.match(t, /วัตถุประสงค์/);
  assert.match(t, /ขั้นตอนการปฏิบัติงาน/);
  assert.match(t, /ฉบับร่าง/);
});

test('a work instruction puts safety and PPE first, lists tools, specs and a blank sign-off', () => {
  const r = build(fieldwork());
  const t = plain(readDocx(doc(r, 'P03-replace-disk', 'docx').data).xml['word/document.xml']);
  assert.match(t, /Work instruction/);
  assert.ok(t.indexOf('Safety and PPE') < t.indexOf('Procedure'));
  assert.match(t, /ESD wrist strap/);
  assert.match(t, /Torx T10 screwdriver/);
  assert.match(t, /Change ticket approved/);
  assert.match(t, /0\.6 ± 0\.1 N·m/);
  assert.match(t, /Sign-off[\s\S]*Done by[\s\S]*Checked by/);
});

test('a runbook in Markdown has commands, expected results, undo, escalation and rollback', () => {
  const md = text(doc(build(fieldwork()), 'P01-restore-db', 'md'));
  assert.match(md, /^# Runbook: Restore the database/m);
  assert.match(md, /```\nsystemctl stop billing\n```/);
  assert.match(md, /Expected result:\*\* Active: inactive \(dead\)/);
  assert.match(md, /Undo:\*\*[\s\S]*systemctl start billing/);
  assert.match(md, /## \d+\. Escalation\n\nCall the on-call DBA after 30 minutes/);
  assert.match(md, /## \d+\. Rollback/);
  assert.match(md, /pg_restore -d <DB_NAME> nightly\.dump/, 'placeholders stay readable inside code');
  assert.doesNotMatch(md, /Document no\./);
});

test('a developer guide in Markdown has prerequisites, conventions and common problems', () => {
  const md = text(doc(build(fieldwork()), 'P02-local-setup', 'md'));
  assert.match(md, /^# Developer guide: Set up the service locally/m);
  for (const h of ['Prerequisites', 'Conventions', 'Common problems']) assert.match(md, new RegExp('## \\d+\\. ' + h));
  assert.match(md, /```\nnpm ci\n```/);
});

test('Markdown output keeps hostile text as text', () => {
  const k = fieldwork();
  k.processes[0].name = '<script>x</script> [click](javascript:alert(1)) | *b*';
  k.processes[0].steps[0].command = 'echo ```nested```';
  const md = text(doc(build(k), 'P01-restore-db', 'md'));
  assert.match(md, /\\<script\\>x\\<\/script\\> \\\[click\\\]\(javascript:alert\(1\)\) \\\| \\\*b\\\*/);
  assert.match(md, /````\necho ```nested```\n````/);
});

test('hostile pack content stays text in every document', () => {
  const k = example();
  const p = k.processes[0];
  p.name = '<script>alert(1)</script> & "x"';
  p.steps[0].title = '<img src=x onerror=alert(1)>';
  p.summary = 'a\u0001b\u0000c\uDC00\uDC00d';
  p.diagram_svg = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>';
  const r = build(k);
  const html = text(doc(r, 'P01-bank-reconciliation', 'html'));
  assert.doesNotMatch(html, /<script|<img src=x|<svg/i);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt; &amp; &quot;x&quot;/);
  assert.match(html, /http-equiv="Content-Security-Policy"/);
  const d = readDocx(doc(r, 'P01-bank-reconciliation', 'docx').data);
  assert.match(d.xml['word/document.xml'], /&lt;script&gt;alert\(1\)&lt;\/script&gt; &amp;/);
  assert.doesNotMatch(d.xml['word/document.xml'], /[\uDC00-\uDFFF]/);
});

test('a task with nothing but a name still gets valid documents', () => {
  const r = build({ pack_id: 'KP-X', language: 'en', processes: [{ id: 'P01', name: 'Only a name' }] });
  assert.match(text(doc(r, 'P01-only-a-name', 'html')), /Only a name/);
  readDocx(doc(r, 'P01-only-a-name', 'docx').data);
});

test('the Pack README points to the documents', () => {
  assert.match(text(file(build(example()), 'README.md')), /`documents\/`/);
});

test('commands, expected results and undo survive every view', () => {
  for (const view of ['checklist', 'timeline', 'decision']) {
    const k = fieldwork();
    const p = k.processes[0];
    p.view = view;
    p.steps.forEach((s) => { s.when = 'Day 1'; });
    p.steps[0].branches = [{ label: 'ok', goto: 'P01.S02' }];
    const r = build(k);
    for (const ext of ['md', 'html']) {
      const t = text(doc(r, 'P01-restore-db', ext));
      assert.match(t, /systemctl stop billing/, view + ' ' + ext + ' command');
      assert.match(t, /Active: inactive \(dead\)/, view + ' ' + ext + ' expected');
      assert.match(t, /systemctl start billing/, view + ' ' + ext + ' undo');
    }
  }
});

test('line breaks in names and text cannot restructure the Markdown', () => {
  const k = fieldwork();
  k.processes[0].name = 'Restore\n# Fake heading';
  k.processes[0].summary = 'Line one\n===\n    indented\n- not a list\n1. not a list\nSee https://example.com and www.example.com';
  k.processes[0].steps[0].title = 'Stop\n## Fake';
  const md = text(doc(build(k), 'P01-restore-db', 'md'));
  assert.doesNotMatch(md, /^# Fake heading/m);
  assert.doesNotMatch(md, /^## Fake/m);
  assert.doesNotMatch(md, /^===/m);
  assert.doesNotMatch(md, /^ {4}indented/m);
  assert.doesNotMatch(md, /^- not a list/m);
  assert.doesNotMatch(md, /^1\. not a list/m);
  assert.doesNotMatch(md, /https:\/\/example\.com/);
  assert.doesNotMatch(md, /www\.example\.com/);
});

test('definitions list only glossary terms that appear in the task text', () => {
  const k = fieldwork();
  k.glossary = [{ term: 'Status', meaning: 'field name, never in the text' }, { term: 'ID', meaning: 'also a field name' }, { term: 'VPN', meaning: 'virtual private network' }];
  const t = text(doc(build(k), 'P01-restore-db', 'html'));
  assert.match(t, /virtual private network/);
  assert.doesNotMatch(t, /field name, never in the text|also a field name/);
});

test('Word documents open in the current Word mode, not compatibility mode', () => {
  const d = readDocx(doc(build(fieldwork()), 'P03-replace-disk', 'docx').data);
  assert.ok(d.names.includes('word/settings.xml'));
  assert.match(d.xml['word/settings.xml'], /compatibilityMode" w:uri="http:\/\/schemas\.microsoft\.com\/office\/word" w:val="15"/);
  assert.match(d.xml['word/_rels/document.xml.rels'], /relationships\/settings" Target="settings\.xml"/);
  assert.match(d.xml['[Content_Types].xml'], /\/word\/settings\.xml/);
});
