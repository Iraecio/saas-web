# Research: Administração completa de profissionais

## Listagem unificada

**Decision**: Criar consulta administrativa paginada que una dados comuns de usuário e perfis, com função, escopo, revenda, verificação e indicadores.

**Rationale**: Os endpoints atuais separam locutores/produtores e não suportam busca, ordenação ou filtros completos.

**Alternatives considered**: Buscar duas listas e mesclar no frontend. Rejeitado por paginação, ordenação e totais incorretos.

## Visão 360º

**Decision**: Carregar cabeçalho/resumo em agregado único; serviços, pedidos, carteira e auditoria carregam paralelamente sob demanda.

**Rationale**: Mantém a primeira renderização rápida e permite falha parcial.

**Alternatives considered**: Um payload gigante; chamadas por item. O primeiro desperdiça dados e o segundo gera N+1.

## Reset administrativo

**Decision**: O superadmin dispara link temporário para o e-mail cadastrado, com rate limit e auditoria.

**Rationale**: Definir senha em nome do usuário expõe credencial e amplia responsabilidade do operador.

**Alternatives considered**: Senha temporária exibida no painel. Rejeitada por segurança.

## Bloqueio

**Decision**: Desativação reversível com motivo, revogação de sessões e versionamento otimista.

**Rationale**: Preserva histórico e impede acesso imediato sem excluir dados relacionados.

**Alternatives considered**: Exclusão ou apenas ocultação no frontend. Incompatíveis com auditoria e controle de acesso.

## Inspeção

**Decision**: Emitir credencial de inspeção separada, somente leitura, por 30 minutos, vinculada ao superadmin e alvo; servidor rejeita métodos mutáveis e endpoints sensíveis.

**Rationale**: Permite reproduzir visibilidade com rastreabilidade sem conhecer senha ou substituir a sessão original.

**Alternatives considered**: Login real sem senha; troca local de role; token completo do profissional. Rejeitados por escalada de privilégio, ausência de auditoria e risco de mutação.

## Estado e responsividade

**Decision**: Query parameters para filtros/seção; tabela no desktop, cards no mobile e drawer de filtros.

**Rationale**: Preserva contexto e evita compressão ilegível.

**Alternatives considered**: Estado apenas em memória e tabela horizontal no mobile.

## Concorrência

**Decision**: Alterações enviam `updatedAt`/versão esperada; conflito retorna estado atual para comparação.

**Rationale**: Evita sobrescrever mudança feita por outro administrador.

**Alternatives considered**: Última escrita vence. Rejeitada para ações administrativas sensíveis.
