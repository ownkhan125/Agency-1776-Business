const { chromium } = require('playwright');
const fs = require('fs');

const TARGET_URL = process.env.TARGET_URL || 'http://localhost:3000';
const PAGES = ['/', '/about'];

function fmt(o) { return JSON.stringify(o, null, 2); }

async function capture(page) {
  return await page.evaluate(() => {
    const root = document.querySelector('[data-topbar-root]');
    if (!root) return null;
    const cs = getComputedStyle(root);
    const rect = root.getBoundingClientRect();
    const activeTab = document.querySelector("[data-topbar-tab='active']");
    const activeSpan = activeTab ? activeTab.querySelector('span:last-child') || activeTab : null;
    const activeColor = activeSpan ? getComputedStyle(activeSpan).color : null;
    // Muted "Business Division" text lives in the sibling column
    const mutedContainer = root.querySelector('.hidden.lg\\:flex, div.hidden');
    const mutedColor = mutedContainer ? getComputedStyle(mutedContainer).color : null;
    const htmlTheme = document.documentElement.getAttribute('data-theme');
    return {
      htmlTheme,
      backgroundColor: cs.backgroundColor,
      borderBottomColor: cs.borderBottomColor,
      rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
      activeColor,
      mutedColor,
    };
  });
}

async function toggleTheme(page) {
  await page.click('[data-theme-toggle]');
  // Allow GSAP toggle + CSS variables to settle
  await page.waitForTimeout(500);
}

function assertEqual(name, a, b, fails) {
  const A = typeof a === 'object' ? JSON.stringify(a) : String(a);
  const B = typeof b === 'object' ? JSON.stringify(b) : String(b);
  if (A === B) {
    console.log(`  ✅ ${name}: ${A}`);
    return true;
  }
  console.log(`  ❌ ${name}: dark=${A}  light=${B}`);
  fails.push({ name, dark: A, light: B });
  return false;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message));

  const fails = [];

  for (const path of PAGES) {
    console.log(`\n=== Page: ${path} ===`);
    await page.goto(TARGET_URL + path, { waitUntil: 'networkidle' });
    // Ensure a known starting theme
    await page.evaluate(() => {
      const h = document.documentElement;
      h.setAttribute('data-theme', 'black');
      h.classList.remove('theme-light');
      h.classList.add('theme-black');
      try { localStorage.setItem('theme', 'black'); } catch (e) {}
    });
    await page.waitForTimeout(200);

    // 1. Capture in dark mode
    const dark = await capture(page);
    console.log('Dark:', fmt(dark));
    if (!dark) { console.log('❌ Top Bar element not found'); process.exit(1); }

    if (path === '/') {
      await page.screenshot({
        path: '/tmp/topbar-dark.png',
        clip: { x: 0, y: 0, width: 1440, height: 60 },
      });
      console.log('📸 saved /tmp/topbar-dark.png');
    }

    // 2. Toggle to light
    await toggleTheme(page);
    const light = await capture(page);
    console.log('Light:', fmt(light));

    if (path === '/') {
      await page.screenshot({
        path: '/tmp/topbar-light.png',
        clip: { x: 0, y: 0, width: 1440, height: 60 },
      });
      console.log('📸 saved /tmp/topbar-light.png');
    }

    // Confirm the theme actually changed (control test)
    if (dark.htmlTheme === light.htmlTheme) {
      console.log('❌ Theme did not actually change on this page — invalid test');
      fails.push({ name: `${path}:theme-did-not-change`, dark: dark.htmlTheme, light: light.htmlTheme });
    } else {
      console.log(`  🎚️ theme flipped: ${dark.htmlTheme} → ${light.htmlTheme}`);
    }

    // 3. Assert equality of Top Bar visual properties
    assertEqual(`${path} backgroundColor`, dark.backgroundColor, light.backgroundColor, fails);
    assertEqual(`${path} borderBottomColor`, dark.borderBottomColor, light.borderBottomColor, fails);
    assertEqual(`${path} bounding-box`, dark.rect, light.rect, fails);
    assertEqual(`${path} active-tab color`, dark.activeColor, light.activeColor, fails);
    assertEqual(`${path} muted-text color`, dark.mutedColor, light.mutedColor, fails);

    // 4. Toggle back and check once more
    await toggleTheme(page);
    const darkAgain = await capture(page);
    console.log('Dark-again:', fmt(darkAgain));
    assertEqual(`${path} backgroundColor (roundtrip)`, dark.backgroundColor, darkAgain.backgroundColor, fails);
    assertEqual(`${path} borderBottomColor (roundtrip)`, dark.borderBottomColor, darkAgain.borderBottomColor, fails);
    assertEqual(`${path} bounding-box (roundtrip)`, dark.rect, darkAgain.rect, fails);
  }

  await browser.close();

  console.log('\n=== Console errors ===');
  if (consoleErrors.length) {
    for (const e of consoleErrors) console.log('  ⚠️ ' + e);
  } else {
    console.log('  (none)');
  }

  console.log('\n=== Result ===');
  if (fails.length === 0 && consoleErrors.length === 0) {
    console.log('✅ PASS — Top Bar is theme-invariant');
    process.exit(0);
  } else {
    console.log(`❌ FAIL — ${fails.length} assertion failures, ${consoleErrors.length} console errors`);
    console.log(fmt(fails));
    process.exit(1);
  }
})();
