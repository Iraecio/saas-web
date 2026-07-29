# Research: Configuração de Meios de Pagamento

## Decision 1: Consumir a API existente sem alterações

**Decision**: Preservar o módulo existente e acrescentar somente a leitura das políticas autorizadas para revendas.

**Rationale**: `PaymentConfigController` já expõe CRUD parcial, validação, ativação e suspensão nos papéis corretos. Porém, criar uma configuração exige `policyId` e uma revenda nova não possuía uma forma autorizada de descobrir políticas com `resellerEnabled`. O novo endpoint retorna somente essas políticas. O serviço da API continua redefinindo edições para rascunho, protegendo propriedade e removendo credenciais das respostas.

**Alternatives considered**: Codificar IDs no frontend ou expor a listagem administrativa. Rejeitados por acoplamento e por vazamento de políticas bloqueadas.

## Decision 2: Uma página adaptada ao papel

**Decision**: Reutilizar a mesma página e o mesmo editor para plataforma e revenda, exibindo políticas globais somente ao superadmin.

**Rationale**: Os DTOs de configuração são idênticos e apenas prefixo, permissões e suspensão variam.

**Alternatives considered**: Duas features e páginas separadas. Rejeitado pela duplicação de formulário, estados e tratamento de erro.

## Decision 3: Dados específicos do provedor em objetos editáveis

**Decision**: Oferecer modelos guiados para os três adaptadores conhecidos e também permitir edição em JSON.

**Rationale**: A API armazena `publicConfig` e `credentials` como objetos e não expõe metadados de campos. Valores padrão orientam o operador sem inventar um contrato dinâmico.

**Alternatives considered**: Formulário exclusivamente fixo por provedor, que exigiria release do frontend para toda nova política; ou JSON sem orientação, com pior usabilidade.

## Decision 4: Credenciais somente escrita

**Decision**: Nunca preencher o editor de credenciais a partir da resposta; edição vazia omite o campo.

**Rationale**: A API retorna apenas `hasCredentials`. Omitir credenciais preserva o segredo cifrado; enviar objeto vazio poderia substituí-lo.

**Alternatives considered**: Placeholder mascarado dentro do campo, rejeitado porque pode ser reenviado como valor real.

## Decision 5: Recarregar após mutações

**Decision**: Após criar, editar, validar, ativar, suspender ou salvar política, recarregar as coleções oficiais.

**Rationale**: Mantém ordenação, estado, timestamps e flags exatamente como persistidos pela API com baixo volume de dados.

**Alternatives considered**: Atualização otimista local, rejeitada por risco de divergir das transições e normalizações do servidor.
