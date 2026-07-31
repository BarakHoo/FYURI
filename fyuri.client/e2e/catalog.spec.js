import { expect, test as base } from '@playwright/test';
import { stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const assetPath = (name) => fileURLToPath(new URL(
  `../public/images/catalog/${name}`,
  import.meta.url,
));

const referenceAssets = [
  'catalog-monocular-hero-v2.webp',
  'pvs-14-reference.webp',
  'pvs-14-pro-reference.webp',
  'pvs-14-lite-reference.webp',
  'pvs-7-reference.webp',
];

const catalogProducts = [
  {
    id: 2,
    name: 'PVS-14',
    nameHebrew: 'PVS-14',
    description: 'Industry standard monocular. Rugged, lightweight, proven.',
    descriptionHebrew: 'מערכת חד-עינית תקנית, קלה ומוכחת.',
    productType: 'monocular',
    price: 3200,
    generation: 'Gen 3',
    tubeType: 'Green Phosphor',
    inStock: true,
    stockQuantity: 12,
    isActive: true,
    specifications: {},
  },
  {
    id: 22,
    name: 'PVS-14 PRO',
    nameHebrew: 'PVS-14 PRO',
    description: 'Enhanced optics and housing. Built for harsh conditions.',
    descriptionHebrew: 'אופטיקה וגוף משודרגים לתנאי שטח קשים.',
    productType: 'monocular',
    price: 4100,
    generation: 'Gen 3',
    tubeType: 'White Phosphor',
    inStock: true,
    stockQuantity: 8,
    isActive: true,
    specifications: {},
  },
  {
    id: 23,
    name: 'PVS-14 LITE',
    nameHebrew: 'PVS-14 LITE',
    description: 'Streamlined performance. Excellent value.',
    descriptionHebrew: 'ביצועים יעילים וערך מצוין.',
    productType: 'monocular',
    price: 2450,
    generation: 'Gen 2+',
    tubeType: 'White Phosphor',
    inStock: true,
    stockQuantity: 5,
    isActive: true,
    specifications: {},
  },
  {
    id: 5,
    name: 'PVS-7',
    nameHebrew: 'PVS-7',
    description: 'Compact and versatile. Battle-proven design.',
    descriptionHebrew: 'מערכת קומפקטית ורב-שימושית בתצורה מוכחת.',
    productType: 'monocular',
    price: 2900,
    generation: 'Gen 3',
    tubeType: 'Green Phosphor',
    inStock: true,
    stockQuantity: 2,
    isActive: true,
    specifications: {},
  },
];

const test = base.extend({
  runtimeErrors: [async ({ page }, use) => {
    const errors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`console.error: ${message.text()}`);
    });
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));

    await use(errors);
    expect(errors, 'The reference catalog emitted browser runtime errors').toEqual([]);
  }, { auto: true }],
});

async function visitCatalog(page, viewport = { width: 1680, height: 944 }) {
  await page.route('**/api/**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: '[]',
  }));
  await page.route('**/api/products', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(catalogProducts),
  }));
  await page.setViewportSize(viewport);
  await page.goto('/products');
  await expect(page.getByRole('heading', { name: 'NIGHT VISION SYSTEMS' })).toBeVisible();
}

async function expectNoHorizontalOverflow(page) {
  await expect.poll(() => page.evaluate(() => (
    Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)
  ))).toBeLessThanOrEqual(1);
}

async function roundedBox(locator) {
  const box = await locator.boundingBox();
  return Object.fromEntries(
    Object.entries(box || {}).map(([key, value]) => [key, Math.round(value)]),
  );
}

