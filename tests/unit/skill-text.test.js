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

test('images-and-safety covers files and links, not only pictures', () => {
  const doc = read('references/images-and-safety.md');
  assert.match(doc, /## Files, examples and links/);
  assert.doesNotMatch(doc, /only where it helps/);
});
