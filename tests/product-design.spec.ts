import { test, expect } from "@playwright/test";
import path from "node:path";

const evidence = path.join(process.cwd(), ".git", "qa", "screenshots");

for (const width of [1440, 1024, 768, 390, 375]) {
  test(`Product layout and interactions at ${width}px`, async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Clear agreements.",
    );
    await expect(page.locator(".story-artwork").first()).toHaveCSS(
      "background-image",
      /bothway-icon/,
    );
    await expect(page.locator(".hero-agreement")).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(1);
    if (width === 1440 || width === 390) {
      await expect(page.locator(".nav-loading")).toHaveCount(0);
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: path.join(evidence, `${width}-home.png`),
        animations: "disabled",
        style: ".skip-link{display:none!important}",
      });
      await page.locator(".tide-story").scrollIntoViewIfNeeded();
      await page.locator(".tide-story").screenshot({
        path: path.join(evidence, `${width}-story.png`),
        animations: "disabled",
        style:
          ".skip-link{display:none!important}.tide-nav{visibility:hidden!important}",
      });
    }
    const process = page.locator("#how-it-works");
    await process.scrollIntoViewIfNeeded();
    if (width <= 600)
      await page
        .getByRole("button", { name: "Next stage", exact: true })
        .click();
    else
      await page
        .getByRole("button", { name: "Stage 3: Agree on terms", exact: true })
        .click();
    await expect(
      page.getByRole("button", {
        name: "Stage 3: Agree on terms",
        exact: true,
      }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#process-details")).toContainText(
      "Ready for both approvals.",
    );
    if (width > 600) {
      await page
        .getByRole("button", { name: "Stage 3: Agree on terms", exact: true })
        .press("ArrowRight");
      await expect(page.locator("#process-details")).toContainText(
        "Checkout preview",
      );
    }
    if (width === 1440 || width === 390)
      await process.screenshot({
        path: path.join(evidence, `${width}-process.png`),
        animations: "disabled",
        style:
          ".skip-link{display:none!important}.tide-nav{visibility:hidden!important}",
      });
    await page.locator("#agreement-preview").scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: /02\s*Build/ }).click();
    await expect(page.locator("#milestone-detail")).toContainText(
      "Design & Development",
    );
    await page.getByRole("button", { name: /03\s*Deliver/ }).click();
    await expect(page.locator("#milestone-detail")).toContainText(
      "Handover documentation",
    );
    if (width === 1440 || width === 390)
      await page.locator("#agreement-preview").screenshot({
        path: path.join(evidence, `${width}-explorer.png`),
        animations: "disabled",
        style:
          ".skip-link{display:none!important}.tide-nav{visibility:hidden!important}",
      });
    for (const route of ["/login", "/signup"]) {
      await page.goto(route);
      await expect(
        page.getByLabel("Email address", { exact: true }),
      ).toBeVisible();
      await page
        .getByLabel("Password", { exact: true })
        .fill("TestPassword123!");
      await page
        .getByRole("button", { name: "Show password", exact: true })
        .click();
      await expect(
        page.getByLabel("Password", { exact: true }),
      ).toHaveAttribute("type", "text");
      await page
        .getByRole("button", { name: "Hide password", exact: true })
        .click();
      await expect(page.getByLabel("Password", { exact: true })).toHaveValue(
        "TestPassword123!",
      );
      await expect(page.getByText(/FAST-FILL|Elena|Marcus/)).toHaveCount(0);
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        ),
      ).toBeLessThanOrEqual(1);
      if (width === 1440 || width === 390)
        await page.screenshot({
          path: path.join(evidence, `${width}-${route.slice(1)}.png`),
          animations: "disabled",
          style:
            ".skip-link{display:none!important}.tide-nav{visibility:hidden!important}",
        });
    }
    await page.getByRole("link", { name: "Sign in", exact: true }).click();
    await page.waitForURL("**/login");
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  });
}

test("Reduced motion and server errors stay usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Stage 5: Submit and review", exact: true })
    .click();
  await expect(page.locator("#process-details")).toContainText(
    "Brand direction.pdf",
  );
  await page.goto("/login?redirect=//example.com");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("unknown-design-qa@example.com");
  await page.getByLabel("Password", { exact: true }).fill("WrongPassword123!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.locator(".auth-error")).toContainText(
    "Invalid email or password",
  );
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeEnabled();
});

test("Real signup creates an authenticated account", async ({ page }) => {
  test.skip(!process.env.TIDESET_TEST_BASE_URL, "Requires isolated QA server.");
  await page.goto("/signup");
  await page.getByLabel("Full name", { exact: true }).fill("Signup QA");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("signup-qa-" + Date.now() + "@example.com");
  await page.getByLabel("Password", { exact: true }).fill("TestPassword123!");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await page.waitForURL("**/dashboard");
  await expect(page.getByRole("button", { name: /Signup QA/ })).toBeVisible();
  expect((await page.request.get("/api/auth/me")).status()).toBe(200);
});
