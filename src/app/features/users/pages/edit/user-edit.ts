import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CardComponent } from '../../../../shared/components/card/card';
import { UserService } from '../../services/user';
import { ResellerService } from '../../../resellers/services/reseller';
import { AuthService } from '../../../../core/services/auth';
import { AppStateService } from '../../../../core/services/app-state';
import { User, UserPermission, UserRole } from '../../../../core/models/user.model';
import { Reseller } from '../../../resellers/models/reseller.model';

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN:      'Super Admin',
  ADMIN:            'Administrador',
  RESELLER:         'Revendedor',
  RESELLER_MANAGER: 'Gerente de Revendedor',
  VOICE_ACTOR:      'Locutor',
  PRODUCER:         'Produtor',
  CLIENT:           'Cliente',
};

const ROLE_COLORS: Record<UserRole, string> = {
  SUPER_ADMIN:      'text-red-500',
  ADMIN:            'text-orange-500',
  RESELLER:         'text-blue-500',
  RESELLER_MANAGER: 'text-blue-400',
  VOICE_ACTOR:      'text-purple-500',
  PRODUCER:         'text-pink-500',
  CLIENT:           'text-green-500',
};

const PERMISSION_CATALOG: Record<UserRole, string[]> = {
  SUPER_ADMIN:      ['can_manage_users', 'can_view_audit_log', 'can_manage_resellers', 'can_create_role_defaults', 'can_manage_permissions'],
  ADMIN:            ['can_manage_users', 'can_view_audit_log', 'can_manage_resellers'],
  RESELLER:         [],
  RESELLER_MANAGER: ['manage_clients', 'can_place_orders_on_behalf', 'can_access_billing', 'can_view_reports', 'can_edit_client_profile', 'can_manage_team_members'],
  VOICE_ACTOR:      ['can_view_assigned_orders', 'can_deliver_recordings', 'can_message_clients', 'can_upload_audio_files'],
  PRODUCER:         ['can_upload_production_files', 'can_view_assigned_orders'],
  CLIENT:           [],
};

