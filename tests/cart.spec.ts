import { expect, test } from '@playwright/test';
import { attachScreenshot, BACKPACK_NAME, backpackOnPage, openCatalog } from './swag-labs';

test.describe('RT-04 | Carrinho', () => {
  const catalogRemovalCases = [
    { id: 'CT-06-CAT-STD', username: 'standard_user', tag: [] },
    { id: 'CT-06-CAT-PROB', username: 'problem_user', tag: ['@diagnostico'] },
  ];

  for (const { id, username, tag } of catalogRemovalCases) {
    test(`${id} | remove o último item pelo catálogo`, { tag }, async ({ page }, testInfo) => {
      await openCatalog(page, username);
      const backpack = backpackOnPage(page);
      const cartBadge = page.getByTestId('shopping-cart-badge');
      const addButton = backpack.getByRole('button', { name: 'Add to cart', exact: true });
      const removeButton = backpack.getByRole('button', { name: 'Remove', exact: true });

      await addButton.click();
      await expect(cartBadge).toHaveText('1');
      await expect(removeButton).toBeVisible();

      await removeButton.click();
      await attachScreenshot(page, testInfo, `${id}-apos-remover`);
      await expect.soft(backpack.getByRole('button')).toHaveText('Add to cart');
      await expect.soft(cartBadge).toHaveCount(0);

      await page.getByTestId('shopping-cart-link').click();
      await expect(page).toHaveURL('/cart.html');
      await expect(page.getByTestId('title')).toHaveText('Your Cart');
      await attachScreenshot(page, testInfo, `${id}-estado-do-carrinho`);
      await expect(page.getByTestId('cart-list').getByTestId('inventory-item')).toHaveCount(0);
    });
  }

  test('CT-06-CAR-STD | remove o último item pelo carrinho', async ({ page }, testInfo) => {
    await openCatalog(page);
    const cartBadge = page.getByTestId('shopping-cart-badge');

    await backpackOnPage(page).getByRole('button', { name: 'Add to cart', exact: true }).click();
    await expect(cartBadge).toHaveText('1');
    await page.getByTestId('shopping-cart-link').click();
    await expect(page).toHaveURL('/cart.html');
    await expect(page.getByTestId('title')).toHaveText('Your Cart');

    const cartItems = page.getByTestId('cart-list').getByTestId('inventory-item');
    await expect(cartItems.getByTestId('inventory-item-name')).toHaveText([BACKPACK_NAME]);
    await backpackOnPage(page).getByRole('button', { name: 'Remove', exact: true }).click();
    await expect(cartItems).toHaveCount(0);
    await expect(cartBadge).toHaveCount(0);
    await attachScreenshot(page, testInfo, 'CT-06-CAR-STD-carrinho-vazio');

    await page.getByTestId('continue-shopping').click();
    await expect(page).toHaveURL('/inventory.html');
    await expect(backpackOnPage(page).getByRole('button', { name: 'Add to cart', exact: true })).toBeVisible();
  });
});
