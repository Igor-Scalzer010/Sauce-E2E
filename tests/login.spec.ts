import { expect, test } from '@playwright/test';
import { attachScreenshot, DEMO_PASSWORD, submitLogin } from './swag-labs';

test.describe('RT-01 | Autenticação', () => {
  test('CT-01-STD | abre o catálogo com credenciais válidas', async ({ page }, testInfo) => {
    await submitLogin(page, 'standard_user', DEMO_PASSWORD);

    await expect(page).toHaveURL('/inventory.html');
    await expect(page.getByTestId('title')).toHaveText('Products');
    await expect(page.getByTestId('inventory-item').first()).toBeVisible();
    await expect(page.getByTestId('error')).toHaveCount(0);
    await attachScreenshot(page, testInfo, 'CT-01-STD-catalogo');
  });

  const invalidInputs = [
    {
      id: 'CT-02-USRV-STD',
      description: 'solicita o usuário quando o campo está vazio',
      username: '',
      password: DEMO_PASSWORD,
      error: 'Epic sadface: Username is required',
    },
    {
      id: 'CT-02-SENV-STD',
      description: 'solicita a senha quando o campo está vazio',
      username: 'standard_user',
      password: '',
      error: 'Epic sadface: Password is required',
    },
    {
      id: 'CT-02-USRI-STD',
      description: 'rejeita um usuário inexistente',
      username: 'qa_inexistente',
      password: DEMO_PASSWORD,
      error: 'Epic sadface: Username and password do not match any user in this service',
    },
    {
      id: 'CT-02-SENI-STD',
      description: 'rejeita uma senha incorreta',
      username: 'standard_user',
      password: 'senha_incorreta',
      error: 'Epic sadface: Username and password do not match any user in this service',
    },
  ];

  for (const { id, description, username, password, error } of invalidInputs) {
    test(`${id} | ${description}`, async ({ page }) => {
      await submitLogin(page, username, password);

      await expect(page.getByTestId('error')).toHaveText(error);
      await expect(page).toHaveURL('/');
    });
  }

  test('CT-03-LOCK | impede o acesso da conta bloqueada', async ({ page }, testInfo) => {
    await submitLogin(page, 'locked_out_user', DEMO_PASSWORD);

    await expect(page.getByTestId('error')).toHaveText('Epic sadface: Sorry, this user has been locked out.');
    await expect(page).toHaveURL('/');
    await attachScreenshot(page, testInfo, 'CT-03-LOCK-conta-bloqueada');
  });
});
