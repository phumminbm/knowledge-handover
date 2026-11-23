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
