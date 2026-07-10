const { chromium } = require('playwright');

const TARGET = 'http://localhost:3000';
const OUT = 'C:/Users/General/AppData/Local/Temp/pw-portfolio';

(async () => {
  const fs = require('fs');
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 812 },
  ];

  const results = [];

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    const errors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text().slice(0, 200)); });
    page.on('pageerror', (err) => errors.push('PAGE: ' + err.message.slice(0, 200)));

    await page.goto(TARGET + '/work', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    await page.evaluate(() => document.querySelector('#work-list')?.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(1500);

    const notes = [];
    let ok = true;

    // Grab both strips + measure direction over 2 seconds
    const measure = await page.evaluate(async () => {
      const section = document.querySelector('#work-list');
      const strips = Array.from(section.querySelectorAll('div.flex.w-max')).filter(
        (el) => el.className.includes('will-change-transform')
      );
      if (strips.length < 2) return { stripCount: strips.length };

      const stripA = strips[0];
      const stripB = strips[1];
      const aStart = stripA.getBoundingClientRect().x;
      const bStart = stripB.getBoundingClientRect().x;

      await new Promise((r) => setTimeout(r, 2000));

      const aEnd = stripA.getBoundingClientRect().x;
      const bEnd = stripB.getBoundingClientRect().x;

      return {
        stripCount: strips.length,
        aStart, aEnd, aDelta: aEnd - aStart, // positive = moving right (L→R)
        bStart, bEnd, bDelta: bEnd - bStart, // negative = moving left (R→L)
      };
    });

    if (measure.stripCount < 2) { ok = false; notes.push(`only ${measure.stripCount} strips found`); }
    else {
      if (!(measure.aDelta > 2)) { ok = false; notes.push(`top row NOT moving L→R (Δ=${measure.aDelta?.toFixed(1)}px)`); }
      else notes.push(`top L→R Δ=${measure.aDelta.toFixed(1)}px`);
      if (!(measure.bDelta < -2)) { ok = false; notes.push(`bottom row NOT moving R→L (Δ=${measure.bDelta?.toFixed(1)}px)`); }
      else notes.push(`bottom R→L Δ=${measure.bDelta.toFixed(1)}px`);
    }

    // Hover pause test — only run on desktop where we have precise mouse control
    if (vp.name === 'desktop' && measure.stripCount >= 2) {
      // Find a card in row A (top). Row A is the FIRST role="region"
      const cardInfo = await page.evaluate(() => {
        const rowA = document.querySelectorAll('[aria-label*="top row"]')[0];
        const rowB = document.querySelectorAll('[aria-label*="bottom row"]')[0];
        const rowARect = rowA?.getBoundingClientRect();
        const rowBRect = rowB?.getBoundingClientRect();
        return {
          rowACenter: rowARect ? { x: rowARect.x + rowARect.width / 2, y: rowARect.y + rowARect.height / 2 } : null,
          rowBCenter: rowBRect ? { x: rowBRect.x + rowBRect.width / 2, y: rowBRect.y + rowBRect.height / 2 } : null,
        };
      });

      if (cardInfo.rowACenter) {
        // Hover top row → measure both strips motion
        await page.mouse.move(cardInfo.rowACenter.x, cardInfo.rowACenter.y);
        await page.waitForTimeout(500); // let pause register
        const hoverMeasure = await page.evaluate(async () => {
          const section = document.querySelector('#work-list');
          const strips = Array.from(section.querySelectorAll('div.flex.w-max')).filter(
            (el) => el.className.includes('will-change-transform')
          );
          const aStart = strips[0].getBoundingClientRect().x;
          const bStart = strips[1].getBoundingClientRect().x;
          await new Promise((r) => setTimeout(r, 1500));
          const aEnd = strips[0].getBoundingClientRect().x;
          const bEnd = strips[1].getBoundingClientRect().x;
          return { aDelta: aEnd - aStart, bDelta: bEnd - bStart };
        });
        // Top should be ~0 (paused); bottom still moving R→L (negative)
        if (Math.abs(hoverMeasure.aDelta) > 3) { ok = false; notes.push(`top NOT paused on hover Δ=${hoverMeasure.aDelta.toFixed(1)}`); }
        else notes.push(`top paused ok (Δ=${hoverMeasure.aDelta.toFixed(1)}px)`);
        if (!(hoverMeasure.bDelta < -2)) { ok = false; notes.push(`bottom stopped moving during top hover Δ=${hoverMeasure.bDelta.toFixed(1)}`); }
        else notes.push(`bottom kept moving during top hover Δ=${hoverMeasure.bDelta.toFixed(1)}px`);

        // Leave — top should resume
        await page.mouse.move(10, 10);
        await page.waitForTimeout(800);
        const resumeMeasure = await page.evaluate(async () => {
          const section = document.querySelector('#work-list');
          const strips = Array.from(section.querySelectorAll('div.flex.w-max')).filter(
            (el) => el.className.includes('will-change-transform')
          );
          const aStart = strips[0].getBoundingClientRect().x;
          await new Promise((r) => setTimeout(r, 1500));
          const aEnd = strips[0].getBoundingClientRect().x;
          return { aDelta: aEnd - aStart };
        });
        if (!(resumeMeasure.aDelta > 2)) { ok = false; notes.push(`top NOT resumed after unhover Δ=${resumeMeasure.aDelta.toFixed(1)}`); }
        else notes.push(`top resumed ok Δ=${resumeMeasure.aDelta.toFixed(1)}px`);
      }
    }

    // Overflow check
    const overflow = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      win: window.innerWidth,
    }));
    const overflowX = overflow.scroll > overflow.win + 1;
    if (overflowX) { ok = false; notes.push(`overflow-x ${overflow.scroll - overflow.win}px`); }

    if (errors.length) { ok = false; notes.push(`err: ${errors[0]}`); }

    // Full-page screenshot for visual confirmation
    await page.screenshot({ path: `${OUT}/${vp.name}-work-directions.png`, fullPage: false });

    results.push({ viewport: vp.name, ok, notes: notes.join(' | ') });
    await page.close();
    await context.close();
  }

  await browser.close();

  console.log('\n=== RESULTS ===');
  for (const r of results) {
    console.log(`${r.ok ? '✅' : '❌'} ${r.viewport.padEnd(8)} ${r.notes}`);
  }
  const passed = results.filter(r => r.ok).length;
  console.log(`\n${passed}/${results.length} passed`);
})();
