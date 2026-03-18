import { test, expect } from "@playwright/test";
import { seed } from "../fixtures/seed";
import { seedSession } from "../fixtures/session";
import { Category } from "../../src/types/messages";

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

test.describe("Templates", () => {
  test("lists templates by category", async ({ page }) => {
    await seed.templates.list([
      { name: "Interview Reminder", content: "Hi {recipient}...", category: Category.interview },
      { name: "Calling Extension", content: "Dear {recipients}...", category: Category.calling },
    ]);
    
    await page.goto("http://localhost:3001/templates");
    
    await expect(page.getByText("Interview Reminder")).toBeVisible();
    await expect(page.getByText("Calling Extension")).toBeVisible();
  });

  test("search filters templates", async ({ page }) => {
    await seed.templates.list([
      { name: "Interview Reminder", content: "Hi {recipient}...", category: Category.interview },
      { name: "Baptismal Interview", content: "Dear {recipient}...", category: Category.interview },
      { name: "Calling Extension", content: "Dear {recipients}...", category: Category.calling },
    ]);
    
    await page.goto("http://localhost:3001/templates");
    
    await page.getByPlaceholder("Search templates...").fill("Baptismal");
    
    await expect(page.getByText("Interview Reminder")).not.toBeVisible();
    await expect(page.getByText("Baptismal Interview")).toBeVisible();
    await expect(page.getByText("Calling Extension")).not.toBeVisible();
  });

  test("create new template via form", async ({ page }) => {
    await page.goto("http://localhost:3001/templates");
    
    await page.getByRole("button", { name: "+ New Template" }).click();
    
    await page.locator("input[type='text']").first().fill("Test Template");
    await page.locator("textarea").fill("Hello {recipient}, this is a test.");
    await page.getByRole("button", { name: "Save" }).click();
    
    await expect(page.getByText("Test Template")).toBeVisible();
  });

  test("delete template", async ({ page }) => {
    await seed.templates.single({ 
      name: "To Delete", 
      content: "Delete me", 
      category: Category.interview 
    });
    
    await page.goto("http://localhost:3001/templates");
    
    page.on("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Delete" }).first().click();
    
    await expect(page.getByText("To Delete")).not.toBeVisible();
  });
});
