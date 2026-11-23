'use strict';
// The Pack Builder page: progress through the three steps, any order, phone width.
// Runs against the built file; run `python3 tools/build_dist.py` first.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium, example, ROOT, SKILL } = require('./helpers');

const skip = !chromium && 'playwright not installed';
let browser;
test.before(async () => { if (chromium) browser = await chromium.launch(); });
test.after(async () => { if (browser) await browser.close(); });

const URL_ = pathToFileURL(path.join(SKILL, 'assets', 'pack-builder.html')).href;
const IMGS = ['P01-S01.png', 'P01-S02.png'].map((n) => path.join(ROOT, 'examples', 'bank-reconciliation', 'images', n));
const BLOCK = 'KNOWLEDGE-HANDOVER SAVE · KP-2569-0001 · v5\n```json\n' + JSON.stringify(example()) + '\n```';

async function open(viewport = { width: 1280, height: 900 }) {
  const context = await browser.newContext({ viewport, acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(URL_);
  return { page, context, errors };
}
const done = (page, n) => page.$eval(`.progress [data-step="${n}"]`, (e) => e.classList.contains('done'));
async function paste(page) {
  await page.fill('#save', BLOCK);
  await page.dispatchEvent('#save', 'input');
}

test('progress marks each step as it is completed', { skip }, async () => {
  const { page, context, errors } = await open();
  assert.deepStrictEqual([await done(page, 1), await done(page, 2), await done(page, 3)], [false, false, false]);
  await paste(page);
  assert.strictEqual(await done(page, 1), true);
  assert.strictEqual(await done(page, 2), false);
  await page.setInputFiles('#files', IMGS);
  await page.waitForFunction(() => document.querySelector('.progress [data-step="2"]').classList.contains('done'));
  const dl = page.waitForEvent('download');
  await page.click('#buildZip');
  await dl;
  assert.strictEqual(await done(page, 3), true);
  assert.deepStrictEqual(errors, []);
  await context.close();
});

test('images can be added before the save block', { skip }, async () => {
  const { page, context } = await open();
  await page.setInputFiles('#files', IMGS);
  await page.waitForFunction(() => /P01-S01\.png/.test(document.getElementById('imgs').textContent));
  await paste(page);
  assert.strictEqual(await done(page, 2), true);
  await context.close();
});

test('switching language keeps the pasted pack', { skip }, async () => {
  const { page, context } = await open();
  await paste(page);
  await page.click('.lang [data-l="th"]');
  assert.strictEqual(await page.inputValue('#save'), BLOCK);
  assert.match(await page.textContent('#sum'), /KP-2569-0001/);
  assert.strictEqual(await page.getAttribute('html', 'lang'), 'th');
  await context.close();
});

test('builder header has orbs and an ink build button', { skip }, async () => {
  const { page, context } = await open();
  assert.ok((await page.$$('header .orb')).length >= 2);
  assert.strictEqual(await page.$eval('#buildZip', (b) => getComputedStyle(b).backgroundColor), 'rgb(11, 11, 11)');
  await context.close();
});

test('no horizontal scroll at 360px', { skip }, async () => {
  const { page, context } = await open({ width: 360, height: 780 });
  await paste(page);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await context.close();
});
