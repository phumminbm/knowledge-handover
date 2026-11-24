'use strict';
// Untrusted pack content must never run code in START-HERE.html or the Pack Builder.
// A Pack is passed between people, so a crafted save block is a realistic attack.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');
const core = require('../../skills/knowledge-handover/scripts/pack-core.js');

let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { /* skipped below */ }

const ROOT = path.join(__dirname, '..', '..');
const SKILL = path.join(ROOT, 'skills', 'knowledge-handover');
const example = () => JSON.parse(fs.readFileSync(path.join(ROOT, 'examples', 'bank-reconciliation', 'knowledge.json'), 'utf8'));

const PAYLOADS = {
  'quoted onload': '<svg onload="window.__pwned=1"><rect width="10" height="10"/></svg>',
  'unquoted onload': '<svg onload=window.__pwned=1><rect width="10" height="10"/></svg>',
  'single-quoted onload': "<svg onload='window.__pwned=1'><rect width='10' height='10'/></svg>",
  'script element': '<svg><script>window.__pwned=1</script><rect width="10" height="10"/></svg>',
  'html breakout img': '<svg><img src=x onerror=window.__pwned=1><rect width="10" height="10"/></svg>',
  'foreignObject': '<svg><foreignObject><img src=x onerror="window.__pwned=1"></foreignObject></svg>',
  'image onerror': '<svg><image href="x" onerror="window.__pwned=1"/></svg>',
  'javascript link': '<svg><a href="javascript:window.__pwned=1"><text id="lnk" x="5" y="20">click</text></a></svg>',
  'animate to javascript': '<svg><a><animate attributeName="href" to="javascript:window.__pwned=1"/><text id="lnk" x="5" y="20">click</text></a></svg>',
  'external css': '<svg><style>@import url(https://example.invalid/x.css); rect{fill:url(https://example.invalid/p.png)}</style><rect width="10" height="10"/></svg>',
};

function openPage(browser) {
  return browser.newPage().then((page) => {
    const external = [];
    page.on('request', (r) => { if (!/^(file|data|blob):/.test(r.url())) external.push(r.url()); });
    page.on('dialog', (d) => { external.push('dialog:' + d.message()); d.dismiss(); });
    return { page, external };
  });
}

test('START-HERE.html neutralises hostile diagram_svg', { skip: !chromium && 'playwright not installed' }, async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kh-xss-'));
  const template = fs.readFileSync(path.join(SKILL, 'assets', 'start-here.template.html'), 'utf8');
  const browser = await chromium.launch();
  t.after(() => browser.close());
  for (const [name, svg] of Object.entries(PAYLOADS)) {
    await t.test(name, async () => {
      const k = example();
      k.processes[0].diagram_svg = svg;
      const file = path.join(dir, name.replace(/\W+/g, '-') + '.html');
      fs.writeFileSync(file, core.renderStartHere(k, {}, template, ''));
      const { page, external } = await openPage(browser);
      await page.goto(pathToFileURL(file).href + '#/task/P01/overview');
      await page.waitForSelector('.panel');
      const lnk = await page.$('#lnk');
      if (lnk) await lnk.click().catch(() => {});
      await page.waitForTimeout(150);
      assert.strictEqual(await page.evaluate(() => window.__pwned), undefined, 'payload ran');
      assert.deepStrictEqual(external, [], 'page reached outside the file');
      await page.close();
    });
  }
});

test('START-HERE.html still renders a normal diagram', { skip: !chromium && 'playwright not installed' }, async (t) => {
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const k = example();
  k.processes[0].diagram_svg = '<svg viewBox="0 0 200 100" role="img"><title>Flow</title><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z"/></marker></defs><rect x="10" y="10" width="60" height="30" fill="#fff" stroke="#bf4520"/><line x1="70" y1="25" x2="130" y2="25" stroke="#4f5d75" marker-end="url(#arrow)"/><text x="40" y="30" text-anchor="middle" font-size="10">Start</text></svg>';
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'kh-svg-')), 'ok.html');
  fs.writeFileSync(file, core.renderStartHere(k, {}, fs.readFileSync(path.join(SKILL, 'assets', 'start-here.template.html'), 'utf8'), ''));
  const page = await browser.newPage();
  await page.goto(pathToFileURL(file).href + '#/task/P01/overview');
  await page.waitForSelector('.diagram svg');
  const info = await page.$eval('.diagram svg', (s) => ({
    rects: s.querySelectorAll('rect').length, marker: s.querySelector('line').getAttribute('marker-end'),
    text: s.querySelector('text').textContent, viewBox: s.getAttribute('viewBox'),
  }));
  assert.deepStrictEqual(info, { rects: 1, marker: 'url(#arrow)', text: 'Start', viewBox: '0 0 200 100' });
});

test('Pack Builder does not run markup from a pasted save block', { skip: !chromium && 'playwright not installed' }, async (t) => {
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const k = example();
  k.pack_id = '<img src=x onerror="window.__pwned=1">';
  k.version = '<img src=x onerror="window.__pwned=2">';
  k.processes[0].steps[0].image = '<img src=x onerror="window.__pwned=3">.png';
  const { page, external } = await openPage(browser);
  await page.goto(pathToFileURL(path.join(SKILL, 'assets', 'pack-builder.html')).href);
  await page.fill('#save', 'KNOWLEDGE-HANDOVER SAVE\n```json\n' + JSON.stringify(k) + '\n```');
  await page.dispatchEvent('#save', 'input');
  await page.waitForTimeout(200);
  assert.strictEqual(await page.evaluate(() => window.__pwned), undefined, 'payload ran');
  assert.match(await page.textContent('#sum'), /<img src=x/, 'pack id is shown as text');
  assert.deepStrictEqual(external, []);
});

test('SOP pages run no code from a hostile pack and still print', { skip: !chromium && 'playwright not installed' }, async (t) => {
  const template = fs.readFileSync(path.join(SKILL, 'assets', 'start-here.template.html'), 'utf8');
  const browser = await chromium.launch();
  t.after(() => browser.close());
  for (const [name, svg] of Object.entries(PAYLOADS)) {
    const k = example();
    k.processes[0].diagram_svg = svg;
    k.processes[0].name = '<img src=x onerror=window.__pwned=1>' + name;
    k.processes[0].steps[0].detail = '<script>window.__pwned=1</script>';
    const r = core.build(k, {}, { template, fontsCss: '' });
    const html = r.files.find((f) => /\/sop\/P01-[^/]+\.html$/.test(f.path));
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'kh-sop-')), 'sop.html');
    fs.writeFileSync(file, html.data);
    const { page, external } = await openPage(browser);
    await page.goto(pathToFileURL(file).href);
    if (await page.$('#lnk')) await page.click('#lnk').catch(() => {});
    await page.waitForTimeout(100);
    assert.strictEqual(await page.evaluate(() => window.__pwned), undefined, name);
    assert.deepStrictEqual(external, [], name);
    await page.close();
  }
  const r = core.build(example(), {}, { template, fontsCss: '' });
  const html = r.files.find((f) => /\/sop\/P04-[^/]+\.html$/.test(f.path));
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'kh-sop-')), 'sop.html');
  fs.writeFileSync(file, html.data);
  const { page, external } = await openPage(browser);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(pathToFileURL(file).href);
  assert.ok(await page.isVisible('img[alt="Flow diagram"]'), 'diagram shown');
  const pdf = await page.pdf({ format: 'A4' });
  assert.ok((pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length >= 2, 'prints to several pages');
  assert.deepStrictEqual(errors, []);
  assert.deepStrictEqual(external, []);
  await page.close();
});
