import { expect, test } from '@playwright/test';

/**
 * The documentation shell is three columns: sidebar, reading column, table of
 * contents. These assert the two invariants that make it look balanced, both of
 * which were once broken:
 *
 *   1. The TOC appears at the same breakpoint as the sidebar. When it appeared
 *      224px later, viewports between 1280 and 1536 — including the common 1366
 *      and 1440 laptop widths — rendered a sidebar, no TOC, and up to 304px of
 *      dead space on the right.
 *   2. Whatever slack is left over splits evenly. Without it, every leftover
 *      pixel collected on the right even at 1920px.
 */

const WIDTHS = [1280, 1366, 1440, 1536, 1920];
const ROUTES = ['/learn/', '/reference/skyl/', '/reference/provider/feature-matrix/'];

for (const width of WIDTHS) {
  test(`three columns stay balanced at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });

    for (const route of ROUTES) {
      await page.goto(route);

      const main = (await page.locator('main#main-content').boundingBox())!;
      const sidebar = (await page.getByTestId('doc-sidebar').boundingBox())!;
      const toc = await page.getByTestId('toc').boundingBox();

      // The sidebar and the TOC are a matched pair; one without the other is
      // the bug this suite exists to catch.
      expect(toc, `${route} at ${width}px: TOC not rendered`).not.toBeNull();

      const gutterLeft = main.x - (sidebar.x + sidebar.width);
      const gutterRight = toc!.x - (main.x + main.width);

      // Equal gutters is what "balanced" means here.
      expect(
        Math.abs(gutterLeft - gutterRight),
        `${route} at ${width}px: gutters ${Math.round(gutterLeft)} vs ${Math.round(gutterRight)}`,
      ).toBeLessThanOrEqual(2);

      // And the reading column keeps a sane measure at every width.
      expect(main.width, `${route} at ${width}px`).toBeGreaterThan(600);
      expect(main.width, `${route} at ${width}px`).toBeLessThanOrEqual(768);
    }
  });
}

test('the footer spans the page rather than the reading column', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/learn/');

  const main = (await page.locator('main#main-content').boundingBox())!;
  const footer = (await page.locator('footer').boundingBox())!;

  // It used to be nested inside <main>, which trapped it at 768px.
  expect(footer.width).toBeGreaterThan(main.width);
});

test('a page with too few headings still reserves the TOC column', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });

  await page.goto('/learn/');
  const withToc = (await page.locator('main#main-content').boundingBox())!;

  await page.goto('/community/acknowledgements/');
  const withoutToc = (await page.locator('main#main-content').boundingBox())!;

  // The placeholder keeps the reading column in the same place, so navigating
  // between pages does not shift the text sideways.
  expect(Math.abs(withToc.x - withoutToc.x)).toBeLessThanOrEqual(2);
});
