# Implementation Plan: Endurecimento das Fronteiras de Segurança

**Branch**: `013-security-boundaries` | **Date**: 2026-11-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/013-security-boundaries/spec.md`

## Summary

Fechar as fronteiras identificadas na auditoria em dois projetos: a API passa a validar a faixa de locução e a controlar refresh tokens por cookie; migrations independentes tornam o PostgREST deny-by-default e restringem Storage; o frontend deixa de persistir refresh tokens e usa somente resultados calculados pelo servidor. Segredos locais deixam de ser literais versionados.

## Technical Context

**Language/Version**: TypeScript 6; SQL PostgreSQL 16

**Primary Dependencies**: Angular 22, NestJS 11, Prisma 7, Supabase/PostgREST

**Storage**: PostgreSQL, Supabase Storage, cookies seguros e access token efêmero em memória

**Testing**: Angular test runner/Vitest, Jest, testes de integração NestJS e aplicação de migrations Prisma

**Target Platform**: Navegadores modernos; API Linux; Vercel para o frontend

**Project Type**: Aplicação web Angular + serviço REST NestJS em repositórios irmãos

**Performance Goals**: Validação de faixa e sessão sem consultas adicionais não indexadas; renovação em uma chamada

**Constraints**: Não enfraquecer proteções; migrations de policies separadas; compatibilidade de login/logout; PostgREST do domínio principal fica deny-by-default

**Scale/Scope**: Fluxo de autenticação, criação de pedidos, modelo de serviços, 2 migrations de RLS/policies e configuração local Supabase

## Constitution Check

A constituição contém placeholders e não define gates executáveis. Aplicam-se os gates operacionais: preservar os stacks existentes, negar por padrão, testes antes da alteração sensível, migrations focadas e nenhuma redução de autenticação/autorização. **PASS**.

## Project Structure

### Documentation (this feature)

```text
specs/013-security-boundaries/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/security-contract.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code

```text
saas-web/
└── src/app/
    ├── core/services/auth.ts
    ├── core/interceptors/*.ts
    └── features/orders/pages/create/create.ts

saas-api/
├── prisma/schema.prisma
├── prisma/migrations/<timestamp>_service_duration_guard/migration.sql
├── prisma/migrations/<timestamp>_postgrest_rls_lockdown/migration.sql
├── prisma/migrations/<timestamp>_storage_owner_policies/migration.sql
├── docker-compose.yml
└── src/modules/{auth,order,service}/
```

**Structure Decision**: Documentação fica no `saas-web`, onde o fluxo Spec Kit está instalado; alterações executáveis são divididas pelos proprietários naturais, sem criar uma terceira camada.

## Security Design

1. `Service.maxDurationSeconds` é nullable para migração; serviços de voz sem valor não podem ser usados em novos pedidos até serem configurados.
2. A API calcula `ceil(words / 150 * 60)` e rejeita `serviceId` cuja faixa não comporte o briefing. Preço, revisões e papel continuam sendo lidos do banco.
3. O refresh token é emitido exclusivamente em cookie `HttpOnly`; respostas contêm apenas access token e usuário. Refresh usa cookie mais cabeçalho anti-CSRF e rotaciona o cookie.
4. Todas as tabelas `public` expostas recebem RLS. As nove policies de revenda são preservadas inicialmente para compatibilidade da API; tabelas sem contrato PostgREST ficam sem policy, portanto deny-by-default.
5. Storage recebe policies por proprietário para `authenticated`; `anon` perde escrita. Buckets públicos podem continuar sendo lidos pela API própria de Storage, mas metadados não ficam globalmente mutáveis.
6. Literais de chaves administrativas saem do Compose e tornam-se referências obrigatórias a variáveis locais.

## Post-Design Constitution Check

**PASS**. A solução adiciona controles no servidor, mantém a API como fronteira confiável e entrega migrations independentes para duração, RLS público e Storage.
