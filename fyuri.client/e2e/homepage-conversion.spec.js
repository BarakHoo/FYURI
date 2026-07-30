import { expect, test as base } from '@playwright/test';

const responsiveViewports = [
  { width: 320, height: 640 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1199, height: 844 },
  { width: 1200, height: 844 },
];

const test = base.extend({
  runtimeErrors: [async ({ page }, use) => {
    const errors = [];

    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(`console.error: ${message.text()}`);
      }
    });

    page.on('pageerror', (error) => {
      errors.push(`pageerror: ${error.message}`);
    });

    await use(errors);

    expect(errors, 'The homepage emitted browser runtime errors').toEqual([]);
  }, { auto: true }],
});

async function visitHome(page, viewport = { width: 1200, height: 844 }) {
  await page.setViewportSize(viewport);
  await page.route('**/api/**', (route) => (
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '[]',
    })
  ));
  await page.goto('/');
  await expect(page.locator('main h1')).toBeVisible();
}

async function expectNoHorizontalOverflow(page) {
  await expect.poll(() => page.evaluate(() => {
    const root = document.documentElement;
    return Math.max(0, root.scrollWidth - root.clientWidth);
  })).toBeLessThanOrEqual(1);
}

test.describe('homepage positioning and conversion', () => {
  test('exposes one primary heading and the core conversion destinations', async ({ page }) => {
    await visitHome(page);

    const headings = page.locator('main h1');
    const catalogCta = page.getByTestId('hero-catalog-cta');
    const builderCta = page.getByTestId('hero-builder-cta');
    const whatsappCta = page.getByTestId('hero-whatsapp-cta');
    const labServicesCta = page.getByTestId('lab-services-cta');

    await expect(headings).toHaveCount(1);
    await expect(headings).toContainText(/\S/);

    await expect(catalogCta).toHaveAttribute('href', '/products');
    await expect(builderCta).toHaveAttribute('href', '/builder');
    await expect(whatsappCta).toHaveAttribute('href', 'https://wa.me/972544770200');
    await expect(labServicesCta).toHaveAttribute('href', '/services');

    for (const cta of [catalogCta, builderCta, whatsappCta, labServicesCta]) {
      await expect(cta).toBeVisible();
      await expect(cta).toHaveAccessibleName(/\S/);
    }
  });

  test('uses static imagery without loading legacy homepage video media', async ({ page }) => {
    const videoRequests = [];

    page.on('request', (request) => {
      if (new URL(request.url()).pathname.startsWith('/videos/')) {
        videoRequests.push(request.url());
      }
    });

    await visitHome(page);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('main video')).toHaveCount(0);
    expect(videoRequests, 'The homepage requested media from /videos/').toEqual([]);
  });

  test('gives homepage imagery explicit alt intent, stable dimensions, and loading intent', async ({ page }) => {
    await visitHome(page);

    const images = page.locator('main img');
    const imageCount = await images.count();

    expect(imageCount).toBeGreaterThan(1);

    for (let index = 0; index < imageCount; index += 1) {
      const image = images.nth(index);
      const width = Number(await image.getAttribute('width'));
      const height = Number(await image.getAttribute('height'));

      await expect(image).toHaveAttribute('alt');
      expect(width, `Homepage image ${index + 1} needs a positive width attribute`).toBeGreaterThan(0);
      expect(height, `Homepage image ${index + 1} needs a positive height attribute`).toBeGreaterThan(0);
      await expect(image).toHaveAttribute('loading', index === 0 ? 'eager' : 'lazy');
    }

    await expect(images.first()).toHaveAttribute('alt', /\S/);
    await expect(page.locator('main svg[role="img"]')).toHaveAttribute('aria-label', /\S/);
  });

  test('switches localized content and document direction between Hebrew and English', async ({ page }) => {
    await visitHome(page);

    const root = page.locator('html');

    await expect(root).toHaveAttribute('lang', 'he');
    await expect(root).toHaveAttribute('dir', 'rtl');

    await page.getByTestId('language-toggle').click();

    await expect(root).toHaveAttribute('lang', 'en');
    await expect(root).toHaveAttribute('dir', 'ltr');
    await expect(page.locator('main h1')).toContainText(/Night vision systems/i);
    await expect(page.getByTestId('hero-catalog-cta')).toHaveAccessibleName(/View catalog/i);
  });

  test('keeps light-theme section labels and keyboard focus visibly contrasted', async ({ page }) => {
    await visitHome(page);

    await page.getByRole('button', { name: /מצב בהיר|light/i }).click();

    const sectionLabel = page.getByText('CATALOG / 01', { exact: true });
    const categoriesLink = page.getByRole('link', { name: 'כל הקטגוריות' });

    await expect(sectionLabel).toHaveCSS('color', 'rgb(13, 95, 138)');

    await page.getByTestId('home-capability-paths').getByRole('link').last().focus();
    await page.keyboard.press('Tab');
    await expect(categoriesLink).toBeFocused();
    await expect(categoriesLink).toHaveCSS('outline-color', 'rgb(45, 101, 0)');
    await expect(categoriesLink).toHaveCSS('outline-style', 'solid');
  });

  for (const viewport of responsiveViewports) {
    test(`keeps the primary path usable without overflow at ${viewport.width}px`, async ({ page }) => {
      await visitHome(page, viewport);

      const catalogCta = page.getByTestId('hero-catalog-cta');
      const builderCta = page.getByTestId('hero-builder-cta');

      await expect(catalogCta).toBeVisible();
      await expect(builderCta).toBeVisible();
      await expectNoHorizontalOverflow(page);

      const catalogBox = await catalogCta.boundingBox();
      const builderBox = await builderCta.boundingBox();

      expect(catalogBox, 'Catalog CTA should have a rendered touch target').not.toBeNull();
      expect(builderBox, 'Builder CTA should have a rendered touch target').not.toBeNull();
      expect(catalogBox.height).toBeGreaterThanOrEqual(44);
      expect(builderBox.height).toBeGreaterThanOrEqual(44);
    });
  }
});