@Component({
  selector: 'app-user-edit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, CardComponent, DatePipe],
  template: `
    <div class="p-6" [class.max-w-2xl]="activeTab() === 'dados'">

      <!-- Cabeçalho -->
      <header class="mb-6">
        <a routerLink="/admin/users" class="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
          ← Voltar para usuários
        </a>
        <div class="mt-3 flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
            {{ initials() }}
          </div>
          <div>
            <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">
              {{ user()?.name || user()?.email || 'Usuário' }}
            </h1>
            <span class="text-xs font-semibold uppercase tracking-wide" [class]="roleColor()">
              {{ roleLabel() }}
            </span>
          </div>
        </div>
      </header>

      @if (loadError()) {
        <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-400">
          {{ loadError() }}
        </div>
      }

      @if (loading()) {
        <div class="flex items-center gap-2 text-sm text-neutral-500">
          <div class="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600"></div>
          Carregando...
        </div>
      }

      @if (user()) {

        <!-- Abas (permissões ocultas até API suportar GET de permissões por usuário) -->
        <nav class="mb-6 flex gap-1 border-b border-neutral-200 dark:border-neutral-700">
          <button type="button" (click)="activeTab.set('dados')"
            class="px-4 pb-3 text-sm transition-colors"
            [class]="activeTab() === 'dados'
              ? 'border-b-2 border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-semibold'
              : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'">
            Dados do usuário
          </button>
        </nav>

        <!-- ── ABA: DADOS ──────────────────────────────────── -->
        @if (activeTab() === 'dados') {
          <form [formGroup]="form" (ngSubmit)="save()" class="space-y-6">

            <app-card title="Informações básicas">
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Nome completo</label>
                  <input type="text" formControlName="name" class="form-input w-full" placeholder="Nome do usuário" />
                  @if (f['name'].invalid && f['name'].touched) {
                    <p class="mt-1 text-xs text-red-500">Mínimo 2 caracteres</p>
                  }
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Email</label>
                  <input type="email" formControlName="email" class="form-input w-full" placeholder="email@exemplo.com" />
                  @if (f['email'].invalid && f['email'].touched) {
                    <p class="mt-1 text-xs text-red-500">Email inválido</p>
                  }
                </div>
              </div>
            </app-card>

            <app-card title="Acesso e papel">
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Papel</label>
                  <select formControlName="role" class="form-input w-full">
                    @for (entry of roleOptions; track entry.value) {
                      <option [value]="entry.value">{{ entry.label }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Status</label>
                  <select formControlName="isActive" class="form-input w-full">
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </select>
                </div>
              </div>
            </app-card>

            @if (showResellerField()) {
              <app-card title="Vínculo com revendedor">
                <div>
                  <label class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Revendedor responsável
                  </label>
                  <select formControlName="resellerId" class="form-input w-full">
                    <option value="">Nenhum (cliente direto)</option>
                    @for (r of resellers(); track r.id) {
                      <option [value]="r.id">{{ r.name }} — {{ r.email }}</option>
                    }
                  </select>
                </div>
              </app-card>
            }

            <!-- Redefinição de senha (só SUPER_ADMIN) -->
            @if (isSuperAdmin()) {
              <app-card title="Senha do usuário">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-neutral-600 dark:text-neutral-400">
                      Envia um link de redefinição de senha para o email do usuário.
                    </p>
                  </div>
                  <button type="button" class="btn-secondary shrink-0"
                    [disabled]="resetLinkSending()"
                    (click)="sendResetLink()">
                    @if (resetLinkSending()) { Enviando... }
                    @else if (resetLinkSent()) { ✓ Link enviado }
                    @else { Enviar link de redefinição }
                  </button>
                </div>
                @if (resetLinkError()) {
                  <p class="mt-2 text-sm text-red-500">{{ resetLinkError() }}</p>
                }
              </app-card>
            }

            <app-card title="Informações da conta">
              <dl class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt class="text-neutral-500">ID</dt>
                  <dd class="break-all font-mono text-xs text-neutral-700 dark:text-neutral-300">{{ user()?.id }}</dd>
                </div>
                <div>
                  <dt class="text-neutral-500">Último login</dt>
                  <dd class="text-neutral-700 dark:text-neutral-300">
                    {{ user()?.lastLoginAt ? (user()!.lastLoginAt! | date:'dd/MM/yyyy HH:mm') : 'Nunca' }}
                  </dd>
                </div>
                <div>
                  <dt class="text-neutral-500">Criado em</dt>
                  <dd class="text-neutral-700 dark:text-neutral-300">
                    {{ user()?.createdAt ? (user()!.createdAt! | date:'dd/MM/yyyy') : '—' }}
                  </dd>
                </div>
                <div>
                  <dt class="text-neutral-500">Atualizado em</dt>
                  <dd class="text-neutral-700 dark:text-neutral-300">
                    {{ user()?.updatedAt ? (user()!.updatedAt! | date:'dd/MM/yyyy') : '—' }}
                  </dd>
                </div>
              </dl>
            </app-card>

            @if (saveError()) {
              <div class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-400">
                {{ saveError() }}
              </div>
            }
            @if (saveSuccess()) {
              <div class="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800/50 dark:bg-green-900/20 dark:text-green-400">
                ✓ Usuário atualizado com sucesso
              </div>
            }

            <div class="flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-700">
              <a routerLink="/admin/users" class="btn-secondary">Cancelar</a>
              <button type="submit" class="btn-primary" [disabled]="form.invalid || saving()">
                {{ saving() ? 'Salvando...' : 'Salvar alterações' }}
              </button>
            </div>

          </form>
        }

        <!-- ── ABA: PERMISSÕES ─────────────────────────────── -->
        @if (activeTab() === 'permissoes') {
          <div class="space-y-4">

            <!-- Transfer list -->
            <div class="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_1fr]">

              <!-- Coluna esquerda: disponíveis -->
              <div class="flex flex-col rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <div class="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800/50">
                  <span class="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Disponíveis</span>
                  <span class="text-xs text-neutral-500">{{ availablePerms().length }} permissões</span>
                </div>
                <div class="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800 min-h-[200px] max-h-[360px]">
                  @if (availablePerms().length === 0) {
                    <p class="p-6 text-center text-sm text-neutral-400">Todas as permissões já foram concedidas</p>
                  }
                  @for (perm of availablePerms(); track perm) {
                    <label class="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <input type="checkbox" class="h-4 w-4 rounded border-neutral-300 accent-violet-600"
                        [checked]="selectedAvailable().has(perm)"
                        (change)="toggleAvailable(perm)" />
                      <span class="font-mono text-xs text-neutral-800 dark:text-neutral-200">{{ perm }}</span>
                    </label>
                  }
                </div>
                <div class="border-t border-neutral-200 dark:border-neutral-700 p-3">
                  <button type="button" (click)="grantSelected()"
                    [disabled]="selectedAvailable().size === 0 || permBusy()"
                    class="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800">
                    @if (permBusy()) { Processando... } @else { Conceder selecionadas → }
                  </button>
                </div>
              </div>

              <!-- Setas centrais -->
              <div class="hidden lg:flex flex-col items-center justify-center gap-3 py-8 text-neutral-400">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
              </div>

              <!-- Coluna direita: concedidas -->
              <div class="flex flex-col rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <div class="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800/50">
                  <span class="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Concedidas</span>
                  <span class="text-xs text-neutral-500">{{ grantedPerms().length }} permissões</span>
                </div>
                <div class="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800 min-h-[200px] max-h-[360px]">
                  @if (grantedPerms().length === 0) {
                    <p class="p-6 text-center text-sm text-neutral-400">Nenhuma permissão concedida</p>
                  }
                  @for (perm of grantedPerms(); track perm.permissionName) {
                    <label class="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <input type="checkbox" class="h-4 w-4 rounded border-neutral-300 accent-violet-600"
                        [checked]="selectedGranted().has(perm.permissionName)"
                        (change)="toggleGranted(perm.permissionName)" />
                      <div class="min-w-0 flex-1">
                        <span class="font-mono text-xs text-neutral-800 dark:text-neutral-200">{{ perm.permissionName }}</span>
                        <p class="text-[10px] text-neutral-400 mt-0.5">
                          Concedida {{ perm.grantedAt | date:'dd/MM/yyyy' }}
                          @if (perm.expiresAt) { · Expira {{ perm.expiresAt | date:'dd/MM/yyyy' }} }
                        </p>
                      </div>
                    </label>
                  }
                </div>
                <div class="border-t border-neutral-200 dark:border-neutral-700 p-3">
                  <button type="button" (click)="revokeSelected()"
                    [disabled]="selectedGranted().size === 0 || permBusy()"
                    class="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-800/50 dark:bg-neutral-900 dark:text-red-400 dark:hover:bg-red-900/20">
                    @if (permBusy()) { Processando... } @else { ← Revogar selecionadas }
                  </button>
                </div>
              </div>
            </div>

            <!-- Conceder permissão customizada -->
            <div class="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-600 p-4">
              <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-500">Permissão customizada</p>
              <div class="flex gap-2">
                <input type="text" [value]="customPermInput()"
                  (input)="customPermInput.set($any($event.target).value)"
                  placeholder="ex: can_access_beta_feature"
                  class="form-input flex-1 font-mono text-sm" />
                <button type="button" (click)="grantCustom()"
                  [disabled]="!customPermInput().trim() || permBusy()"
                  class="btn-primary shrink-0 text-sm disabled:opacity-40">
                  + Conceder
                </button>
              </div>
            </div>

            @if (permError()) {
              <div class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-400">
                {{ permError() }}
              </div>
            }
            @if (permSuccess()) {
              <div class="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800/50 dark:bg-green-900/20 dark:text-green-400">
                ✓ {{ permSuccess() }}
              </div>
            }

          </div>
        }

      }
    </div>
  `,
})
export class UserEditComponent implements OnInit {
  readonly id = input.required<string>();

