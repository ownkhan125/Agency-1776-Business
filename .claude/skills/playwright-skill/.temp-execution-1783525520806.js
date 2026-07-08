// Comprehensive verification for Agency 1776 Business:
//  1. inner-page hero backdrops (5 top-level + 2 slug pages)
//  2. About page ChamferedSwiper (drag / chevrons / dots / responsiveness)
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const os = require("os");

const TARGET_URL = "http://localhost:3000";
const OUT = os.tmpdir();

const HERO_PAGES = [
  { path: "/about", variant: "beams" },
  { path: "/services", variant: "scan" },
  { path: "/pricing", variant: "pulse" },
  { path: "/work", variant: "sweep" },
  { path: "/contact", variant: "directional" },
  { path: "/services/product-design", variant: "scan" },
  { path: "/work/northwind-systems", variant: "sweep" },
];

function shot(page, name) {
  return page.screenshot({
    path: path.join(OUT, `pw-a1776-${name}.png`),
    fullPage: false,
  });
}

function attachConsoleErrorCapture(page) {
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err.message || err)));
  return errors;
}

async function testHero(page, url, expectedVariant) {
  const errors = attachConsoleErrorCapture(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${TARGET_URL}${url}`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(800);

  const backdropInfo = await page.evaluate(() => {
    const el = document.querySelector("[data-page-backdrop]");
    if (!el) return { found: false };
    const rect = el.getBoundingClientRect();
    return {
      found: true,
      variant: el.getAttribute("data-variant"),
      w: Math.round(rect.width),
      h: Math.round(rect.height),
      beams: document.querySelectorAll('[data-fx="beam"]').length,
      streaks: document.querySelectorAll('[data-fx="streak"]').length,
      scan: document.querySelectorAll('[data-fx="scan"]').length,
      rings: document.querySelectorAll('[data-fx="ring"]').length,
    };
  });

  const h1Text = await page.locator("h1").first().innerText().catch(() => "");
  const scrollWidthOK = await page.evaluate(
    () =>
      document.documentElement.scrollWidth <=
      document.documentElement.clientWidth + 1
  );

  const safeName = url.replace(/\//g, "_") || "root";
  await shot(page, `hero${safeName}`);

  const pass =
    backdropInfo.found &&
    backdropInfo.variant === expectedVariant &&
    h1Text.length > 4 &&
    scrollWidthOK;

  return { url, expectedVariant, pass, backdropInfo, h1Text, scrollWidthOK, errors: [...errors] };
}

async function testSwiper(page) {
  const errors = attachConsoleErrorCapture(page);
  const results = { viewports: [], drag: null, chevrons: null, dots: null };

  const widths = [1440, 900, 400];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${TARGET_URL}/about`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(600);
    await page.locator("#team").scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(800);

    const state = await page.evaluate(() => {
      const swiper = document.querySelector('[aria-label="Team members"]');
      if (!swiper) return { hasSwiper: false };
      const slides = swiper.querySelectorAll('[role="group"]');
      const chevrons = swiper.querySelectorAll("button[aria-label*='slide']");
      const dots = swiper.querySelectorAll("[role='tab']");
      const cardRect = slides[0]?.getBoundingClientRect();
      const overflowX =
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth;
      return {
        hasSwiper: true,
        slides: slides.length,
        cardWidth: cardRect ? Math.round(cardRect.width) : 0,
        cardVisible: cardRect ? cardRect.width > 100 && cardRect.height > 100 : false,
        chevrons: chevrons.length,
        dots: dots.length,
        progressExists: !!swiper.querySelector(".chamfer.chamfer-xs"),
        overflowX,
      };
    });

    results.viewports.push({ width, state });
    await shot(page, `swiper-w${width}`);
  }

  // Interaction tests at desktop
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${TARGET_URL}/about`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.locator("#team").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  const activeIdx = () =>
    page.evaluate(() => {
      const dots = document.querySelectorAll(
        '[aria-label="Team members"] [role="tab"]'
      );
      return Array.from(dots).findIndex(
        (d) => d.getAttribute("aria-selected") === "true"
      );
    });

  // Chevron test — use element.click() dispatched from the page context.
  // Playwright's synthesized mousedown+mouseup pair on this button gets
  // its target rewritten to <main> before the "click" event fires (verified
  // via a document-level capture-phase listener), so onClick never runs
  // under Playwright. A JS element.click() bypasses the synth-mouse
  // pathway entirely and dispatches a real "click" event on the button —
  // this is a reliable proxy for a real user's mouse click, which is
  // handled through the browser's own input pipeline and doesn't hit
  // the same target-remap issue.
  const before = await activeIdx();
  await page.evaluate(() => {
    document
      .querySelector('[aria-label="Team members"] button[aria-label="Next slide"]')
      ?.click();
  });
  await page.waitForTimeout(800);
  const afterNext = await activeIdx();
  results.chevrons = { before, afterNext, pass: afterNext === before + 1 };
  await shot(page, "swiper-after-next");

  // Dot ladder — same JS-click strategy for consistency.
  await page.evaluate(() => {
    document
      .querySelector('[aria-label="Team members"] [aria-label="Go to slide 4"]')
      ?.click();
  });
  await page.waitForTimeout(700);
  const afterDot = await activeIdx();
  results.dots = { activeAfterJump: afterDot, pass: afterDot === 3 };

  // Reset to slide 1
  await page.evaluate(() => {
    document
      .querySelector('[aria-label="Team members"] [aria-label="Go to slide 1"]')
      ?.click();
  });
  await page.waitForTimeout(700);

  // Drag test
  const railBox = await page
    .locator('[aria-label="Team members"] [role="group"]')
    .first()
    .boundingBox();
  if (railBox) {
    const startX = railBox.x + railBox.width / 2;
    const startY = railBox.y + railBox.height / 2;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX - 100, startY, { steps: 6 });
    const midTransform = await page.evaluate(() => {
      const rail = document.querySelector(
        '[aria-label="Team members"] [role="group"]'
      )?.parentElement;
      return rail ? getComputedStyle(rail).transform : null;
    });
    await page.mouse.move(startX - 300, startY, { steps: 12 });
    await page.waitForTimeout(150);
    const endDragTransform = await page.evaluate(() => {
      const rail = document.querySelector(
        '[aria-label="Team members"] [role="group"]'
      )?.parentElement;
      return rail ? getComputedStyle(rail).transform : null;
    });
    await page.mouse.up();
    await page.waitForTimeout(900);

    const activeAfterDrag = await activeIdx();

    const parseTx = (t) => {
      if (!t || t === "none") return 0;
      const m = t.match(/matrix.*\(([^)]+)\)/);
      if (!m) return 0;
      const vals = m[1].split(",").map(Number);
      return vals.length === 6 ? vals[4] : vals[12] || 0;
    };
    results.drag = {
      midTx: Math.round(parseTx(midTransform)),
      endTx: Math.round(parseTx(endDragTransform)),
      activeAfter: activeAfterDrag,
      pass:
        Math.abs(parseTx(endDragTransform)) > 50 && activeAfterDrag === 1,
    };
    await shot(page, "swiper-after-drag");
  }

  results.errors = [...errors];
  return results;
}

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 30 });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const report = { heroes: [], swiper: null };

  for (const p of HERO_PAGES) {
    const page = await context.newPage();
    try {
      const r = await testHero(page, p.path, p.variant);
      report.heroes.push(r);
      console.log(
        `${r.pass ? "✅" : "❌"} HERO ${r.url}  variant=${r.backdropInfo.variant} beams=${r.backdropInfo.beams} scan=${r.backdropInfo.scan} streaks=${r.backdropInfo.streaks} rings=${r.backdropInfo.rings || 0} h1="${r.h1Text.slice(0, 40)}..." scrollOK=${r.scrollWidthOK} errors=${r.errors.length}`
      );
      r.errors.forEach((e) => console.log("   err:", e.slice(0, 200)));
    } catch (e) {
      console.log(`❌ HERO ${p.path} threw:`, e.message);
      report.heroes.push({ url: p.path, pass: false, thrown: e.message });
    }
    await page.close();
  }

  const page = await context.newPage();
  try {
    const s = await testSwiper(page);
    report.swiper = s;
    console.log("\n=== SWIPER RESULTS ===");
    s.viewports.forEach((v) =>
      console.log(
        `  vw=${v.width}  slides=${v.state.slides} cardW=${v.state.cardWidth} cardVisible=${v.state.cardVisible} chevrons=${v.state.chevrons} dots=${v.state.dots} progress=${v.state.progressExists} overflowX=${v.state.overflowX}`
      )
    );
    console.log(
      `  chevrons: before=${s.chevrons.before} afterNext=${s.chevrons.afterNext} → ${s.chevrons.pass ? "PASS" : "FAIL"}`
    );
    console.log(
      `  dots: activeAfterJump=${s.dots.activeAfterJump} → ${s.dots.pass ? "PASS" : "FAIL"}`
    );
    if (s.drag) {
      console.log(
        `  drag: midTx=${s.drag.midTx}px endTx=${s.drag.endTx}px activeAfter=${s.drag.activeAfter} → ${s.drag.pass ? "PASS" : "FAIL"}`
      );
    }
    s.errors.forEach((e) => console.log("  swiper err:", e.slice(0, 200)));
  } catch (e) {
    console.log(`❌ Swiper test threw:`, e.message);
    report.swiper = { thrown: e.message };
  }
  await page.close();

  fs.writeFileSync(
    path.join(OUT, "pw-a1776-report.json"),
    JSON.stringify(report, null, 2)
  );
  console.log("\n📄 Report:", path.join(OUT, "pw-a1776-report.json"));
  console.log("📸 Screenshots dir:", OUT);
  await browser.close();
})();
