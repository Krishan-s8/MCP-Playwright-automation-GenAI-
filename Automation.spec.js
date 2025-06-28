const { test, expect } = require('@playwright/test');

test('Valid login and purchase', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');
  await expect(page).toHaveURL(/inventory/);

  // Add all products to cart
  const addButtons = await page.$$('.inventory_item button');
  for (const btn of addButtons) {
    await btn.click();
    await page.waitForTimeout(1000); // Short wait to see the click
  }

  await page.click('.shopping_cart_link');
  await page.waitForTimeout(1000);

  await page.click('[data-test="checkout"]');
  await page.waitForTimeout(1000);

  await page.fill('[data-test="firstName"]', 'John');
  await page.fill('[data-test="lastName"]', 'Doe');
  await page.fill('[data-test="postalCode"]', '12345');
  await page.click('[data-test="continue"]');
  await page.waitForTimeout(1000);

  await page.click('[data-test="finish"]');
  await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
});

test('Invalid login shows error', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.fill('#user-name', 'invalid_user');
  await page.fill('#password', 'wrong_password');
  await page.click('#login-button');
  await expect(page.locator('[data-test="error"]')).toBeVisible();
});

test('Locked out user cannot login', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.fill('#user-name', 'locked_out_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');
  await expect(page.locator('[data-test="error"]')).toBeVisible();
});

test('Add and remove items from cart', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');
  await expect(page).toHaveURL(/inventory/);

  // Add first item
  await page.click('.inventory_item button');
  await page.waitForTimeout(1000);

  await page.click('.shopping_cart_link');
  await expect(page.locator('.cart_item')).toHaveCount(1);

  // Remove item
  await page.click('[data-test^="remove"]');
  await expect(page.locator('.cart_item')).toHaveCount(0);
});

test('Checkout with missing info shows error', async ({ page }) => {
  try {
    await page.goto('https://www.saucedemo.com/');
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');
    await page.click('.shopping_cart_link');
    await page.click('[data-test="checkout"]');

    // Leave first name blank
    await page.fill('[data-test="lastName"]', 'Doe');
    await page.fill('[data-test="postalCode"]', '12345');
    await page.click('[data-test="continue"]');
    await expect(page.locator('[data-test="error"]')).toBeVisible();
    console.log('Test passed: Error message is visible');
  } catch (error) {
    console.log('Test failed:', error.message);
    throw error;
  }
});

test('Logout works', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');
  await page.click('#react-burger-menu-btn');
  await page.waitForTimeout(1000);
  await page.click('#logout_sidebar_link');
  await expect(page).toHaveURL('https://www.saucedemo.com/');
});

test('Sort products', async ({ page }) => {
  test.setTimeout(90000); // 90 seconds timeout for this test
  try {
    await page.goto('https://www.saucedemo.com/');
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');
    await expect(page.locator('.inventory_item').first()).toBeVisible();
    await expect(page.locator('.product_sort_container')).toBeVisible();

    await page.selectOption('.product_sort_container', 'za');
    await page.waitForTimeout(1000);
    await page.selectOption('.product_sort_container', 'lohi');
    await page.waitForTimeout(1000);
    await page.selectOption('.product_sort_container', 'hilo');
    await page.waitForTimeout(1000);

    console.log('Test passed: Sorting options executed');
  } catch (error) {
    console.log('Test failed:', error.message);
    throw error;
  }
});

test('Product page loads all products', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');
  await expect(page).toHaveURL(/inventory/);

  // Check if all products are loaded
  await expect(page.locator('.inventory_item')).toHaveCount(6);
  console.log('All products loaded');
});