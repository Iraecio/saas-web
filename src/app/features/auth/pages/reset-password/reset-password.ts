import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/services/auth';
import { MagicCubeComponent } from '../../../../shared/components/magic-cube/magic-cube';

@Component({
  selector: 'app-reset-password',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, MagicCubeComponent],
  template: `
    <div class="min-h-screen w-full flex items-center justify-center bg-black p-6 relative overflow-hidden">
      <app-magic-cube />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_50%_70%_at_center,rgba(0,0,0,0.85)_0%,transparent_80%)] pointer-events-none"></div>

      <div class="w-full max-w-md relative z-10 bg-neutral-950/85 backdrop-blur-2xl rounded-2xl p-8 border border-white/20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] ring-1 ring-white/5">

        @if (!token()) {
          <!-- Sem token na URL -->
          <div class="text-center space-y-4">
            <div class="text-4xl">⚠️</div>
            <h2 class="text-xl font-bold text-white">Link inválido</h2>
            <p class="text-neutral-400 text-sm">O link de redefinição é inválido ou expirou.</p>
            <a routerLink="/auth/forgot-password"
              class="inline-block mt-2 text-sm text-white underline hover:text-neutral-300 transition-colors">
              Solicitar novo link
            </a>
          </div>
        } @else if (done()) {
          <!-- Sucesso -->
          <div class="text-center space-y-4">
            <div class="text-4xl">✅</div>
            <h2 class="text-xl font-bold text-white">Senha redefinida!</h2>
            <p class="text-neutral-400 text-sm">Sua nova senha foi salva. Faça login para continuar.</p>
            <a routerLink="/auth/login"
              class="inline-block mt-4 w-full px-4 py-3 bg-white text-neutral-900 font-semibold rounded-lg text-center hover:bg-neutral-100 transition-all">
              Ir para o login
            </a>
          </div>
        } @else {
          <!-- Formulário -->
          <div class="mb-8">
            <h2 class="text-3xl font-bold text-white">Nova senha</h2>
            <p class="text-neutral-400 mt-2">Escolha uma senha forte para sua conta.</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-neutral-300 mb-2">Nova senha</label>
              <input
                [type]="showPwd() ? 'text' : 'password'"
                formControlName="newPassword"
                placeholder="Mínimo 8 caracteres"
                class="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              />
              @if (form.get('newPassword')?.invalid && form.get('newPassword')?.touched) {
                <p class="mt-1 text-xs text-red-400">Mínimo 8 caracteres</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-300 mb-2">Confirmar senha</label>
              <input
                [type]="showPwd() ? 'text' : 'password'"
                formControlName="confirmNewPassword"
                placeholder="Repita a nova senha"
                class="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              />
              @if (form.errors?.['mismatch'] && form.get('confirmNewPassword')?.touched) {
                <p class="mt-1 text-xs text-red-400">As senhas não coincidem</p>
              }
            </div>

            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" (change)="showPwd.set($any($event.target).checked)"
                class="w-4 h-4 rounded border-neutral-700 accent-white" />
              <span class="text-sm text-neutral-400">Mostrar senhas</span>
            </label>

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
                <span>Salvando...</span>
              } @else {
                <span>Redefinir senha</span>
              }
            </button>
          </form>
        }

      </div>
    </div>
  `,
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route       = inject(ActivatedRoute);
  private readonly router      = inject(Router);
  private readonly destroyRef  = inject(DestroyRef);
  private readonly platformId  = inject(PLATFORM_ID);

  readonly token   = signal('');
  readonly loading = signal(false);
  readonly done    = signal(false);
  readonly error   = signal<string | null>(null);
  readonly showPwd = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      newPassword:        ['', [Validators.required, Validators.minLength(8)]],
      confirmNewPassword: ['', Validators.required],
    },
    { validators: (g) => g.get('newPassword')?.value === g.get('confirmNewPassword')?.value ? null : { mismatch: true } },
  );

  ngOnInit(): void {
    // Tenta query params primeiro (rota normal após redirect do LoginComponent)
    let token =
      this.route.snapshot.queryParamMap.get('access_token') ||
      this.route.snapshot.queryParamMap.get('token') ||
      '';

    // Fallback: lê do hash fragment caso o Supabase redirecione direto aqui
    if (!token && isPlatformBrowser(this.platformId)) {
      const hash = window.location.hash.slice(1);
      if (hash) {
        const params = new URLSearchParams(hash);
        token = params.get('access_token') ?? '';
      }
    }

    this.token.set(token);
  }

  submit(): void {
    if (this.form.invalid) return;
    const { newPassword, confirmNewPassword } = this.form.getRawValue();
    this.loading.set(true);
    this.error.set(null);

    this.authService
      .resetPassword(this.token(), newPassword, confirmNewPassword)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.done.set(true);
        },
        error: (err: Error) => {
          this.loading.set(false);
          this.error.set(err.message ?? 'Link inválido ou expirado. Solicite um novo.');
        },
      });
  }
}
