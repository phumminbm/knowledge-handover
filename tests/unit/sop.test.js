'use strict';
// SOP documents: one Word file and one print-ready page per task, from the same knowledge.json.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const core = require('../../skills/knowledge-handover/scripts/pack-core.js');

const ROOT = path.join(__dirname, '..', '..');
const EX = path.join(ROOT, 'examples', 'bank-reconciliation');
const example = () => JSON.parse(fs.readFileSync(path.join(EX, 'knowledge.json'), 'utf8'));
const images = () => Object.fromEntries(fs.readdirSync(path.join(EX, 'images')).map((n) => [n, new Uint8Array(fs.readFileSync(path.join(EX, 'images', n)))]));
const template = fs.readFileSync(path.join(ROOT, 'skills', 'knowledge-handover', 'assets', 'start-here.template.html'), 'utf8');
const build = (k, imgs) => core.build(k, imgs || {}, { template, fontsCss: '' });
const file = (r, rel) => r.files.find((f) => f.path === r.root + '/' + rel);
const text = (f) => (typeof f.data === 'string' ? f.data : Buffer.from(f.data).toString('utf8'));

// Unzip a docx with Python and return { names, xml: { 'word/document.xml': '...' } }, checking every XML part parses.
function readDocx(bytes) {
  const p = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'kh-docx-')), 'sop.docx');
  fs.writeFileSync(p, Buffer.from(bytes));
  const out = execFileSync('python3', ['-c', [
    'import sys, json, zipfile, xml.dom.minidom',
    'z = zipfile.ZipFile(sys.argv[1])',
    'assert z.testzip() is None',
    'xml_parts = {}',
    'for n in z.namelist():',
    '    if n.endswith(".xml") or n.endswith(".rels"):',
    '        d = z.read(n); xml.dom.minidom.parseString(d); xml_parts[n] = d.decode("utf-8")',
    'print(json.dumps({"names": z.namelist(), "xml": xml_parts}))',
  ].join('\n'), p], { maxBuffer: 64 * 1024 * 1024 }).toString();
  return JSON.parse(out);
}
const plain = (xml) => xml.replace(/<[^>]+>/g, '');

test('every task gets a Word SOP and a print-ready SOP page', () => {
  const k = example();
  const r = build(k, images());
  for (const p of k.processes) {
    const base = 'sop/' + p.id + '-' + p.slug;
    assert.ok(file(r, base + '.docx'), base + '.docx');
    assert.ok(file(r, base + '.html'), base + '.html');
  }
});

test('the Word SOP is a valid document with the standard sections, blanks and honest status', () => {
  const k = example();
  const r = build(k, images());
  const d = readDocx(file(r, 'sop/P04-supplier-payment-approval.docx').data);
  for (const part of ['[Content_Types].xml', '_rels/.rels', 'word/document.xml', 'word/styles.xml', 'word/_rels/document.xml.rels', 'docProps/core.xml']) {
    assert.ok(d.names.includes(part), part);
  }
  const t = plain(d.xml['word/document.xml']);
  assert.match(t, /Approve a supplier payment/);
  for (const h of ['Purpose', 'Scope and when to use', 'Responsibilities', 'Procedure', 'Records and outputs', 'Revision history']) assert.match(t, new RegExp(h));
  for (const blank of ['Document no.', 'Effective date', 'Approved by']) assert.match(t, new RegExp(blank));
  assert.match(t, /Draft/);
  assert.doesNotMatch(t, /\bApproved\b(?! by)/, 'never claims to be approved');
  assert.match(t, /Up to \$200 can be paid from petty cash[\s\S]{0,200}Needs confirmation|Needs confirmation[\s\S]{0,200}Up to \$200 can be paid/);
  assert.match(t, /Over \$5,000\?|Is the total over \$5,000\?/);
  assert.doesNotMatch(t, /Q-005|How do you confirm\?/, 'practice questions are left out');
});

test('the Word SOP embeds the giver\'s screenshots and lists their pins', () => {
  const r = build(example(), images());
  const d = readDocx(file(r, 'sop/P01-bank-reconciliation.docx').data);
  assert.ok(d.names.some((n) => /^word\/media\/image\d+\.png$/.test(n)), 'image copied');
  assert.match(d.xml['word/_rels/document.xml.rels'], /relationships\/image" Target="media\/image1\.png"/);
  assert.match(plain(d.xml['word/document.xml']), /Choose the current account/);
});

test('the SOP page shows the procedure in the shape of the task', () => {
  const r = build(example(), images());
  const html = (id) => text(file(r, 'sop/' + id + '.html'));
  const check = html('P03-petty-cash-close');
  assert.match(check, /☐/);
  assert.ok(check.indexOf('Close the door') < check.indexOf('Count the petty cash'), 'safety step first');
  const time = html('P02-vat-data');
  assert.ok(time.indexOf('Days 1–3') < time.indexOf('Days 4–5') && time.indexOf('Days 4–5') < time.indexOf('By day 10'));
  const fix = html('P05-online-banking-problems');
  assert.match(fix, /No one-time code arrives on the phone/);
  assert.match(fix, /<th[^>]*>(Symptom|What you see)/);
  const steps = html('P01-bank-reconciliation');
  assert.match(steps, /data:image\/png;base64,/, 'real screenshot embedded');
  assert.match(steps, /data:image\/svg\+xml;base64,/, 'diagram as an inert image');
  assert.match(steps, /Save as PDF/);
});

test('a Thai pack gets Thai SOP labels', () => {
  const k = example();
  k.language = 'th';
  const r = build(k);
  const t = text(file(r, 'sop/P04-supplier-payment-approval.html'));
  assert.match(t, /วัตถุประสงค์/);
  assert.match(t, /ขั้นตอนการปฏิบัติงาน/);
  assert.match(t, /ฉบับร่าง/);
});

test('hostile pack content stays text in both SOP files', () => {
  const k = example();
  const p = k.processes[0];
  p.name = '<script>alert(1)</script> & "x"';
  p.steps[0].title = '<img src=x onerror=alert(1)>';
  p.summary = 'a\u0001b\u0000c';
  p.diagram_svg = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><foreignObject><iframe src="https://evil.example"></iframe></foreignObject></svg>';
  const r = build(k);
  const html = text(file(r, 'sop/P01-bank-reconciliation.html'));
  assert.doesNotMatch(html, /<script/i);
  assert.doesNotMatch(html, /<img src=x/i);
  assert.doesNotMatch(html, /<svg/i, 'the diagram is never inlined');
  assert.doesNotMatch(html, /<iframe/i);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt; &amp; &quot;x&quot;/);
  assert.match(html, /http-equiv="Content-Security-Policy"/);
  const d = readDocx(file(r, 'sop/P01-bank-reconciliation.docx').data);
  assert.match(plain(d.xml['word/document.xml']), /&lt;script&gt;alert\(1\)&lt;\/script&gt; &amp;/);
});

test('a task with nothing but a name still gets a valid SOP', () => {
  const r = build({ pack_id: 'KP-X', language: 'en', processes: [{ id: 'P01', name: 'Only a name' }] });
  assert.match(text(file(r, 'sop/P01-only-a-name.html')), /Only a name/);
  readDocx(file(r, 'sop/P01-only-a-name.docx').data);
});

test('the Pack README points to the SOP files', () => {
  const r = build(example());
  assert.match(text(file(r, 'README.md')), /`sop\/`/);
});
