import { expect, test } from '@playwright/test';

const mobileViewport = { width: 390, height: 844 };
const belowLgViewport = { width: 1199, height: 844 };
const desktopViewport = { width: 1200, height: 844 };

const productsName = /Products|מוצרים/i;

async function visitPublicPage(page, viewport, path = '/about') {
  await page.setViewportSize(viewport);
  await page.route('**/api/**', (route) => (
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '[]',
    })
  ));
  await page.goto(path);
}

async function expectNoHorizontalOverflow(page) {
  await expect.poll(() => page.evaluate(() => {
    const root = document.documentElement;
    return Math.max(0, root.scrollWidth - root.clientWidth);
  })).toBeLessThanOrEqual(1);
}

async function expectDrawerAtEdge(page, drawer, edge) {
  await expect.poll(async () => {
    const box = await drawer.boundingBox();
    const viewport = page.viewportSize();

    if (!box || !viewport) {
      return Number.POSITIVE_INFINITY;
    }

    const gap = edge === 'right'
      ? viewport.width - (box.x + box.width)
      : box.x;

    return Math.abs(gap);
  }).toBeLessThanOrEqual(1);
}

test.describe('responsive site navigation', () => {
  test('mobile drawer has an accessible lifecycle and restores focus and scroll', async ({ page }) => {
    await visitPublicPage(page, mobileViewport);

    const body = page.locator('body');
    const menuButton = page.getByTestId('mobile-menu-button');
    const drawer = page.getByTestId('mobile-nav-paper');
    const closeButton = page.getByTestId('mobile-nav-close');
    const initialBodyOverflow = await body.evaluate((element) => element.style.overflow);

    await expect(menuButton).toBeVisible();
    await expect(menuButton).toHaveAccessibleName(/.+/);
    await expect(menuButton).toHaveAttribute('aria-controls', 'mobile-site-navigation');
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect(menuButton).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(drawer).toBeHidden();

    await menuButton.click();

    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveAttribute('id', 'mobile-site-navigation');
    await expect(drawer).toHaveAttribute('role', 'dialog');
    await expect(drawer).toHaveAttribute('aria-modal', 'true');
    await expect(drawer).toHaveAccessibleName(/.+/);
    await expect(drawer.getByRole('navigation')).toBeVisible();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    await expect(closeButton).toHaveAccessibleName(/.+/);
    await expect(closeButton).toBeFocused();
    await expect(body).toHaveCSS('overflow', 'hidden');

    const drawerLogo = drawer.getByTestId('fyuri-logo');
    await expect(drawerLogo).toHaveAttribute('src', '/brand/fyuri-lockup-on-dark.svg');
    await drawer.getByRole('button', { name: /מצב בהיר|Light mode/i }).click();
    await expect(drawerLogo).toHaveAttribute('src', '/brand/fyuri-lockup-on-light.svg');

    await closeButton.click();

    await expect(drawer).toBeHidden();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect(menuButton).toBeFocused();
    await expect.poll(() => body.evaluate((element) => element.style.overflow))
      .toBe(initialBodyOverflow);

    await menuButton.click();
    await expect(closeButton).toBeFocused();
    await page.keyboard.press('Escape');

    await expect(drawer).toBeHidden();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect(menuButton).toBeFocused();
    await expect.poll(() => body.evaluate((element) => element.style.overflow))
      .toBe(initialBodyOverflow);
    await expectNoHorizontalOverflow(page);
  });

  test('mobile route and product-category links close the drawer', async ({ page }) => {
    await visitPublicPage(page, mobileViewport);

    const menuButton = page.getByTestId('mobile-menu-button');
    const drawer = page.getByTestId('mobile-nav-paper');

    await menuButton.click();
    await drawer.locator('a[href="/contact"]').click();

    await expect(page).toHaveURL(/\/contact$/);
    await expect(drawer).toBeHidden();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    await menuButton.click();

    const productsDisclosure = drawer.getByRole('button', { name: productsName });
    await expect(productsDisclosure).toHaveAttribute('aria-expanded', 'false');
    await productsDisclosure.click();
    await expect(productsDisclosure).toHaveAttribute('aria-expanded', 'true');

    await drawer.locator('a[href="/products?category=monocular"]').click();

    await expect(page).toHaveURL(/\/products\?category=monocular$/);
    await expect(drawer).toBeHidden();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await expectNoHorizontalOverflow(page);
  });

  test('mobile catalog search closes the drawer and preserves the query in the URL', async ({ page }) => {
    await visitPublicPage(page, mobileViewport);

    const menuButton = page.getByTestId('mobile-menu-button');
    const drawer = page.getByTestId('mobile-nav-paper');

    await menuButton.click();
    await drawer.getByRole('textbox', { name: 'Search products' }).fill('pvs 14 pro');
    await drawer.getByRole('button', { name: 'Search' }).click();

    await expect(page).toHaveURL(/\/products\?q=pvs\+14\+pro$/);
    await expect(drawer).toBeHidden();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await expectNoHorizontalOverflow(page);
  });

  test('history navigation cannot resurrect a previously open drawer', async ({ page }) => {
    await visitPublicPage(page, mobileViewport, '/contact');

    const menuButton = page.getByTestId('mobile-menu-button');

    await menuButton.click();
    await page.getByTestId('mobile-nav-paper').locator('a[href="/about"]').click();
    await expect(page).toHaveURL(/\/about$/);

    await menuButton.click();
    await expect(page.getByTestId('mobile-nav-paper')).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.getByTestId('mobile-nav-paper')).toBeHidden();

    await page.goForward();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByTestId('mobile-nav-paper')).toBeHidden();
    await expect(page.getByTestId('mobile-menu-button')).toHaveAttribute('aria-expanded', 'false');
  });

  test('mobile drawer follows the physical start edge in English and Hebrew', async ({ page }) => {
    await visitPublicPage(page, mobileViewport);

    const root = page.locator('html');
    const menuButton = page.getByTestId('mobile-menu-button');
    const drawer = page.getByTestId('mobile-nav-paper');

    await expect(root).toHaveAttribute('lang', 'en');
    await expect(root).toHaveAttribute('dir', 'ltr');

    await menuButton.click();
    await expect(drawer).toHaveCSS('direction', 'ltr');
    await expectDrawerAtEdge(page, drawer, 'left');
    expect(await drawer.evaluate((element) => element.getBoundingClientRect().width))
      .toBeLessThan(mobileViewport.width);
    await page.getByTestId('mobile-nav-close').click();

    await page.getByTestId('language-toggle').click();
    await expect(root).toHaveAttribute('lang', 'he');
    await expect(root).toHaveAttribute('dir', 'rtl');

    await menuButton.click();
    await expect(drawer).toHaveCSS('direction', 'rtl');
    await expectDrawerAtEdge(page, drawer, 'right');
    await expectNoHorizontalOverflow(page);
  });

  test('the mobile/desktop boundary is the lg breakpoint', async ({ page }) => {
    await visitPublicPage(page, belowLgViewport);

    const body = page.locator('body');
    const menuButton = page.getByTestId('mobile-menu-button');
    const drawer = page.getByTestId('mobile-nav-paper');
    const desktopNav = page.getByTestId('desktop-nav');
    const desktopProductsButton = page.getByTestId('desktop-products-button');
    const logoLink = page.getByTestId('site-logo-link');
    const initialBodyOverflow = await body.evaluate((element) => element.style.overflow);

    await expect(menuButton).toBeVisible();
    await expect(desktopNav).toBeHidden();
    await expect(desktopProductsButton).toBeHidden();

    await menuButton.click();
    await expect(drawer).toBeVisible();
    await expect(body).toHaveCSS('overflow', 'hidden');

    await page.setViewportSize(desktopViewport);

    await expect(menuButton).toBeHidden();
    await expect(drawer).toBeHidden();
    await expect(desktopNav).toBeVisible();
    await expect(desktopProductsButton).toBeVisible();
    await expect(logoLink).toBeFocused();
    await expect.poll(() => body.evaluate((element) => element.style.overflow))
      .toBe(initialBodyOverflow);
    await expectNoHorizontalOverflow(page);

    await desktopProductsButton.click();
    await expect(desktopProductsButton).toHaveAttribute('aria-expanded', 'true');

    await page.setViewportSize(belowLgViewport);

    await expect(menuButton).toBeVisible();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect(drawer).toBeHidden();
    await expect(desktopNav).toBeHidden();
    await expect(logoLink).toBeFocused();
    await expect.poll(() => body.evaluate((element) => element.style.overflow))
      .toBe(initialBodyOverflow);
    await expectNoHorizontalOverflow(page);
  });

  test('desktop Products supports click, Escape, focus restoration, and category navigation', async ({ page }) => {
    await visitPublicPage(page, desktopViewport);

    const desktopNav = page.getByTestId('desktop-nav');
    const productsButton = page.getByTestId('desktop-products-button');
    const categoryLink = page.locator(
      '#desktop-products-navigation a[href="/products?category=monocular"]',
    );

    await expect(desktopNav).toBeVisible();
    await expect(desktopNav).toHaveRole('navigation');
    await expect(productsButton).toBeVisible();
    await expect(productsButton).toHaveAccessibleName(productsName);
    await expect(productsButton).toHaveAttribute('aria-expanded', 'false');

    await productsButton.click();

    await expect(productsButton).toHaveAttribute('aria-expanded', 'true');
    await expect(categoryLink).toBeVisible();
    await page.keyboard.press('Escape');

    await expect(productsButton).toHaveAttribute('aria-expanded', 'false');
    await expect(categoryLink).toBeHidden();
    await expect(productsButton).toBeFocused();

    await productsButton.click();
    await categoryLink.click();

    await expect(page).toHaveURL(/\/products\?category=monocular$/);
    await expect(productsButton).toHaveAttribute('aria-expanded', 'false');
    await expect(categoryLink).toBeHidden();
    await expectNoHorizontalOverflow(page);
  });

  test('catalog desktop header localizes and exposes working search, support, and cart controls', async ({ page }) => {
    await visitPublicPage(page, { width: 1680, height: 944 }, '/products');

    const root = page.locator('html');
    const productsButton = page.getByTestId('desktop-products-button');
    const languageButton = page.getByTestId('language-toggle');
    const searchButton = page.getByTestId('catalog-search-button');
    const supportLink = page.getByTestId('catalog-support-link');
    const cartLink = page.locator('header a[href="/cart"]');
    const referenceHeader = page.locator('header.MuiPaper-root');

    await expect(root).toHaveAttribute('lang', 'en');
    await expect(root).toHaveAttribute('dir', 'ltr');
    await expect(referenceHeader).toHaveAttribute('dir', 'ltr');
    await expect(
      page.locator('.catalog-reference-topbar').getByText('Expert Support'),
    ).toBeVisible();
    await expect(productsButton).toHaveAccessibleName('PRODUCTS');
    await expect(languageButton).toBeVisible();
    await expect(languageButton).toHaveAccessibleName('Switch to Hebrew');
    await expect(searchButton).toHaveAccessibleName('Search catalog');
    await expect(supportLink).toHaveAccessibleName('Customer support and contact');
    await expect(cartLink).toHaveAccessibleName('Cart, 0 items');

    await productsButton.click();
    await expect(productsButton).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(productsButton).toHaveAttribute('aria-expanded', 'false');
    await languageButton.click();

    await expect(root).toHaveAttribute('lang', 'he');
    await expect(root).toHaveAttribute('dir', 'rtl');
    await expect(referenceHeader).toHaveAttribute('dir', 'rtl');
    await expect(productsButton).toHaveAccessibleName('מוצרים');
    await expect(
      page.locator('.catalog-reference-topbar').getByText('תמיכה מקצועית'),
    ).toBeVisible();
    await expect(languageButton).toHaveAccessibleName('החלף לאנגלית');
    await expect(searchButton).toHaveAccessibleName('חיפוש בקטלוג');
    await expect(supportLink).toHaveAccessibleName('שירות לקוחות וצור קשר');
    await expect(cartLink).toHaveAccessibleName('סל קניות, 0 פריטים');

    await languageButton.click();
    await expect(root).toHaveAttribute('lang', 'en');
    await expect(root).toHaveAttribute('dir', 'ltr');

    await searchButton.click();
    const searchDialog = page.getByRole('dialog', { name: 'Product search' });
    await expect(searchDialog).toBeVisible();
    await expect(searchButton).toHaveAttribute('aria-expanded', 'true');
    await searchDialog.getByRole('textbox', { name: 'Search products' }).fill('pvs 14 pro');
    await searchDialog.getByRole('button', { name: 'Search' }).click();

    await expect(page).toHaveURL(/\/products\?q=pvs\+14\+pro$/);
    await expect(page.getByRole('dialog', { name: 'Product search' })).toBeHidden();

    await supportLink.click();
    await expect(page).toHaveURL(/\/contact$/);
    await expectNoHorizontalOverflow(page);
  });

  test('desktop Products remains scrollable on short viewports', async ({ page }) => {
    await visitPublicPage(page, { width: 1200, height: 500 });

    await page.getByTestId('desktop-products-button').click();

    const popoverPaper = page.locator('#desktop-products-navigation .MuiPopover-paper');
    const lastCategoryLink = popoverPaper.locator('a[href="/products?category=accessories"]');

    await expect(popoverPaper).toBeVisible();
    await expect.poll(() => popoverPaper.evaluate((element) => (
      element.scrollHeight > element.clientHeight
    ))).toBe(true);

    await lastCategoryLink.scrollIntoViewIfNeeded();
    await expect(lastCategoryLink).toBeInViewport();
  });

  test('desktop contact strip slides away while the main navigation stays pinned', async ({ page }) => {
    await visitPublicPage(page, desktopViewport, '/');

    const contactStrip = page.getByTestId('contact-strip');
    const navbar = page.locator('header').first();

    await expect(contactStrip).toHaveCSS('height', '38px');
    await expect.poll(async () => (await navbar.boundingBox())?.y).toBe(38);

    await page.evaluate(() => window.scrollTo(0, 200));

    await expect(contactStrip).toHaveCSS('height', '0px');
    await expect(contactStrip).toHaveAttribute('aria-hidden', 'true');
    await expect.poll(async () => Math.abs((await navbar.boundingBox())?.y ?? 999))
      .toBeLessThanOrEqual(1);

    await page.evaluate(() => window.scrollTo(0, 0));

    await expect(contactStrip).toHaveCSS('height', '38px');
    await expect(contactStrip).not.toHaveAttribute('aria-hidden', 'true');
    await expect.poll(async () => (await navbar.boundingBox())?.y).toBe(38);
  });
});
