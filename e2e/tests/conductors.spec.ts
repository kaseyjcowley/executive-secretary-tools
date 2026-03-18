import { test, expect } from "@playwright/test";
import { seed } from "../fixtures/seed";
import { seedSession } from "../fixtures/session";

const TEST_USER = {
  id: "test-user-id",
  name: "Test User",
  email: "test@yourdomain.com",
};

const TEST_CONDUCTORS = [
  { slackUserId: "U001", name: "Ryan Preece" },
  { slackUserId: "U002", name: "Roger Schultz" },
  { slackUserId: "U003", name: "Dave Thibault" },
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
    
    await expect(page.locator("div").filter({ hasText: /^Ryan Preece$/ })).toBeVisible();
    await expect(page.locator("div").filter({ hasText: /^Roger Schultz$/ })).toBeVisible();
  });

  test("set override", async ({ page }) => {
    await page.goto("http://localhost:3001/conductors");
    
    await page.selectOption('select[name="override"]', "U003");
    await page.fill('input[name="reason"]', "Vacation");
    await page.click("text=Set Override");
    
    await expect(page.locator("div").filter({ hasText: /^Dave Thibault$/ })).toBeVisible();
    await expect(page.locator("text=Vacation")).toBeVisible();
  });

  test("clear override", async ({ page }) => {
    await seed.conductors.override(TEST_CONDUCTORS[2], "Vacation");
    
    await page.goto("http://localhost:3001/conductors");
    
    await page.click("text=Clear Override");
    
    await expect(page.locator("div").filter({ hasText: /^Ryan Preece$/ })).toBeVisible();
  });

  test("advance rotation", async ({ page }) => {
    await page.goto("http://localhost:3001/conductors");
    
    page.on("dialog", (dialog) => dialog.accept());
    
    await page.click("text=Advance Rotation");
    
    await expect(page.locator("div").filter({ hasText: /^Roger Schultz$/ })).toBeVisible();
  });
});
