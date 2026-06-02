import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/services/auth';
import { MagicCubeComponent } from '../../../../shared/components/magic-cube/magic-cube';

@Component({
  selector: 'app-forgot-password',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, MagicCubeComponent],
  template: `
    <div class="min-h-screen w-full flex items-center justify-center bg-black p-6 relative overflow-hidden">
      <app-magic-cube />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_50%_70%_at_center,rgba(0,0,0,0.85)_0%,transparent_80%)] pointer-events-none"></div>

      <div class="w-full max-w-md relative z-10 bg-neutral-950/85 backdrop-blur-2xl rounded-2xl p-8 border border-white/20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] ring-1 ring-white/5">

        <div class="mb-8">
          <h2 class="text-3xl font-bold text-white">Esqueci minha senha</h2>
          <p class="text-neutral-400 mt-2">Informe seu email e enviaremos um link para redefinir sua senha.</p>
        </div>

        @if (sent()) {
          <div class="rounded-xl border border-green-500/30 bg-green-900/20 p-6 text-center space-y-3">
            <div class="text-4xl">📬</div>
            <p class="text-green-400 font-semibold">Email enviado!</p>
            <p class="text-sm text-neutral-400">
              Se o endereço <strong class="text-white">{{ submittedEmail() }}</strong> estiver cadastrado,
              você receberá um link em alguns minutos.
            </p>
            <p class="text-xs text-neutral-500">Verifique também a caixa de spam.</p>
          </div>
          <div class="mt-6 text-center">
            <a routerLink="/auth/login" class="text-sm text-neutral-400 hover:text-white transition-colors">
              ← Voltar para o login
            </a>
          </div>
        } @else {
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-neutral-300 mb-2">Email</label>
              <input
                type="email"
                formControlName="email"
                autocomplete="email"
                placeholder="seu@email.com"
                class="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              />
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <p class="mt-1 text-xs text-red-400">Email inválido</p>
              }
            </div>

            @if (error()) {
              <div class="px-4 py-3 bg-red-900/20 border border-red-800/50 rounded-lg text-sm text-red-400">
                {{ error() }}
              </div>
            }

            <button
              type="submit"
              [disabled]="form.invalid || loading()"
              class="w-full px-4 py-3 bg-white text-neutral-900 font-semibold rounded-lg hover:bg-neutral-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              @if (loading()) {
                <div class="w-4 h-4 border-2 border-neutral-400 border-t-neutral-900 rounded-full animate-spin"></div>
                <span>Enviando...</span>
              } @else {
                <span>Enviar link de redefinição</span>
              }
            </button>

            <div class="text-center">
              <a routerLink="/auth/login" class="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
                ← Voltar para o login
              </a>
            </div>
          </form>
        }

      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {
  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly destroyRef  = inject(DestroyRef);

  readonly loading        = signal(false);
  readonly error          = signal<string | null>(null);
  readonly sent           = signal(false);
  readonly submittedEmail = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submit(): void {
    if (this.form.invalid) return;
    const { email } = this.form.getRawValue();
    this.loading.set(true);
    this.error.set(null);

    this.authService
      .forgotPassword(email)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.submittedEmail.set(email);
          this.sent.set(true);
        },
        error: () => {
          this.loading.set(false);
          // Não revelar se o email existe — mostrar sucesso genérico igualmente
          this.submittedEmail.set(email);
          this.sent.set(true);
        },
      });
  }
}
