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
            class="mt-5 grid gap-4 md:grid-cols-2"
          >
            <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Modalidade
              <select class="form-input mt-1 w-full" formControlName="policyId">
                <option value="">Selecione</option>
                @for (policy of eligiblePolicies(); track policy.id) {
                  <option [value]="policy.id">
                    {{ policy.displayName }} · {{ methodLabel(policy.methodType) }}
                  </option>
                }
              </select>
            </label>
            <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Nome interno
              <input
                class="form-input mt-1 w-full"
                formControlName="name"
                placeholder="Conta principal"
              />
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
            <label class="text-sm font-medium text-neutral-700 md:col-span-2 dark:text-neutral-300">
              Dados públicos (JSON)
              <textarea
                rows="6"
                class="form-input mt-1 w-full font-mono text-xs"
                formControlName="publicConfig"
              ></textarea>
              <span class="mt-1 block text-xs font-normal text-neutral-500">
                {{ publicConfigHint() }}
              </span>
            </label>
            <label class="text-sm font-medium text-neutral-700 md:col-span-2 dark:text-neutral-300">
              Credenciais (JSON, opcional)
              <textarea
                rows="4"
                class="form-input mt-1 w-full font-mono text-xs"
                formControlName="credentials"
                placeholder='{"webhookSecret":"..."}'
                autocomplete="off"
              ></textarea>
              <span class="mt-1 block text-xs font-normal text-neutral-500">
                @if (editing()?.hasCredentials) {
                  Credencial configurada. Deixe vazio para preservá-la ou informe um objeto para
                  substituir.
                } @else {
                  Segredos são enviados uma vez e não voltam a ser exibidos.
                }
              </span>
            </label>
            @if (formError()) {
              <p role="alert" class="text-sm text-red-600 md:col-span-2">{{ formError() }}</p>
            }
            <div class="flex justify-end gap-2 md:col-span-2">
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
    publicConfig: ['{}', Validators.required],
    credentials: [''],
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
    this.configurationForm.reset({
      policyId: this.eligiblePolicies()[0]?.id ?? '',
      name: '',
      priority: 0,
      currency: 'BRL',
      publicConfig: this.defaultPublicConfig(this.eligiblePolicies()[0]),
      credentials: '',
    });
    this.configurationForm.controls.policyId.enable();
    this.configurationForm.controls.currency.enable();
    this.editorOpen.set(true);
  }

  openEdit(configuration: PaymentConfiguration): void {
    this.editing.set(configuration);
    this.formError.set(null);
    this.configurationForm.reset({
      policyId: configuration.policyId,
      name: configuration.name,
      priority: configuration.priority,
      currency: configuration.currency,
      publicConfig: JSON.stringify(configuration.publicConfig, null, 2),
      credentials: '',
    });
    this.configurationForm.controls.policyId.disable();
    this.configurationForm.controls.currency.disable();
    this.editorOpen.set(true);
  }

  closeEditor(): void {
    this.editorOpen.set(false);
    this.editing.set(null);
    this.formError.set(null);
  }

  saveConfiguration(): void {
    if (this.configurationForm.invalid || this.busy()) return;
    let publicConfig: Record<string, unknown>;
    let credentials: Record<string, unknown> | undefined;
    try {
      publicConfig = this.parseObject(
        this.configurationForm.getRawValue().publicConfig,
        'Dados públicos',
      );
      const credentialsText = this.configurationForm.getRawValue().credentials.trim();
      credentials = credentialsText ? this.parseObject(credentialsText, 'Credenciais') : undefined;
    } catch (error) {
      this.formError.set((error as Error).message);
      return;
    }

    const values = this.configurationForm.getRawValue();
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

  publicConfigHint(): string {
    const policy = this.policies().find(
      (item) => item.id === this.configurationForm.getRawValue().policyId,
    );
    if (policy?.providerCode === 'PIX_MANUAL') {
      return 'Informe instructions, pixKey e beneficiaryName.';
    }
    if (policy?.providerCode === 'MANUAL') return 'Informe ao menos instructions.';
    if (policy?.providerCode === 'GENERIC_WEBHOOK') {
      return 'As instruções públicas são opcionais; informe webhookSecret nas credenciais.';
    }
    return 'Informe um objeto conforme o contrato do provedor.';
  }

  private defaultPublicConfig(policy?: PaymentMethodPolicy): string {
    if (policy?.providerCode === 'PIX_MANUAL') {
      return JSON.stringify({ instructions: '', pixKey: '', beneficiaryName: '' }, null, 2);
    }
    if (policy?.providerCode === 'MANUAL') {
      return JSON.stringify({ instructions: '' }, null, 2);
    }
    return '{}';
  }

  private parseObject(value: string, label: string): Record<string, unknown> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(value);
    } catch {
      throw new Error(`${label}: informe um JSON válido.`);
    }
    if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
      throw new Error(`${label}: o valor deve ser um objeto JSON.`);
    }
    return parsed as Record<string, unknown>;
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
