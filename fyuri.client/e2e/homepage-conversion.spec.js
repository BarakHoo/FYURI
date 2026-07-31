import { expect, test as base } from '@playwright/test';
import { stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const heroMediaPaths = {
  poster: fileURLToPath(new URL('../public/images/banners/tactical-nvg-poster.webp', import.meta.url)),
  webm: fileURLToPath(new URL('../public/videos/tactical-nvg.webm', import.meta.url)),
  mp4: fileURLToPath(new URL('../public/videos/tactical-nvg.mp4', import.meta.url)),
};

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
    const allCategoriesCta = page.getByTestId('home-all-categories-cta');
    const builderSectionCta = page.getByTestId('home-builder-section-cta');
    const contactPageCta = page.getByTestId('contact-page-cta');

    await expect(headings).toHaveCount(1);
    await expect(headings).toContainText(/\S/);

    await expect(catalogCta).toHaveAttribute('href', '/products');
    await expect(builderCta).toHaveAttribute('href', '/builder');
    await expect(whatsappCta).toHaveAttribute('href', 'https://wa.me/972544770200');
    await expect(labServicesCta).toHaveAttribute('href', '/services');
    await expect(allCategoriesCta).toHaveAttribute('href', '/products');
    await expect(builderSectionCta).toHaveAttribute('href', '/builder');
    await expect(contactPageCta).toHaveAttribute('href', '/contact');

    const capabilityPaths = await page
      .getByTestId('home-capability-paths')
      .getByRole('link')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
    expect(capabilityPaths).toEqual(['/products', '/builder', '/services']);

    const categoryPaths = {
      monocular: '/products?category=monocular',
      binocular: '/products?category=binocular',
      panoramic: '/products?category=panoramic',
      intensifier: '/products?category=intensifier',
    };

    for (const [category, path] of Object.entries(categoryPaths)) {
      const categoryLink = page.getByTestId(`home-category-${category}`);
      await expect(categoryLink).toHaveAttribute('href', path);
      await expect(categoryLink).toHaveAccessibleName(/\S/);
    }

    for (const cta of [
      catalogCta,
      builderCta,
      whatsappCta,
      labServicesCta,
      allCategoriesCta,
      builderSectionCta,
      contactPageCta,
    ]) {
      await expect(cta).toBeVisible();
      await expect(cta).toHaveAccessibleName(/\S/);
    }
  });

  test('serves the responsive FYURI identity system and installable-site assets', async ({ page, request }) => {
    await visitHome(page);

    const headerLogo = page.getByTestId('site-logo-link').locator('img');
    await expect(headerLogo).toHaveAttribute('src', '/images/logos/fyuri-logo-transparent.png');

    const renderedLogo = await headerLogo.evaluate((image) => ({
      complete: image.complete,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
    }));
    expect(renderedLogo.complete).toBe(true);
    expect(renderedLogo.naturalWidth).toBeGreaterThan(0);
    expect(renderedLogo.naturalHeight).toBeGreaterThan(0);

    const assetPaths = [
      '/favicon.svg',
      '/favicon.ico',
      '/brand/favicon-16x16.png',
      '/brand/favicon-32x32.png',
      '/brand/apple-touch-icon.png',
      '/brand/fyuri-lockup-on-dark.svg',
      '/brand/fyuri-lockup-on-light.svg',
      '/brand/fyuri-mark-on-dark.svg',
      '/brand/fyuri-icon-192.png',
      '/brand/fyuri-icon-512.png',
      '/brand/fyuri-icon-maskable-512.png',
      '/site.webmanifest',
    ];

    for (const path of assetPaths) {
      const response = await request.get(path);
      expect(response.ok(), `${path} should load`).toBe(true);
    }

    const manifestResponse = await request.get('/site.webmanifest');
    const manifest = await manifestResponse.json();
    expect(manifest.short_name).toBe('FYURI');
    expect(manifest.theme_color).toBe('#07111b');
    expect(manifest.icons).toEqual(expect.arrayContaining([
      expect.objectContaining({ sizes: '192x192', purpose: 'any' }),
      expect.objectContaining({ sizes: '512x512', purpose: 'maskable' }),
    ]));
  });

  test('loads the optimized muted hero loop when motion and network policy allow it', async ({ page }) => {
    const videoRequests = [];

    page.on('request', (request) => {
      if (new URL(request.url()).pathname.startsWith('/videos/')) {
        videoRequests.push(request.url());
      }
    });

    await visitHome(page);

    const video = page.getByTestId('home-hero-video');
    const properties = await video.evaluate((element) => ({
      autoplay: element.autoplay,
      controls: element.controls,
      loop: element.loop,
      muted: element.muted,
      playsInline: element.playsInline,
      poster: new URL(element.poster).pathname,
      preload: element.preload,
    }));
    const sources = await video.locator('source').evaluateAll((elements) => (
      elements.map((element) => ({
        src: new URL(element.src).pathname,
        type: element.type,
      }))
    ));

    await expect(video).toHaveCount(1);
    await expect(page.getByTestId('home-hero-poster')).toBeVisible();
    expect(properties).toEqual({
      autoplay: true,
      controls: false,
      loop: true,
      muted: true,
      playsInline: true,
      poster: '/images/banners/tactical-nvg-poster.webp',
      preload: 'metadata',
    });
    expect(sources).toEqual([
      { src: '/videos/tactical-nvg.webm', type: 'video/webm' },
      { src: '/videos/tactical-nvg.mp4', type: 'video/mp4' },
    ]);
    await expect.poll(() => videoRequests.length).toBeGreaterThan(0);
  });

  test('keeps the complete hero media package below two megabytes', async () => {
    const [poster, webm, mp4] = await Promise.all([
      stat(heroMediaPaths.poster),
      stat(heroMediaPaths.webm),
      stat(heroMediaPaths.mp4),
    ]);

    expect(poster.size).toBeLessThanOrEqual(100_000);
    expect(webm.size).toBeLessThanOrEqual(900_000);
    expect(mp4.size).toBeLessThanOrEqual(1_200_000);
    expect(poster.size + webm.size + mp4.size).toBeLessThanOrEqual(2_000_000);
  });

  test('uses only the poster when reduced motion is requested', async ({ page }) => {
    const videoRequests = [];

    await page.emulateMedia({ reducedMotion: 'reduce' });
    page.on('request', (request) => {
      if (new URL(request.url()).pathname.startsWith('/videos/')) {
        videoRequests.push(request.url());
      }
    });

    await visitHome(page);
    await expect(page.getByTestId('home-hero-poster')).toBeVisible();
    await expect(page.getByTestId('home-hero-video')).toHaveCount(0);
    expect(videoRequests).toEqual([]);
  });

  test('uses only the poster when the browser requests data saving', async ({ page }) => {
    const videoRequests = [];

    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'connection', {
        configurable: true,
        value: {
          addEventListener() {},
          effectiveType: '4g',
          removeEventListener() {},
          saveData: true,
        },
      });
    });
    page.on('request', (request) => {
      if (new URL(request.url()).pathname.startsWith('/videos/')) {
        videoRequests.push(request.url());
      }
    });

    await visitHome(page);
    await expect(page.getByTestId('home-hero-poster')).toBeVisible();
    await expect(page.getByTestId('home-hero-video')).toHaveCount(0);
    expect(videoRequests).toEqual([]);
  });

  test('gives homepage decorative imagery explicit alt intent, stable dimensions, and loading intent', async ({ page }) => {
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

    await expect(images.first()).toHaveAttribute('alt', '');
    await expect(images.first()).toHaveAttribute('fetchpriority', 'high');
    expect(await images.evaluateAll((elements) => elements.map((image) => image.getAttribute('alt'))))
      .toEqual(Array(imageCount).fill(''));
    await expect(page.locator('main svg[role="img"]')).toHaveAttribute('aria-label', /\S/);
  });

  test('starts in English and switches localized content and document direction to Hebrew', async ({ page }) => {
    await visitHome(page);

    const root = page.locator('html');
    const heroHeading = page.locator('main h1');
    const englishHeading = await heroHeading.textContent();

    await expect(root).toHaveAttribute('lang', 'en');
    await expect(root).toHaveAttribute('dir', 'ltr');
    await expect(heroHeading).toContainText(/Night vision systems/i);
    await expect(page.getByTestId('hero-catalog-cta')).toHaveAccessibleName(/View catalog/i);

    await page.getByTestId('language-toggle').click();

    await expect(root).toHaveAttribute('lang', 'he');
    await expect(root).toHaveAttribute('dir', 'rtl');
    await expect(heroHeading).toContainText(/[\u0590-\u05ff]/);
    await expect(heroHeading).not.toHaveText(englishHeading ?? '');
    await expect(page.getByTestId('hero-catalog-cta')).toHaveAccessibleName(/[\u0590-\u05ff]/);
    await expect(page.getByTestId('home-category-monocular')).toHaveAccessibleName(/[\u0590-\u05ff]/);
  });

  test('keeps light-theme section labels and keyboard focus visibly contrasted', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('themeMode', 'light'));
    await visitHome(page);

    const sectionLabel = page.getByText('CATALOG / 01', { exact: true });
    const categoriesLink = page.getByRole('link', { name: 'All categories' });

    await expect(sectionLabel).toHaveCSS('color', 'rgb(13, 95, 138)');

    await page.getByTestId('home-capability-paths').getByRole('link').last().focus();
    await page.keyboard.press('Tab');
    await expect(categoriesLink).toBeFocused();
    await expect(categoriesLink).toHaveCSS('outline-color', 'rgb(13, 95, 138)');
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
