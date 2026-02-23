import { test, expect } from "@playwright/test";

test("landing page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("OpenSplit makes shared expenses obvious and fair.")).toBeVisible();
});
