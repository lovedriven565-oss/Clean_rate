// Проверка file:// + видимость первого экрана + скриншоты v3/v2. Запуск: node check-file.cjs
const { chromium } = require('@playwright/test');
const { pathToFileURL } = require('url');
const path = require('path');
let fails = 0;
const ok = (n, c, x = '') => { console.log((c ? 'PASS' : 'FAIL') + ' ' + n + (x ? ' — ' + x : '')); if (!c) fails++; };
const v3 = pathToFileURL(path.join(__dirname, 'index.html')).href;
const v2 = pathToFileURL(path.join(__dirname, '..', 'home-v2', 'index.html')).href;

(async () => {
  const b = await chromium.launch();
  const errors = [], ext = [];

  // === file:// прямое открытие ===
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  p.on('request', r => { if (!r.url().startsWith('file://')) ext.push(r.url()); });
  await p.goto(v3, { waitUntil: 'load' });
  await p.waitForTimeout(1200);
  await p.evaluate(() => document.fonts.ready);
  const imgs = await p.evaluate(() => [...document.images].map(i => ({ s: i.src.split('/').pop(), w: i.naturalWidth })));
  const broken = imgs.filter(i => i.w === 0);
  ok('file:// images loaded', broken.length === 0, broken.length ? JSON.stringify(broken) : imgs.length + ' imgs');
  const geist = await p.evaluate(() => document.fonts.check('700 16px Geist') && document.fonts.check('16px "Geist Mono"'));
  ok('file:// fonts loaded', geist);
  ok('file:// no external requests', ext.length === 0, ext.join(',') || 'none');
  await p.close();
  await ctx.close();

  // === Мобильная высота: поиск и кнопка видны до скролла ===
  for (const [w, h] of [[390, 844], [360, 640]]) {
    const c2 = await b.newContext({ viewport: { width: w, height: h } });
    const m = await c2.newPage();
    await m.goto('http://127.0.0.1:8080/index.html', { waitUntil: 'networkidle' });
    const vis = await m.evaluate(() => {
      const ih = innerHeight;
      const r1 = document.querySelector('#q').getBoundingClientRect();
      const r2 = document.querySelector('#askForm button[type=submit]').getBoundingClientRect();
      return { ih, input: r1.bottom <= ih && r1.top >= 0, btn: r2.bottom <= ih && r2.top >= 0, bottom: Math.round(r2.bottom) };
    });
    ok(`search visible @${w}x${h}`, vis.input && vis.btn, `btn bottom ${vis.bottom}/${vis.ih}`);
    await m.close();
    await c2.close();
  }

  // === Скриншоты для сравнения с home-v2 ===
  const shots = [
    ['http://127.0.0.1:8080/index.html', 1440, 'shot-v3-1440.png'],
    ['http://127.0.0.1:8080/index.html', 390, 'shot-v3-390.png'],
    [v2, 1440, 'shot-v2-1440.png'],
    [v2, 390, 'shot-v2-390.png'],
  ];
  for (const [url, w, name] of shots) {
    const c3 = await b.newContext({ viewport: { width: w, height: 900 } });
    const s = await c3.newPage();
    await s.goto(url, { waitUntil: 'load' });
    await s.waitForTimeout(1000);
    await s.screenshot({ path: name });
    await s.close();
    await c3.close();
    console.log('shot ' + name);
  }

  console.log('JS errors:', errors.length ? errors : 'none');
  console.log(fails === 0 && errors.length === 0 ? 'ALL OK' : `ISSUES: ${fails} failed`);
  await b.close();
  process.exit(fails || errors.length ? 1 : 0);
})().catch(e => { console.log('FAIL', e.message); process.exit(1); });
