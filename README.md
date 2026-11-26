# Sauce E2E

Testes automatizados de ponta a ponta do [Swag Labs](https://www.saucedemo.com/) com Playwright e TypeScript. A suíte verifica os fluxos de autenticação, carrinho e checkout pela interface da loja de demonstração.

## Requisitos

| Requisito | Comportamento validado | Arquivo |
| --- | --- | --- |
| RT-01 — Autenticação | Entrar com credenciais válidas e rejeitar credenciais inválidas, campos obrigatórios vazios e usuário bloqueado. | [login.spec.ts](tests/login.spec.ts) |
| RT-04 — Carrinho | Adicionar e remover um produto no catálogo ou no carrinho e conferir os controles, o contador e a lista de itens. | [cart.spec.ts](tests/cart.spec.ts) |
| RT-07 — Conclusão e cancelamento da compra | Finalizar o pedido e esvaziar o carrinho ou cancelar nas etapas previstas. | [checkout.spec.ts](tests/checkout.spec.ts) |

Os 13 cenários usam contas de demonstração do Swag Labs e são executados em Chromium, Firefox e WebKit, totalizando 39 execuções. Cada teste começa com um novo contexto de navegador e acessa apenas a origem do Swag Labs. Recursos de terceiros, como telemetria e fontes externas, são bloqueados durante a execução.

## Executar localmente

Use Node.js 24 e npm. A execução acessa o site de demonstração pela internet.

```bash
npm ci
npx playwright install
npm run typecheck
npm test
npm run test:report
```

No Linux, instale também as dependências do sistema com `npx playwright install --with-deps` quando necessário.

| Comando | O que executa |
| --- | --- |
| `npm test` | Suíte completa, incluindo cenários de diagnóstico. |
| `npm run test:baseline` | Cenários fora da tag `@diagnostico`. |
| `npm run test:diagnostics` | Cenários `CT-06-CAT-PROB` e `CT-11-ERR`, que verificam a remoção no catálogo com `problem_user` e a finalização da compra com `error_user`. |
| `npm test -- --project=chromium` | Suíte completa apenas no Chromium. |
| `npm test -- tests/cart.spec.ts` | Apenas o requisito de carrinho nos três navegadores. |

Os diagnósticos comparam o comportamento observado com o requisito. Uma divergência deixa o cenário com status de falha e faz a suíte completa retornar código de saída diferente de zero.

## Relatórios e GitHub Actions

O relatório HTML é gerado em `playwright-report/`, com capturas anexadas aos cenários e rastros das falhas. O arquivo `test-results/results.json` registra o resultado de cada execução em formato estruturado.

O workflow [Playwright E2E](.github/workflows/playwright.yml) roda em pushes na `main`, pull requests com destino à `main` e acionamentos manuais. Ele instala as dependências com `npm ci` e os navegadores com `npx playwright install --with-deps`, valida TypeScript e executa a suíte completa. O artefato `playwright-report` fica disponível na página da execução por 30 dias, inclusive quando os testes falham. Depois de extrair o artefato, abra o relatório com `npx playwright show-report <diretório-extraído>`.