  private readonly fb               = inject(FormBuilder);
  private readonly userService      = inject(UserService);
  private readonly resellerService  = inject(ResellerService);
  private readonly authService      = inject(AuthService);
  private readonly appState         = inject(AppStateService);
  private readonly destroyRef       = inject(DestroyRef);

  // ── State ──────────────────────────────────────────────────────────────────

  readonly activeTab  = signal<'dados' | 'permissoes'>('dados');
  readonly user       = signal<User | null>(null);
  readonly resellers  = signal<Reseller[]>([]);
  readonly loading    = signal(true);
  readonly loadError  = signal<string | null>(null);

  // Dados tab
  readonly saving      = signal(false);
  readonly saveError   = signal<string | null>(null);
  readonly saveSuccess = signal(false);

  // Reset link (admin)
  readonly resetLinkSending = signal(false);
  readonly resetLinkSent    = signal(false);
  readonly resetLinkError   = signal<string | null>(null);

  readonly isSuperAdmin = computed(() => this.appState.userRole() === 'SUPER_ADMIN');

  // Permissões tab
  readonly grantedPerms    = signal<UserPermission[]>([]);
  readonly selectedAvailable = signal<Set<string>>(new Set());
  readonly selectedGranted   = signal<Set<string>>(new Set());
  readonly permBusy    = signal(false);
  readonly permError   = signal<string | null>(null);
  readonly permSuccess = signal<string | null>(null);
  readonly customPermInput = signal('');

