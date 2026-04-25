# Bootstrap Super Admin Page

Página para inicializar o primeiro super admin do sistema.

## Localização

- **Rota**: `/auth/bootstrap`
- **Componente**: `src/app/features/auth/pages/bootstrap/bootstrap.ts`

## Funcionalidades

### ✅ Implementado

1. **Formulário responsivo** com campos:
   - Nome (opcional)
   - Email (obrigatório, validado)
   - Senha (obrigatório, mínimo 8 caracteres)

2. **Validação em tempo real**:
   - Email format validation
   - Senha minLength 8 e maxLength 72
   - Feedback visual (checkmark quando válido)

3. **Gestão de estado**:
   - Loading state enquanto envia requisição
   - Error handling com mensagens específicas para cada status HTTP
   - Spinner animado durante submissão

4. **Segurança**:
   - Aviso de segurança destacado
   - Toggle para mostrar/ocultar senha
   - Trim automático de espaços

5. **UX aprimorada**:
   - ChangeDetectionStrategy.OnPush (performance)
   - MagicCube background animado
   - Gradientes e animations suaves
   - Tailwind CSS com tema dark/light
   - Accessibilidade (aria-labels)

6. **Detecção de sistema já inicializado**:
   - Se retornar 409 "já inicializado", mostra mensagem específica
   - Sugere fazer login na conta

## Integração com Backend

Usa endpoint: `POST /v1/auth/bootstrap`

Request:
```json
{
  "email": "admin@example.com",
  "password": "SenhaForte123!",
  "name": "Super Admin"
}
```

Response (201):
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

## Fluxo de Uso

1. Abra `http://localhost:3000/auth/bootstrap` (ou domínio em produção)
2. Preencha o formulário
3. Clique em "Criar Super Admin"
4. Se sucesso → Redireciona para `/admin/dashboard`
5. Se erro → Mostra mensagem no formulário

## Performance

- **Chunk size**: 8.87 kB (lazy loaded)
- **ChangeDetectionStrategy**: OnPush
- **Signals**: Reatividade otimizada
- **RxJS**: Operadores mínimos (tap, finalize)

## Boas práticas aplicadas

✅ Standalone component (Angular 14+)
✅ Reactive forms com FormBuilder
✅ Signals para estado (Angular 18+)
✅ RxJS operators para side effects
✅ Error handling robusto
✅ Mensagens de erro amigáveis
✅ Validação client-side
✅ Autocomplete attributes
✅ ARIA labels
✅ Loading states
✅ Clean code sem comentários desnecessários
