import { expect, test, type Page } from '@playwright/test';
import { attachScreenshot, BACKPACK_NAME, backpackOnPage, openCatalog } from './swag-labs';

async function openCheckout(page: Page, username = 'standard_user') {
  await openCatalog(page, username);
  const product = backpackOnPage(page);
  const price = await product.getByTestId('inventory-item-price').innerText();

  await product.getByRole('button', { name: 'Add to cart', exact: true }).click();
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
  await page.getByTestId('shopping-cart-link').click();
  await expect(page).toHaveURL('/cart.html');
  await expect(backpackOnPage(page).getByTestId('item-quantity')).toHaveText('1');
  await expect(backpackOnPage(page).getByTestId('inventory-item-price')).toHaveText(price);

  await page.getByTestId('checkout').click();
  await expect(page).toHaveURL('/checkout-step-one.html');
  await expect(page.getByTestId('title')).toHaveText('Checkout: Your Information');
  return price;
}

async function fillCheckoutInformation(page: Page) {
  await page.getByTestId('firstName').fill('Pessoa');
  await page.getByTestId('lastName').fill('Teste');
  await page.getByTestId('postalCode').fill('12345');
  await page.getByTestId('continue').click();

  await expect(page).toHaveURL('/checkout-step-two.html');
  await expect(page.getByTestId('title')).toHaveText('Checkout: Overview');
}

function centsFromPrice(text: string) {
  const amount = /\$(\d+)\.(\d{2})$/.exec(text.trim());
  if (!amount) {
    throw new Error(`Valor em dólares inesperado: ${text}`);
  }
  return Number(amount[1]) * 100 + Number(amount[2]);
}

test.describe('RT-07 | Conclusão e cancelamento da compra', () => {
  const finishCases = [
    { id: 'CT-11-STD', username: 'standard_user', tag: [] },
    { id: 'CT-11-ERR', username: 'error_user', tag: ['@diagnostico'] },
  ];

  for (const { id, username, tag } of finishCases) {
    test(`${id} | conclui a compra e esvazia o carrinho`, { tag }, async ({ page }, testInfo) => {
      const price = await openCheckout(page, username);
      await fillCheckoutInformation(page);

      const item = backpackOnPage(page);
      await expect(item.getByTestId('inventory-item-name')).toHaveText(BACKPACK_NAME);
      await expect(item.getByTestId('item-quantity')).toHaveText('1');
      await expect(item.getByTestId('inventory-item-price')).toHaveText(price);
      await expect(page.getByTestId('subtotal-label')).toHaveText(`Item total: ${price}`);
      const tax = centsFromPrice(await page.getByTestId('tax-label').innerText());
      const total = centsFromPrice(price) + tax;
      await expect(page.getByTestId('total-label')).toHaveText(`Total: $${(total / 100).toFixed(2)}`);

      await page.getByTestId('finish').click();
      await attachScreenshot(page, testInfo, `${id}-apos-finalizar`);
      await expect(page).toHaveURL('/checkout-complete.html');
      await expect(page.getByTestId('title')).toHaveText('Checkout: Complete!');
      await expect(page.getByTestId('complete-header')).toHaveText('Thank you for your order!');
      await expect(page.getByTestId('shopping-cart-badge')).toHaveCount(0);
      await attachScreenshot(page, testInfo, `${id}-confirmacao`);

      await page.getByTestId('back-to-products').click();
      await expect(page).toHaveURL('/inventory.html');
      await page.getByTestId('shopping-cart-link').click();
      await expect(page).toHaveURL('/cart.html');
      await expect(page.getByTestId('cart-list').getByTestId('inventory-item')).toHaveCount(0);
    });
  }

  test('CT-12-DADOS-STD | volta ao carrinho ao cancelar nos dados', async ({ page }, testInfo) => {
    await openCheckout(page);
    await page.getByTestId('cancel').click();

    await expect(page).toHaveURL('/cart.html');
    await expect(page.getByTestId('title')).toHaveText('Your Cart');
    await expect(page.getByTestId('complete-header')).toHaveCount(0);
    await attachScreenshot(page, testInfo, 'CT-12-DADOS-STD-retorno-ao-carrinho');
  });

  test('CT-12-RESUMO-STD | volta ao catálogo ao cancelar no resumo', async ({ page }, testInfo) => {
    await openCheckout(page);
    await fillCheckoutInformation(page);
    await page.getByTestId('cancel').click();

    await expect(page).toHaveURL('/inventory.html');
    await expect(page.getByTestId('title')).toHaveText('Products');
    await expect(page.getByTestId('complete-header')).toHaveCount(0);
    await attachScreenshot(page, testInfo, 'CT-12-RESUMO-STD-retorno-ao-catalogo');
  });
});
