import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const resumePath = path.join(process.cwd(), "e2e", "fixtures", "resume.pdf");

test.describe.configure({ mode: "serial" });

async function login(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

async function signOut(page: Page) {
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL((url) => url.pathname === "/");
}

test("filters open roles from the query string and paginates", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Open roles" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Legacy PHP Contractor" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Staff Engineer" })).toHaveCount(0);

  await page.getByLabel("Keywords").fill("engineer");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/\/\?q=engineer$/);
  await expect(page.getByRole("link", { name: "Backend Engineer" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Finance Associate" })).toHaveCount(0);

  await page.goto("/?location=Berlin");
  await expect(page.getByRole("link", { name: "Backend Engineer" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Platform Engineer" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Warehouse Intern" })).toHaveCount(0);

  await page.goto("/?type=INTERNSHIP");
  await expect(page.getByRole("link", { name: "Warehouse Intern" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Backend Engineer" })).toHaveCount(0);

  await page.goto("/");
  await page.getByRole("link", { name: "Next" }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.getByRole("link", { name: "Backend Engineer" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Finance Associate" })).toHaveCount(0);
});

test("rejects a bad password", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("jordan.hale@example.com");
  await page.getByLabel("Password").fill("not-the-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Invalid email or password.")).toBeVisible();
});

test("registers a candidate and an employer", async ({ page }) => {
  const stamp = Date.now();

  await page.goto("/register");
  await page.getByLabel("Name").fill("Casey Nguyen");
  await page.getByLabel("Email").fill(`casey-${stamp}@example.com`);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/dashboard\/candidate/);
  await expect(page.getByRole("heading", { name: "Your applications" })).toBeVisible();

  await signOut(page);
  await page.goto("/register");
  await page.getByLabel("Name").fill("Avery Cole");
  await page.getByLabel("Email").fill(`avery-${stamp}@example.com`);
  await page.getByLabel("Password").fill("password123");
  await page.getByLabel("Account type").selectOption("EMPLOYER");
  await page.getByLabel("Company name").fill(`Cole Studio ${stamp}`);
  await page.getByLabel("Company location").fill("Remote");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/dashboard\/employer/);
  await expect(page.getByRole("heading", { name: `Cole Studio ${stamp}` })).toBeVisible();
});

test("saves a search and opens it again", async ({ page }) => {
  await login(page, "jordan.hale@example.com");
  await page.goto("/?location=Berlin");
  await page.getByLabel("Search name").fill("Berlin roles");
  await page.getByRole("button", { name: "Save search" }).click();
  await expect(page).toHaveURL(/\/saved-searches/);
  await page.getByRole("link", { name: "Berlin roles" }).click();
  await expect(page).toHaveURL(/location=Berlin/);
  await expect(page.getByRole("link", { name: "Backend Engineer" })).toBeVisible();
});

test("requires a resume and then accepts an application", async ({ page, request }) => {
  await login(page, "jordan.hale@example.com");
  await page.goto("/?q=engineer");
  await page.getByRole("link", { name: "Backend Engineer" }).click();
  await page.getByLabel("Cover letter").fill("I have shipped Postgres APIs and would like to work on Lumen's hiring tools.");
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(page.getByText("Resume is required.")).toBeVisible();

  await page.getByLabel("Resume").setInputFiles(resumePath);
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(page.getByText("Application submitted.")).toBeVisible();

  await page.goto("/dashboard/candidate");
  await expect(page.getByRole("link", { name: "Backend Engineer", exact: true })).toBeVisible();
  await expect(page.getByText("Submitted")).toBeVisible();

  const href = await page
    .getByRole("link", { name: "Download resume for Backend Engineer" })
    .getAttribute("href");
  expect(href).toBeTruthy();
  const own = await page.request.get(href!);
  expect(own.status()).toBe(200);
  expect(own.headers()["content-type"]).toContain("pdf");
  const stranger = await request.get(href!);
  expect(stranger.status()).toBe(401);
});

test("validates a posting and then publishes it", async ({ page }) => {
  await login(page, "mira.chen@example.com");
  await page.getByRole("link", { name: "Post a job" }).click();
  await page.getByLabel("Title").fill("Ab");
  await page.getByLabel("Description").fill("Too short to publish.");
  await page.getByLabel("Location").fill("Berlin");
  await page.getByRole("button", { name: "Save job" }).click();
  await expect(page.getByText("Title must be at least 3 characters.")).toBeVisible();

  await page.getByLabel("Title").fill("Site Reliability Engineer");
  await page
    .getByLabel("Description")
    .fill("Keep the board's deploys boring. Pages, traces, and a weekly look at error budgets.");
  await page.getByLabel("Location").fill("Berlin");
  await page.getByLabel("Employment type").selectOption("FULL_TIME");
  await page.getByLabel("Minimum salary").fill("130000");
  await page.getByLabel("Maximum salary").fill("160000");
  await page.getByRole("button", { name: "Save job" }).click();
  await expect(page.getByRole("heading", { name: "Site Reliability Engineer" })).toBeVisible();
});

test("employer reviews the application and the candidate can withdraw", async ({ page }) => {
  await login(page, "mira.chen@example.com");
  await page.goto("/dashboard/employer");
  await page.getByRole("link", { name: "Review Backend Engineer" }).click();
  const resume = await page
    .getByRole("link", { name: "Download resume for Jordan Hale" })
    .getAttribute("href");
  const download = await page.request.get(resume!);
  expect(download.status()).toBe(200);

  await page.getByLabel("Status for Jordan Hale").selectOption("INTERVIEW");
  await page.getByRole("button", { name: "Update Jordan Hale" }).click();
  await expect(page.getByText("Status updated.")).toBeVisible();
  await expect(page.locator("span.pill").filter({ hasText: "Interview" })).toBeVisible();

  await signOut(page);
  await login(page, "jordan.hale@example.com");
  await expect(page.locator("span.pill").filter({ hasText: "Interview" })).toBeVisible();
  await page.getByRole("button", { name: "Withdraw Backend Engineer" }).click();
  await expect(page.locator("span.pill").filter({ hasText: "Withdrawn" })).toBeVisible();
});

test("middleware keeps each role on its own dashboard", async ({ page }) => {
  await login(page, "jordan.hale@example.com");
  await page.goto("/dashboard/employer");
  await expect(page).toHaveURL(/\/dashboard\/candidate/);

  await signOut(page);
  await login(page, "mira.chen@example.com");
  await page.goto("/dashboard/candidate");
  await expect(page).toHaveURL(/\/dashboard\/employer/);
  await page.goto("/saved-searches");
  await expect(page).toHaveURL(/\/dashboard\/employer/);
});
