import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize, Observable, switchMap, throwError } from 'rxjs';
import { ProfessionalAdminDetail } from '../../../../core/models/professional-admin.model';
import { NotificationService } from '../../../../core/services/notification';
import { ImpersonationService } from '../../../../core/services/impersonation';
import { ProfessionalAdminService } from '../../services/professional-admin';

type Section = 'overview' | 'profile' | 'services' | 'orders' | 'wallet' | 'audit';

@Component({
  selector: 'app-professional-admin-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyPipe, DatePipe, FormsModule],
  template: `
    <main class="mx-auto max-w-[1320px] space-y-6 p-4 sm:p-6 lg:p-8">
      <a
        routerLink=".."
        class="inline-flex min-h-11 items-center text-sm font-semibold text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
        >← Voltar para profissionais</a
      >

      @if (loading()) {
        <div
          class="h-48 animate-pulse rounded-3xl bg-neutral-200/70 dark:bg-neutral-800"
          aria-label="Carregando profissional"
        ></div>
        <div class="grid gap-4 lg:grid-cols-3">
          @for (_ of [1, 2, 3]; track $index) {
            <div class="h-44 animate-pulse rounded-2xl bg-neutral-200/70 dark:bg-neutral-800"></div>
          }
        </div>
      } @else if (error()) {
        <section
          role="alert"
          class="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
        >
          <h1 class="text-lg font-semibold">Não foi possível abrir este profissional</h1>
          <p class="mt-2 text-sm">{{ error() }}</p>
          <button class="btn-secondary mt-5" (click)="load()">Tentar novamente</button>
        </section>
      } @else if (detail(); as data) {
        <header
          class="relative overflow-hidden rounded-3xl bg-neutral-950 px-5 pb-6 pt-7 text-white sm:px-8 sm:pb-8"
        >
          <div
            class="absolute -right-16 -top-24 size-64 rounded-full bg-emerald-500/15 blur-3xl"
          ></div>
          <div class="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div class="flex items-start gap-4">
              <div
                class="grid size-16 shrink-0 place-items-center rounded-2xl bg-emerald-400 text-xl font-semibold text-neutral-950"
              >
                {{ initials(data.professional.name) }}
              </div>
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">
                    {{ data.professional.name }}
                  </h1>
                  <span
                    class="rounded-md border px-2 py-1 text-xs"
                    [class.border-emerald-400]="data.professional.accountStatus === 'ACTIVE'"
                    [class.text-emerald-300]="data.professional.accountStatus === 'ACTIVE'"
                    [class.border-red-400]="data.professional.accountStatus === 'BLOCKED'"
                    [class.text-red-300]="data.professional.accountStatus === 'BLOCKED'"
                    >{{
                      data.professional.accountStatus === 'ACTIVE'
                        ? 'Conta ativa'
                        : 'Conta bloqueada'
                    }}</span
                  >
                </div>
                <p class="mt-1 text-sm text-neutral-400">
                  {{ roleLabel(data) }} ·
                  {{ data.professional.scope === 'GLOBAL' ? 'Global' : 'Revenda' }} ·
                  {{ data.user.email }}
                </p>
                <p class="mt-2 font-mono text-xs text-neutral-500">{{ data.user.id }}</p>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                class="min-h-11 rounded-lg bg-white px-4 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200 active:translate-y-px"
                (click)="openAction('inspect')"
              >
                Inspecionar</button
              ><button
                class="min-h-11 rounded-lg border border-neutral-700 px-4 text-sm font-semibold hover:bg-neutral-800"
                (click)="openAction('edit')"
              >
                Editar</button
              ><button
                class="min-h-11 rounded-lg border border-neutral-700 px-4 text-sm font-semibold hover:bg-neutral-800"
                (click)="
                  openAction(data.professional.accountStatus === 'ACTIVE' ? 'block' : 'reactivate')
                "
              >
                {{ data.professional.accountStatus === 'ACTIVE' ? 'Bloquear' : 'Reativar' }}</button
              ><button
                class="min-h-11 rounded-lg border border-neutral-700 px-4 text-sm font-semibold hover:bg-neutral-800"
                (click)="openAction('reset')"
              >
                Redefinir senha
              </button>
            </div>
          </div>
        </header>

        <nav
          class="flex gap-1 overflow-x-auto border-b border-neutral-200 pb-px dark:border-neutral-800"
          aria-label="Seções do profissional"
        >
          @for (item of sections; track item.id) {
            <button
              class="min-h-11 shrink-0 border-b-2 px-3 text-sm font-medium transition"
              [class.border-emerald-600]="section() === item.id"
              [class.text-emerald-700]="section() === item.id"
              [class.border-transparent]="section() !== item.id"
              [class.text-neutral-500]="section() !== item.id"
              (click)="section.set(item.id)"
            >
              {{ item.label }}
            </button>
          }
        </nav>

        @if (section() === 'overview') {
          <section class="grid gap-4 lg:grid-cols-3">
            <article
              class="rounded-2xl bg-white p-5 ring-1 ring-neutral-200/80 dark:bg-neutral-950 dark:ring-neutral-800"
            >
              <p class="text-xs font-medium text-neutral-500">Último acesso</p>
              <p class="mt-3 font-semibold">
                {{
                  data.user.lastLoginAt
                    ? (data.user.lastLoginAt | date: 'dd/MM/yyyy HH:mm')
                    : 'Nunca acessou'
                }}
              </p>
              <p class="mt-1 text-sm text-neutral-500">
                Conta criada em {{ data.user.createdAt | date: 'dd/MM/yyyy' }}
              </p>
            </article>
            <article
              class="rounded-2xl bg-white p-5 ring-1 ring-neutral-200/80 dark:bg-neutral-950 dark:ring-neutral-800"
            >
              <p class="text-xs font-medium text-neutral-500">Serviços</p>
              <p class="mt-3 text-3xl font-semibold tabular-nums">{{ data.offerings.length }}</p>
              <p class="mt-1 text-sm text-neutral-500">
                {{ activeServices(data) }} ativos no catálogo
              </p>
            </article>
            <article
              class="rounded-2xl bg-white p-5 ring-1 ring-neutral-200/80 dark:bg-neutral-950 dark:ring-neutral-800"
            >
              <p class="text-xs font-medium text-neutral-500">Verificação</p>
              <p class="mt-3 font-semibold">
                {{ data.professional.verificationStatus || 'Não informada' }}
              </p>
              <p class="mt-1 text-sm text-neutral-500">
                Perfil
                {{
                  data.professional.scope === 'GLOBAL'
                    ? 'disponível globalmente'
                    : 'vinculado a uma revenda'
                }}
              </p>
            </article>
          </section>
          <section class="grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
            <article
              class="rounded-2xl bg-white p-6 ring-1 ring-neutral-200/80 dark:bg-neutral-950 dark:ring-neutral-800"
            >
              <h2 class="text-lg font-semibold">Dados essenciais</h2>
              <dl class="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <dt class="text-xs text-neutral-500">Nome</dt>
                  <dd class="mt-1 font-medium">{{ data.user.name || 'Não informado' }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-neutral-500">E-mail</dt>
                  <dd class="mt-1 break-all font-medium">{{ data.user.email }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-neutral-500">Papel</dt>
                  <dd class="mt-1 font-medium">{{ roleLabel(data) }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-neutral-500">Revenda</dt>
                  <dd class="mt-1 font-medium">{{ data.user.resellerId || 'Sem vínculo' }}</dd>
                </div>
              </dl>
            </article>
            <article class="rounded-2xl bg-neutral-100 p-6 dark:bg-neutral-900">
              <h2 class="text-lg font-semibold">Próximas ações</h2>
              <p class="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                Revise os serviços e pedidos antes de bloquear uma conta. A inspeção é registrada e
                funciona somente em leitura.
              </p>
            </article>
          </section>
        } @else if (section() === 'profile') {
          <section
            class="rounded-2xl bg-white p-6 ring-1 ring-neutral-200/80 dark:bg-neutral-950 dark:ring-neutral-800"
          >
            <h2 class="text-xl font-semibold">Perfil e conta</h2>
            <dl class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt class="text-xs text-neutral-500">Nome</dt>
                <dd class="mt-1 font-medium">{{ data.user.name || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-neutral-500">E-mail</dt>
                <dd class="mt-1 font-medium">{{ data.user.email }}</dd>
              </div>
              <div>
                <dt class="text-xs text-neutral-500">Status</dt>
                <dd class="mt-1 font-medium">
                  {{ data.user.isActive === false ? 'Bloqueada' : 'Ativa' }}
                </dd>
              </div>
              <div>
                <dt class="text-xs text-neutral-500">Escopo</dt>
                <dd class="mt-1 font-medium">{{ data.professional.scope }}</dd>
              </div>
              <div>
                <dt class="text-xs text-neutral-500">Sotaque</dt>
                <dd class="mt-1 font-medium">{{ data.professional.accent || 'Não informado' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-neutral-500">Atualizado</dt>
                <dd class="mt-1 font-medium">
                  {{ data.user.updatedAt | date: 'dd/MM/yyyy HH:mm' }}
                </dd>
              </div>
            </dl>
          </section>
        } @else if (section() === 'services') {
          <section class="space-y-3">
            <div>
              <h2 class="text-xl font-semibold">Serviços</h2>
              <p class="text-sm text-neutral-500">
                Ofertas, valores e disponibilidade deste profissional.
              </p>
            </div>
            @for (offering of data.offerings; track offering.serviceId) {
              <article
                class="flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-neutral-200/80 dark:bg-neutral-950 dark:ring-neutral-800 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 class="font-semibold">{{ offering.serviceName }}</h3>
                  <p class="mt-1 text-sm text-neutral-500">
                    {{ offering.scope }} · {{ offering.active ? 'Ativo' : 'Inativo' }}
                  </p>
                </div>
                <p class="font-semibold tabular-nums">
                  {{ offering.priceCents / 100 | currency: 'BRL' }}
                </p>
              </article>
            } @empty {
              <div
                class="rounded-2xl border border-dashed p-10 text-center text-sm text-neutral-500"
              >
                Nenhum serviço configurado.
              </div>
            }
          </section>
        } @else {
          <section
            class="rounded-2xl border border-dashed border-neutral-300 px-6 py-14 text-center dark:border-neutral-700"
          >
            <h2 class="font-semibold text-neutral-900 dark:text-white">{{ sectionTitle() }}</h2>
            <p class="mx-auto mt-2 max-w-lg text-sm leading-6 text-neutral-500">
              Esta seção depende do endpoint administrativo agregado definido no contrato da
              feature. Os dados existentes permanecem preservados.
            </p>
          </section>
        }
      }
    </main>

    @if (action(); as currentAction) {
      <div class="fixed inset-0 z-40 bg-neutral-950/55" (click)="closeAction()"></div>
      <section
        class="fixed inset-x-3 bottom-3 z-50 max-h-[90dvh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-950 sm:left-auto sm:right-6 sm:top-1/2 sm:bottom-auto sm:w-[30rem] sm:-translate-y-1/2"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="'action-title'"
      >
        <h2 id="action-title" class="text-xl font-semibold">{{ actionTitle(currentAction) }}</h2>
        <p class="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
          {{ actionDescription(currentAction) }}
        </p>
        @if (currentAction === 'edit') {
          <div class="mt-5 space-y-4">
            <div>
              <label class="mb-1.5 block text-sm font-medium" for="edit-name">Nome</label
              ><input id="edit-name" class="form-input min-h-11 w-full" [(ngModel)]="editName" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium" for="edit-email">E-mail</label
              ><input
                id="edit-email"
                class="form-input min-h-11 w-full"
                type="email"
                [(ngModel)]="editEmail"
              />
            </div>
          </div>
        }
        @if (
          currentAction === 'block' || currentAction === 'reactivate' || currentAction === 'inspect'
        ) {
          <div class="mt-5">
            <label class="mb-1.5 block text-sm font-medium" for="action-reason">Motivo</label
            ><textarea
              id="action-reason"
              class="form-input min-h-24 w-full"
              maxlength="500"
              [(ngModel)]="reason"
              placeholder="Registre o motivo desta ação"
            ></textarea>
          </div>
        }
        @if (actionError()) {
          <p
            role="alert"
            class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
          >
            {{ actionError() }}
          </p>
        }
        <div class="mt-6 flex justify-end gap-2">
          <button class="btn-secondary min-h-11" [disabled]="saving()" (click)="closeAction()">
            Cancelar</button
          ><button
            class="btn-primary min-h-11"
            [disabled]="saving() || !actionValid(currentAction)"
            (click)="confirmAction(currentAction)"
          >
            {{ saving() ? 'Processando…' : actionButton(currentAction) }}
          </button>
        </div>
      </section>
    }
  `,
})
export class ProfessionalAdminDetailPage {
  private readonly service = inject(ProfessionalAdminService);
  private readonly route = inject(ActivatedRoute);
  private readonly notify = inject(NotificationService);
  private readonly inspection = inject(ImpersonationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly detail = signal<ProfessionalAdminDetail | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly section = signal<Section>(
    (this.route.snapshot.queryParamMap.get('section') as Section) || 'overview',
  );
  readonly action = signal<'inspect' | 'edit' | 'block' | 'reactivate' | 'reset' | null>(null);
  readonly saving = signal(false);
  readonly actionError = signal('');
  reason = '';
  editName = '';
  editEmail = '';
  readonly sections: { id: Section; label: string }[] = [
    { id: 'overview', label: 'Visão geral' },
    { id: 'profile', label: 'Perfil' },
    { id: 'services', label: 'Serviços' },
    { id: 'orders', label: 'Pedidos' },
    { id: 'wallet', label: 'Carteira' },
    { id: 'audit', label: 'Auditoria' },
  ];
  constructor() {
    this.load();
  }
  load(): void {
    const userId = this.route.snapshot.paramMap.get('userId')!;
    this.loading.set(true);
    this.error.set('');
    this.service
      .findByUserId(userId)
      .pipe(
        switchMap((profile) =>
          profile
            ? this.service.getDetail(userId, profile)
            : throwError(() => new Error('Profissional não encontrado.')),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (detail) => {
          this.detail.set(detail);
          this.loading.set(false);
        },
        error: (error) => {
          this.error.set(error.message);
          this.loading.set(false);
        },
      });
  }
  openAction(action: NonNullable<ReturnType<typeof this.action>>): void {
    const data = this.detail();
    if (!data) return;
    this.action.set(action);
    this.actionError.set('');
    this.reason = '';
    this.editName = data.user.name ?? '';
    this.editEmail = data.user.email;
  }
  closeAction(): void {
    if (!this.saving()) this.action.set(null);
  }
  actionValid(action: string): boolean {
    return action === 'edit'
      ? !!this.editName.trim() && /.+@.+\..+/.test(this.editEmail)
      : action === 'reset' || this.reason.trim().length >= 5;
  }
  confirmAction(action: string): void {
    const data = this.detail();
    if (!data) return;
    this.saving.set(true);
    this.actionError.set('');
    const request: Observable<unknown> =
      action === 'edit'
        ? this.service.updateUser(data.user.id, {
            name: this.editName.trim(),
            email: this.editEmail.trim(),
          })
        : action === 'block'
          ? this.service.block(data.user.id)
          : action === 'reactivate'
            ? this.service.reactivate(data.user.id)
            : action === 'reset'
              ? this.service.sendPasswordReset(data.user.email)
              : this.inspection.start(data.user.id, this.reason.trim());
    request
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.action.set(null);
          this.notify.success(
            action === 'reset'
              ? 'Link de redefinição enviado.'
              : action === 'inspect'
                ? 'Inspeção iniciada em modo somente leitura.'
                : 'Profissional atualizado.',
          );
          if (action === 'inspect')
            void this.router.navigate([
              data.professional.role === 'VOICE_ACTOR'
                ? '/admin/dashboard/voice-actor'
                : '/admin/dashboard/producer',
            ]);
          if (action !== 'inspect') this.load();
        },
        error: (error) =>
          this.actionError.set(error.message ?? 'Não foi possível concluir a ação.'),
      });
  }
  actionTitle(action: string): string {
    return (
      {
        inspect: 'Inspecionar como profissional',
        edit: 'Editar profissional',
        block: 'Bloquear conta',
        reactivate: 'Reativar conta',
        reset: 'Redefinir senha',
      } as Record<string, string>
    )[action];
  }
  actionDescription(action: string): string {
    return (
      {
        inspect:
          'Você verá o sistema na perspectiva deste profissional, em modo somente leitura por até 30 minutos. A ação será auditada.',
        edit: 'Atualize os dados básicos da conta. Alterações ficam registradas.',
        block: 'O acesso será interrompido. Os dados e o histórico serão preservados.',
        reactivate: 'O profissional recuperará o acesso ao sistema.',
        reset:
          'Enviaremos um link temporário ao e-mail cadastrado. A senha nunca é exibida ao administrador.',
      } as Record<string, string>
    )[action];
  }
  actionButton(action: string): string {
    return (
      {
        inspect: 'Iniciar inspeção',
        edit: 'Salvar alterações',
        block: 'Bloquear conta',
        reactivate: 'Reativar conta',
        reset: 'Enviar link',
      } as Record<string, string>
    )[action];
  }
  initials(name: string): string {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase();
  }
  roleLabel(data: ProfessionalAdminDetail): string {
    return data.professional.role === 'VOICE_ACTOR' ? 'Locutor(a)' : 'Produtor(a)';
  }
  activeServices(data: ProfessionalAdminDetail): number {
    return data.offerings.filter((item) => item.active).length;
  }
  sectionTitle(): string {
    return (
      (
        {
          orders: 'Pedidos do profissional',
          wallet: 'Carteira e movimentações',
          audit: 'Histórico administrativo',
        } as Record<string, string>
      )[this.section()] ?? ''
    );
  }
}
