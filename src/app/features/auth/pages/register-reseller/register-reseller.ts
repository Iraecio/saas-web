import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-register-reseller',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen w-full flex items-center justify-center bg-black p-6">
      <div class="w-full max-w-md bg-neutral-950/85 backdrop-blur-2xl rounded-2xl p-8 border border-white/20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]">

        @if (defaultDomain()) {
          <!-- Tela de confirmação -->
          <div class="text-center space-y-6">
            <div class="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <span class="text-3xl">✓</span>
            </div>
            <h2 class="text-2xl font-bold text-white">Revenda criada!</h2>
            <p class="text-neutral-400">Seu subdomínio padrão foi gerado:</p>
            <div class="px-4 py-3 bg-neutral-900 rounded-lg border border-white/10 font-mono text-green-400 text-sm break-all">
              {{ defaultDomain() }}
            </div>
            <p class="text-neutral-500 text-sm">Guarde esse endereço — seus clientes vão acessar a plataforma por ele.</p>
            <a routerLink="/auth/login"
               class="block w-full px-4 py-3 bg-white text-neutral-900 font-semibold rounded-lg text-center hover:bg-neutral-100 transition-colors">
              Ir para o login →
            </a>
          </div>
        } @else {
          <!-- Formulário de cadastro -->
          <div class="mb-8">
            <h2 class="text-3xl font-bold text-white">Criar revenda</h2>
            <p class="text-neutral-400 mt-2">Cadastre sua empresa revendedora</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-neutral-300 mb-2">Nome completo</label>
              <input type="text" formControlName="name" placeholder="Seu nome"
                class="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all" />
              @if (form.get('name')?.invalid && form.get('name')?.touched) {
                <p class="text-xs text-red-400 mt-1">Nome é obrigatório</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-300 mb-2">Nome da empresa (opcional)</label>
              <input type="text" formControlName="companyName" placeholder="Empresa LTDA"
                class="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all" />
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-300 mb-2">Email</label>
              <input type="email" formControlName="email" placeholder="seu@email.com"
                class="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all" />
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <p class="text-xs text-red-400 mt-1">Email válido é obrigatório</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-300 mb-2">Senha</label>
              <input type="password" formControlName="password" placeholder="Mínimo 8 caracteres"
                class="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all" />
              @if (form.get('password')?.invalid && form.get('password')?.touched) {
                <p class="text-xs text-red-400 mt-1">Mínimo 8 caracteres</p>
              }
            </div>

            @if (error()) {
              <div class="px-4 py-3 bg-red-900/20 border border-red-800/50 rounded-lg text-sm text-red-400 flex gap-3">
                <span>⚠️</span><span>{{ error() }}</span>
              </div>
            }

            <button type="submit" [disabled]="form.invalid || loading()"
              class="w-full px-4 py-3 bg-white text-neutral-900 font-semibold rounded-lg hover:bg-neutral-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              @if (loading()) {
                <div class="w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
                <span>Criando...</span>
              } @else {
                <span>Criar revenda</span>
              }
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-neutral-500 text-sm">
              Já tem conta?
              <a routerLink="/auth/login" class="text-white hover:underline">Entrar</a>
            </p>
          </div>
        }
      </div>
    </div>
  `,
})
export class RegisterResellerComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly error = signal<string | undefined>(undefined);
  readonly defaultDomain = signal<string | undefined>(undefined);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    companyName: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(undefined);

    const { name, companyName, email, password } = this.form.getRawValue();
    this.auth
      .registerReseller({ name, email, password, companyName: companyName || undefined })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.defaultDomain.set(res.defaultDomain);
        },
        error: (err: Error) => {
          this.loading.set(false);
          if (err.message?.includes('409') || err.message?.toLowerCase().includes('already')) {
            this.error.set('Este email já está cadastrado.');
          } else {
            this.error.set(err.message ?? 'Erro ao criar revenda.');
          }
        },
      });
  }
}
