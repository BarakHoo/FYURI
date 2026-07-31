import { expect, test } from '@playwright/test';

const mobileViewport = { width: 390, height: 844 };

const product = {
  id: 42,
  sku: 'PVS-14',
  name: 'PVS-14',
  nameHebrew: 'PVS-14',
  description: 'A compact professional night vision monocular.',
  descriptionHebrew: 'מכשיר ראיית לילה חד-עיני מקצועי וקומפקטי.',
  productType: 'monocular',
  price: 3200,
  generation: 'Gen 3',
  tubeType: 'White Phosphor',
  inStock: true,
  stockQuantity: 2,
  isActive: true,
  thumbnailUrl: '/images/products/pvs-14.jpg',
  imageUrls: [
    '/images/products/pvs-14.jpg',
    '/images/products/pvs-31.jpg',
  ],
  specifications: {
    Weight: '350 g',
    Waterproof: 'IP67',
  },
};

async function mockBaseApis(page) {
  await page.route('**/api/**', (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;

    if (request.method() === 'GET' && /^\/api\/cart\/[^/]+$/.test(pathname)) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '[]',
      });
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '[]',
    });
  });
}

async function mockProduct(page, value = product) {
  await page.route(`**/api/products/${value.id}`, (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(value),
  }));
}

test.describe('catalogue-style equipment pages', () => {
  test('renders curated art with the complete API gallery, specifications, and builder link', async ({ page }) => {
    await mockBaseApis(page);
    await mockProduct(page);
    await page.goto('/products/42');

    await expect(page.getByRole('heading', { name: 'PVS-14' })).toBeVisible();
    await expect(page.getByAltText('PVS-14')).toHaveAttribute(
      'src',
      '/images/catalog/pvs-14-reference.webp',
    );
    await expect(page.getByTestId('product-gallery-thumbnail')).toHaveCount(3);
    await expect(page.getByText('350 g')).toBeVisible();
    await expect(page.getByText('IP67')).toBeVisible();

    const configure = page.getByTestId('configure-product-detail');
    await expect(configure).toHaveAttribute('href', /\/builder\?.*preset=pvs-14/);
    await configure.click();
    await expect(page).toHaveURL(/\/builder\?.*preset=pvs-14/);
    await expect(page.getByText('Starting configuration: PVS-14')).toBeVisible();
  });

  test('replaces a mismatched backend placeholder with generated SKU art', async ({ page }) => {
    const barak = {
      ...product,
      id: 44,
      sku: 'BNVD-BARAK',
      name: 'BNVD - Barak',
      productType: 'binocular',
      thumbnailUrl: '/images/products/pvs-31.jpg',
      imageUrls: [],
    };
    await mockBaseApis(page);
    await mockProduct(page, barak);
    await page.goto('/products/44');

    await expect(page.getByAltText('BNVD - Barak')).toHaveAttribute(
      'src',
      '/images/catalog/products/bnvd-barak-v1.webp',
    );
    await expect(page.getByTestId('product-gallery-thumbnail')).toHaveCount(0);
  });

  test('does not offer an impossible quantity when tracked stock is zero', async ({ page }) => {
    const unavailableProduct = {
      ...product,
      id: 43,
      inStock: true,
      stockQuantity: 0,
    };
    await mockBaseApis(page);
    await mockProduct(page, unavailableProduct);
    await page.goto('/products/43');

    await expect(page.getByRole('button', { name: 'Out of stock' })).toBeDisabled();
    await expect(page.getByLabel('Quantity')).toHaveCount(0);
  });

  test('shows a persistent inline error when adding to the cart fails', async ({ page }) => {
    await mockBaseApis(page);
    await mockProduct(page);
    await page.route('**/api/cart/*/items', (route) => route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'failed' }),
    }));
    await page.goto('/products/42');

    await page.getByRole('button', { name: 'Add to Cart' }).click();
    await expect(
      page.getByRole('alert').filter({
        hasText: 'We could not add this product to the cart.',
      }),
    ).toBeVisible();
  });

  test('uses the lightweight blueprint first on mobile and exposes keyboard controls', async ({ page }) => {
    const modelRequests = [];
    page.on('request', (request) => {
      if (request.url().endsWith('.glb')) modelRequests.push(new URL(request.url()).pathname);
    });

    await mockBaseApis(page);
    await page.setViewportSize(mobileViewport);
    await page.goto('/builder');

    await expect(page.getByRole('button', { name: 'Blueprint view' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(modelRequests).toEqual([]);

    const stepRail = page.getByRole('navigation', { name: 'Device build steps' });
    await stepRail.getByRole('button', { name: /Housing \/ Chassis/ }).click();

    const configurationPanel = page.locator('.equipment-config-panel');
    const housingOption = configurationPanel.getByRole('button', {
      name: /PVS-14 Mil-Spec Housing/,
    });
    await housingOption.focus();
    await page.keyboard.press('Enter');
    await expect(housingOption).toHaveAttribute('aria-pressed', 'true');
    await expect(page).toHaveURL(/housing=housing-pvs14/);

    await expect(page.getByRole('button', { name: 'Close Housing / Chassis options' }))
      .toBeVisible();
    await page.getByRole('button', { name: 'Close Housing / Chassis options' }).click();
    await expect(housingOption).toHaveCount(0);

    await page.getByRole('button', { name: '3D view' }).click();
    await expect.poll(() => modelRequests).toContain('/models/monocular.glb');
    expect(modelRequests.some((path) => path.includes('binocular.glb'))).toBe(false);
    expect(modelRequests.some((path) => path.includes('panoramic.glb'))).toBe(false);
  });
});
