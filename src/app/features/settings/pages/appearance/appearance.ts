import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppStateService } from '../../../../core/services/app-state';
import { AuthService } from '../../../../core/services/auth';
import { CardComponent } from '../../../../shared/components/card/card';

@Component({
  selector: 'app-settings-appearance',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CardComponent],
  template: `
    <div class="p-6 space-y-6">

      <!-- Aparência -->
      <app-card title="Aparência">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-neutral-900 dark:text-white">Tema escuro</p>
            <p class="text-sm text-neutral-500">Alterar entre tema claro e escuro.</p>
          </div>
          <button type="button" class="btn-secondary" (click)="appState.toggleTheme()">
            {{ appState.theme() === 'dark' ? 'Desligar' : 'Ligar' }}
          </button>
        </div>
      </app-card>

      <!-- Alterar senha -->
      <app-card title="Alterar senha">
        <form [formGroup]="form" (ngSubmit)="changePassword()" class="space-y-4 max-w-sm">

          <div>
            <label class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Senha atual
            </label>
            <input [type]="showPwd() ? 'text' : 'password'" formControlName="currentPassword"
              class="form-input w-full" placeholder="••••••••" autocomplete="current-password" />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Nova senha
            </label>
            <input [type]="showPwd() ? 'text' : 'password'" formControlName="newPassword"
              class="form-input w-full" placeholder="Mínimo 8 caracteres" autocomplete="new-password" />
            @if (form.get('newPassword')?.invalid && form.get('newPassword')?.touched) {
              <p class="mt-1 text-xs text-red-500">Mínimo 8 caracteres</p>
            }
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Confirmar nova senha
            </label>
            <input [type]="showPwd() ? 'text' : 'password'" formControlName="confirmNewPassword"
              class="form-input w-full" placeholder="Repita a nova senha" autocomplete="new-password" />
            @if (form.errors?.['mismatch'] && form.get('confirmNewPassword')?.touched) {
              <p class="mt-1 text-xs text-red-500">As senhas não coincidem</p>
            }
          </div>

          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" (change)="showPwd.set($any($event.target).checked)"
              class="h-4 w-4 rounded border-neutral-300 accent-violet-600" />
            <span class="text-sm text-neutral-500">Mostrar senhas</span>
          </label>

          @if (pwdError()) {
            <div class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-400">
              {{ pwdError() }}
            </div>
          }
          @if (pwdSuccess()) {
            <div class="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-800/50 dark:bg-green-900/20 dark:text-green-400">
              ✓ Senha alterada. Faça login novamente.
            </div>
          }

          <div class="flex justify-end">
            <button type="submit" class="btn-primary"
              [disabled]="form.invalid || pwdLoading()">
              {{ pwdLoading() ? 'Salvando...' : 'Alterar senha' }}
            </button>
          </div>
        </form>
      </app-card>

    </div>
  `,
})
export class SettingsAppearanceComponent {
  protected readonly appState = inject(AppStateService);
  private readonly authService = inject(AuthService);
  private readonly fb          = inject(FormBuilder);
  private readonly destroyRef  = inject(DestroyRef);

  readonly showPwd    = signal(false);
  readonly pwdLoading = signal(false);
  readonly pwdError   = signal<string | null>(null);
  readonly pwdSuccess = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      currentPassword:    ['', Validators.required],
      newPassword:        ['', [Validators.required, Validators.minLength(8)]],
      confirmNewPassword: ['', Validators.required],
    },
    { validators: (g) => g.get('newPassword')?.value === g.get('confirmNewPassword')?.value ? null : { mismatch: true } },
  );

  changePassword(): void {
    if (this.form.invalid) return;
    const { currentPassword, newPassword, confirmNewPassword } = this.form.getRawValue();
    this.pwdLoading.set(true);
    this.pwdError.set(null);
    this.pwdSuccess.set(false);

    this.authService
      .changePassword(currentPassword, newPassword, confirmNewPassword)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.pwdLoading.set(false);
          this.pwdSuccess.set(true);
          this.form.reset();
          // Sessão invalidada — limpar tokens locais após breve delay
          setTimeout(() => this.authService.clearSession(), 3000);
        },
        error: (err: Error) => {
          this.pwdLoading.set(false);
          this.pwdError.set(err.message ?? 'Senha atual incorreta.');
        },
      });
  }
}
