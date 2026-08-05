import { expect, test, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/**
 * The hidden credits panel.
 *
 * Two things need proving, and the second is the one that makes the feature
 * what it claims to be: that it opens, and that the trigger and the personal
 * details are **absent from the shipped bundle**.
 */

const SEQUENCE = 'bagombeka';

/**
 * Types the sequence, first waiting for hydration.
 *
 * The listener is attached by a client component, so keystrokes sent before
 * React has hydrated go nowhere — and the heavier pages take long enough for
 * that to be a real race rather than a theoretical one.
 */
async function type(page: Page, text: string) {
  await page.waitForLoadState('networkidle');
  for (const ch of text) {
    await page.keyboard.press(ch);
  }
}

test('typing the sequence reveals the panel', async ({ page }) => {
  await page.goto('/learn/');
  await expect(page.getByTestId('credits')).toBeHidden();

  await type(page, SEQUENCE);

  const panel = page.getByTestId('credits');
  await expect(panel).toBeVisible();
  await expect(panel).toContainText('Bagombeka Job');
  await expect(panel).toContainText('Why I started this');
  await expect(panel.getByRole('link', { name: /bagombekajob\.com/ })).toBeVisible();
  await expect(panel.getByRole('link', { name: /gmail\.com/ })).toBeVisible();
  await expect(panel.getByRole('link', { name: /linkedin\.com\/in\/bagombeka-job/ })).toBeVisible();
});

test('it works in upper case, and on any page', async ({ page }) => {
  await page.goto('/reference/skyl/');
  await type(page, SEQUENCE.toUpperCase());
  await expect(page.getByTestId('credits')).toBeVisible();
});

test('Escape closes it and focus is restored', async ({ page }) => {
  await page.goto('/learn/');
  await page.getByTestId('search-open').focus();

  await type(page, SEQUENCE);
  await expect(page.getByTestId('credits')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByTestId('credits')).toBeHidden();

  // Focus must return where it was, or a keyboard reader is stranded.
  const focused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
  expect(focused).toBe('search-open');
});

test('the backdrop closes it', async ({ page }) => {
  await page.goto('/learn/');
  await type(page, SEQUENCE);
  await expect(page.getByTestId('credits')).toBeVisible();

  await page.getByTestId('credits-backdrop').click({ position: { x: 5, y: 5 } });
  await expect(page.getByTestId('credits')).toBeHidden();
});

test('typing it into the search box does NOT fire it', async ({ page }) => {
  await page.goto('/learn/');
  await page.getByTestId('search-open').click();
  await page.getByTestId('search-input').fill(SEQUENCE);

  await page.waitForTimeout(400);
  // Firing here would be both a bug and a giveaway.
  await expect(page.getByTestId('credits')).toBeHidden();
});

test('it is usable at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto('/learn/');
  await type(page, SEQUENCE);

  await expect(page.getByTestId('credits')).toBeVisible();
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(overflows).toBe(false);
});

/**
 * The assertion the whole design rests on.
 *
 * Client-side code cannot keep a secret, but it can avoid handing one over: the
 * trigger is matched by digest and the details are base64 at rest, so none of
 * this should be greppable in the build. Note the trigger is checked
 * **case-sensitively** — the public repo URL contains `BAGOMBEKA-JOB-DEV`, and
 * that is expected.
 */
test('the trigger and the personal details are absent from the build', () => {
  const out = path.resolve(import.meta.dirname, '..', '..', 'out');
  test.skip(!fs.existsSync(out), 'no build output to inspect');

  const files: string[] = [];
  (function walk(dir: string) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (/\.(html|js|txt|json|css|md)$/.test(e.name)) files.push(full);
    }
  })(out);

  const forbidden = [SEQUENCE, '778480981', 'bagombekajob16', 'bagombekajob.com', 'linkedin.com/in'];
  const leaks: string[] = [];

  for (const file of files) {
    const body = fs.readFileSync(file, 'utf8');
    for (const needle of forbidden) {
      if (body.includes(needle)) leaks.push(`${path.relative(out, file)} contains "${needle}"`);
    }
  }

  expect(leaks, `plaintext leaked into the build:\n${leaks.slice(0, 5).join('\n')}`).toHaveLength(0);
});
