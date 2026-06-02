import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { CardComponent } from '../../../../shared/components/card/card';
import { UserService } from '../../services/user';
import { ResellerService } from '../../../resellers/services/reseller';
import { User, UserRole } from '../../../../core/models/user.model';
import { Reseller } from '../../../resellers/models/reseller.model';

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrador',
  RESELLER: 'Revendedor',
  RESELLER_MANAGER: 'Gerente de Revendedor',
  VOICE_ACTOR: 'Locutor',
  PRODUCER: 'Produtor',
  CLIENT: 'Cliente',
};

@Component({
  selector: 'app-user-edit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, CardComponent, DatePipe],
  template: `
    <div class="p-6 max-w-2xl">
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
        <form [formGroup]="form" (ngSubmit)="save()" class="space-y-6">

          <!-- Informações básicas -->
          <app-card title="Informações básicas">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Nome completo
                </label>
                <input type="text" formControlName="name" class="form-input w-full"
                  placeholder="Nome do usuário" />
                @if (f['name'].invalid && f['name'].touched) {
                  <p class="mt-1 text-xs text-red-500">Mínimo 2 caracteres</p>
                }
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Email
                </label>
                <input type="email" formControlName="email" class="form-input w-full"
                  placeholder="email@exemplo.com" />
                @if (f['email'].invalid && f['email'].touched) {
                  <p class="mt-1 text-xs text-red-500">Email inválido</p>
                }
              </div>
            </div>
          </app-card>

          <!-- Acesso e papel -->
          <app-card title="Acesso e papel">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Papel
                </label>
                <select formControlName="role" class="form-input w-full">
                  @for (entry of roleOptions; track entry.value) {
                    <option [value]="entry.value">{{ entry.label }}</option>
                  }
                </select>
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Status
                </label>
                <select formControlName="isActive" class="form-input w-full">
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>
            </div>
          </app-card>

          <!-- Vínculo (CLIENT e RESELLER_MANAGER) -->
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

          <!-- Info: campos não editáveis pela API -->
          <app-card title="Informações da conta">
            <dl class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt class="text-neutral-500">ID</dt>
                <dd class="font-mono text-xs text-neutral-700 dark:text-neutral-300 break-all">{{ user()?.id }}</dd>
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

          <!-- Feedback -->
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
              @if (saving()) {
                <span>Salvando...</span>
              } @else {
                <span>Salvar alterações</span>
              }
            </button>
          </div>

        </form>
      }
    </div>
  `,
})
export class UserEditComponent implements OnInit {
  readonly id = input.required<string>();

  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly resellerService = inject(ResellerService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly user = signal<User | null>(null);
  readonly resellers = signal<Reseller[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly saveError = signal<string | null>(null);
  readonly saveSuccess = signal(false);

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

  readonly initials = () => {
    const u = this.user();
    const src = u?.name || u?.email || '';
    return src.slice(0, 2).toUpperCase();
  };

  readonly roleLabel = () => ROLE_LABELS[this.user()?.role ?? 'CLIENT'];

  readonly roleColor = () => {
    const colors: Record<UserRole, string> = {
      SUPER_ADMIN:      'text-red-500',
      ADMIN:            'text-orange-500',
      RESELLER:         'text-blue-500',
      RESELLER_MANAGER: 'text-blue-400',
      VOICE_ACTOR:      'text-purple-500',
      PRODUCER:         'text-pink-500',
      CLIENT:           'text-green-500',
    };
    return colors[this.user()?.role ?? 'CLIENT'];
  };

  readonly showResellerField = () => {
    const role = this.f['role'].value;
    return role === 'CLIENT' || role === 'RESELLER_MANAGER';
  };

  ngOnInit(): void {
    this.userService
      .getFull(this.id())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.user.set(user);
          this.form.patchValue({
            name:       user.name ?? '',
            email:      user.email,
            role:       user.role,
            isActive:   String(user.isActive ?? true),
            resellerId: user.resellerId ?? '',
          });
          this.loading.set(false);
        },
        error: (err: Error) => {
          this.loadError.set(err.message ?? 'Erro ao carregar usuário');
          this.loading.set(false);
        },
      });

    this.resellerService
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (r) => this.resellers.set(r), error: () => {} });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.saveError.set(null);
    this.saveSuccess.set(false);

    const { name, email, role, isActive, resellerId } = this.form.getRawValue();
    const dto: Record<string, unknown> = { name, email, role, isActive: isActive === 'true' };

    if (role === 'CLIENT' || role === 'RESELLER_MANAGER') {
      dto['resellerId'] = resellerId || null;
    }

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
}
