import { expect, test } from '@playwright/test';
import { allRoutes } from '../../src/sidebars';

/**
 * Every route in every sidebar must render.
 *
 * The link checker proves a file exists behind each entry; this proves the
 * built page actually loads and has a heading. A 404 in navigation is the one
 * documentation bug a reader cannot work around.
 */
const routes = allRoutes();

test('the sidebars are not empty', () => {
  expect(routes.length).toBeGreaterThan(100);
});

for (const route of routes) {
  test(`renders ${route}`, async ({ page }) => {
    const response = await page.goto(`${route}/`);
    expect(response?.status(), `${route} returned ${response?.status()}`).toBeLessThan(400);

    // A rendered page always has exactly one H1 and a breadcrumb trail.
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();
    await expect(page.getByTestId('doc-sidebar')).toBeAttached();
  });
}
