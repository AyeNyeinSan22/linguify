import { test, expect } from "@playwright/test";
import {
  mockCoachApi,
  mockTtsApiFailure,
  mockVoiceBrowserApis,
} from "./helpers/mock-browser-apis";

test.describe("Voice Coach playback controls", () => {
  test.beforeEach(async ({ page }) => {
    await mockVoiceBrowserApis(page);
    await mockCoachApi(page);
    await mockTtsApiFailure(page);
  });

  test("shows pause and stop controls while coach is speaking", async ({ page }) => {
    await page.goto("/voice");

    await page.locator("button.rounded-full.w-20").click();
    await expect(page.getByText("I go to school yesterday")).toBeVisible();

    await page.getByRole("button", { name: /Get Feedback/i }).click();
    await expect(page.getByText(/I went to school yesterday/i)).toBeVisible();

    await expect(page.getByText(/Coach speaking/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Pause coach voice/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Stop coach voice/i })).toBeVisible();
  });

  test("can pause and resume coach voice", async ({ page }) => {
    await page.goto("/voice");

    await page.locator("button.rounded-full.w-20").click();
    await expect(page.getByText("I go to school yesterday")).toBeVisible();
    await page.getByRole("button", { name: /Get Feedback/i }).click();

    await expect(page.getByText(/Coach speaking/i)).toBeVisible();
    await page.getByRole("button", { name: /Pause coach voice/i }).click();

    await expect(page.getByText(/Paused/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Resume coach voice/i })).toBeVisible();

    await page.getByRole("button", { name: /Resume coach voice/i }).click();
    await expect(page.getByText(/Coach speaking/i)).toBeVisible();
  });

  test("can stop coach voice and hide controls", async ({ page }) => {
    await page.goto("/voice");

    await page.locator("button.rounded-full.w-20").click();
    await expect(page.getByText("I go to school yesterday")).toBeVisible();
    await page.getByRole("button", { name: /Get Feedback/i }).click();

    await expect(page.getByText(/Coach speaking/i)).toBeVisible();
    await page.getByRole("button", { name: /Stop coach voice/i }).click();

    await expect(page.getByText(/Coach speaking/i)).not.toBeVisible();
    await expect(page.getByRole("button", { name: /Stop coach voice/i })).not.toBeVisible();
  });
});
