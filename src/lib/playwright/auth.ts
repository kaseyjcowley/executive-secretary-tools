import { chromium, BrowserContext, Page } from "playwright";

const DEV_SERVER_URL = process.env.DEV_SERVER_URL || "http://localhost:3000";
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

export async function createAuthenticatedContext(): Promise<BrowserContext> {
  if (!NEXTAUTH_SECRET) {
    throw new Error("NEXTAUTH_SECRET environment variable is required");
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  const response = await context.request.get(`${DEV_SERVER_URL}/api/auth/test-login`);

  if (response?.status() === 403) {
    await context.close();
    throw new Error("TEST_LOGIN_UNAVAILABLE: Server is not in development mode");
  }

  if (!response.ok()) {
    await context.close();
    throw new Error(`TEST_LOGIN_FAILED: Received status ${response.status()}`);
  }

  const sessionResponse = await context.request.get(`${DEV_SERVER_URL}/api/auth/session`);
  const session = await sessionResponse.json();

  if (!session?.user) {
    await context.close();
    throw new Error("SESSION_INVALID: Session cookie set but no user in session");
  }

  return context;
}

export async function isSessionValid(page: Page): Promise<boolean> {
  const response = await page.request.get(`${DEV_SERVER_URL}/api/auth/session`);
  const session = await response.json();
  return !!session?.user;
}

export async function refreshContext(context: BrowserContext): Promise<BrowserContext> {
  await context.close();
  return await createAuthenticatedContext();
}