  readonly availablePerms = computed(() => {
    const role = this.user()?.role ?? 'CLIENT';
    const catalog = PERMISSION_CATALOG[role];
    const granted = new Set(this.grantedPerms().map((p) => p.permissionName));
    return catalog.filter((p) => !granted.has(p));
  });

  // ── Form ───────────────────────────────────────────────────────────────────

  readonly roleOptions = (Object.entries(ROLE_LABELS) as [UserRole, string][]).map(
    ([value, label]) => ({ value, label }),
  );

  readonly form = this.fb.nonNullable.group({
    name:       ['', [Validators.required, Validators.minLength(2)]],
    email:      ['', [Validators.required, Validators.email]],
    role:       ['CLIENT' as UserRole, Validators.required],
    isActive:   ['true'],
    resellerId: [''],
  });

  get f() { return this.form.controls; }

  // ── Computed display ───────────────────────────────────────────────────────

  readonly initials  = () => { const u = this.user(); const s = u?.name || u?.email || ''; return s.slice(0, 2).toUpperCase(); };
  readonly roleLabel = () => ROLE_LABELS[this.user()?.role ?? 'CLIENT'];
  readonly roleColor = () => ROLE_COLORS[this.user()?.role ?? 'CLIENT'];
  readonly showResellerField = () => { const r = this.f['role'].value; return r === 'CLIENT' || r === 'RESELLER_MANAGER'; };

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  ngOnInit(): void {
    forkJoin({
      user:      this.userService.getFull(this.id()).pipe(catchError(() => of(null))),
      resellers: this.resellerService.list().pipe(catchError(() => of([]))),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ user, resellers }) => {
        this.resellers.set(resellers as Reseller[]);
        if (user) {
          this.user.set(user);
          this.grantedPerms.set(user.permissions ?? []);
          this.form.patchValue({
            name:       user.name ?? '',
            email:      user.email,
            role:       user.role,
            isActive:   String(user.isActive ?? true),
            resellerId: user.resellerId ?? '',
          });
        } else {
          this.loadError.set('Não foi possível carregar o usuário.');
        }
        this.loading.set(false);
      });
  }

  // ── Dados ──────────────────────────────────────────────────────────────────

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.saveError.set(null);
    this.saveSuccess.set(false);

    const { name, email, role, isActive, resellerId } = this.form.getRawValue();
    const dto: Record<string, unknown> = { name, email, role, isActive: isActive === 'true' };
    if (role === 'CLIENT' || role === 'RESELLER_MANAGER') dto['resellerId'] = resellerId || null;

    this.userService
      .updateRaw(this.id(), dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.user.set(updated);
          this.saving.set(false);
          this.saveSuccess.set(true);
          setTimeout(() => this.saveSuccess.set(false), 3000);
        },
        error: (err: Error) => {
          this.saving.set(false);
          this.saveError.set(err.message ?? 'Erro ao salvar');
        },
      });
  }

  // ── Reset de senha (admin) ────────────────────────────────────────────────

  sendResetLink(): void {
    const email = this.user()?.email;
    if (!email) return;
    this.resetLinkSending.set(true);
    this.resetLinkError.set(null);

    this.authService
      .forgotPassword(email)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.resetLinkSending.set(false);
          this.resetLinkSent.set(true);
          setTimeout(() => this.resetLinkSent.set(false), 5000);
        },
        error: (err: Error) => {
          this.resetLinkSending.set(false);
          this.resetLinkError.set(err.message ?? 'Erro ao enviar link.');
        },
      });
  }

  // ── Permissões: seleção ────────────────────────────────────────────────────

  toggleAvailable(perm: string): void {
    this.selectedAvailable.update((s) => { const n = new Set(s); n.has(perm) ? n.delete(perm) : n.add(perm); return n; });
  }

  toggleGranted(perm: string): void {
    this.selectedGranted.update((s) => { const n = new Set(s); n.has(perm) ? n.delete(perm) : n.add(perm); return n; });
  }

  // ── Permissões: concessão ──────────────────────────────────────────────────

  grantSelected(): void {
    const perms = [...this.selectedAvailable()];
    if (!perms.length) return;
    this.executeGrants(perms, () => this.selectedAvailable.set(new Set()));
  }

  grantCustom(): void {
    const perm = this.customPermInput().trim();
    if (!perm) return;
    this.executeGrants([perm], () => this.customPermInput.set(''));
  }

  private executeGrants(perms: string[], onDone: () => void): void {
    this.permBusy.set(true);
    this.permError.set(null);
    this.permSuccess.set(null);

    const calls = perms.map((p) =>
      this.userService.grantPermission(this.id(), { permissionName: p }).pipe(catchError(() => of(null))),
    );

    forkJoin(calls)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (results) => {
          const granted = results.filter((r): r is UserPermission => r !== null);
          this.grantedPerms.update((cur) => [...cur, ...granted]);
          this.permBusy.set(false);
          this.permSuccess.set(`${granted.length} permissão(ões) concedida(s)`);
          onDone();
          setTimeout(() => this.permSuccess.set(null), 3000);
        },
        error: (err: Error) => {
          this.permBusy.set(false);
          this.permError.set(err.message ?? 'Erro ao conceder permissão');
        },
      });
  }

  // ── Permissões: revogação ──────────────────────────────────────────────────

  revokeSelected(): void {
    const perms = [...this.selectedGranted()];
    if (!perms.length) return;
    this.permBusy.set(true);
    this.permError.set(null);
    this.permSuccess.set(null);

    const calls = perms.map((p) =>
      this.userService.revokePermission(this.id(), p).pipe(catchError(() => of(null))),
    );

    forkJoin(calls)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const revoked = new Set(perms);
          this.grantedPerms.update((cur) => cur.filter((p) => !revoked.has(p.permissionName)));
          this.selectedGranted.set(new Set());
          this.permBusy.set(false);
          this.permSuccess.set(`${perms.length} permissão(ões) revogada(s)`);
          setTimeout(() => this.permSuccess.set(null), 3000);
        },
        error: (err: Error) => {
          this.permBusy.set(false);
          this.permError.set(err.message ?? 'Erro ao revogar permissão');
        },
      });
  }
}
