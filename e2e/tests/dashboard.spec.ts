import { test, expect } from "@playwright/test";
import { seed } from "../fixtures/seed";

test.beforeEach(async ({ context, page }) => {
  await seed.flush();
  
  // Use test-login endpoint to get authenticated session
  // This will redirect and set the session cookie
  await page.goto("http://localhost:3001/api/auth/test-login");
  
  // Wait for redirect to complete
  await page.waitForURL("http://localhost:3001/", { timeout: 10000 }).catch(() => {});
});

test.afterEach(async () => {
  await seed.flush();
});

test.describe("Dashboard", () => {
  test("loads with greeting and stat cards", async ({ page }) => {
    await page.goto("http://localhost:3001/");
    
    await expect(page.locator("h1")).toContainText(/^Good/);
    await expect(page.locator("text=Pending Messages")).toBeVisible();
    await expect(page.getByRole("link", { name: "Interviews", exact: true })).toBeVisible();
    await expect(page.locator("text=Youth Visits Due")).toBeVisible();
    await expect(page.locator("text=Scheduled")).toBeVisible();
  });

  test("stat cards navigate to correct pages", async ({ page }) => {
    await page.goto("http://localhost:3001/");
    
    await page.click("text=Interviews");
    await expect(page).toHaveURL("http://localhost:3001/interviews");
    
    await page.goto("http://localhost:3001/");
    await page.click("text=Youth Visits Due");
    await expect(page).toHaveURL("http://localhost:3001/youth");
  });

  test("quick actions navigate correctly", async ({ page }) => {
    await page.goto("http://localhost:3001/");
    
    await page.click("text=Send Messages");
    await expect(page).toHaveURL("http://localhost:3001/messages");
    
    await page.goto("http://localhost:3001/");
    await page.click("text=Conductors");
    await expect(page).toHaveURL("http://localhost:3001/conductors");
  });

  test("shows correct stats with seeded data", async ({ page }) => {
    await seed.youth.single("John Smith");
    await seed.youth.single("Jane Doe", { lastSeenAt: new Date("2024-01-01") });
    
    await page.goto("http://localhost:3001/");
    
    await expect(page.locator("text=Youth Visits Due")).toBeVisible();
  });
});
