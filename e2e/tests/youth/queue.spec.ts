import { test, expect } from "@playwright/test";
import { seed } from "../../fixtures/seed";
import { seedSession } from "../../fixtures/session";

const TEST_USER = {
  id: "test-user-id",
  name: "Test User",
  email: "test@yourdomain.com",
};

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
});

test.afterEach(async () => {
  await seed.flush();
});

test.describe("Youth Queue", () => {
  test("displays youth in queue", async ({ page }) => {
    await seed.youth.queue([
      { name: "John Smith" },
      { name: "Jane Doe" },
    ]);
    
    await page.goto("http://localhost:3001/youth");
    
    await expect(page.getByText("John Smith")).toBeVisible();
    await expect(page.getByText("Jane Doe")).toBeVisible();
  });

  test("add single youth via page", async ({ page }) => {
    await page.goto("http://localhost:3001/youth");
    
    await page.getByRole("link", { name: "Add Youth" }).click();
    const nameInput = page.locator('#name');
    await nameInput.fill("");
    await nameInput.pressSequentially("New Youth", { delay: 50 });
    await page.waitForFunction(() => {
      const btn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      return btn && !btn.disabled;
    });
    await page.getByRole("button", { name: "Add Youth" }).click();
    
    await expect(page).toHaveURL("http://localhost:3001/youth");
    await expect(page.getByRole("heading", { name: "New Youth" })).toBeVisible();
  });

  test("edit youth", async ({ page }) => {
    const youth = await seed.youth.single("Original Name");
    
    await page.goto("http://localhost:3001/youth");
    
    await page.getByRole("button", { name: "Edit" }).first().click();
    await page.locator('#preferredName').pressSequentially("Nickname");
    await page.getByRole("button", { name: "Save" }).click();
    
    await expect(page.getByText("Nickname")).toBeVisible();
  });

  test("delete youth", async ({ page }) => {
    const youth = await seed.youth.single("To Delete");
    
    await page.goto("http://localhost:3001/youth");
    
    page.on("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Delete" }).first().click();
    
    await expect(page.getByText("To Delete")).not.toBeVisible();
  });

  test("shows empty state when no youth", async ({ page }) => {
    await page.goto("http://localhost:3001/youth");
    
    await expect(page.getByText("No youth in the queue yet")).toBeVisible();
  });
});
