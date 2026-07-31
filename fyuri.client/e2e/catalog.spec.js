import { expect, test as base } from '@playwright/test';
import { stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const catalogHeroPath = fileURLToPath(new URL(
  '../public/images/banners/catalog-night-ops.webp',
  import.meta.url,
));

const products = [
  {
    id: 2,
    name: 'PVS-14',
    nameHebrew: 'PVS-14',
    description: 'Single-tube monocular. Lightweight, versatile and proven.',
    descriptionHebrew: 'מכשיר חד עיני קל משקל, רב-תכליתי ומוכח.',
    sku: 'PVS-14',
    price: 3200,
    thumbnailUrl: '/images/products/pvs-14.jpg',
    imageUrls: ['/images/products/pvs-14.jpg'],
    inStock: true,
    stockQuantity: 12,
    productType: 'monocular',
    generation: 'Gen 3',
    tubeType: 'Green Phosphor',
    specifications: {},
  },
  {
    id: 1,
    name: 'BNVD-1431',
    nameHebrew: 'BNVD-1431',
    description: 'Balanced dual-tube night vision system.',
    descriptionHebrew: 'מערכת ראיית לילה דו עינית מאוזנת.',
    sku: 'BNVD-1431',
    price: 8500,
    thumbnailUrl: '/images/products/pvs-31.jpg',
    imageUrls: ['/images/products/pvs-31.jpg'],
    inStock: true,
    stockQuantity: 5,
    productType: 'binocular',
    generation: 'Gen 3',
    tubeType: 'White Phosphor',
    specifications: {},
  },
  {
    id: 24,
    name: 'Photonis 4G White Phosphor Tube',
    nameHebrew: 'שפופרת Photonis 4G זרחן לבן',
    description: 'Autogated image intensifier with extended spectral range.',
    descriptionHebrew: 'מגבר אור עם ספקטרום מורחב.',
    sku: 'TUBE-4G',
    price: 16600,
    thumbnailUrl: '/images/products/pvs-14.jpg',
    imageUrls: ['/images/products/pvs-14.jpg'],
    inStock: true,
    stockQuantity: 8,
    productType: 'intensifier',
    generation: 'Gen 2+ (4G)',
    tubeType: 'White Phosphor',
    specifications: {},
  },
  {
    id: 19,
    name: 'Nocturn Chimera Housing — Magnesium',
    nameHebrew: 'גוף Chimera — מגנזיום',
    description: 'Panoramic housing in magnesium.',
    descriptionHebrew: 'גוף פנורמי ממגנזיום.',
    sku: 'CHIM-MG',
    price: 17200,
    thumbnailUrl: '/images/banners/night-vision.jpg',
    imageUrls: ['/images/banners/night-vision.jpg'],
    inStock: true,
    stockQuantity: 2,
    productType: 'housing',
    specifications: {
      VariantGroup: 'chimera-housing',
      VariantLabel: 'Magnesium|מגנזיום',
    },
  },
  {
    id: 18,
    name: 'Nocturn Chimera Housing',
    nameHebrew: 'גוף Chimera',
    description: 'Articulating panoramic housing in aluminum.',
    descriptionHebrew: 'גוף פנורמי מפרקי מאלומיניום.',
    sku: 'CHIM-AL',
    price: 14800,
    thumbnailUrl: '/images/products/pvs-31.jpg',
    imageUrls: ['/images/products/pvs-31.jpg'],
    inStock: true,
    stockQuantity: 4,
    productType: 'housing',
    specifications: {
      VariantGroup: 'chimera-housing',
      VariantLabel: 'Aluminum|אלומיניום',
    },
  },
  {
    id: 20,
    name: 'Nocturn Chimera Housing — Polymer',
    nameHebrew: 'גוף Chimera — פולימר',
    description: 'Panoramic housing in reinforced polymer.',
    descriptionHebrew: 'גוף פנורמי מפולימר מחוזק.',
    sku: 'CHIM-PL',
    price: 12900,
    thumbnailUrl: '/images/banners/night-vision.jpg',
    imageUrls: ['/images/banners/night-vision.jpg'],
    inStock: true,
    stockQuantity: 6,
    productType: 'housing',
    specifications: {
      VariantGroup: 'chimera-housing',
      VariantLabel: 'Polymer|פולימר',
    },
  },
  {
    id: 36,
    name: 'Wilcox L4 G24 Helmet Mount',
    nameHebrew: 'מתקן קסדה Wilcox L4 G24',
    description: 'Helmet mounting interface.',
    descriptionHebrew: 'ממשק חיבור לקסדה.',
    sku: 'G24',
    price: 3400,
    thumbnailUrl: '/images/products/pvs-14.jpg',
    imageUrls: ['/images/products/pvs-14.jpg'],
    inStock: false,
    stockQuantity: 0,
    productType: 'accessories',
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
    const unexpectedErrors = page.__allowCatalogFailure
      ? errors.filter((message) => (
        !message.includes('500 (Internal Server Error)')
        && !message.includes('Products request failed with 500')
      ))
      : errors;
    expect(unexpectedErrors, 'The catalog emitted browser runtime errors').toEqual([]);
  }, { auto: true }],
});

