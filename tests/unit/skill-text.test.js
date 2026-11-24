'use strict';
// Guards for behaviour the skill text must keep. These found real gaps in test runs with an AI.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const SKILL = path.join(__dirname, '..', '..', 'skills', 'knowledge-handover');
const read = (p) => fs.readFileSync(path.join(SKILL, p), 'utf8');

test('interview asks for the real thing: screenshots, files, finished examples and links', () => {
  const doc = read('references/interview.md');
  const i = doc.indexOf('## Ask for the real thing');
  assert.ok(i >= 0, 'interview.md has an "Ask for the real thing" section');
  const section = doc.slice(i, doc.indexOf('\n## ', i + 5));
  for (const word of [/screenshot/i, /template/i, /finished example/i, /link/i, /same (message|reply)/i, /ai_inferred/, /cover/i]) {
    assert.match(section, word);
  }
});

test('SKILL.md tells the AI to ask for real material on every task, not only at the start', () => {
  const doc = read('SKILL.md');
  const step4 = doc.slice(doc.indexOf('4. **Go deep'), doc.indexOf('5. **Review'));
  assert.match(step4, /Ask for the real thing/);
  assert.doesNotMatch(step4, /ask for real images where a picture helps/);
});

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
  assert.ok(desc.length <= 1024, 'description is ' + desc.length + ' characters');
});

test('message and teaching instructions mention urgent items only for handovers', () => {
  const hosts = read('references/saving-and-hosts.md');
  assert.doesNotMatch(hosts, /I've put together a handover pack/);
  assert.match(hosts, /only (when|if) the Pack has handover items/i);
  const teach = read('references/teaching.md');
  const first = teach.slice(teach.indexOf('## First reply'), teach.indexOf('\n## ', teach.indexOf('## First reply') + 5));
  assert.doesNotMatch(first, /this is a handover from/);
  assert.match(first, /only (when|if) the Pack has handover items/i);
  const skill = read('SKILL.md');
  assert.doesNotMatch(skill, /explain in plain words what this handover is/);
  assert.match(skill, /see what is urgent right now \(when the work is changing hands/);
  assert.match(skill, /`handover-status\.md` \(only when handing over\)/);
  assert.match(read('references/pack-format.md'), /handover-status\.md +only when handing over/);
});

test('the Codex store description is purpose-neutral', () => {
  const d = JSON.parse(fs.readFileSync(path.join(SKILL, '..', '..', '.codex-plugin', 'plugin.json'), 'utf8')).interface.longDescription;
  assert.doesNotMatch(d, /teach the successor/);
  assert.match(d, /when the work is changing hands/);
});

test('images-and-safety covers files and links, not only pictures', () => {
  const doc = read('references/images-and-safety.md');
  assert.match(doc, /## Files, examples and links/);
  assert.doesNotMatch(doc, /only where it helps/);
});

test('diagrams show unconfirmed parts as dashed, with a legend', () => {
  const doc = read('SKILL.md');
  const section = doc.slice(doc.indexOf('## Diagrams and pages'), doc.indexOf('## Reference library'));
  assert.match(section, /dashed/);
  assert.match(section, /ai_inferred/);
  assert.match(section, /legend/);
});

test('the AI picks a document type per task, asks for the organisation template, and keeps commands exact', () => {
  const interview = read('references/interview.md');
  const section = interview.slice(interview.indexOf('## Ask for the real thing'), interview.indexOf('\n## ', interview.indexOf('## Ask for the real thing') + 5));
  assert.match(section, /template/);
  assert.doesNotMatch(section, /numbering rule/, 'never invites the AI to make up document numbers');
  assert.match(interview, /doc_type/);
  assert.match(interview, /placeholder/i);
  const skill = read('SKILL.md');
  const step4 = skill.slice(skill.indexOf('4. **Go deep'), skill.indexOf('5. **Review'));
  assert.match(step4, /doc_type/);
  const step6 = skill.slice(skill.indexOf('6. **Build and share'), skill.indexOf('The giver can stop'));
  assert.match(step6, /documents\//);
  assert.match(step6, /never (fill|invent|guess)[^.]*(document number|approver)/i);
  const fmt = read('references/pack-format.md');
  for (const re of [/documents\/<id>-<slug>/, /work_instruction/, /runbook/, /dev_guide/, /`command`/, /`expected`/, /`spec`/, /`rollback`/, /`prerequisites`/, /`ppe`/, /`escalation`/, /doc_purpose/, /<REDACTED>/]) assert.match(fmt, re);
  assert.match(read('references/teaching.md'), /command/i);
});
