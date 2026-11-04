# Research: Atualização para Angular 22

## Matriz de runtime e compilador

**Decision**: Usar Angular 22.2.x, Node.js 24.15.0 e TypeScript 6.0.x, preservando RxJS 7.8.

**Rationale**: A matriz oficial do Angular 22 aceita Node ^22.22.3, ^24.15.0 ou ^26, exige TypeScript >=6.0 <6.1 e aceita RxJS ^7.4. O ambiente disponível já atende ao intervalo Node.

**Alternatives considered**: Node 22.22.3 é compatível, mas exigiria trocar o runtime local; TypeScript 5.9 não atende Angular 22.

## Caminho de migração

**Decision**: Atualizar uma versão principal por vez com `ng update` para core/CLI 22 e aplicar migrações oficiais antes dos ajustes manuais.

**Rationale**: O projeto parte do Angular 21.2, exatamente uma major abaixo, e a documentação oficial recomenda o comando de atualização com a major de destino.

**Alternatives considered**: Alterar somente números no manifest não aplicaria schematics; recriar o workspace aumentaria risco e escopo.

## Componentes e bibliotecas

**Decision**: Alinhar Material/CDK em 22.2, PrimeNG em 22.1 e substituir `lucide-angular` por `@lucide/angular`.

**Rationale**: PrimeNG 22.1 declara peers Angular/CDK 22.1+. O pacote antigo Lucide limita peers ao Angular 21, enquanto o pacote oficial atual aceita Angular >=17 e exporta a integração Angular equivalente.

**Alternatives considered**: Ignorar peers com flags do npm deixaria a instalação inválida; remover ícones alteraria a interface; criar componentes SVG locais duplicaria manutenção.

## SSR, testes e navegador

**Decision**: Preservar o builder de aplicação, `@angular/ssr`, hidratação e Vitest atuais; validar build e execução do bundle SSR.

**Rationale**: Esses recursos continuam suportados na linha 22 e não há requisito para mudar arquitetura. Angular 22 define suporte de navegador pelo Baseline 2026-05-07.

**Alternatives considered**: Migrar para SPA ou trocar o runner de testes não é necessário para compatibilidade e ampliaria regressões.
