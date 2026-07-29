import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, forkJoin } from 'rxjs';
import {
  PaymentConfiguration,
  PaymentConfigStatus,
  PaymentMethodPolicy,
  PaymentMethodType,
  UpsertPaymentPolicyDto,
} from '../../../../core/models/payment-settings.model';
import { UserRole } from '../../../../core/models/user.model';
import { AppStateService } from '../../../../core/services/app-state';
import { PaymentSettingsService } from '../../services/payment-settings';

type PaymentSettingsRole = Extract<UserRole, 'SUPER_ADMIN' | 'RESELLER' | 'RESELLER_MANAGER'>;

const STATUS_LABEL: Record<PaymentConfigStatus, string> = {
  DRAFT: 'Rascunho',
  ACTIVE: 'Ativo',
  SUSPENDED: 'Suspenso',
  INACTIVE: 'Inativo',
  INVALID: 'Inválido',
};

const STATUS_CLASS: Record<PaymentConfigStatus, string> = {
  DRAFT: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  SUSPENDED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  INACTIVE: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  INVALID: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

@Component({
  selector: 'app-payment-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="space-y-6 p-6">
      <header class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-violet-600">Financeiro</p>
          <h2 class="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
            Meios de pagamento
          </h2>
          <p class="mt-1 max-w-2xl text-sm text-neutral-500">
            @if (isSuperAdmin()) {
              Defina como a plataforma recebe das revendas e quais modalidades elas podem oferecer.
            } @else {
              Defina como seus clientes pagarão pelas compras de créditos da sua revenda.
            }
          </p>
        </div>
        <button
          type="button"
          class="btn-primary"
          [disabled]="loading() || busy()"
          (click)="openCreate()"
        >
          Novo meio
        </button>
      </header>

      @if (success()) {
        <div
          role="status"
          class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-900/20 dark:text-emerald-300"
        >
          {{ success() }}
        </div>
      }

      @if (error()) {
        <div
          role="alert"
          class="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between dark:border-red-800/60 dark:bg-red-900/20 dark:text-red-300"
        >
          <span>{{ error() }}</span>
          <button type="button" class="btn-secondary shrink-0" (click)="load()">
            Tentar novamente
          </button>
        </div>
      }

      @if (isSuperAdmin()) {
        <section
          class="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900"
        >
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 class="font-semibold text-neutral-900 dark:text-white">Modalidades globais</h3>
              <p class="text-sm text-neutral-500">
                Autorize cada integração para a plataforma e para as revendas.
              </p>
            </div>
            <button type="button" class="btn-secondary" [disabled]="busy()" (click)="openPolicy()">
              Nova modalidade
            </button>
          </div>

          @if (policyEditorOpen()) {
            <form
              [formGroup]="policyForm"
              (ngSubmit)="savePolicy()"
              class="mt-5 grid gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4 md:grid-cols-3 dark:border-neutral-700 dark:bg-neutral-800/50"
            >
              <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Código do provedor
                <input
                  class="form-input mt-1 w-full"
                  formControlName="providerCode"
                  placeholder="MANUAL"
                />
              </label>
              <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Tipo
                <select class="form-input mt-1 w-full" formControlName="methodType">
                  <option value="MANUAL">Manual</option>
                  <option value="PIX">PIX</option>
                  <option value="PROVIDER">Provedor</option>
                </select>
              </label>
              <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Nome exibido
                <input class="form-input mt-1 w-full" formControlName="displayName" />
              </label>
              <label class="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                <input type="checkbox" formControlName="platformEnabled" />
                Disponível para a plataforma
              </label>
              <label class="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                <input type="checkbox" formControlName="resellerEnabled" />
                Revendas podem configurar
              </label>
              <div class="flex justify-end gap-2 md:col-span-3">
                <button type="button" class="btn-secondary" (click)="closePolicy()">
                  Cancelar
                </button>
                <button type="submit" class="btn-primary" [disabled]="policyForm.invalid || busy()">
                  {{ busy() ? 'Salvando...' : 'Salvar modalidade' }}
                </button>
              </div>
            </form>
          }

          <div class="mt-5 grid gap-3 lg:grid-cols-2">
            @for (policy of policies(); track policy.id) {
              <article class="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="font-semibold text-neutral-900 dark:text-white">
                      {{ policy.displayName }}
                    </p>
                    <p class="mt-0.5 font-mono text-xs text-neutral-500">
                      {{ policy.providerCode }}
                    </p>
                  </div>
                  <span
                    class="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                  >
                    {{ methodLabel(policy.methodType) }}
                  </span>
                </div>
                <div class="mt-4 flex flex-wrap gap-2 text-xs">
                  <span [class]="flagClass(policy.platformEnabled)">
                    Plataforma: {{ policy.platformEnabled ? 'permitido' : 'bloqueado' }}
                  </span>
                  <span [class]="flagClass(policy.resellerEnabled)">
                    Revendas: {{ policy.resellerEnabled ? 'permitido' : 'bloqueado' }}
                  </span>
                </div>
                <button
                  type="button"
                  class="mt-4 text-sm font-medium text-violet-600 hover:text-violet-700"
                  (click)="editPolicy(policy)"
                >
                  Editar modalidade
                </button>
              </article>
            } @empty {
              @if (!loading()) {
                <p class="py-6 text-center text-sm text-neutral-500 lg:col-span-2">
                  Nenhuma modalidade cadastrada. Crie a primeira para habilitar recebimentos.
                </p>
              }
            }
          </div>
        </section>
      }

      @if (editorOpen()) {
        <section
          class="rounded-xl border border-violet-200 bg-white p-5 shadow-sm dark:border-violet-800 dark:bg-neutral-900"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="font-semibold text-neutral-900 dark:text-white">
                {{ editing() ? 'Editar meio de pagamento' : 'Novo meio de pagamento' }}
              </h3>
              <p class="text-sm text-neutral-500">
                Alterar uma configuração exige nova validação antes da ativação.
              </p>
            </div>
            <button
              type="button"
              class="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              (click)="closeEditor()"
            >
              Fechar
            </button>
          </div>

          <form
            [formGroup]="configurationForm"
            (ngSubmit)="saveConfiguration()"
            class="mt-6 space-y-6"
          >
            <fieldset>
              <legend class="text-sm font-semibold text-neutral-900 dark:text-white">
                1. Escolha como receber
              </legend>
              <p class="mt-1 text-sm text-neutral-500">
                Selecione uma modalidade autorizada para este ambiente.
              </p>
              <div class="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                @for (policy of eligiblePolicies(); track policy.id) {
                  <button
                    type="button"
                    class="group flex min-h-28 items-start gap-3 rounded-xl border p-4 text-left transition-all"
                    [class.border-brand]="configurationForm.controls.policyId.value === policy.id"
                    [class.bg-brand/5]="configurationForm.controls.policyId.value === policy.id"
                    [class.ring-2]="configurationForm.controls.policyId.value === policy.id"
                    [class.ring-brand/15]="configurationForm.controls.policyId.value === policy.id"
                    [class.border-neutral-200]="
                      configurationForm.controls.policyId.value !== policy.id
                    "
                    [disabled]="!!editing()"
                    (click)="selectPolicy(policy)"
                  >
                    <span
                      class="flex size-10 shrink-0 items-center justify-center rounded-lg text-xl"
                      [class]="providerIconClass(policy.providerCode)"
                    >
                      {{ providerIcon(policy.providerCode) }}
                    </span>
                    <span>
                      <span class="block font-semibold text-neutral-900 dark:text-white">
                        {{ policy.displayName }}
                      </span>
                      <span class="mt-1 block text-xs leading-5 text-neutral-500">
                        {{ providerDescription(policy.providerCode) }}
                      </span>
                    </span>
                  </button>
                }
              </div>
            </fieldset>

            <div
              class="grid gap-4 rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 md:grid-cols-4 dark:border-neutral-700 dark:bg-neutral-800/40"
            >
              <label
                class="text-sm font-medium text-neutral-700 md:col-span-2 dark:text-neutral-300"
              >
                Nome para identificação
                <input
                  class="form-input mt-1 w-full"
                  formControlName="name"
                  placeholder="Ex.: PIX principal"
                />
                <span class="mt-1 block text-xs font-normal text-neutral-500">
                  Visível apenas para sua equipe.
                </span>
              </label>
              <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Prioridade
                <input
                  type="number"
                  min="0"
                  class="form-input mt-1 w-full"
                  formControlName="priority"
                />
              </label>
              <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Moeda
                <input
                  maxlength="3"
                  class="form-input mt-1 w-full uppercase"
                  formControlName="currency"
                />
              </label>
            </div>

            @if (selectedProvider() === 'PIX_MANUAL') {
              <section
                class="rounded-xl border border-cyan-200 bg-cyan-50/50 p-5 dark:border-cyan-900 dark:bg-cyan-950/20"
              >
                <div class="mb-5">
                  <h4 class="font-semibold text-neutral-900 dark:text-white">Dados da chave PIX</h4>
                  <p class="text-sm text-neutral-500">
                    O pagador verá estes dados e enviará o comprovante para análise.
                  </p>
                </div>
                <div class="grid gap-4 md:grid-cols-2">
                  <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Tipo da chave
                    <select class="form-input mt-1" formControlName="pixKeyType">
                      <option value="CPF">CPF</option>
                      <option value="CNPJ">CNPJ</option>
                      <option value="EMAIL">E-mail</option>
                      <option value="PHONE">Telefone</option>
                      <option value="RANDOM">Chave aleatória</option>
                    </select>
                  </label>
                  <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Chave PIX
                    <input
                      class="form-input mt-1"
                      formControlName="pixKey"
                      placeholder="Digite a chave"
                    />
                  </label>
                  <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Nome do favorecido
                    <input class="form-input mt-1" formControlName="beneficiaryName" />
                  </label>
                  <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    CPF ou CNPJ do favorecido
                    <input
                      class="form-input mt-1"
                      formControlName="beneficiaryDocument"
                      inputmode="numeric"
                    />
                  </label>
                </div>
              </section>
            }

            @if (selectedProvider() === 'BANK_TRANSFER_MANUAL' || selectedProvider() === 'MANUAL') {
              <section
                class="rounded-xl border border-blue-200 bg-blue-50/50 p-5 dark:border-blue-900 dark:bg-blue-950/20"
              >
                <div class="mb-5">
                  <h4 class="font-semibold text-neutral-900 dark:text-white">Dados bancários</h4>
                  <p class="text-sm text-neutral-500">
                    Use uma conta apta a receber depósitos e transferências.
                  </p>
                </div>
                <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Banco
                    <input
                      class="form-input mt-1"
                      formControlName="bankName"
                      placeholder="Nome ou código"
                    />
                  </label>
                  <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Agência
                    <input class="form-input mt-1" formControlName="agency" />
                  </label>
                  <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Conta com dígito
                    <input class="form-input mt-1" formControlName="account" />
                  </label>
                  <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Tipo de conta
                    <select class="form-input mt-1" formControlName="accountType">
                      <option value="CHECKING">Conta corrente</option>
                      <option value="SAVINGS">Conta poupança</option>
                      <option value="PAYMENT">Conta de pagamento</option>
                    </select>
                  </label>
                  <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Nome do titular
                    <input class="form-input mt-1" formControlName="holderName" />
                  </label>
                  <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    CPF ou CNPJ do titular
                    <input
                      class="form-input mt-1"
                      formControlName="holderDocument"
                      inputmode="numeric"
                    />
                  </label>
                </div>
              </section>
            }

            @if (selectedProvider() === 'MERCADO_PAGO') {
              <section
                class="rounded-xl border border-sky-200 bg-sky-50/50 p-5 dark:border-sky-900 dark:bg-sky-950/20"
              >
                <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 class="font-semibold text-neutral-900 dark:text-white">
                      Integração Mercado Pago
                    </h4>
                    <p class="max-w-2xl text-sm text-neutral-500">
                      Informe as credenciais de produção da conta que receberá os pagamentos.
                    </p>
                  </div>
                  @if (editing()?.hasCredentials) {
                    <span
                      class="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
                    >
                      Credenciais configuradas
                    </span>
                  }
                </div>
                <div class="mt-5 grid gap-4 md:grid-cols-2">
                  <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Access token
                    <input
                      type="password"
                      class="form-input mt-1"
                      formControlName="accessToken"
                      autocomplete="new-password"
                      placeholder="{{
                        editing()?.hasCredentials ? 'Deixe vazio para manter' : 'APP_USR-...'
                      }}"
                    />
                  </label>
                  <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Assinatura secreta do webhook
                    <input
                      type="password"
                      class="form-input mt-1"
                      formControlName="webhookSecret"
                      autocomplete="new-password"
                      placeholder="{{
                        editing()?.hasCredentials
                          ? 'Deixe vazio para manter'
                          : 'Chave gerada no Mercado Pago'
                      }}"
                    />
                  </label>
                </div>
                <div
                  class="mt-4 rounded-lg border border-sky-200 bg-white/70 p-3 text-xs leading-5 text-neutral-600 dark:border-sky-900 dark:bg-neutral-900/40 dark:text-neutral-400"
                >
                  As credenciais são criptografadas pela API e nunca voltam a ser exibidas. Após
                  salvar, use <strong>Validar</strong> para testar a conexão antes de ativar.
                </div>
              </section>
            }

            @if (selectedProvider() && selectedProvider() !== 'MERCADO_PAGO') {
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Instruções para o pagador
                <textarea
                  rows="4"
                  class="form-input mt-1 resize-y"
                  formControlName="instructions"
                  placeholder="Explique como realizar o pagamento e enviar o comprovante."
                ></textarea>
              </label>
            }

            @if (formError()) {
              <p
                role="alert"
                class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300"
              >
                {{ formError() }}
              </p>
            }
            <div
              class="sticky bottom-0 -mx-5 flex flex-col-reverse gap-2 border-t border-neutral-200 bg-white/95 px-5 py-4 backdrop-blur sm:flex-row sm:justify-end dark:border-neutral-700 dark:bg-neutral-900/95"
            >
              <button type="button" class="btn-secondary" (click)="closeEditor()">Cancelar</button>
              <button
                type="submit"
                class="btn-primary"
                [disabled]="configurationForm.invalid || busy()"
              >
                {{ busy() ? 'Salvando...' : editing() ? 'Salvar alterações' : 'Criar meio' }}
              </button>
            </div>
          </form>
        </section>
      }

      <section>
        <div>
          <h3 class="font-semibold text-neutral-900 dark:text-white">
            {{ isSuperAdmin() ? 'Recebimentos da plataforma' : 'Recebimentos da revenda' }}
          </h3>
          <p class="text-sm text-neutral-500">
            Valide os dados antes de ativar um meio para novas compras.
          </p>
        </div>

        @if (loading()) {
          <div class="mt-4 grid gap-4 lg:grid-cols-2">
            @for (item of [1, 2]; track item) {
              <div class="h-52 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800"></div>
            }
          </div>
        } @else {
          <div class="mt-4 grid gap-4 lg:grid-cols-2">
            @for (configuration of configurations(); track configuration.id) {
              <article
                class="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900"
              >
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <h4 class="font-semibold text-neutral-900 dark:text-white">
                      {{ configuration.name }}
                    </h4>
                    <p class="mt-1 text-sm text-neutral-500">
                      {{ configuration.policy.displayName }} · {{ configuration.currency }} ·
                      prioridade {{ configuration.priority }}
                    </p>
                  </div>
                  <span
                    class="rounded-full px-2.5 py-1 text-xs font-semibold"
                    [class]="statusClass(configuration.status)"
                  >
                    {{ statusLabel(configuration.status) }}
                  </span>
                </div>

                <dl class="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt class="text-neutral-500">Validação</dt>
                    <dd class="mt-0.5 font-medium text-neutral-800 dark:text-neutral-200">
                      {{
                        configuration.validatedAt
                          ? formatDate(configuration.validatedAt)
                          : 'Pendente'
                      }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-neutral-500">Credenciais</dt>
                    <dd class="mt-0.5 font-medium text-neutral-800 dark:text-neutral-200">
                      {{
                        configuration.hasCredentials ? 'Configuradas' : 'Não necessárias/ausentes'
                      }}
                    </dd>
                  </div>
                </dl>

                <div
                  class="mt-5 flex flex-wrap gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-800"
                >
                  <button
                    type="button"
                    class="btn-secondary"
                    [disabled]="busy()"
                    (click)="openEdit(configuration)"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    class="btn-secondary"
                    [disabled]="busy()"
                    (click)="validate(configuration)"
                  >
                    Validar
                  </button>
                  <button
                    type="button"
                    class="btn-primary"
                    [disabled]="
                      busy() || !configuration.validatedAt || configuration.status === 'ACTIVE'
                    "
                    (click)="activate(configuration)"
                  >
                    Ativar
                  </button>
                  @if (isSuperAdmin() && configuration.status === 'ACTIVE') {
                    <button
                      type="button"
                      class="btn-secondary"
                      [disabled]="busy()"
                      (click)="startSuspend(configuration)"
                    >
                      Suspender
                    </button>
                  }
                </div>

                @if (suspendingId() === configuration.id) {
                  <form
                    class="mt-4 flex flex-col gap-2 rounded-lg bg-neutral-50 p-3 sm:flex-row dark:bg-neutral-800/60"
                    (ngSubmit)="suspend(configuration)"
                  >
                    <input
                      class="form-input flex-1"
                      placeholder="Motivo da suspensão"
                      [value]="suspendReason()"
                      (input)="suspendReason.set($any($event.target).value)"
                    />
                    <button
                      type="submit"
                      class="btn-primary"
                      [disabled]="busy() || suspendReason().trim().length < 3"
                    >
                      Confirmar
                    </button>
                    <button type="button" class="btn-secondary" (click)="cancelSuspend()">
                      Cancelar
                    </button>
                  </form>
                }
              </article>
            } @empty {
              <div
                class="rounded-xl border border-dashed border-neutral-300 px-6 py-12 text-center lg:col-span-2 dark:border-neutral-700"
              >
                <p class="font-medium text-neutral-800 dark:text-neutral-200">
                  Nenhum meio configurado
                </p>
                <p class="mt-1 text-sm text-neutral-500">
                  Crie o primeiro meio para começar a receber pagamentos.
                </p>
                <button type="button" class="btn-primary mt-4" (click)="openCreate()">
                  Criar meio
                </button>
              </div>
            }
          </div>
        }
      </section>
    </div>
  `,
})
export class PaymentSettingsPage {
  private readonly appState = inject(AppStateService);
  private readonly service = inject(PaymentSettingsService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly policies = signal<PaymentMethodPolicy[]>([]);
  readonly configurations = signal<PaymentConfiguration[]>([]);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly formError = signal<string | null>(null);
  readonly editorOpen = signal(false);
  readonly editing = signal<PaymentConfiguration | null>(null);
  readonly policyEditorOpen = signal(false);
  readonly suspendingId = signal<string | null>(null);
  readonly suspendReason = signal('');
  readonly selectedProvider = signal<string | null>(null);

  readonly role = computed(() => this.appState.userRole() as PaymentSettingsRole);
  readonly isSuperAdmin = computed(() => this.role() === 'SUPER_ADMIN');
  readonly eligiblePolicies = computed(() =>
    this.policies().filter((policy) =>
      this.isSuperAdmin() ? policy.platformEnabled : policy.resellerEnabled,
    ),
  );

  readonly configurationForm = this.fb.nonNullable.group({
    policyId: ['', Validators.required],
    name: ['', [Validators.required, Validators.minLength(2)]],
    priority: [0, [Validators.required, Validators.min(0)]],
    currency: ['BRL', [Validators.required, Validators.pattern(/^[A-Za-z]{3}$/)]],
    instructions: [''],
    pixKey: [''],
    pixKeyType: ['EMAIL'],
    beneficiaryName: [''],
    beneficiaryDocument: [''],
    bankName: [''],
    agency: [''],
    account: [''],
    accountType: ['CHECKING'],
    holderName: [''],
    holderDocument: [''],
    accessToken: [''],
    webhookSecret: [''],
  });

  readonly policyForm = this.fb.nonNullable.group({
    providerCode: ['', [Validators.required, Validators.minLength(2)]],
    methodType: ['MANUAL' as PaymentMethodType, Validators.required],
    displayName: ['', [Validators.required, Validators.minLength(2)]],
    platformEnabled: [true],
    resellerEnabled: [false],
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      policies: this.service.listPolicies(this.role()),
      configurations: this.service.listConfigurations(this.role()),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ policies, configurations }) => {
          this.policies.set(policies);
          this.configurations.set(configurations);
          this.loading.set(false);
        },
        error: (error: Error) => {
          this.error.set(error.message || 'Não foi possível carregar os meios de pagamento.');
          this.loading.set(false);
        },
      });
  }

  openCreate(): void {
    this.editing.set(null);
    this.formError.set(null);
    const firstPolicy = this.eligiblePolicies()[0];
    this.configurationForm.reset({
      policyId: firstPolicy?.id ?? '',
      name: '',
      priority: 0,
      currency: 'BRL',
      instructions: '',
      pixKey: '',
      pixKeyType: 'EMAIL',
      beneficiaryName: '',
      beneficiaryDocument: '',
      bankName: '',
      agency: '',
      account: '',
      accountType: 'CHECKING',
      holderName: '',
      holderDocument: '',
      accessToken: '',
      webhookSecret: '',
    });
    this.selectedProvider.set(firstPolicy?.providerCode ?? null);
    this.configurationForm.controls.policyId.enable();
    this.configurationForm.controls.currency.enable();
    this.editorOpen.set(true);
  }

  openEdit(configuration: PaymentConfiguration): void {
    const config = configuration.publicConfig;
    this.editing.set(configuration);
    this.formError.set(null);
    this.configurationForm.reset({
      policyId: configuration.policyId,
      name: configuration.name,
      priority: configuration.priority,
      currency: configuration.currency,
      instructions: this.configValue(config, 'instructions'),
      pixKey: this.configValue(config, 'pixKey'),
      pixKeyType: this.configValue(config, 'pixKeyType') || 'EMAIL',
      beneficiaryName: this.configValue(config, 'beneficiaryName'),
      beneficiaryDocument: this.configValue(config, 'beneficiaryDocument'),
      bankName: this.configValue(config, 'bankName'),
      agency: this.configValue(config, 'agency'),
      account: this.configValue(config, 'account'),
      accountType: this.configValue(config, 'accountType') || 'CHECKING',
      holderName: this.configValue(config, 'holderName'),
      holderDocument: this.configValue(config, 'holderDocument'),
      accessToken: '',
      webhookSecret: '',
    });
    this.selectedProvider.set(configuration.policy.providerCode);
    this.configurationForm.controls.policyId.disable();
    this.configurationForm.controls.currency.disable();
    this.editorOpen.set(true);
  }

  closeEditor(): void {
    this.editorOpen.set(false);
    this.editing.set(null);
    this.formError.set(null);
    this.selectedProvider.set(null);
  }

  saveConfiguration(): void {
    if (this.configurationForm.invalid || this.busy()) return;
    const values = this.configurationForm.getRawValue();
    const provider = this.selectedProvider();
    const validationError = this.validateProviderFields(provider, values);
    if (validationError) {
      this.formError.set(validationError);
      return;
    }
    const publicConfig = this.buildPublicConfig(provider, values);
    const credentials =
      provider === 'MERCADO_PAGO' && (values.accessToken.trim() || values.webhookSecret.trim())
        ? {
            accessToken: values.accessToken.trim(),
            webhookSecret: values.webhookSecret.trim(),
          }
        : undefined;
    const current = this.editing();
    const request = current
      ? this.service.updateConfiguration(this.role(), current.id, {
          name: values.name.trim(),
          priority: values.priority,
          publicConfig,
          ...(credentials ? { credentials } : {}),
        })
      : this.service.createConfiguration(this.role(), {
          policyId: values.policyId,
          name: values.name.trim(),
          priority: values.priority,
          currency: values.currency.toUpperCase(),
          publicConfig,
          ...(credentials ? { credentials } : {}),
        });
    this.runMutation(request, current ? 'Meio atualizado.' : 'Meio criado.', () =>
      this.closeEditor(),
    );
  }

  openPolicy(): void {
    this.policyForm.reset({
      providerCode: '',
      methodType: 'MANUAL',
      displayName: '',
      platformEnabled: true,
      resellerEnabled: false,
    });
    this.policyForm.controls.providerCode.enable();
    this.policyForm.controls.methodType.enable();
    this.policyEditorOpen.set(true);
  }

  editPolicy(policy: PaymentMethodPolicy): void {
    this.policyForm.reset({
      providerCode: policy.providerCode,
      methodType: policy.methodType,
      displayName: policy.displayName,
      platformEnabled: policy.platformEnabled,
      resellerEnabled: policy.resellerEnabled,
    });
    this.policyForm.controls.providerCode.disable();
    this.policyForm.controls.methodType.disable();
    this.policyEditorOpen.set(true);
  }

  closePolicy(): void {
    this.policyEditorOpen.set(false);
  }

  savePolicy(): void {
    if (this.policyForm.invalid || this.busy()) return;
    const dto = this.policyForm.getRawValue() as UpsertPaymentPolicyDto;
    this.runMutation(this.service.savePolicy(dto), 'Modalidade salva.', () => this.closePolicy());
  }

  validate(configuration: PaymentConfiguration): void {
    this.runMutation(
      this.service.validateConfiguration(this.role(), configuration.id),
      'Configuração validada.',
    );
  }

  activate(configuration: PaymentConfiguration): void {
    if (!configuration.validatedAt) return;
    this.runMutation(
      this.service.activateConfiguration(this.role(), configuration.id),
      'Meio ativado.',
    );
  }

  startSuspend(configuration: PaymentConfiguration): void {
    this.suspendingId.set(configuration.id);
    this.suspendReason.set('');
  }

  cancelSuspend(): void {
    this.suspendingId.set(null);
    this.suspendReason.set('');
  }

  suspend(configuration: PaymentConfiguration): void {
    const reason = this.suspendReason().trim();
    if (reason.length < 3) return;
    this.runMutation(
      this.service.suspendConfiguration(configuration.id, reason),
      'Meio suspenso.',
      () => this.cancelSuspend(),
    );
  }

  statusLabel(status: PaymentConfigStatus): string {
    return STATUS_LABEL[status];
  }

  statusClass(status: PaymentConfigStatus): string {
    return STATUS_CLASS[status];
  }

  methodLabel(type: PaymentMethodType): string {
    return { MANUAL: 'Manual', PIX: 'PIX', PROVIDER: 'Provedor' }[type];
  }

  selectPolicy(policy: PaymentMethodPolicy): void {
    if (this.editing()) return;
    this.configurationForm.controls.policyId.setValue(policy.id);
    this.selectedProvider.set(policy.providerCode);
    this.formError.set(null);
  }

  providerIcon(providerCode: string): string {
    if (providerCode === 'PIX_MANUAL') return '◆';
    if (providerCode === 'MERCADO_PAGO') return 'MP';
    if (providerCode === 'BANK_TRANSFER_MANUAL' || providerCode === 'MANUAL') return '▤';
    return '◉';
  }

  providerIconClass(providerCode: string): string {
    if (providerCode === 'PIX_MANUAL') {
      return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300';
    }
    if (providerCode === 'MERCADO_PAGO') {
      return 'bg-sky-100 text-xs font-black text-sky-700 dark:bg-sky-900/40 dark:text-sky-300';
    }
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
  }

  providerDescription(providerCode: string): string {
    if (providerCode === 'PIX_MANUAL') return 'Chave PIX com análise manual do comprovante.';
    if (providerCode === 'MERCADO_PAGO') return 'Checkout automático e atualização de status.';
    if (providerCode === 'BANK_TRANSFER_MANUAL' || providerCode === 'MANUAL') {
      return 'Depósito ou transferência com comprovante.';
    }
    return 'Integração de pagamento autorizada.';
  }

  flagClass(enabled: boolean): string {
    return enabled
      ? 'rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
      : 'rounded-full bg-neutral-100 px-2.5 py-1 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400';
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
      new Date(value),
    );
  }

  private configValue(config: Record<string, unknown>, key: string): string {
    const value = config[key];
    return typeof value === 'string' ? value : '';
  }

  private validateProviderFields(
    provider: string | null,
    values: ReturnType<typeof this.configurationForm.getRawValue>,
  ): string | null {
    if (!provider) return 'Selecione uma modalidade de pagamento.';
    if (provider === 'PIX_MANUAL') {
      if (
        !values.pixKey.trim() ||
        !values.beneficiaryName.trim() ||
        !values.beneficiaryDocument.trim() ||
        !values.instructions.trim()
      ) {
        return 'Preencha a chave PIX, o favorecido, o documento e as instruções.';
      }
    }
    if (provider === 'BANK_TRANSFER_MANUAL' || provider === 'MANUAL') {
      if (
        !values.bankName.trim() ||
        !values.agency.trim() ||
        !values.account.trim() ||
        !values.holderName.trim() ||
        !values.holderDocument.trim() ||
        !values.instructions.trim()
      ) {
        return 'Preencha todos os dados bancários e as instruções para o pagador.';
      }
    }
    if (
      provider === 'MERCADO_PAGO' &&
      !this.editing()?.hasCredentials &&
      (!values.accessToken.trim() || !values.webhookSecret.trim())
    ) {
      return 'Informe o access token e a assinatura secreta do webhook.';
    }
    if (
      provider === 'MERCADO_PAGO' &&
      Boolean(values.accessToken.trim()) !== Boolean(values.webhookSecret.trim())
    ) {
      return 'Para substituir credenciais, informe o access token e a assinatura secreta.';
    }
    return null;
  }

  private buildPublicConfig(
    provider: string | null,
    values: ReturnType<typeof this.configurationForm.getRawValue>,
  ): Record<string, unknown> {
    if (provider === 'PIX_MANUAL') {
      return {
        instructions: values.instructions.trim(),
        pixKey: values.pixKey.trim(),
        pixKeyType: values.pixKeyType,
        beneficiaryName: values.beneficiaryName.trim(),
        beneficiaryDocument: values.beneficiaryDocument.trim(),
      };
    }
    if (provider === 'BANK_TRANSFER_MANUAL' || provider === 'MANUAL') {
      return {
        instructions: values.instructions.trim(),
        bankName: values.bankName.trim(),
        agency: values.agency.trim(),
        account: values.account.trim(),
        accountType: values.accountType,
        holderName: values.holderName.trim(),
        holderDocument: values.holderDocument.trim(),
      };
    }
    return {};
  }

  private runMutation(
    request: Observable<unknown>,
    message: string,
    afterSuccess?: () => void,
  ): void {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set(null);
    this.success.set(null);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.busy.set(false);
        this.success.set(message);
        afterSuccess?.();
        this.load();
      },
      error: (error: Error) => {
        this.busy.set(false);
        this.error.set(error.message || 'Não foi possível concluir a operação.');
      },
    });
  }
}
