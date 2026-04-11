const { webkit } = require("playwright");

(async () => {
  const browser = await webkit.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on("console", (msg) => console.log("PAGE LOG:", msg.type(), msg.text()));
  page.on("pageerror", (err) => console.log("PAGE ERROR:", err.toString()));

  try {
    await page.goto("http://localhost:3000/api/auth/test-login", {
      waitUntil: "networkidle",
    });
    await page.goto("http://localhost:3000/messages", {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(800);
    const controls = await page.$$(".react-select__control");
    console.log("react-select__control count (webkit):", controls.length);
    if (controls.length === 0) {
      console.log("no controls");
      await browser.close();
      return;
    }
    await controls[0].click();
    await page.waitForTimeout(300);
    const option = await page.$(".react-select__option");
    if (option) {
      await option.click();
      console.log("Clicked first react-select option (webkit)");
    } else {
      console.log("No dropdown options found (webkit)");
    }
  } catch (err) {
    console.error("Script error", err);
  } finally {
    await browser.close();
  }
})();
