import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MagicCubeComponent } from '../../../../shared/components/magic-cube/magic-cube';
import { AuthService } from '../../../../core/services/auth';
import { AppStateService } from '../../../../core/services/app-state';
import { UserRole } from '../../../../core/models/user.model';

@Component({
  selector: 'app-bootstrap',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MagicCubeComponent],
  template: `
    <div class="min-h-screen w-full flex items-center justify-center bg-black p-6 overflow-y-auto relative">
      <app-magic-cube />

      <div class="absolute inset-0 bg-[radial-gradient(ellipse_50%_70%_at_center,rgba(0,0,0,0.85)_0%,transparent_80%)] pointer-events-none"></div>

      <div class="w-full max-w-md relative z-10 bg-neutral-950/85 backdrop-blur-2xl rounded-2xl p-8 border border-white/20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] ring-1 ring-white/5">
        <!-- Cabeçalho -->
        <div class="mb-8">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-4">
            <span class="text-lg">👑</span>
          </div>
          <h2 class="text-3xl font-bold text-white">Inicializar Sistema</h2>
          <p class="text-neutral-400 mt-2">Crie o primeiro super admin</p>
        </div>

        <!-- Aviso de Segurança -->
        <div class="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-6">
          <p class="text-sm text-amber-400 flex items-start gap-3">
            <span class="flex-shrink-0 text-lg">⚠️</span>
            <span>Esta operação só pode ser realizada uma vez. Guarde as credenciais com segurança.</span>
          </p>
        </div>

        <!-- Formulário -->
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-6">
          <!-- Nome Input -->
          <div class="group">
            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Nome <span class="text-neutral-500">(opcional)</span>
            </label>
            <div class="relative">
              <input
                type="text"
                formControlName="name"
                autocomplete="name"
                placeholder="Super Admin"
                maxlength="100"
                class="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <!-- Email Input -->
          <div class="group">
            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Email
            </label>
            <div class="relative">
              <input
                type="email"
                formControlName="email"
                autocomplete="email"
                placeholder="admin@example.com"
                class="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
              @if (form.get('email')?.valid && form.get('email')?.touched) {
                <span class="absolute right-3 top-3 text-green-500">✓</span>
              }
            </div>
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <p class="text-xs text-red-500 mt-1">{{ form.get('email')?.errors?.['required'] ? 'Email é obrigatório' : 'Email inválido' }}</p>
            }
          </div>

          <!-- Senha Input -->
          <div class="group">
            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Senha
            </label>
            <div class="relative">
              <input
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="password"
                autocomplete="new-password"
                placeholder="••••••••"
                class="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                (click)="togglePassword()"
                [attr.aria-label]="showPassword() ? 'Ocultar senha' : 'Mostrar senha'"
                class="absolute right-3 top-3 text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                @if (showPassword()) {
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.244 7.244 3.228 3.228m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                }
              </button>
            </div>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-2">Mínimo 8 caracteres</p>
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <p class="text-xs text-red-500 mt-1">Senha deve ter no mínimo 8 caracteres</p>
            }
          </div>

          <!-- Mensagem de Erro -->
          @if (error()) {
            <div class="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg text-sm text-red-700 dark:text-red-400 flex items-start gap-3">
              <span class="text-lg flex-shrink-0">⚠️</span>
              <span>{{ error() }}</span>
            </div>
          }

          <!-- Botão Inicializar -->
          <button
            type="submit"
            [disabled]="form.invalid || loading()"
            class="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
          >
            @if (loading()) {
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Inicializando...</span>
            } @else {
              <span>👑 Criar Super Admin</span>
            }
          </button>
        </form>

        <!-- Info Footer -->
        <div class="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800 text-center text-xs text-neutral-500 dark:text-neutral-600">
          <p>Após criar o super admin, você será redirecionado para o painel administrativo.</p>
        </div>
      </div>
    </div>
  `,
})
export class BootstrapComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly appState = inject(AppStateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly error = signal<string | undefined>(undefined);
  readonly showPassword = signal(false);

  private readonly roleDashboardMap: Record<UserRole, string> = {
    SUPER_ADMIN: 'admin',
    ADMIN: 'admin',
    RESELLER: 'reseller',
    RESELLER_MANAGER: 'reseller',
    VOICE_ACTOR: 'voice-actor',
    PRODUCER: 'producer',
    CLIENT: 'client',
  };

  readonly form = this.fb.nonNullable.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [Validators.required, Validators.minLength(8), Validators.maxLength(72)],
    ],
  });

  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(undefined);

    const { email, password, name } = this.form.getRawValue();
    this.auth
      .superAdminBootstrap({ email, password, name: name.trim() || undefined })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading.set(false);
          const user = this.appState.user();
          const dashboardPath = user?.role ? this.roleDashboardMap[user.role] : 'client';
          this.router.navigate(['/admin/dashboard', dashboardPath]).catch((err) => {
            console.error('[BootstrapComponent] Erro ao navegar:', err);
            this.error.set('Erro ao redirecionar. Tente novamente.');
          });
        },
        error: (err: HttpErrorResponse | Error) => {
          this.loading.set(false);
          this.error.set(this.extractMessage(err));
        },
      });
  }

  private extractMessage(err: HttpErrorResponse | Error): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 409) {
        const body = err.error as { message?: string } | null;
        if (body?.message?.includes('inicializado')) {
          return 'Sistema já foi inicializado. Faça login na sua conta.';
        }
        return 'Email já cadastrado.';
      }
      if (err.status === 429) return 'Muitas tentativas. Aguarde um minuto.';
      if (err.status === 0) return 'Sem conexão com o servidor.';
      const body = err.error as { message?: string; errors?: string[] } | null;
      if (body?.errors?.length) return body.errors.join(' · ');
      if (body?.message) return body.message;
      return `Erro ${err.status}`;
    }
    return err.message ?? 'Falha na inicialização';
  }
}
