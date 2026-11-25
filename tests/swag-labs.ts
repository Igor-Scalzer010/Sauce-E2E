import { expect, type Page, type TestInfo } from '@playwright/test';

// Credenciais públicas exibidas na tela de login do Swag Labs.
export const DEMO_PASSWORD = 'secret_sauce';
export const BACKPACK_NAME = 'Sauce Labs Backpack';

export async function submitLogin(page: Page, username: string, password: string) {
  await page.goto('/');
  await page.getByTestId('username').fill(username);
  await page.getByTestId('password').fill(password);
  await page.getByTestId('login-button').click();
}

export async function openCatalog(page: Page, username = 'standard_user') {
  await submitLogin(page, username, DEMO_PASSWORD);
  await expect(page).toHaveURL('/inventory.html');
  await expect(page.getByTestId('title')).toHaveText('Products');
}

export function backpackOnPage(page: Page) {
  return page.getByTestId('inventory-item').filter({
    has: page.getByText(BACKPACK_NAME, { exact: true }),
  });
}

export async function attachScreenshot(page: Page, testInfo: TestInfo, name: string) {
  await testInfo.attach(name, {
    body: await page.screenshot({ animations: 'disabled' }),
    contentType: 'image/png',
  });
}
