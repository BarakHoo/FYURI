import { expect, test } from '@playwright/test';

const product = {
  id: 42,
  sku: 'PVS-14-TEST',
  name: 'PVS-14 Test Unit',
  nameHebrew: 'יחידת בדיקה PVS-14',
  productType: 'monocular',
  price: 3200,
  inStock: true,
  stockQuantity: 2,
  isActive: true,
  imageUrls: [],
  specifications: {},
};

const cartItem = (quantity = 1) => ({
  id: 7,
  sessionId: 'test-session',
  productId: product.id,
  product,
  quantity,
  priceAtAddTime: product.price,
});

async function changeRouteWithoutRemount(page, target) {
  await page.evaluate((url) => {
    window.history.pushState({}, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, target);
}

test.describe('commerce reliability', () => {
  test('shows a recoverable cart load error instead of an empty cart', async ({ page }) => {
    let cartRequests = 0;
    await page.route('**/api/**', (route) => {
      const request = route.request();
      const pathname = new URL(request.url()).pathname;
      if (request.method() === 'GET' && /^\/api\/cart\/[^/]+$/.test(pathname)) {
        cartRequests += 1;
        return route.fulfill({
          status: cartRequests === 1 ? 503 : 200,
          contentType: 'application/json',
          body: cartRequests === 1 ? '"unavailable"' : '[]',
        });
      }

      return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await page.goto('/cart');
    await expect(page.getByRole('heading', { name: 'We could not load your cart.' })).toBeVisible();
    await page.getByRole('button', { name: 'Retry' }).click();
    await expect(page.getByRole('heading', { name: 'Your cart is empty' })).toBeVisible();
    expect(cartRequests).toBe(2);
  });

  test('locks quantity controls, reports a failed mutation, and retries at the stock cap', async ({ page }) => {
    let quantity = 1;
    let updateRequests = 0;
    let releaseFirstUpdate;
    const firstUpdateGate = new Promise((resolve) => {
      releaseFirstUpdate = resolve;
    });

    await page.route('**/api/**', async (route) => {
      const request = route.request();
      const pathname = new URL(request.url()).pathname;

      if (request.method() === 'GET' && /^\/api\/cart\/[^/]+$/.test(pathname)) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([cartItem(quantity)]),
        });
      }

      if (request.method() === 'PUT' && /\/api\/cart\/[^/]+\/items\/7$/.test(pathname)) {
        updateRequests += 1;
        if (updateRequests === 1) {
          await firstUpdateGate;
          return route.fulfill({
            status: 409,
            contentType: 'application/json',
            body: '"stock changed"',
          });
        }

        quantity = request.postDataJSON().quantity;
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(cartItem(quantity)),
        });
      }

      if (request.method() === 'GET' && pathname === '/api/products/42') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(product),
        });
      }

      return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await page.goto('/cart');
    const increase = page.getByRole('button', { name: 'Increase quantity of PVS-14 Test Unit' });
    await expect(increase).toBeEnabled();
    await increase.click();
    await expect(increase).toBeDisabled();
    await expect(page.getByLabel('Updating cart')).toBeVisible();

    releaseFirstUpdate();
    await expect(page.getByText(
      'The quantity could not be updated. Available stock may have changed.',
    )).toBeVisible();

    await page.getByRole('button', { name: 'Retry' }).click();
    await expect(page.getByText(
      'The quantity could not be updated. Available stock may have changed.',
    )).toBeHidden();
    await expect(increase).toBeDisabled();
    expect(updateRequests).toBe(2);
    expect(quantity).toBe(2);
  });

  test('checkout waits for cart hydration and exposes a retryable cart error', async ({ page }) => {
    let cartRequests = 0;
    let releaseSecondRequest;
    const hydrationGate = new Promise((resolve) => {
      releaseSecondRequest = resolve;
    });

    await page.route('**/api/**', async (route) => {
      const request = route.request();
      const pathname = new URL(request.url()).pathname;

      if (request.method() === 'GET' && /^\/api\/cart\/[^/]+$/.test(pathname)) {
        cartRequests += 1;
        if (cartRequests === 1) {
          return route.fulfill({
            status: 503,
            contentType: 'application/json',
            body: '"unavailable"',
          });
        }

        await hydrationGate;
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([cartItem()]),
        });
      }

      if (request.method() === 'GET' && pathname === '/api/products/42') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(product),
        });
      }

      return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await page.goto('/checkout');
    await expect(page.getByRole('heading', { name: 'We could not verify your cart.' })).toBeVisible();
    const retry = page.getByRole('button', { name: 'Retry' });
    await retry.click();
    await expect(page.getByRole('heading', { name: 'Loading your order details…' })).toBeVisible();
    await expect(page).toHaveURL(/\/checkout$/);

    releaseSecondRequest();
    await expect(page.getByRole('heading', { name: 'Customer Information' })).toBeVisible();
    await expect(page).toHaveURL(/\/checkout$/);
  });

  test('updates contact context and language only until the message is edited', async ({ page }) => {
    await page.route('**/api/**', (route) => {
      const pathname = new URL(route.request().url()).pathname;
      if (/^\/api\/cart\/[^/]+$/.test(pathname)) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.goto('/contact?product=PVS-14');
    const message = page.getByLabel('Message');
    await expect(message).toHaveValue(
      'I would like expert guidance about PVS-14. My question is:',
    );

    await changeRouteWithoutRemount(page, '/contact?service=lab');
    await expect(message).toHaveValue(
      'I would like to request lab service for a night-vision device. Device and issue details:',
    );

    await page.getByTestId('language-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'he');
    await expect(page.getByLabel('הודעה')).toHaveValue(
      'אני מעוניין/ת בשירות מעבדה עבור מכשיר ראיית לילה. פרטי המכשיר והתקלה:',
    );

    const hebrewMessage = page.getByLabel('הודעה');
    await hebrewMessage.fill('Keep this operator-authored message.');
    await changeRouteWithoutRemount(page, '/contact?product=PVS-7');
    await expect(hebrewMessage).toHaveValue('Keep this operator-authored message.');
  });
});
