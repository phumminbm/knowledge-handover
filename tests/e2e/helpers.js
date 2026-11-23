'use strict';
// Render a Pack's START-HERE.html to a temp file and open it in Chromium,
// recording errors and any request that leaves the file.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');
const core = require('../../skills/knowledge-handover/scripts/pack-core.js');

const ROOT = path.join(__dirname, '..', '..');
const SKILL = path.join(ROOT, 'skills', 'knowledge-handover');
const template = () => fs.readFileSync(path.join(SKILL, 'assets', 'start-here.template.html'), 'utf8');
const fixture = () => JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'views.json'), 'utf8'));
const example = () => JSON.parse(fs.readFileSync(path.join(ROOT, 'examples', 'bank-reconciliation', 'knowledge.json'), 'utf8'));
const exampleImage = (name) => 'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, 'examples', 'bank-reconciliation', 'images', name)).toString('base64');

let chromium = null;
try { ({ chromium } = require('playwright')); } catch (e) { /* tests skip */ }

async function openPack(browser, pack, opts = {}) {
  const { hash = '', viewport = { width: 1280, height: 900 }, images = {}, init = null } = opts;
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'kh-page-')), 'START-HERE.html');
  fs.writeFileSync(file, core.renderStartHere(pack, images, template(), ''));
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  const external = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('request', (r) => { if (!/^(file|data|blob):/.test(r.url())) external.push(r.url()); });
  if (init) await page.addInitScript(init);
  await page.goto(pathToFileURL(file).href + hash);
  await page.waitForSelector('#app > *');
  return { page, errors, external, context };
}

module.exports = { openPack, fixture, example, exampleImage, chromium, ROOT, SKILL };
