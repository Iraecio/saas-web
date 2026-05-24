import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { UserService } from '../../services/user';
import { UserPermission } from '../../../../core/models/user.model';

@Component({
  selector: 'app-user-permissions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  template: `
    <div class="p-6 max-w-3xl mx-auto space-y-6">
      <header class="flex items-center gap-4">
        <a [routerLink]="['../../', userId()]" class="text-neutral-500 hover:text-white transition-colors">← Voltar</a>
        <div>
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Permissões do usuário</h1>
          <p class="text-sm text-neutral-500 mt-1">ID: {{ userId() }}</p>
        </div>
      </header>

      <!-- Lista de permissões ativas -->
      <section class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
        <h2 class="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Permissões ativas</h2>

        @if (loading()) {
          <div class="flex justify-center py-8">
            <div class="w-5 h-5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else if (permissions().length === 0) {
          <p class="text-neutral-500 text-sm py-4 text-center">Nenhuma permissão concedida.</p>
        } @else {
          <div class="divide-y divide-neutral-200 dark:divide-neutral-800">
            @for (perm of permissions(); track perm.id) {
              <div class="py-3 flex items-center justify-between">
                <div>
                  <span class="font-mono text-sm text-neutral-900 dark:text-white">{{ perm.permissionName }}</span>
                  <p class="text-xs text-neutral-500 mt-0.5">
                    Concedida em {{ perm.grantedAt | date:'dd/MM/yyyy' }}
                    @if (perm.expiresAt) { · Expira {{ perm.expiresAt | date:'dd/MM/yyyy' }} }
                  </p>
                </div>
                <button (click)="revoke(perm.permissionName)"
                  class="text-xs text-red-500 hover:text-red-700 transition-colors px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                  Revogar
                </button>
              </div>
            }
          </div>
        }
      </section>

      <!-- Formulário para conceder permissão -->
      <section class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
        <h2 class="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Conceder permissão</h2>

        <form [formGroup]="form" (ngSubmit)="grant()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Nome da permissão
            </label>
            <input type="text" formControlName="permissionName"
              placeholder="ex: manage_clients, can_access_billing"
              class="form-input w-full font-mono text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Data de expiração (opcional)
            </label>
            <input type="date" formControlName="expiresAt" class="form-input w-full" />
          </div>

          @if (grantError()) {
            <p class="text-sm text-red-500">{{ grantError() }}</p>
          }
          @if (grantSuccess()) {
            <p class="text-sm text-green-600 dark:text-green-400">✓ Permissão concedida com sucesso</p>
          }

          <div class="flex justify-end">
            <button type="submit" [disabled]="form.invalid || granting()"
              class="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
              {{ granting() ? 'Concedendo...' : 'Conceder permissão' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  `,
})
export class PermissionsPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  readonly userId = signal('');
  readonly permissions = signal<UserPermission[]>([]);
  readonly loading = signal(true);
  readonly granting = signal(false);
  readonly grantSuccess = signal(false);
  readonly grantError = signal<string | undefined>(undefined);

  readonly form = this.fb.nonNullable.group({
    permissionName: ['', Validators.required],
    expiresAt: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.userId.set(id);
    this.loadPermissions(id);
  }

  private loadPermissions(userId: string): void {
    this.loading.set(true);
    this.userService
      .get(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          // UserListItem doesn't carry full permissions — re-fetch full user via getUser
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    // Fetch full user to get permissions
    this.userService
      .getFull(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.permissions.set(user.permissions ?? []);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  grant(): void {
    const userId = this.userId();
    if (!userId) return;
    this.granting.set(true);
    this.grantSuccess.set(false);
    this.grantError.set(undefined);

    const { permissionName, expiresAt } = this.form.getRawValue();
    this.userService
      .grantPermission(userId, { permissionName, expiresAt: expiresAt || undefined })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (perm) => {
          this.permissions.update((p) => [...p, perm]);
          this.granting.set(false);
          this.grantSuccess.set(true);
          this.form.reset();
          setTimeout(() => this.grantSuccess.set(false), 3000);
        },
        error: (err: Error) => {
          this.granting.set(false);
          this.grantError.set(err.message ?? 'Erro ao conceder permissão');
        },
      });
  }

  revoke(permissionName: string): void {
    const userId = this.userId();
    if (!userId) return;
    this.userService
      .revokePermission(userId, permissionName)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.permissions.update((p) => p.filter((x) => x.permissionName !== permissionName));
        },
        error: (err: Error) => this.grantError.set(err.message ?? 'Erro ao revogar'),
      });
  }
}
