import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="card">
      <h2 class="mb-6 text-center text-2xl font-bold text-neutral-900 dark:text-white">Entrar</h2>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
            Email
          </label>
          <input type="email" class="form-input" formControlName="email" autocomplete="email" />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
            Senha
          </label>
          <input
            type="password"
            class="form-input"
            formControlName="password"
            autocomplete="current-password"
          />
        </div>

        @if (error()) {
          <p class="border-l-2 border-neutral-900 bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-900 dark:border-white dark:bg-neutral-800 dark:text-white">
            {{ error() }}
          </p>
        }

        <button type="submit" class="btn-primary w-full" [disabled]="form.invalid || loading()">
          {{ loading() ? 'Entrando...' : 'Entrar' }}
        </button>

        <button type="button" class="btn-secondary w-full" (click)="demoLogin()">
          Entrar como demo
        </button>
      </form>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/admin/dashboard']),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.message ?? 'Falha no login');
      },
      complete: () => this.loading.set(false),
    });
  }

  demoLogin(): void {
    this.auth.setSession('demo-token', {
      id: 'demo-1',
      email: 'demo@saas-web.dev',
      name: 'Usuário Demo',
      role: 'admin',
    });
    this.router.navigate(['/admin/dashboard']);
  }
}
