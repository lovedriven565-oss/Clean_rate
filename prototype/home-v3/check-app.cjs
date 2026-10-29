// Проверка переноса home-v3 в app/: node check-app.cjs [url]
const { chromium } = require('@playwright/test');
const BASE = process.argv[2] || 'http://localhost:3111/';
let fails = 0;
const ok = (n, c, x = '') => { console.log((c ? 'PASS' : 'FAIL') + ' ' + n + (x ? ' — ' + x : '')); if (!c) fails++; };

(async () => {
  const b = await chromium.launch();
  const errors = [];
  const newPage = async (w, opts = {}) => {
    const p = await (await b.newContext({ viewport: { width: w, height: opts.h || 900 }, ...opts })).newPage();
    // «Transition was aborted» — шум React 19 dev-режима при быстрых синтетических
    // кликах (в проде переходы просто прерываются без ошибки). Не считаем провалом.
    const devNoise = /Transition was aborted/;
    p.on('pageerror', e => { if (!devNoise.test(e.message)) errors.push(w + 'px pageerror: ' + e.message); });
    p.on('console', m => { if (m.type() === 'error' && !devNoise.test(m.text())) errors.push(w + 'px console: ' + m.text()); });
    await p.goto(BASE, { waitUntil: 'domcontentloaded' });
    await p.locator('#shelf').waitFor({ state: 'attached', timeout: 30000 });
    await p.waitForTimeout(4500); // гидратация на холодной компиляции dev-сервера
    return p;
  };
  // Клик с повтором до срабатывания: защита от гонки гидратации на dev-сервере.
  const clickTillPressed = async (p, loc, timeout = 15000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      await loc.click();
      await p.waitForTimeout(450);
      if ((await loc.getAttribute('aria-pressed')) === 'true') return true;
    }
    return false;
  };
  const overflow = async (p, w) => ok(`overflow@${w}`, (await p.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - document.documentElement.clientWidth)) === 0);

  // === Десктоп 1440 ===
  const d = await newPage(1440);
  await overflow(d, 1440);
  ok('showcase heading', await d.locator('#shelf h2').textContent().then(t => t.includes('Выберите задачу')));
  const rowCount = await d.locator('button[data-sol]').count();
  ok('rows rendered', rowCount >= 10, 'rows: ' + rowCount);
  ok('desktop detail visible', await d.locator('#shelf aside >> visible=true').count() === 1);

  // маркировка платных мест — слово «Реклама», «Спонсор» в #pros не используется;
  // дефолтная задача (вино) имеет демо-спонсора в Минске → плашка «Реклама» видна
  const prosText0 = await d.locator('#pros').innerText();
  // innerText отдаёт текст после CSS uppercase → проверяем регистронезависимо
  ok('pros marks paid as Реклама', !prosText0.includes('Спонсор') && /реклама/i.test(prosText0));
  // первая строка списка — органическая: платная строка идёт после органики
  const firstProsRow = await d.locator('#pros li').first().innerText();
  ok('first pros row is organic', !/реклама/i.test(firstProsRow));
  const minskFirstCompany = firstProsRow.split('\n')[0].trim();

  // клик по строке → деталь меняется, aria-pressed на ней
  const second = d.locator('button[data-sol]').nth(1);
  const secondSlug = await second.getAttribute('data-sol');
  const secondTitle = (await second.locator('span').nth(2).textContent()).trim();
  ok('click selects row', await clickTillPressed(d, second));
  await d.waitForTimeout(400);
  ok('detail shows selected', (await d.locator('#shelf aside').textContent()).includes(secondTitle.split(' ').slice(0, 3).join(' ')), secondTitle);
  // выбранная задача становится контекстом секции мастеров
  ok('pros follows selection', (await d.locator('#pros').textContent()).includes('задача «' + secondTitle.split(' ').slice(0, 3).join(' ')), secondTitle);

  // hover-превью: деталь показывает наведённую, выбор остаётся на кликнутой
  const first = d.locator('button[data-sol]').first();
  const firstTitle = (await first.locator('span').nth(2).textContent()).trim();
  await first.hover(); await d.waitForTimeout(300);
  ok('hover previews detail', (await d.locator('#shelf aside').textContent()).includes(firstTitle.split(' ').slice(0, 3).join(' ')), firstTitle);
  ok('selection stays explicit', (await d.locator(`button[data-sol="${secondSlug}"]`).getAttribute('aria-pressed')) === 'true' && (await first.getAttribute('aria-pressed')) === 'false');
  await d.mouse.move(10, 10); await d.waitForTimeout(200);

  // клавиатура: ArrowDown двигает фокус, Enter выбирает
  await first.focus(); await d.keyboard.press('ArrowDown'); await d.waitForTimeout(150);
  ok('arrow moves focus', (await d.evaluate(() => document.activeElement?.dataset.sol)) === secondSlug);
  await d.keyboard.press('Enter'); await d.waitForTimeout(300);
  ok('enter selects', (await d.evaluate(() => document.activeElement?.getAttribute('aria-pressed'))) === 'true');

  // фильтр категории
  const tabBtns = d.locator('#shelf [role="radiogroup"] button');
  await tabBtns.nth(1).click(); await d.waitForTimeout(300);
  const filtered = await d.locator('button[data-sol]').count();
  ok('tab filters list', filtered > 0 && filtered < rowCount, 'filtered: ' + filtered);
  await tabBtns.first().click(); await d.waitForTimeout(300);

  // подборка: клик карточки выбирает задачу и скроллит
  const card = d.locator('#collections button').first();
  const cardTitle = (await card.locator('span').last().textContent()).trim();
  await card.scrollIntoViewIfNeeded(); await card.click(); await d.waitForTimeout(800);
  ok('collection card selects', (await d.locator('#shelf aside').textContent()).includes(cardTitle.split(' ').slice(0, 3).join(' ')), cardTitle);
  ok('scrolled to shelf', await d.evaluate(() => document.getElementById('shelf').getBoundingClientRect().top < innerHeight * 0.7));

  // «Показать мастеров» → #pros
  await d.locator('#shelf aside a[href="#pros"]').click(); await d.waitForTimeout(800);
  ok('pros anchor scrolls', await d.evaluate(() => { const r = document.getElementById('pros').getBoundingClientRect(); return r.top < innerHeight && r.top > -r.height; }));

  // умный поиск: ввод → подсказки (дождаться панели; первая компиляция /api/search медленная)
  await d.locator('input[type="search"]').first().fill('вино');
  const suggBox = d.locator('.glass.rounded-panel').first();
  await suggBox.waitFor({ state: 'visible', timeout: 30000 }).catch(() => {});
  const sugg = await suggBox.innerText().catch(() => '');
  ok('search suggestions open', sugg.includes('Решения') || sugg.includes('вино') || sugg.length > 20, sugg.slice(0, 60));
  await d.keyboard.press('Escape');

  // честные формы: страницы партнёров и брендов отдают рабочую форму
  for (const path of ['/for-partners', '/for-brands']) {
    const res = await d.context().request.get(BASE.replace(/\/$/, '') + path, { timeout: 90000 }).catch(() => null);
    const html = res?.ok() ? await res.text() : '';
    ok(`form page ${path}`, !!res?.ok() && html.includes('<form'), 'status ' + (res?.status() ?? 'timeout'));
  }

  // честность: нет выдуманной экономии (innerText — без содержимого <script>)
  const body = await d.locator('body').innerText();
  ok('no fake savings', !/−?\s*75%|DIY −/.test(body), (body.match(/.{0,20}75%.{0,20}/) || ['none'])[0]);
  ok('honest estimate label', body.includes('Выезд мастера'));

  // SEO: canonical + hreflang (ENABLED_MARKETS: ru-BY, ru-RU + ru + x-default) + JSON-LD
  ok('canonical', await d.locator('head link[rel="canonical"]').count() === 1);
  ok('hreflang x4', await d.locator('head link[rel="alternate"][hreflang]').count() === 4);
  const jsonld = await d.locator('script[type="application/ld+json"]').first().textContent();
  ok('jsonld WebSite+SearchAction', jsonld.includes('"WebSite"') && jsonld.includes('SearchAction'));

  // принудительная тёмная тема — рендер без поломки
  await d.evaluate(() => document.documentElement.classList.add('dark'));
  await d.waitForTimeout(300);
  const darkBg = await d.evaluate(() => getComputedStyle(document.body).backgroundColor);
  ok('dark theme applies', darkBg !== 'rgb(250, 250, 250)' && darkBg !== 'rgba(0, 0, 0, 0)', darkBg);
  await d.evaluate(() => document.documentElement.classList.remove('dark'));
  await d.close();

  // === Смена региона: cookie ch_region=RU:moscow → мастера Москвы, не Минска ===
  const rctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await rctx.addCookies([{ name: 'ch_region', value: 'RU:moscow', url: BASE }]);
  const rp = await rctx.newPage();
  rp.on('pageerror', e => { if (!/Transition was aborted/.test(e.message)) errors.push('region pageerror: ' + e.message); });
  await rp.goto(BASE, { waitUntil: 'domcontentloaded' });
  await rp.locator('#pros').waitFor({ state: 'attached', timeout: 30000 });
  await rp.waitForTimeout(1500);
  const moscowPros = await rp.locator('#pros').innerText();
  ok('region cookie switches context', moscowPros.includes('Москва'), moscowPros.split('\n').find(l => l.includes('Контекст')) || 'no context line');
  ok('region filters city strictly', !moscowPros.includes(minskFirstCompany), minskFirstCompany + ' leaked to Moscow');
  await rctx.close();

  // === Планшет 768 ===
  const t = await newPage(768);
  await overflow(t, 768);
  // на планшете (<lg) inline-раскрытие под строкой
  const trow = t.locator('button[data-sol]').nth(2);
  const tTitle = (await trow.locator('span').nth(2).textContent()).trim();
  await clickTillPressed(t, trow); await t.waitForTimeout(400);
  ok('tablet inline expand', (await t.locator('#shelf [id^="exp-"]:not([hidden])').textContent()).includes(tTitle.split(' ').slice(0, 3).join(' ')));
  await t.close();

  // === Мобильный 390 ===
  const m = await newPage(390, { h: 844 });
  await overflow(m, 390);
  const vis = await m.evaluate(() => {
    const ih = innerHeight;
    const inp = document.querySelector('input[type="search"]');
    const r1 = inp.getBoundingClientRect();
    const btn = inp.closest('form').querySelector('button[type="submit"]').getBoundingClientRect();
    return { ih, input: r1.bottom <= ih && r1.top >= 0, btn: btn.bottom <= ih && btn.top >= 0, bottom: Math.round(btn.bottom) };
  });
  ok('search visible @390x844', vis.input && vis.btn, `btn bottom ${vis.bottom}/${vis.ih}`);
  const mrow = m.locator('button[data-sol]').nth(1);
  const mTitle = (await mrow.locator('span').nth(2).textContent()).trim();
  await mrow.scrollIntoViewIfNeeded(); await clickTillPressed(m, mrow); await m.waitForTimeout(500);
  const exp = m.locator('#shelf [id^="exp-"]:not([hidden])');
  ok('mobile inline answer', (await exp.textContent()).includes(mTitle.split(' ').slice(0, 3).join(' ')));
  ok('mobile expanded has steps', (await exp.locator('ol li').count()) >= 3, 'steps: ' + await exp.locator('ol li').count());
  ok('mobile expanded has warning', (await exp.textContent()).includes('Не делайте'));
  ok('mobile no desktop aside', await m.locator('#shelf aside >> visible=true').count() === 0);
  // регион смены города недоступен в navbar select? — RegionSelector есть; пропускаем смену, проверяем секцию мастеров
  ok('pros section exists', await m.locator('#pros').count() === 1);
  await m.close();

  // === Reduced motion ===
  const r = await newPage(390, { reducedMotion: 'reduce' });
  ok('reduced motion loads', (await r.locator('#shelf').count()) === 1);
  await r.close();

  console.log('JS errors:', errors.length ? errors : 'none');
  console.log(fails === 0 && errors.length === 0 ? 'ALL OK' : `ISSUES: ${fails} failed, ${errors.length} errors`);
  await b.close();
  process.exit(fails || errors.length ? 1 : 0);
})().catch(e => { console.log('FAIL', e.message); process.exit(1); });
