import { test, expect } from "@playwright/test";

test.describe("TIDESET End-to-End User Journeys", () => {
  test.setTimeout(90000);

  test("1. Public Landing Page loads with clean branding and editorial hero", async ({ page }) => {
    await page.goto("");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=TIDESET").first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Clear agreements.");
    await expect(page.getByRole("link", { name: "Create an agreement", exact: true })).toBeVisible();
    await expect(page.locator("canvas").first()).toBeVisible();
    await expect(page.locator("#story-heading")).toContainText("A little clarity.");
    await expect(page.locator(".story-scene")).toHaveCount(3);
    await expect(page.locator("#process-heading")).toContainText("final handoff");
    await expect(page.locator("#explorer-heading")).toContainText("Every step");
    await expect(page.getByText("Zero Escrow Ambiguity")).toHaveCount(0);
  });

  test("2. Full Payment, Delivery, Revision, and Acceptance Lifecycle on Demo Sandbox", async ({ page }) => {
    await page.goto("/demo");
    await page.waitForLoadState("networkidle");

    // Ensure we are in Elena's view
    await page.click("button:has-text('Elena')");
    await page.waitForTimeout(600);

    // Verify Stage 1 is ready for settlement ($200.00)
    const payHeroBtn = page.locator("button:has-text('Pay $200.00 with PayPal Sandbox')");
    if (await payHeroBtn.isVisible()) {
      await payHeroBtn.click();

      // PayPal Checkout Modal opens
      await expect(page.locator("text=PayPal Sandbox Checkout")).toBeVisible();

      // Click Demo Settlement or Authorize
      const simBtn = page.locator("button:has-text('Simulate Sandbox Settlement')");
      if (await simBtn.isVisible()) {
        await simBtn.click();
      } else {
        await page.click("button:has-text('Authorize')");
      }

      // Verify payment confirmation message with real/simulated mode distinction
      await expect(
        page.locator("text=/Settlement Verified|SIMULATED LOCAL TEST|REAL SANDBOX PAYMENT VERIFIED/").first()
      ).toBeVisible({ timeout: 15000 });

      // Wait for modal to close & state to refresh
      await page.waitForTimeout(2500);
    }

    // Switch to Marcus (Provider)
    await page.click("button:has-text('Marcus')");
    await page.waitForTimeout(1000);

    // Verify Provider sees "Cleared"
    await expect(page.locator("text=/Cleared/").first()).toBeVisible({ timeout: 10000 });

    // Click Submit Deliverables
    const submitBtn = page.locator("button:has-text('Submit Deliverables')").first();
    await submitBtn.click();

    // Fill notes in modal
    await page.fill("textarea", "Completed initial architecture and responsive UI layout.");
    await page.click("button:has-text('Submit with Evidence')");
    await page.waitForTimeout(1500);

    // Switch back to Elena (Customer)
    await page.click("button:has-text('Elena')");
    await page.waitForTimeout(1000);

    // Elena sees Review Deliverables
    await expect(page.locator("text=Review Deliverables").first()).toBeVisible({ timeout: 10000 });

    // Elena requests revision
    await page.click("button:has-text('Request Revisions')");
    await page.fill("textarea", "Please adjust the font contrast on the primary button.");
    await page.click("button:has-text('Submit Revision Request')");
    await page.waitForTimeout(1500);

    // Switch to Marcus to see revision request
    await page.click("button:has-text('Marcus')");
    await page.waitForTimeout(1000);
    await expect(page.locator("text=Revision Requested by Client").first()).toBeVisible({ timeout: 10000 });

    // Marcus re-submits work
    await page.click("button:has-text('Re-submit Work')");
    await page.fill("textarea", "Updated hero CTA button contrast ratio to 7:1.");
    await page.click("button:has-text('Submit with Evidence')");
    await page.waitForTimeout(1500);

    // Elena accepts deliverables
    await page.click("button:has-text('Elena')");
    await page.waitForTimeout(1000);
    await page.click("button:has-text('Accept Milestone Deliverables')");
    await page.waitForTimeout(2000);

    // Verify Stage 1 is marked Delivered & Accepted
    await expect(page.locator("text=Delivered & Accepted").first()).toBeVisible({ timeout: 10000 });
  });

  test("3. Stress Simulator executes +7d delay and generates survivability repair", async ({ page }) => {
    await page.goto("/demo");
    await page.waitForLoadState("networkidle");

    // Open Stress Test Simulator
    await page.click("button:has-text('Stress Test')");

    // Modal appears
    await expect(page.locator("text=Agreement Stress-Test Simulator")).toBeVisible();

    // Click preset: 7-Day Paycheck Delay
    await page.click("button:has-text('7-Day Paycheck Delay')");

    // Verify Deficit Warning is detected
    await expect(page.locator("text=Rigid Milestone Breakdown Detected!")).toBeVisible({ timeout: 35000 });

    // Verify AI Survivability Repair is presented
    await expect(page.locator("text=TIDESET AI Survivability Solution")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("button:has-text('Draft Survivable Revision (v2)')")).toBeVisible();

    // Close modal
    await page.click("button:has-text('Draft Survivable Revision (v2)')");
    await page.waitForTimeout(1500);
  });

  test("4. AI Agreement Builder generates survivable schedule with engine origin badge", async ({ page }) => {
    await page.goto("/demo");
    await page.waitForLoadState("networkidle");

    // Click AI Builder in navbar
    const builderBtn = page.locator("button:has-text('AI Builder')").first();
    await builderBtn.click();

    // Modal appears
    await expect(page.locator("text=AI Agreement Builder").first()).toBeVisible();

    // Click Synthesize
    await page.click("button:has-text('Synthesize Survivable Schedule with AI')");

    // Verify engine origin badge is displayed (allowing live OpenRouter AI response window)
    await expect(page.locator("text=/Deterministic Solver|OpenRouter/").first()).toBeVisible({ timeout: 60000 });
    await expect(page.locator("text=/Survivability Score:/").first()).toBeVisible({ timeout: 20000 });
  });

  test("5. Real account login, navigation and logout", async ({ page, request }) => {
    test.skip(!process.env.TIDESET_TEST_BASE_URL, "Real-account checks require an isolated QA server.");
    const email = "design-qa-" + Date.now() + "@example.com";
    const registration = await request.post("/api/auth/register", {data: {name: "Design QA", email, password: "TestPassword123!"}});
    expect(registration.ok()).toBeTruthy();
    await request.post("/api/auth/logout");
    await page.goto("/login");
    await expect(page.getByText("Elena (Client)")).toHaveCount(0);
    await page.getByLabel("Email address", {exact:true}).fill(email);
    await page.getByLabel("Password", {exact:true}).fill("TestPassword123!");
    await page.getByRole("button", {name: "Sign in", exact:true}).click();
    await page.waitForURL("**/dashboard");
    await expect(page.getByRole("button", {name: /Design QA/})).toBeVisible();
    await page.getByRole("link", {name:"My agreements",exact:true}).click();
    await page.waitForURL("**/agreements");
    await page.getByRole("button", {name:/Design QA/}).click();
    await page.getByRole("button", {name:"Sign out",exact:true}).click();
    await page.waitForURL("**/login");
    expect((await page.request.get("/api/auth/me")).status()).toBe(401);
    await page.goto("/dashboard");
    await page.waitForURL("**/login?redirect=*");
  });
});
