import { expect, test } from "@playwright/test";

test("opens the cached record and traces a finding to evidence", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Every record in view. Every claim anchored." })).toBeVisible();

  await page.getByRole("link", { name: "Explore the synthetic case" }).click();
  await expect(page.getByRole("heading", { name: "Patient records" })).toBeVisible();

  await page.getByRole("link", { name: "Open walkthrough" }).click();
  await expect(page.getByRole("heading", { name: "Maya Fernando" })).toBeVisible();
  await expect(page.getByText("Synthetic clinical fixture:")).toBeVisible();

  const recordSections = page.getByRole("navigation", { name: "Patient record sections" });
  await recordSections.getByRole("button", { name: /Findings/ }).click();
  await expect(page.getByRole("heading", { name: "Findings for review" })).toBeVisible();

  await page.getByRole("button", { name: /Allergy contradiction Aspirin appears/ }).click();
  await page.getByRole("button", { name: /Allergy & visit note/ }).click();
  const evidenceDialog = page.getByRole("dialog", { name: /Allergy & visit note/ });
  await expect(evidenceDialog).toBeVisible();
  await expect(page.getByText("Evidence confidence")).toBeVisible();
  await evidenceDialog.getByRole("button", { name: "Close evidence drawer" }).click();
});

test("returns a cited answer and an insufficient-evidence response", async ({ page }) => {
  await page.goto("/patients/competition-case?tab=ask");
  await expect(page.getByRole("heading", { name: "Ask this record" })).toBeVisible();

  await page.getByRole("button", { name: "Was aspirin prescribed despite an earlier allergy?" }).click();
  await expect(page.getByText("Yes—a possible contradiction is present.", { exact: false })).toBeVisible();
  await expect(page.getByText("supported", { exact: true })).toBeVisible();

  const composer = page.getByRole("textbox", { name: "Question about the patient record" });
  await composer.fill("What is this patient's blood type?");
  await page.getByRole("button", { name: "Send question" }).click();
  await expect(page.getByText(/can.t answer.*enough evidence/i)).toBeVisible();
  await expect(page.getByText("insufficient", { exact: true })).toBeVisible();
});

test("mobile dashboard does not overflow horizontally", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chrome", "Mobile-only layout assertion");
  await page.goto("/patients/competition-case");
  await expect(page.getByRole("heading", { name: "Maya Fernando" })).toBeVisible();

  const sizes = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(sizes.scrollWidth).toBeLessThanOrEqual(sizes.clientWidth + 1);
});
