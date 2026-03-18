import { test, expect } from "@playwright/test";
import { seed } from "../fixtures/seed";
import { seedSession } from "../fixtures/session";

const TEST_USER = {
  id: "test-user-id",
  name: "Test User",
  email: "test@yourdomain.com",
};

const TEST_CONDUCTORS = [
  { slackUserId: "U0ABURZDH39", name: "Test Conductor 1" },
  { slackUserId: "U0AE1TWL95X", name: "Test Conductor 2" },
  { slackUserId: "U0AD4HC8Z3J", name: "Test Conductor 3" },
];

test.beforeEach(async ({ context }) => {
  await seed.flush();
  
  const token = await seedSession(TEST_USER);
  
  await context.addCookies([
    {
      name: "next-auth.session-token",
      value: token,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  
  await seed.conductors.rotation(TEST_CONDUCTORS);
});

test.afterEach(async () => {
  await seed.flush();
});

test.describe("Conductors", () => {
  test("shows current and next conductor", async ({ page }) => {
    await page.goto("http://localhost:3001/conductors");
    
    await expect(page.locator("div").filter({ hasText: /^Test Conductor 1$/ })).toBeVisible();
    await expect(page.locator("div").filter({ hasText: /^Test Conductor 2$/ })).toBeVisible();
  });

  test("set override", async ({ page }) => {
    await page.goto("http://localhost:3001/conductors");
    
    await page.click('input[value="U0AD4HC8Z3J"]');
    await page.fill('#reason', "Vacation");
    await page.click("text=Set Override");
    
    await expect(page.getByText("Dave Thibault").first()).toBeVisible();
    await expect(page.locator("text=Vacation")).toBeVisible();
  });

  test("clear override", async ({ page }) => {
    await seed.conductors.override(TEST_CONDUCTORS[2], "Vacation");
    
    await page.goto("http://localhost:3001/conductors");
    
    await page.click("text=Clear Override");
    
    await expect(page.locator("div").filter({ hasText: /^Test Conductor 1$/ })).toBeVisible();
  });

  test("advance rotation", async ({ page }) => {
    await page.goto("http://localhost:3001/conductors");
    
    page.on("dialog", (dialog) => dialog.accept());
    
    await page.click("text=Advance Rotation");
    
    await expect(page.locator("div").filter({ hasText: /^Test Conductor 2$/ })).toBeVisible();
  });
});
