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

// ── Search and walk-through (Task 4) ──────────────────────────────────────

const { exampleImage } = require('./helpers');
const IMAGES = { 'P01-S01.png': exampleImage('P01-S01.png') };
const hashOf = (page) => page.evaluate(() => location.hash);

test('/ opens search; a glossary term opens the glossary', { skip }, async () => {
  const { page, context } = await openPack(browser, fixture());
  await page.keyboard.press('/');
  await page.fill('#search-q', 'reconcile');
  const first = await page.textContent('#search [role=option]');
  assert.match(first, /Reconcile/);
  await page.keyboard.press('Enter');
  assert.strictEqual(await hashOf(page), '#/glossary');
  await context.close();
});

test('Ctrl+K search finds a step and opens the walk-through at it', { skip }, async () => {
  const { page, context } = await openPack(browser, fixture());
  await page.keyboard.press('Control+k');
  await page.fill('#search-q', 'take payment');
  await page.keyboard.press('Enter');
  assert.strictEqual(await hashOf(page), '#/task/P01/walk/P01.S04');
  assert.match(await page.textContent('.step-title'), /Take payment at the desk/);
  await context.close();
});

test('search shows pack text as text, not markup', { skip }, async () => {
  const { page, context } = await openPack(browser, fixture());
  await page.click('#search-open');
  await page.fill('#search-q', '<b>');
  assert.match(await page.textContent('#search'), /<b>x<\/b>/);
  assert.strictEqual(await page.$('#search [role=option] b'), null);
  await context.close();
});

test('#/task/P01 opens the walk-through with the step rail and action bar', { skip }, async () => {
  const { page, context } = await openPack(browser, fixture(), { hash: '#/task/P01', images: IMAGES });
  assert.strictEqual((await page.$$('.rail a[data-step]')).length, 4);
  assert.ok(await page.$('.actionbar #next'));
  assert.ok(await page.$('.actionbar #ask-step'));
  await context.close();
});

test('rail jumps to a step, arrow keys move, Back returns', { skip }, async () => {
  const { page, context } = await openPack(browser, fixture(), { hash: '#/task/P03/walk', images: IMAGES });
  await page.click('.rail a[data-step="P03.S03"]');
  assert.match(await page.textContent('.step-title'), /Send to the accountant/);
  await page.keyboard.press('ArrowRight');
  assert.match(await page.textContent('.step-title'), /File the paper copies/);
  await page.click('#back');
  assert.match(await page.textContent('.step-title'), /Send to the accountant/);
  await context.close();
});

test('a branch step hides Next until a choice is made', { skip }, async () => {
  const { page, context } = await openPack(browser, fixture(), { hash: '#/task/P01/walk/P01.S02', images: IMAGES });
  assert.strictEqual(await page.isVisible('#next'), false);
  await page.click('.choice >> text=Not insured');
  assert.match(await page.textContent('.step-title'), /Take payment at the desk/);
  await context.close();
});

test('home continues where the receiver left off', { skip }, async () => {
  const { page, context } = await openPack(browser, fixture(), { hash: '#/task/P01/walk/P01.S04', images: IMAGES });
  await page.evaluate(() => { location.hash = '#/'; });
  await page.waitForSelector('.hero');
  await page.click('#hero-go');
  assert.strictEqual(await hashOf(page), '#/task/P01/walk/P01.S04');
  await context.close();
});

test('walk-through works when localStorage is blocked', { skip }, async () => {
  const init = () => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); };
  const { page, errors, context } = await openPack(browser, fixture(), { hash: '#/task/P01', images: IMAGES, init });
  await page.click('#next');
  assert.match(await page.textContent('.step-title'), /Is the patient insured/);
  await page.evaluate(() => { location.hash = '#/'; });
  await page.waitForSelector('.hero');
  assert.deepStrictEqual(errors, []);
  await context.close();
});

test('missing task falls back to home, missing step to step 1', { skip }, async () => {
  let r = await openPack(browser, fixture(), { hash: '#/task/NOPE' });
  assert.ok(await r.page.$('.hero'));
  await r.context.close();
  r = await openPack(browser, fixture(), { hash: '#/task/P01/walk/NOPE', images: IMAGES });
  assert.match(await r.page.textContent('.step-title'), /Open the billing screen/);
  await r.context.close();
});

test('the screenshot opens full screen and Esc closes it', { skip }, async () => {
  const { page, context } = await openPack(browser, fixture(), { hash: '#/task/P01', images: IMAGES });
  await page.click('.shot');
  assert.strictEqual(await page.isVisible('#lightbox'), true);
  await page.keyboard.press('Escape');
  assert.strictEqual(await page.isVisible('#lightbox'), false);
  await context.close();
});

// ── Task views (Task 5) ───────────────────────────────────────────────────

const selectedTab = (page) => page.getAttribute('[role=tab][aria-selected=true]', 'data-tab');

