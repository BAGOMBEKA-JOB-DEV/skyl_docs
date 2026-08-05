import { expect, test } from '@playwright/test';

test.describe('home page', () => {
  test('states the pitch and the honest status', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'skyl', exact: true })).toBeVisible();
    await expect(page.getByText('One Go interface for every AI model.')).toBeVisible();
    // The pre-v1 caveat is load-bearing: the project's own principle is
    // honesty over coverage, so the banner must not be quietly dropped.
    await expect(page.getByText(/not yet validated against live provider APIs/i)).toBeVisible();
  });

  test('animates the provider swap', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('provider-swap')).toBeVisible();
  });
});

test.describe('search', () => {
  test('opens with Ctrl+K and finds a page', async ({ page }) => {
    await page.goto('/learn/');
    await page.keyboard.press('Control+k');
    await expect(page.getByTestId('search-input')).toBeVisible();

    await page.getByTestId('search-input').fill('streaming');
    await expect(page.getByTestId('search-results').getByRole('button').first()).toBeVisible();

    await page.getByTestId('search-results').getByRole('button').first().click();
    await expect(page).toHaveURL(/\/learn\//);
  });

  test('reports when nothing matches', async ({ page }) => {
    await page.goto('/learn/');
    await page.getByTestId('search-open').click();
    await page.getByTestId('search-input').fill('zzzzznotathing');
    await expect(page.getByText(/Nothing matches/)).toBeVisible();
  });
});

test.describe('theme', () => {
  test('toggles and persists across a navigation', async ({ page }) => {
    await page.goto('/learn/');
    const html = page.locator('html');
    const wasDark = await html.evaluate((el) => el.classList.contains('dark'));

    await page.getByTestId('theme-toggle').click();
    await expect
      .poll(() => html.evaluate((el) => el.classList.contains('dark')))
      .toBe(!wasDark);

    await page.goto('/reference/skyl/');
    await expect
      .poll(() => html.evaluate((el) => el.classList.contains('dark')))
      .toBe(!wasDark);
  });
});

test.describe('provider tabs', () => {
  test('remember the choice across pages', async ({ page }) => {
    await page.goto('/learn/');
    const tabs = page.getByTestId('provider-tabs').first();
    await tabs.getByRole('tab', { name: 'Gemini' }).click();
    await expect(tabs.getByRole('tab', { name: 'Gemini' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    // The choice is the whole pitch: a reader who picks Gemini should read a
    // Gemini-flavoured site, not re-pick on every page.
    await page.goto('/learn/without-an-api-key/');
    await expect(
      page.getByTestId('provider-tabs').first().getByRole('tab', { name: 'Gemini' }),
    ).toHaveAttribute('aria-selected', 'true');
  });
});

test.describe('feature matrix', () => {
  test('filters to the silently-ignored rows', async ({ page }) => {
    await page.goto('/reference/provider/feature-matrix/');
    const matrix = page.getByTestId('feature-matrix');
    await expect(matrix).toBeVisible();

    const before = await matrix.getByRole('row').count();

    // Turn off everything except the ⚠️ state.
    for (const label of ['Mapped', 'Rejected', 'Not applicable']) {
      await matrix.getByRole('button', { name: new RegExp(label) }).click();
    }
    await expect.poll(async () => matrix.getByRole('row').count()).toBeLessThan(before);
  });

  test('narrows to one provider', async ({ page }) => {
    await page.goto('/reference/provider/feature-matrix/');
    await page.getByTestId('feature-matrix').getByRole('combobox').selectOption('gemini');
    await expect(page.getByTestId('feature-matrix').getByRole('columnheader', { name: 'gemini' }).first()).toBeVisible();
  });
});

test.describe('learn pages', () => {
  test('carry the react.dev furniture', async ({ page }) => {
    // A leaf page promises what *this page* covers…
    await page.goto('/learn/your-first-stream/');
    await expect(page.getByRole('region', { name: 'You will learn' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Recap' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Challenges' })).toBeVisible();
  });

  test('chapter overviews promise the whole chapter', async ({ page }) => {
    // …while a chapter overview promises the chapter, using the isChapter
    // variant. Asserting both keeps the two templates from drifting together.
    await page.goto('/learn/streaming/');
    await expect(page.getByRole('region', { name: 'In this chapter' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /What.s next/ })).toBeVisible();
  });

  test('reveal a challenge solution', async ({ page }) => {
    await page.goto('/learn/your-first-stream/');
    const solution = page.getByTestId('solution').first();
    await expect(solution).toBeVisible();
    await solution.getByText('Show solution').click();
    await expect(solution).toHaveAttribute('open', '');
  });
});

test.describe('responsive', () => {
  test('does not scroll horizontally at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    for (const route of ['/', '/learn/', '/reference/provider/feature-matrix/']) {
      await page.goto(route);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      expect(overflow, `${route} scrolls horizontally`).toBe(false);
    }
  });
});
