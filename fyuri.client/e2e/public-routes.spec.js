import { expect, test } from '@playwright/test';

const desktopViewport = { width: 1200, height: 844 };
const mobileViewport = { width: 390, height: 844 };

const product = {
  id: 42,
  sku: 'PVS-14-TEST',
  name: 'PVS-14 Test Unit',
  nameHebrew: 'יחידת בדיקה PVS-14',
  description: 'A deterministic product used by the public-route regression test.',
  descriptionHebrew: 'מוצר קבוע לבדיקת מסלולי האתר.',
  productType: 'monocular',
  price: 3200,
  generation: 'Gen 3',
  tubeType: 'White Phosphor',
  inStock: true,
  stockQuantity: 2,
  isActive: true,
  thumbnailUrl: null,
  imageUrls: [],
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

async function expectNoHorizontalOverflow(page) {
  await expect.poll(() => page.evaluate(() => {
    const root = document.documentElement;
    return Math.max(0, root.scrollWidth - root.clientWidth);
  })).toBeLessThanOrEqual(1);
}

test.describe('shared public routes', () => {
  test('uses the reference shell and renders a bilingual, responsive 404', async ({ page }) => {
    await mockBaseApis(page);
    await page.setViewportSize(desktopViewport);
    await page.goto('/route-that-does-not-exist');

    await expect(page.locator('.catalog-reference-topbar')).toBeVisible();
    await expect(page.getByTestId('site-logo-link').locator('img')).toHaveAttribute(
      'src',
      '/images/logos/fyuri-logo-transparent.png',
    );
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/');
    await expect(page.getByRole('link', { name: 'View catalog' })).toHaveAttribute(
      'href',
      '/products',
    );
    await expectNoHorizontalOverflow(page);

    await page.getByTestId('language-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'he');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { name: 'העמוד לא נמצא' })).toBeVisible();

    await page.setViewportSize(mobileViewport);
    await expect(page.getByTestId('mobile-menu-button')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('prefills Contact contexts and submits the service request', async ({ page }) => {
    let submittedMessage = null;

    await mockBaseApis(page);
    await page.route('**/api/contact', async (route) => {
      submittedMessage = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'saved' }),
      });
    });
    await page.setViewportSize(mobileViewport);

    await page.goto('/contact?product=PVS-14%20PRO');
    await expect(page.getByLabel('Message')).toHaveValue(
      'I would like expert guidance about PVS-14 PRO. My question is:',
    );
    await expect(page.getByRole('heading', { name: 'Ask about PVS-14 PRO' })).toBeVisible();

    await page.goto('/contact?service=lab');
    const message = page.getByLabel('Message');
    await expect(message).toHaveValue(
      'I would like to request lab service for a night-vision device. Device and issue details:',
    );

    await page.getByLabel('Full Name').fill('Test Operator');
    await page.getByLabel('Email').fill('operator@example.com');
    await message.fill('PVS-14 will not power on after a battery change.');
    await page.getByRole('button', { name: 'Send message' }).click();

    await expect(page.getByText('Your message was received and saved successfully.')).toBeVisible();
    expect(submittedMessage).toEqual({
      name: 'Test Operator',
      email: 'operator@example.com',
      phone: '',
      message: 'PVS-14 will not power on after a battery change.',
    });
    await expectNoHorizontalOverflow(page);
  });

  test('shows Product Detail loading, clamps stock, and posts the cart quantity', async ({ page }) => {
    let releaseProduct;
    let cartRequest = null;
    const productGate = new Promise((resolve) => {
      releaseProduct = resolve;
    });

    await mockBaseApis(page);
    await page.route('**/api/products/42', async (route) => {
      await productGate;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(product),
      });
    });
    await page.route('**/api/cart/*/items', async (route) => {
      cartRequest = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1 }),
      });
    });
    await page.setViewportSize(mobileViewport);
    await page.goto('/products/42', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Loading product details…' })).toBeVisible();
    releaseProduct();

    await expect(page.getByRole('heading', { name: product.name })).toBeVisible();
    const quantity = page.getByLabel('Quantity');
    await quantity.fill('99');
    await expect(quantity).toHaveValue('2');

    await page.getByRole('button', { name: 'Add to Cart' }).click();
    await expect.poll(() => cartRequest).toEqual({ productId: 42, quantity: 2 });
    await expectNoHorizontalOverflow(page);
  });

  test('renders the Product Detail not-found state for a missing product', async ({ page }) => {
    await mockBaseApis(page);
    await page.route('**/api/products/404', (route) => route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'missing' }),
    }));
    await page.setViewportSize(desktopViewport);
    await page.goto('/products/404');

    await expect(page.getByRole('heading', { name: 'Product not found.' })).toBeVisible();
    await expect(page.getByText('The product may have been removed or the link may be incorrect.'))
      .toBeVisible();
    await expect(page.getByRole('button', { name: 'Back to catalog' })).toBeVisible();
  });

  test('resets scroll after client-side route navigation', async ({ page }) => {
    await mockBaseApis(page);
    await page.setViewportSize({ width: 1200, height: 500 });
    await page.goto('/about');
    await expect(
      page.getByRole('heading', { name: 'Expertise you can trust in the dark.' }),
    ).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);

    await page.getByTestId('catalog-support-link').click();
    await expect(page).toHaveURL(/\/contact$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(1);
  });
});