test('each view opens on its own main tab', { skip }, async () => {
  for (const [id, tab] of [['P01', 'walk'], ['P02', 'checklist'], ['P03', 'timeline'], ['P04', 'decide'], ['P05', 'fix']]) {
    const { page, context } = await openPack(browser, fixture(), { hash: '#/task/' + id, images: IMAGES });
    assert.strictEqual(await selectedTab(page), tab, id);
    await context.close();
  }
});

test('the walk-through tab is available on every view', { skip }, async () => {
  for (const id of ['P02', 'P03', 'P04', 'P05']) {
    const { page, context } = await openPack(browser, fixture(), { hash: '#/task/' + id });
    assert.ok(await page.$('[role=tab][data-tab=walk]'), id);
    await context.close();
  }
});

test('checklist puts safety first, keeps ticks after reload, and clears them', { skip }, async () => {
  const { page, context } = await openPack(browser, fixture(), { hash: '#/task/P02' });
  const titles = await page.$$eval('.checklist .ck-title', (e) => e.map((x) => x.textContent));
  assert.strictEqual(titles[0], 'Check the oxygen tank pressure');
  assert.ok(await page.$('.checklist .notice.safe'));
  await page.check('.checklist input[data-step="P02.S01"]');
  await page.reload();
  await page.waitForSelector('.checklist');
  assert.strictEqual(await page.isChecked('.checklist input[data-step="P02.S01"]'), true);
  await page.click('#clear-ticks');
  assert.strictEqual(await page.isChecked('.checklist input[data-step="P02.S01"]'), false);
  await context.close();
});

test('timeline groups steps by when, with an Any time group last', { skip }, async () => {
  const { page, context } = await openPack(browser, fixture(), { hash: '#/task/P03' });
  const groups = await page.$$eval('.timeline .tl-when', (e) => e.map((x) => x.textContent));
  assert.deepStrictEqual(groups, ['Day 1', 'By day 5', 'Any time']);
  assert.strictEqual((await page.$$('.timeline .tl-group:first-child .tl-step')).length, 2);
  await context.close();
});

test('decision finder walks the questions to a step', { skip }, async () => {
  const { page, context } = await openPack(browser, fixture(), { hash: '#/task/P04' });
  assert.match(await page.textContent('.finder'), /Never discount more than 20%/);
  await page.click('.finder .choice >> text=Yes');
  await page.click('.finder .choice >> text=Yes');
  assert.match(await page.textContent('.finder .answer'), /Approve up to 10%/);
  await context.close();
});

test('decision finder stops on a loop and shows the steps', { skip }, async () => {
  const { page, errors, context } = await openPack(browser, fixture(), { hash: '#/task/P04' });
  await page.click('.finder .choice >> text=Yes');
  await page.click('.finder .choice >> text=Not sure');
  assert.ok(await page.$('.finder .stuck'));
  assert.ok((await page.$$('.finder .stuck a')).length >= 4);
  assert.deepStrictEqual(errors, []);
  await context.close();
});

test('troubleshoot filter narrows the symptoms', { skip }, async () => {
  const { page, context } = await openPack(browser, fixture(), { hash: '#/task/P05' });
  assert.strictEqual((await page.$$('.fixes .fixcard')).length, 3);
  await page.fill('#fix-filter', 'paper');
  assert.strictEqual(await page.$$eval('.fixes .fixcard', (c) => c.filter((x) => !x.hidden).length), 1);
  await context.close();
});

test('home cards name the action of each view', { skip }, async () => {
  const { page, context } = await openPack(browser, fixture());
  const labels = await page.$$eval('.card .btn.pri', (b) => b.map((x) => x.textContent));
  for (const l of ['Walk me through', 'Open checklist', 'See timeline', 'Find what to do', 'What’s wrong?']) {
    assert.ok(labels.some((x) => x.includes(l)), l);
  }
  await context.close();
});

test('an old pack without views still opens the walk-through', { skip }, async () => {
  const k = fixture();
  k.processes.forEach((p) => { delete p.view; });
  const { page, context } = await openPack(browser, k, { hash: '#/task/P02' });
  assert.strictEqual(await selectedTab(page), 'walk');
  await context.close();
});

test('a view without its data falls back to the walk-through', { skip }, async () => {
  const k = fixture();
  k.processes[4].troubleshooting = [];
  const { page, context } = await openPack(browser, k, { hash: '#/task/P05' });
  assert.strictEqual(await selectedTab(page), 'walk');
  await context.close();
});

test('phone walk-through opens the step list from a button', { skip }, async () => {
  const { page, context } = await openPack(browser, fixture(), { hash: '#/task/P01', images: IMAGES, viewport: PHONE });
  assert.strictEqual(await page.isVisible('.rail'), false);
  await page.click('#steps-open');
  assert.strictEqual(await page.isVisible('.rail'), true);
  await context.close();
});
