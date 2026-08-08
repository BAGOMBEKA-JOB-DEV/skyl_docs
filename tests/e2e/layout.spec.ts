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

/**
 * The header packed itself into the left 59% of the window, because a
 * responsive `md:ml-4` cancelled the `ml-auto` that was supposed to push the
 * nav right. At 1366px the rightmost element ended at 808 — 558px of dead
 * space. It should reach the container's padding, and nothing further.
 */
for (const width of [1280, 1366, 1440]) {
  test(`the header spans the window at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/learn/');

    const right = await page.evaluate(() => {
      const items = [...document.querySelectorAll('header a, header button')]
        .map((e) => e.getBoundingClientRect())
        .filter((r) => r.y < 70 && r.width > 8);
      return Math.max(...items.map((r) => r.x + r.width));
    });

    // Everything past the container's own padding is dead space.
    expect(
      width - right,
      `${width}px: ${Math.round(width - right)}px unused on the right`,
    ).toBeLessThanOrEqual(40);
  });
}

test('the search box grows into the header slack', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/learn/');

  // It was a fixed 256px, which is what left the bar unable to reach the edge.
  const search = (await page.getByTestId('search-open').boundingBox())!;
  expect(search.width).toBeGreaterThan(500);
});

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

/**
 * Mobile navigation.
 *
 * Below `lg` the header's track links are hidden, and the drawer used to carry
 * only the current track's pages — so a phone reader could not get from Learn
 * to Reference at all, and on the home page had nothing but two hero buttons.
 */
const MOBILE = { width: 430, height: 932 };

test('the menu opens from the home page and reaches another track', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await page.goto('/');

  // The journey that was impossible: home -> Reference, on a phone.
  await page.getByTestId('nav-toggle').click();
  const drawer = page.getByTestId('mobile-nav');
  await expect(drawer).toHaveAttribute('aria-hidden', 'false');
  await expect.poll(async () => Math.round((await drawer.boundingBox())!.x)).toBe(0);

  for (const label of ['Learn', 'Reference', 'Community', 'Blog']) {
    await expect(drawer.getByRole('link', { name: label, exact: true })).toBeVisible();
  }

  await drawer.getByRole('link', { name: 'Reference', exact: true }).click();
  await expect(page.locator('h1')).toContainText('skyl API Reference');
});

test('the drawer carries both the tracks and the current section', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await page.goto('/learn/');
  await page.getByTestId('nav-toggle').click();

  const drawer = page.getByTestId('mobile-nav');
  // Track switcher…
  await expect(drawer.getByRole('link', { name: 'Community', exact: true })).toBeVisible();
  // …and this track's own pages.
  await expect(drawer.getByRole('link', { name: 'Installation' })).toBeVisible();

  // Leaving the track entirely is the case that had no path before.
  await drawer.getByRole('link', { name: 'Community', exact: true }).click();
  await expect(page.locator('h1')).toContainText('skyl Community');
});

test('the drawer closes on navigation and on backdrop tap', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await page.goto('/learn/');
  const drawer = page.getByTestId('mobile-nav');

  await page.getByTestId('nav-toggle').click();
  await expect(drawer).toHaveAttribute('aria-hidden', 'false');
  // Tap to the right of the drawer: it is 320px wide and sits above the
  // backdrop, so a tap at x=5 would land on the drawer itself.
  await page.getByTestId('mobile-nav-backdrop').click({ position: { x: MOBILE.width - 20, y: 400 } });
  await expect(drawer).toHaveAttribute('aria-hidden', 'true');

  await page.getByTestId('nav-toggle').click();
  await drawer.getByRole('link', { name: 'Installation' }).first().click();
  await expect(page.locator('h1')).toContainText('Installation');
  // Landing on the new page with the menu still covering it would be a bug.
  await expect(drawer).toHaveAttribute('aria-hidden', 'true');
});

test('the drawer is absent on desktop, where the header nav is visible', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/learn/');

  await expect(page.getByTestId('mobile-nav')).toBeHidden();
  await expect(page.getByTestId('doc-sidebar')).toBeVisible();
});
