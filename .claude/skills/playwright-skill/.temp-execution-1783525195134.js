// Focused diagnostic for the About page chevron button.
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 60 });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("console", (msg) => console.log(`console ${msg.type()}:`, msg.text().slice(0, 200)));
  page.on("pageerror", (err) => console.log("pageerror:", err.message));

  await page.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.locator("#team").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);

  // Inspect the next button
  const btnInfo = await page.evaluate(() => {
    const btn = document.querySelector(
      '[aria-label="Team members"] button[aria-label="Next slide"]'
    );
    if (!btn) return { found: false };
    const rect = btn.getBoundingClientRect();
    const style = getComputedStyle(btn);
    // Find the top-most element at the button center
    const topEl = document.elementFromPoint(
      rect.x + rect.width / 2,
      rect.y + rect.height / 2
    );
    return {
      found: true,
      rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
      inViewport: rect.top >= 0 && rect.bottom <= window.innerHeight,
      disabled: btn.disabled,
      pointerEvents: style.pointerEvents,
      opacity: style.opacity,
      display: style.display,
      topElTag: topEl?.tagName,
      topElClass: topEl?.className,
      topElAriaLabel: topEl?.getAttribute("aria-label"),
      matchesBtn: topEl === btn || btn.contains(topEl),
    };
  });
  console.log("BTN INFO:", JSON.stringify(btnInfo, null, 2));

  // Attempt a click and inspect state
  const before = await page.evaluate(() => {
    const dots = document.querySelectorAll(
      '[aria-label="Team members"] [role="tab"]'
    );
    return Array.from(dots).findIndex((d) => d.getAttribute("aria-selected") === "true");
  });
  console.log("Active index BEFORE:", before);

  // Try normal click
  try {
    await page.locator('[aria-label="Team members"] button[aria-label="Next slide"]').click();
    console.log("Normal click completed");
  } catch (e) {
    console.log("Normal click failed:", e.message);
  }
  await page.waitForTimeout(1000);

  const afterNormal = await page.evaluate(() => {
    const dots = document.querySelectorAll(
      '[aria-label="Team members"] [role="tab"]'
    );
    return Array.from(dots).findIndex((d) => d.getAttribute("aria-selected") === "true");
  });
  console.log("Active index AFTER normal click:", afterNormal);

  // If it didn't advance, try forcing at coordinates
  if (afterNormal === before) {
    console.log("--- Retrying with force + coordinate click ---");
    await page
      .locator('[aria-label="Team members"] button[aria-label="Next slide"]')
      .click({ force: true });
    await page.waitForTimeout(1000);
    const afterForce = await page.evaluate(() => {
      const dots = document.querySelectorAll(
        '[aria-label="Team members"] [role="tab"]'
      );
      return Array.from(dots).findIndex((d) => d.getAttribute("aria-selected") === "true");
    });
    console.log("Active index AFTER force click:", afterForce);
  }

  // Try dispatching click via JS
  const jsClickResult = await page.evaluate(() => {
    const btn = document.querySelector(
      '[aria-label="Team members"] button[aria-label="Next slide"]'
    );
    if (!btn) return "no button";
    btn.click();
    return "clicked via JS";
  });
  console.log("JS click result:", jsClickResult);
  await page.waitForTimeout(1000);
  const afterJs = await page.evaluate(() => {
    const dots = document.querySelectorAll(
      '[aria-label="Team members"] [role="tab"]'
    );
    return Array.from(dots).findIndex((d) => d.getAttribute("aria-selected") === "true");
  });
  console.log("Active index AFTER JS click:", afterJs);

  await browser.close();
})();
