'use strict';
// START-HERE.html behaviour: shell, navigation, search, walk-through and task views.
const test = require('node:test');
const assert = require('node:assert');
const { openPack, fixture, chromium } = require('./helpers');

const skip = !chromium && 'playwright not installed';
let browser;
test.before(async () => { if (chromium) browser = await chromium.launch(); });
test.after(async () => { if (browser) await browser.close(); });

const PHONE = { width: 360, height: 780 };

// WCAG contrast of a colour against white, evaluated inside the page.
function contrastWithWhite(css) {
  const m = css.trim().match(/^#([0-9a-f]{6})$/i);
  const hex = m ? m[1] : null;
  const rgb = hex ? [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    : css.match(/\d+/g).slice(0, 3).map((n) => Number(n) / 255);
  const lin = rgb.map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  const L = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
  return 1.05 / (L + 0.05);
}

// ── Shell and reference views (Task 3) ────────────────────────────────────

for (const hash of ['', '#/urgent', '#/questions', '#/glossary', '#/changes', '#/nope']) {
  test(`route ${hash || 'home'} renders without errors`, { skip }, async () => {
    const { page, errors, external, context } = await openPack(browser, fixture(), { hash });
    assert.ok(await page.$('nav.side'), 'sidebar present');
    assert.deepStrictEqual(errors, []);
    assert.deepStrictEqual(external, []);
    await context.close();
  });
}

test('unknown route shows home', { skip }, async () => {
  const { page, context } = await openPack(browser, fixture(), { hash: '#/nope' });
  assert.ok(await page.$('.hero'));
  await context.close();
});

test('reference views list their content', { skip }, async () => {
  const k = fixture();
  for (const [hash, title, text] of [['#/urgent', 'Urgent', 'Renew the printer contract'], ['#/urgent', 'Urgent', 'Billing system'],
    ['#/questions', 'Questions still unanswered', 'Who signs the printer contract?'], ['#/glossary', 'Glossary', 'Reconcile'],
    ['#/changes', 'Change history', 'Added printer fixes']]) {
    const { page, context } = await openPack(browser, k, { hash });
    assert.strictEqual((await page.textContent('main h1')).trim(), title, hash);
    assert.match(await page.textContent('main'), new RegExp(text), hash);
    await context.close();
  }
});

test('light accent is darkened to keep pins readable', { skip }, async () => {
  const k = Object.assign(fixture(), { accent: '#ffd400' });
  const { page, context } = await openPack(browser, k);
  const accent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent'));
  assert.ok(contrastWithWhite(accent) >= 4.5, 'accent ' + accent);
  await context.close();
});

test('home hero has orbs and an ink primary button', { skip }, async () => {
  const { page, context } = await openPack(browser, fixture());
  assert.ok((await page.$$('.hero .orb')).length >= 2);
  const bg = await page.$eval('.hero .btn.pri', (b) => getComputedStyle(b).backgroundColor);
  assert.strictEqual(bg, 'rgb(11, 11, 11)');
  await context.close();
});

test('sidebar lists every task, uncaptured ones greyed', { skip }, async () => {
  const { page, context } = await openPack(browser, fixture());
  const names = await page.$$eval('nav.side [data-route^="#/task/"]', (a) => a.map((x) => x.textContent));
  assert.strictEqual(names.length, 5);
  assert.match(await page.textContent('nav.side'), /Order supplies/);
  await context.close();
});

test('no horizontal scroll at 360px, long Thai title included', { skip }, async () => {
  const k = Object.assign(fixture(), { title: 'งานกระทบยอดบัญชีธนาคารและเงินสดย่อยประจำเดือนสำหรับทุกสาขาทั่วประเทศ'.repeat(2) });
  for (const hash of ['', '#/urgent', '#/glossary', '#/task/P01/walk', '#/task/P01/overview']) {
    const { page, context } = await openPack(browser, k, { hash, viewport: PHONE });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), hash);
    await context.close();
  }
});

test('a pack with no processes still renders home and sidebar', { skip }, async () => {
  const k = Object.assign(fixture(), { processes: [] });
  const { page, errors, context } = await openPack(browser, k);
  assert.ok(await page.$('.hero'));
  assert.match(await page.textContent('nav.side'), /Issue an invoice/);
  assert.deepStrictEqual(errors, []);
  await context.close();
});

test('phone menu opens the sidebar sheet and Esc closes it', { skip }, async () => {
  const { page, context } = await openPack(browser, fixture(), { viewport: PHONE });
  assert.strictEqual(await page.isVisible('nav.side'), false);
  await page.click('#menu-open');
  assert.strictEqual(await page.isVisible('nav.side'), true);
  await page.keyboard.press('Escape');
  assert.strictEqual(await page.isVisible('nav.side'), false);
  await context.close();
});

test('ask AI shows a prompt to copy', { skip }, async () => {
  const { page, context } = await openPack(browser, fixture());
  await page.click('#ask-ai');
  assert.match(await page.textContent('#ai-panel'), /Teach me from this pack/);
  await context.close();
});
