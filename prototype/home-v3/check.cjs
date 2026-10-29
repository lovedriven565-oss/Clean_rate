// Регрессионная проверка прототипа home-v3. Запуск: node check.cjs [url]
const { chromium } = require('@playwright/test');
const BASE = process.argv[2] || 'http://127.0.0.1:8080/index.html';
let fails = 0;
const ok = (name, cond, extra = '') => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (extra ? ' — ' + extra : '')); if (!cond) fails++; };

(async () => {
  const b = await chromium.launch();
  const errors = [];
  const newPage = async (w, opts = {}) => {
    const p = await (await b.newContext({ viewport: { width: w, height: 840 }, ...opts })).newPage();
    p.on('pageerror', e => errors.push(w + 'px pageerror: ' + e.message));
    p.on('console', m => { if (m.type() === 'error') errors.push(w + 'px console: ' + m.text()); });
    p.on('request', r => { if (!r.url().startsWith('http://127.0.0.1')) errors.push('external: ' + r.url()); });
    await p.goto(BASE, { waitUntil: 'networkidle' });
    return p;
  };

  // === Десктоп 1440: поиск и синхронизация ===
  const d = await newPage(1440);
  const overflow = async (p, w) => ok(`overflow@${w}`, (await p.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - document.documentElement.clientWidth)) === 0);
  await overflow(d, 1440);

  for (const [query, expect] of [['вино на диване', 'vino'], ['жир на кухне', 'zhir'], ['запах после потопа', 'syrost']]) {
    await d.locator('#q').fill(query); await d.locator('#askForm button[type=submit]').click(); await d.waitForTimeout(500);
    ok('search ' + query, (await d.evaluate(() => document.querySelector('.mrow[aria-pressed="true"]')?.dataset.id)) === expect,
      await d.locator('#capTitle').textContent());
  }
  // неоднозначный запрос «запах» -> варианты, а не автовыбор
  await d.locator('#q').fill('запах'); await d.locator('#askForm button[type=submit]').click(); await d.waitForTimeout(400);
  const optsCount = await d.locator('#opts [data-opt]').count();
  ok('ambiguous offers options', optsCount >= 2, 'options: ' + optsCount);
  await d.locator('#opts [data-opt="kover"]').click(); await d.waitForTimeout(400);
  ok('option pick kover', (await d.locator('#capTitle').textContent()).includes('ковре'));
  // «запах на ковре» -> ковёр, не матрас
  await d.locator('#q').fill('запах на ковре'); await d.locator('#askForm button[type=submit]').click(); await d.waitForTimeout(400);
  ok('kovre resolves to kover', (await d.locator('#capTitle').textContent()).includes('ковре'), await d.locator('#capTitle').textContent());
  // ошибка и пусто
  await d.locator('#q').fill('ошибка'); await d.locator('#askForm button[type=submit]').click(); await d.waitForTimeout(200);
  ok('error state', (await d.locator('#msg').textContent()).includes('Демонстрационная ошибка'));
  await d.locator('#q').fill('абракадабра'); await d.locator('#askForm button[type=submit]').click(); await d.waitForTimeout(200);
  ok('no match state', (await d.locator('#msg').textContent()).includes('Точного совпадения нет'));

  // === Синхронизация фильтра: выбрать категорию, затем задачу из подборки другой категории ===
  await d.locator('#tabs .pill[data-cat="odors"]').click(); await d.waitForTimeout(300);
  await d.locator('.bcard[data-id="zhir"]').click(); await d.waitForTimeout(400);
  ok('box pick resets filter', (await d.locator('#capTitle').textContent()).includes('вытяжке') && (await d.locator('#tabs .pill[data-cat="all"]').getAttribute('aria-pressed')) === 'true');
  ok('detail synced', (await d.locator('#detail').textContent()).includes('вытяжке'));

  // клавиатура: стрелки + Enter + видимый фокус
  await d.locator('.mrow').first().focus(); await d.keyboard.press('ArrowDown'); await d.keyboard.press('ArrowDown'); await d.keyboard.press('Enter'); await d.waitForTimeout(300);
  ok('keyboard select', (await d.evaluate(() => document.activeElement?.dataset.id)) === (await d.evaluate(() => document.querySelector('.mrow[aria-pressed="true"]').dataset.id)));
  ok('focus outline', (await d.evaluate(() => getComputedStyle(document.activeElement).outlineStyle)) !== 'none');

  // нет вымышленных сумм
  const bodyText = await d.locator('body').textContent();
  ok('no fake prices', !/Br\b|\d+\s*[–-]\s*\d+\s*B/.test(bodyText), (bodyText.match(/60–120|45–90|80–160/g) || []).join(','));

  // контекст мастеров
  ok('proCtx', (await d.locator('#proCtx').textContent()).includes('Минск'));

  // демо-состояния (панель свёрнута — сначала раскрыть)
  await d.locator('.demo-bar summary').click(); await d.waitForTimeout(150);
  await d.locator('#stNoPros').check(); await d.waitForTimeout(200);
  ok('no pros', (await d.locator('#proList').textContent()).includes('нет'));
  await d.locator('#stNoPros').uncheck();
  await d.locator('#stNoAds').check(); await d.waitForTimeout(200);
  ok('no ads', await d.locator('#adEmpty').isVisible());
  await d.locator('#stNoAds').uncheck();
  await d.locator('#stNoVideo').check(); await d.waitForTimeout(200);
  ok('no video honest', (await d.locator('#adPlayer').textContent()).includes('нет'));
  await d.locator('#stNoVideo').uncheck();
  await d.locator('#stLoad').check(); await d.waitForTimeout(200);
  ok('loading skeleton', (await d.locator('#detail .skel').count()) > 0);
  await d.locator('#stLoad').uncheck();

  // темная тема
  await d.locator('#theme').click(); await d.waitForTimeout(200);
  ok('dark theme', (await d.evaluate(() => document.documentElement.dataset.theme)) === 'dark');
  await d.locator('#theme').click();
  // смена города -> пустое честное состояние
  await d.locator('#city').selectOption('moscow'); await d.waitForTimeout(300);
  ok('moscow pros honest', (await d.locator('#proList').textContent()).includes('Москва'));
  await d.locator('#city').selectOption('minsk');
  await d.close();

  // === Планшет 768 ===
  const t = await newPage(768);
  await overflow(t, 768);
  await t.close();

  // === Мобильный 390: раскрытие под строкой, меню, overflow ===
  const m = await newPage(390);
  await overflow(m, 390);
  await m.locator('#menuBtn').click(); await m.waitForTimeout(200);
  ok('mobile menu', await m.locator('#mnav').isVisible());
  await m.locator('#mnav a[href="#shelf"]').click(); await m.waitForTimeout(400);
  ok('mobile menu closes', !(await m.locator('#mnav').isVisible()));
  await m.locator('#shelf').scrollIntoViewIfNeeded();
  await m.locator('.mrow[data-id="krov"]').click(); await m.waitForTimeout(400);
  ok('mobile inline answer', await m.locator('.mexp .det-body').isVisible());
  ok('mobile expanded content', (await m.locator('.mexp:not([hidden])').textContent()).includes('крови'));
  // pick из подборки при другой категории на мобильном (ранее падал на отсутствующей строке)
  await m.locator('#tabs .pill[data-cat="kitchen"]').click(); await m.waitForTimeout(300);
  await m.locator('#collections').scrollIntoViewIfNeeded();
  await m.locator('.bcard[data-id="kover"]').click(); await m.waitForTimeout(500);
  ok('mobile box pick no crash', (await m.locator('#capTitle').textContent()).includes('ковре'));
  await m.close();

  // === Reduced motion ===
  const r = await newPage(390, { reducedMotion: 'reduce' });
  const anim = await r.evaluate(() => getComputedStyle(document.querySelector('.skel') || document.body).animationName);
  ok('reduced motion', anim === 'none' || anim === '');
  await r.close();

  console.log('JS errors:', errors.length ? errors : 'none');
  console.log(fails === 0 && errors.length === 0 ? 'ALL OK' : `ISSUES: ${fails} failed, ${errors.length} errors`);
  await b.close();
  process.exit(fails || errors.length ? 1 : 0);
})().catch(e => { console.log('FAIL', e.message); process.exit(1); });