async function mockCatalogApi(page, { failProductsOnce = false } = {}) {
  const addRequests = [];
  let productsFailed = false;

  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (url.pathname === '/api/products') {
      if (failProductsOnce && !productsFailed) {
        productsFailed = true;
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'temporary failure' }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(products),
      });
      return;
    }

    if (url.pathname.includes('/items') && request.method() === 'POST') {
      addRequests.push(request.postDataJSON());
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '[]',
    });
  });

  return addRequests;
}

async function visitCatalog(page, path = '/products', viewport = { width: 1680, height: 1000 }) {
  await page.setViewportSize(viewport);
  await page.goto(path);
  await expect(page.locator('#catalog-title')).toBeVisible();
  await expect(page.locator('.catalog-card, .catalog-state').first()).toBeVisible();
}

async function switchToEnglish(page) {
  const html = page.locator('html');
  if (await html.getAttribute('lang') !== 'en') {
    await page.getByTestId('language-toggle').click();
  }
  await expect(html).toHaveAttribute('lang', 'en');
  await expect(html).toHaveAttribute('dir', 'ltr');
}

async function expectNoHorizontalOverflow(page) {
  await expect.poll(() => page.evaluate(() => (
    Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)
  ))).toBeLessThanOrEqual(1);
}

test.describe('premium catalog reimplementation', () => {
  test('keeps the generated category hero below the lightweight image budget', async () => {
    const hero = await stat(catalogHeroPath);
    expect(hero.size).toBeLessThanOrEqual(100_000);
  });

  test('matches the reference hierarchy and reaches four real columns on wide screens', async ({ page }) => {
    await mockCatalogApi(page);
    await visitCatalog(page);
    await switchToEnglish(page);

    await expect(page.locator('.catalog-hero__image')).toHaveAttribute(
      'src',
      '/images/banners/catalog-night-ops.webp',
    );
    await expect(page.locator('.catalog-breadcrumb')).toBeVisible();
    await expect(page.locator('.catalog-capabilities li')).toHaveCount(5);
    await expect(page.locator('.catalog-sidebar')).toBeVisible();
    await expect(page.locator('.catalog-toolbar')).toBeVisible();
    await expect(page.getByTestId('catalog-product-card')).toHaveCount(5);

    const gridColumns = await page.locator('.catalog-product-grid--grid').evaluate((element) => (
      getComputedStyle(element).gridTemplateColumns.split(' ').length
    ));
    expect(gridColumns).toBe(4);
    await expectNoHorizontalOverflow(page);
  });

  test('groups variants deterministically and requires configuration', async ({ page }) => {
    await mockCatalogApi(page);
    await visitCatalog(page, '/products?category=housing');
    await switchToEnglish(page);

    const card = page.getByTestId('catalog-product-card');
    await expect(card).toHaveCount(1);
    await expect(card).toContainText('3 variants');
    await expect(card).toContainText('Starting at');
    await expect(card).toContainText('12,900');
    await expect(card.getByRole('link', { name: 'Configure' })).toHaveAttribute(
      'href',
      '/products/18',
    );
    await expect(card.getByRole('button', { name: 'Add to cart' })).toHaveCount(0);
  });

  test('keeps filters, sorting and view state in the URL across reloads', async ({ page }) => {
    await mockCatalogApi(page);
    await visitCatalog(page, '/products?category=intensifier&gen=2-plus&sort=price-asc&view=list');
    await switchToEnglish(page);

    await expect(page.getByTestId('catalog-product-card')).toHaveCount(1);
    await expect(page.getByTestId('catalog-product-card')).toContainText('Photonis 4G');
    await expect(page.locator('.catalog-product-grid--list')).toBeVisible();
    await expect(page.locator('.catalog-sort select')).toHaveValue('price-asc');

    await page.reload();
    await expect(page.locator('.catalog-product-grid--list')).toBeVisible();
    await expect(
      page.locator('.catalog-sidebar input[type="checkbox"]:checked'),
    ).toHaveCount(1);
    await switchToEnglish(page);

    await page.getByRole('button', { name: 'Grid view' }).click();
    await expect(page).not.toHaveURL(/view=list/);
    await expect(page.locator('.catalog-product-grid--grid')).toBeVisible();
  });

  test('uses the real cart contract and prevents unavailable purchases', async ({ page }) => {
    const addRequests = await mockCatalogApi(page);
    await visitCatalog(page, '/products?category=monocular');
    await switchToEnglish(page);

    await page.getByRole('button', { name: 'Add to cart' }).click();
    await expect.poll(() => addRequests.length).toBe(1);
    expect(addRequests[0]).toEqual({ productId: 2, quantity: 1 });

    await page.goto('/products?category=accessories');
    await switchToEnglish(page);
    await expect(page.getByTestId('catalog-product-card')).toContainText('Out of stock');
    await expect(page.getByRole('button', { name: 'Add to cart' })).toBeDisabled();
  });

  test('opens the filter sheet from the physical start edge in both directions', async ({ page }) => {
    await mockCatalogApi(page);
    await visitCatalog(page, '/products', { width: 390, height: 844 });

    const opener = page.getByTestId('catalog-filter-open');
    const drawer = page.getByTestId('catalog-filter-drawer');

    await opener.click();
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveCSS('direction', 'rtl');
    await expect.poll(async () => {
      const box = await drawer.boundingBox();
      return Math.abs(390 - ((box?.x || 0) + (box?.width || 0)));
    }).toBeLessThanOrEqual(1);

    await page.getByTestId('catalog-filter-close').click();
    await switchToEnglish(page);
    await opener.click();
    await expect(drawer).toHaveCSS('direction', 'ltr');
    await expect.poll(async () => Math.abs((await drawer.boundingBox())?.x || 0))
      .toBeLessThanOrEqual(1);
    await expectNoHorizontalOverflow(page);
  });

  test('shows a deliberate panoramic state instead of a broken blank grid', async ({ page }) => {
    await mockCatalogApi(page);
    await visitCatalog(page, '/products?category=panoramic');
    await switchToEnglish(page);

    await expect(page.getByRole('heading', {
      name: 'Panoramic systems have not been published in the catalog yet.',
    })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Talk to us' })).toHaveAttribute(
      'href',
      '/contact',
    );
  });

  test('surfaces a retryable error and recovers without reporting zero results', async ({ page }) => {
    page.__allowCatalogFailure = true;
    await mockCatalogApi(page, { failProductsOnce: true });
    await page.setViewportSize({ width: 1200, height: 844 });
    await page.goto('/products');

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.locator('.catalog-toolbar__summary')).toContainText(
      /אינו זמין|unavailable/i,
    );
    await page.getByRole('button', { name: /נסו שוב|Retry/ }).click();
    await expect(page.getByTestId('catalog-product-card')).toHaveCount(5);
  });
});
