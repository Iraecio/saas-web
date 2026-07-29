# UI Contract: Configurações > Pagamento

## Access

- Aba e rota visíveis: `SUPER_ADMIN`, `RESELLER`, `RESELLER_MANAGER`
- Acesso direto: protegido pelos mesmos papéis
- `ADMIN` não recebe acesso, pois a API restringe a administração global ao `SUPER_ADMIN`

## Collections

- Superadmin: painel de políticas e painel de configurações da plataforma
- Revenda: somente painel de suas configurações e políticas autorizadas inferidas das configurações/políticas disponíveis

## Editor

- Criar: política, nome, prioridade, moeda, dados públicos e credenciais
- Editar: política e moeda somente leitura; nome, prioridade, dados públicos e credenciais substituíveis
- JSON inválido impede salvamento
- Credenciais existentes são indicadas fora do campo, nunca preenchidas

## Actions

- Validar: disponível em configuração não validada ou após edição
- Ativar: disponível somente com `validatedAt`
- Suspender: somente superadmin, configuração ativa e justificativa com ao menos três caracteres
- Todas as ações desabilitam comandos concorrentes sobre a página

## States

- Loading: skeleton/texto e comandos desabilitados
- Empty: orientação contextual
- Error: mensagem da API e botão Tentar novamente
- Success: confirmação temporária após mutação
