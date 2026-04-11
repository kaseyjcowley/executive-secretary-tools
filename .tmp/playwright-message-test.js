const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on("console", (msg) => console.log("PAGE LOG:", msg.type(), msg.text()));
  page.on("pageerror", (err) => console.log("PAGE ERROR:", err.toString()));

  try {
    // Hit the test-login endpoint to set an authenticated session cookie.
    // This endpoint is available in dev/test environments and sets next-auth cookies.
    const loginResp = await page.goto(
      "http://localhost:3000/api/auth/test-login",
      {
        waitUntil: "networkidle",
      },
    );
    if (loginResp && loginResp.status() >= 400) {
      console.log("test-login endpoint returned status", loginResp.status());
    }

    await page.goto("http://localhost:3000/messages", {
      waitUntil: "networkidle",
    });
    // wait briefly for client components to render
    await page.waitForTimeout(800);
    // count react-select controls
    const controlCount = await page
      .$$eval(".react-select__control", (els) => els.length)
      .catch(() => 0);
    console.log("react-select__control count:", controlCount);
    // dump distinct input placeholders for debugging
    const placeholders = await page
      .$$eval("input", (els) =>
        Array.from(
          new Set(els.map((e) => e.getAttribute("placeholder"))),
        ).filter(Boolean),
      )
      .catch(() => []);
    console.log("placeholders:", placeholders);
    // inspect inputs inside react-select controls
    const selectInputs = await page.$$eval(
      ".react-select__control",
      (controls) => {
        return controls.map((c) => {
          const input = c.querySelector("input");
          return input
            ? {
                ariaLabel: input.getAttribute("aria-label"),
                name: input.getAttribute("name"),
                placeholder: input.getAttribute("placeholder"),
                value: input.value,
              }
            : null;
        });
      },
    );
    console.log("selectInputs sample:", selectInputs.slice(0, 10));
    // click the first react-select control directly and pick its first option
    const controls = await page.$$(".react-select__control");
    if (controls.length === 0) {
      console.log("No react-select controls found to interact with");
      await browser.close();
      process.exit(0);
    }
    await controls[0].click();
    await page.waitForTimeout(300);
    const option = await page.$(".react-select__option");
    if (option) {
      await option.click();
      console.log("Clicked first react-select option");
    } else {
      console.log("No dropdown options found after opening control");
    }
    await page.waitForTimeout(500);
  } catch (err) {
    console.error("Script error", err);
  } finally {
    await browser.close();
  }
})();
