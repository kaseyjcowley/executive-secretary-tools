const { webkit, devices } = require("playwright");

(async () => {
  const device = devices["iPhone 12"];
  const browser = await webkit.launch();
  const context = await browser.newContext({
    ...device,
  });
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
    await page.waitForTimeout(1500);

    // Wait for the Recipient label to appear (if present)
    try {
      await page.waitForSelector("text=Recipient:", { timeout: 3000 });
      console.log("Found Recipient label");
    } catch (e) {
      console.log("Recipient label not found, continuing");
    }

    // Save HTML snapshot and screenshot for inspection (useful for mobile-only DOM differences)
    const html = await page.content();
    const fs = require("fs");
    fs.writeFileSync(".tmp/messages-iphone.html", html);
    await page.screenshot({ path: ".tmp/messages-iphone.png", fullPage: true });

    // try to open the first react-select control we find
    const controls = await page.$$(".react-select__control");
    console.log(
      "react-select__control count (webkit iphone):",
      controls.length,
    );
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
      console.log("Clicked first react-select option (webkit iphone)");
    } else {
      console.log("No dropdown options found (webkit iphone)");
    }
  } catch (err) {
    console.error("Script error", err);
  } finally {
    await browser.close();
  }
})();
