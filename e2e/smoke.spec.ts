import { test, expect } from "@playwright/test";

test.describe("Linguify smoke tests", () => {
  test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Linguify/i);
    await expect(page.getByText(/Grammar Coach/i).first()).toBeVisible();
  });

  test("voice coach page loads", async ({ page }) => {
    await page.goto("/voice");
    await expect(page.getByRole("heading", { name: /Voice Coach/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Record Live/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Upload Audio/i })).toBeVisible();
  });

  test("translate page loads", async ({ page }) => {
    await page.goto("/translate");
    await expect(page.getByText(/Instant AI Translation/i)).toBeVisible();
  });
});