test.describe('reference-parity product catalog', () => {
  test('keeps every generated visual asset below the lightweight image budget', async () => {
    for (const asset of referenceAssets) {
      const file = await stat(assetPath(asset));
      expect(file.size, asset).toBeLessThanOrEqual(100_000);
    }
  });

  test('matches the reference desktop bands and catalog geometry at 1680x944', async ({ page }) => {
    await visitCatalog(page);

    expect(await roundedBox(page.locator('.catalog-reference-topbar'))).toMatchObject({
      y: 0,
      height: 38,
    });
    expect(await roundedBox(page.locator('header.MuiPaper-root'))).toMatchObject({
      y: 38,
      height: 93,
    });
    expect(await roundedBox(page.locator('.reference-catalog-hero'))).toMatchObject({
      y: 131,
      height: 211,
    });
    expect(await roundedBox(page.locator('.reference-capabilities'))).toMatchObject({
      y: 342,
      height: 59,
    });
    expect(await roundedBox(page.locator('.reference-filter-panel'))).toMatchObject({
      x: 54,
      y: 410,
      width: 281,
      height: 514,
    });
    const toolbar = await roundedBox(page.locator('.reference-catalog-toolbar'));
    expect(toolbar).toMatchObject({
      x: 394,
      y: 419,
      height: 44,
    });
    // Native scrollbar width differs between Windows and the Linux CI browser.
    expect(toolbar.width).toBeGreaterThanOrEqual(1190);
    expect(toolbar.width).toBeLessThanOrEqual(1205);

    const cards = page.getByTestId('catalog-product-card');
    await expect(cards).toHaveCount(4);
    const cardBoxes = await Promise.all(
      Array.from({ length: 4 }, (_, index) => roundedBox(cards.nth(index))),
    );
    expect(cardBoxes[0]).toMatchObject({ x: 394, y: 484, height: 427 });
    expect(cardBoxes[0].width).toBeGreaterThanOrEqual(283);
    expect(cardBoxes[0].width).toBeLessThanOrEqual(287);
    for (const box of cardBoxes) {
      expect(box.y).toBe(484);
      expect(box.height).toBe(427);
      expect(Math.abs(box.width - cardBoxes[0].width)).toBeLessThanOrEqual(1);
    }
    for (let index = 1; index < cardBoxes.length; index += 1) {
      const gap = cardBoxes[index].x - cardBoxes[index - 1].x - cardBoxes[index - 1].width;
      expect(gap).toBeGreaterThanOrEqual(19);
      expect(gap).toBeLessThanOrEqual(21);
    }

    const mediaHeight = await cards.nth(0).locator('.reference-product-card__media')
      .evaluate((element) => Math.round(element.getBoundingClientRect().height));
    expect(mediaHeight).toBe(170);
    await expect(cards.nth(3).getByRole('link', { name: 'CONFIGURE' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('uses the transparent reference logo, hero, copy and four-card product lineup', async ({ page }) => {
    await visitCatalog(page);

    await expect(page.getByTestId('site-logo-link').locator('img')).toHaveAttribute(
      'src',
      '/images/logos/fyuri-logo-transparent.png',
    );
    await expect(page.locator('.reference-catalog-hero__image')).toHaveAttribute(
      'src',
      '/images/catalog/catalog-monocular-hero-v2.webp',
    );
    await expect(page.getByText('Compact. Capable. Mission ready.')).toBeVisible();
    await expect(page.locator('.reference-capabilities li')).toHaveCount(5);
    await expect(page.getByText('Showing 4 of 4 results')).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Sort by' })).toHaveValue('featured');

    const cards = page.getByTestId('catalog-product-card');
    await expect(cards.nth(0)).toContainText('PVS-14');
    await expect(cards.nth(0)).toContainText('₪3,200');
    await expect(cards.nth(1)).toContainText('PVS-14 PRO');
    await expect(cards.nth(1)).toContainText('₪4,100');
    await expect(cards.nth(2)).toContainText('PVS-14 LITE');
    await expect(cards.nth(2)).toContainText('₪2,450');
    await expect(cards.nth(3)).toContainText('PVS-7');
    await expect(cards.nth(3)).toContainText('Low stock');
    await expect(cards.nth(3)).toContainText('₪2,900');
  });

  test('retains working favorites and grid/list controls', async ({ page }) => {
    await visitCatalog(page);

    const favorite = page.getByRole('button', { name: 'Save PVS-14 to favorites' });
    await favorite.click();
    const savedFavorite = page.getByRole('button', { name: 'Remove PVS-14 from favorites' });
    await expect(savedFavorite).toHaveAttribute('aria-pressed', 'true');
    await page.reload();
    await expect(page.getByRole('button', { name: 'Remove PVS-14 from favorites' }))
      .toHaveAttribute('aria-pressed', 'true');

    await page.getByRole('button', { name: 'List view' }).click();
    await expect(page.locator('.reference-product-grid--list')).toBeVisible();
    await page.getByRole('button', { name: 'Grid view' }).click();
    await expect(page.locator('.reference-product-grid--grid')).toBeVisible();
  });

  test('uses URL-backed filters, sorting, details and complete builder presets', async ({ page }) => {
    await visitCatalog(page);

    await page.getByRole('button', { name: 'Monoculars 4' }).click();
    await expect(page).toHaveURL(/category=monocular/);

    const genTwoPlus = page.getByLabel('Gen 2+');
    await genTwoPlus.click();
    await expect(page).toHaveURL(/gen=2-plus/);
    await expect(genTwoPlus).toBeChecked();
    await expect(page.getByTestId('catalog-product-card')).toHaveCount(1);
    await expect(page.getByTestId('catalog-product-card')).toContainText('PVS-14 LITE');

    await genTwoPlus.click();
    await expect(genTwoPlus).not.toBeChecked();
    await page.getByRole('button', { name: 'TUBE QUALITY' }).click();
    const whitePhosphor = page.getByLabel('White phosphor');
    await whitePhosphor.click();
    await expect(whitePhosphor).toBeChecked();
    await expect(page.getByTestId('catalog-product-card')).toHaveCount(2);
    await expect(page).toHaveURL(/tube=white-phosphor/);
    await whitePhosphor.click();
    await expect(whitePhosphor).not.toBeChecked();

    await page.getByRole('combobox', { name: 'Sort by' }).selectOption('price-low');
    await expect(page.getByTestId('catalog-product-card').first()).toContainText('PVS-14 LITE');
    await expect(page).toHaveURL(/sort=price-low/);

    await expect(page.getByRole('link', { name: 'VIEW DETAILS' }).first())
      .toHaveAttribute('href', '/products/23');
    const configure = page.getByTestId('configure-product-23');
    await expect(configure).toHaveAttribute('href', /\/builder\?.*preset=pvs-14-lite/);
    await expect(configure).toHaveAttribute('href', /housing=housing-mono-ultralight/);
    await expect(configure).toHaveAttribute('href', /tube=tube-photonis-echo/);
  });

  test('keeps the existing mobile navigation and adds a usable filter drawer', async ({ page }) => {
    await visitCatalog(page, { width: 390, height: 844 });

    await page.getByTestId('mobile-menu-button').click();
    await expect(page.getByRole('dialog', { name: /תפריט ניווט|Navigation menu/ })).toBeVisible();
    await page.getByRole('button', { name: /סגור תפריט ניווט|Close navigation/ }).click();

    await page.getByRole('button', { name: 'FILTERS' }).click();
    const drawer = page.locator('#reference-filter-drawer');
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole('button', { name: 'All products 4' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await drawer.getByRole('button', { name: 'Close filters' }).click();
    await expect(drawer).toBeHidden();
    await expectNoHorizontalOverflow(page);
  });
});
