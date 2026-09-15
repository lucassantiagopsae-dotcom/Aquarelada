const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(path.join(process.argv[2], 'playwright'));
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'tmp', 'livro-v2-review');
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const results = [];
  try {
    for (const [name, width, height] of [['desktop',1440,900],['mobile',390,844],['small',360,740]]) {
      console.log(`Checking ${name}`);
      const page = await browser.newPage({ viewport: { width, height } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/*facebook*', route => route.abort());
      await page.goto('http://127.0.0.1:4177/livro/', { waitUntil: 'networkidle' });
      await page.screenshot({ path: path.join(output, `reference-${name}.png`) });
      await page.goto('http://127.0.0.1:4177/livro-v2/', { waitUntil: 'networkidle' });
      await page.waitForFunction(() => document.getElementById('video-abertura').currentTime > 0);
      const duration = await page.locator('#video-abertura').evaluate(v => v.duration);
      assert(duration > 22 && duration < 23);
      await page.locator('[data-video-toggle="video-abertura"]').click();
      assert(await page.locator('#video-abertura').evaluate(v => v.paused));
      await page.locator('#video-abertura').evaluate(v => { v.currentTime = 1; });
      await page.waitForTimeout(250);
      await page.screenshot({ path: path.join(output, `opening-${name}.png`) });
      await page.locator('[data-video-toggle="video-abertura"]').click();
      await page.waitForFunction(() => !document.getElementById('video-abertura').paused);
      await page.locator('#video-abertura').evaluate(v => { v.currentTime = 9; });
      await page.waitForTimeout(250);
      await page.screenshot({ path: path.join(output, `opening-reading-${name}.png`) });
      await page.locator('.abertura-v2__conhecer').click();
      await page.waitForTimeout(650);
      assert(await page.locator('#video-abertura').evaluate(v => v.paused));
      await page.screenshot({ path: path.join(output, `story-${name}.png`) });
      await page.locator('.capa-v2').scrollIntoViewIfNeeded();
      await page.waitForFunction(() => document.getElementById('video-capa').currentTime > 0);
      await page.waitForTimeout(550);
      await page.screenshot({ path: path.join(output, `cover-${name}.png`) });
      await page.locator('[data-video-toggle="video-capa"]').click();
      assert(await page.locator('#video-capa').evaluate(v => v.paused));
      await page.locator('.trilha__intro').evaluate(e => e.scrollIntoView({ block: 'start', behavior: 'instant' }));
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(output, `play-${name}.png`) });
      const before = await page.locator('.trilha__rail').evaluate(e => e.scrollLeft);
      await page.locator('[data-trilha-next]').click();
      await page.waitForTimeout(500);
      assert(await page.locator('.trilha__rail').evaluate(e => e.scrollLeft) > before);
      const movement1 = await page.locator('.brincadeira img').first().evaluate(e => getComputedStyle(e).transform);
      await page.waitForTimeout(500);
      const movement2 = await page.locator('.brincadeira img').first().evaluate(e => getComputedStyle(e).transform);
      assert.notEqual(movement1, movement2);
      await page.locator('[data-motion-toggle]').click();
      assert.equal(await page.locator('.brincadeira img').first().evaluate(e => getComputedStyle(e).animationPlayState), 'paused');
      for (const illustration of await page.locator('.brincadeira img').all()) {
        await illustration.scrollIntoViewIfNeeded();
        await illustration.evaluate(image => { image.loading = 'eager'; });
        await page.waitForFunction(src => {
          const image = Array.from(document.images).find(item => item.src === src);
          return image && image.complete && image.naturalWidth > 0;
        }, await illustration.getAttribute('src').then(src => new URL(src, page.url()).href), { timeout: 5000 });
      }
      await page.locator('.trilha__rail').evaluate(e => { e.scrollLeft = 0; });
      for (const section of ['.bonus','.continua','.afeto','.convite','.respiro','.fechar']) {
        await page.locator(section).scrollIntoViewIfNeeded();
        await page.waitForTimeout(550);
        await page.screenshot({ path: path.join(output, `${section.slice(1)}-${name}.png`) });
      }
      await page.screenshot({ path: path.join(output, `full-${name}.png`), fullPage: true });
      const measurements = await page.evaluate(() => ({
        width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        fixedOverlays: Array.from(document.querySelectorAll('body *')).filter(e => getComputedStyle(e).position === 'fixed' && e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().height > 0).map(e => e.className),
        imagesMissing: Array.from(document.images).filter(i => !i.complete || !i.naturalWidth).map(i => i.src),
        amazon: Array.from(document.querySelectorAll('[data-meta-event]')).every(a => a.href.startsWith('https://www.amazon.com.br/')),
        headingOverflow: Array.from(document.querySelectorAll('h1,h2,h3')).filter(e => e.scrollWidth > e.clientWidth + 2).map(e => e.textContent)
      }));
      assert(measurements.scrollWidth <= width);
      assert.equal(measurements.fixedOverlays.length, 0, 'Fixed elements must not cover page copy');
      assert.equal(measurements.imagesMissing.length, 0, measurements.imagesMissing.join('\n'));
      assert.equal(measurements.headingOverflow.length, 0);
      assert(measurements.amazon);
      assert.equal(errors.length, 0, errors.join('\n'));
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload({ waitUntil: 'networkidle' });
      assert(await page.locator('#video-abertura').evaluate(v => v.paused));
      await page.locator('[data-video-toggle="video-abertura"]').click();
      await page.waitForFunction(() => !document.getElementById('video-abertura').paused);
      results.push({ viewport: name, width, height, duration, measurements, videoControls: 'pass', offscreenPause: 'pass', carousel: 'pass', animationPause: 'pass', motionSamples: [movement1,movement2], reducedMotion: 'pass', errors });
      await page.close();
    }
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
    console.log(JSON.stringify(results, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
