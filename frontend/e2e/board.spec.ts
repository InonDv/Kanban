import { expect, test } from "@playwright/test";

async function openBoard(page: import("@playwright/test").Page) {
  await page.goto("/");
  await expect(page).toHaveURL(/board=/);
  await expect(page.getByTestId("board")).toBeVisible({ timeout: 15000 });
}

test.describe("Kanban board", () => {
  test("loads with dummy data", async ({ page }) => {
    await openBoard(page);
    await expect(page.getByTestId("card-card-1")).toContainText(
      "Audit current homepage",
    );
    await expect(page.getByTestId("column-title-col-backlog")).toHaveText(
      "Backlog",
    );
    await expect(page.getByTestId("column-col-done")).toContainText(
      "Publish design tokens",
    );
  });

  test("renames a column", async ({ page }) => {
    await openBoard(page);
    await page.getByTestId("column-title-col-todo").click();
    const input = page.getByTestId("column-title-input-col-todo");
    await input.fill("Ready");
    await input.press("Enter");
    await expect(page.getByTestId("column-title-col-todo")).toHaveText("Ready");
  });

  test("adds a card to a column", async ({ page }) => {
    await openBoard(page);
    await page.getByTestId("add-card-open-col-review").click();
    await page
      .getByTestId("add-card-title-col-review")
      .fill("Write release notes");
    await page
      .getByTestId("add-card-details-col-review")
      .fill("Summarize changes for stakeholders.");
    await page.getByTestId("add-card-submit-col-review").click();
    await expect(page.getByTestId("column-col-review")).toContainText(
      "Write release notes",
    );
  });

  test("deletes a card", async ({ page }) => {
    await openBoard(page);
    await expect(page.getByTestId("card-card-7")).toBeVisible();
    await page.getByTestId("delete-card-card-7").click({ force: true });
    await expect(page.getByTestId("card-card-7")).toHaveCount(0);
  });

  test("edits a card", async ({ page }) => {
    await openBoard(page);
    await page.getByTestId("edit-card-card-1").click();
    await page.getByTestId("edit-card-title-card-1").fill("Revised scope");
    await page
      .getByTestId("edit-card-details-card-1")
      .fill("Updated MVP details.");
    await page.getByTestId("edit-card-save-card-1").click();
    await expect(page.getByTestId("card-card-1")).toContainText("Revised scope");
    await expect(page.getByTestId("card-card-1")).toContainText(
      "Updated MVP details.",
    );
  });

  test("assigns a person to a card", async ({ page }) => {
    await openBoard(page);
    await page.getByTestId("people-button").click();
    await page.getByTestId("people-name-input").fill("Assign Target");
    await page.getByTestId("people-add-submit").click();
    await expect(page.getByTestId("people-panel")).toContainText("Assign Target");
    await page.getByTestId("people-panel-close").click();

    const assign = page.getByTestId("assign-card-card-2");
    await expect(assign).toContainText("Assign Target");
    await assign.selectOption({ label: "Assign Target" });
    await expect(assign).not.toHaveValue("");
  });

  test("manages company people list", async ({ page }) => {
    await openBoard(page);
    await page.getByTestId("people-button").click();
    await expect(page.getByTestId("people-panel")).toBeVisible();
    await page.getByTestId("people-name-input").fill("Casey Morgan");
    await page.getByTestId("people-add-submit").click();
    await expect(page.getByTestId("people-panel")).toContainText("Casey Morgan");
    await page.getByTestId("people-panel-close").click();
    await expect(page.getByTestId("assign-card-card-1")).toContainText(
      "Casey Morgan",
    );
  });

  test("drags a card to another column", async ({ page }) => {
    await openBoard(page);
    const card = page.getByTestId("card-card-1");
    const target = page.getByTestId("column-drop-col-done");

    await expect(page.getByTestId("column-col-backlog")).toContainText(
      "Audit current homepage",
    );

    const cardBox = await card.boundingBox();
    const targetBox = await target.boundingBox();
    if (!cardBox || !targetBox) {
      throw new Error("Missing bounding boxes for drag");
    }

    await page.mouse.move(
      cardBox.x + cardBox.width / 2,
      cardBox.y + cardBox.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      targetBox.x + targetBox.width / 2,
      targetBox.y + Math.min(40, targetBox.height / 2),
      { steps: 12 },
    );
    await page.mouse.up();

    await expect(page.getByTestId("column-col-done")).toContainText(
      "Audit current homepage",
    );
    await expect(page.getByTestId("column-col-backlog")).not.toContainText(
      "Audit current homepage",
    );
  });

  test("share button copies the board link", async ({ page }) => {
    await openBoard(page);
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.getByTestId("share-button").click();
    await expect(page.getByTestId("share-button")).toHaveText("Link copied");
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toMatch(/board=/);
  });

  test("syncs edits live between two clients", async ({ browser }) => {
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    await openBoard(pageA);
    const sharedUrl = pageA.url();
    await pageB.goto(sharedUrl);
    await expect(pageB.getByTestId("board")).toBeVisible({ timeout: 15000 });

    await pageA.getByTestId("column-title-col-todo").click();
    const input = pageA.getByTestId("column-title-input-col-todo");
    await input.fill("Ready");
    await input.press("Enter");

    await expect(pageA.getByTestId("column-title-col-todo")).toHaveText(
      "Ready",
    );
    await expect(pageB.getByTestId("column-title-col-todo")).toHaveText(
      "Ready",
      { timeout: 10000 },
    );

    await contextA.close();
    await contextB.close();
  });
});
