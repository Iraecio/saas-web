import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CardComponent } from '../../../../shared/components/card/card';

@Component({
  selector: 'app-users-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, CardComponent],
  template: `
    <div class="p-6">
      <header class="mb-6">
        <a routerLink=".." class="text-sm text-primary-600 hover:underline">← Voltar</a>
        <h1 class="mt-2 text-3xl font-bold text-neutral-900 dark:text-white">Novo usuário</h1>
      </header>

      <app-card>
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
              Nome
            </label>
            <input type="text" class="form-input" formControlName="name" />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
              Email
            </label>
            <input type="email" class="form-input" formControlName="email" />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
              Função
            </label>
            <select class="form-input" formControlName="role">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          @if (userId()) {
            <div class="pt-2 border-t border-neutral-200 dark:border-neutral-700">
              <a [routerLink]="['..', userId(), 'permissions']"
                class="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 01 3 10.5c0 5.539 3.582 10.28 8.55 11.84a.75.75 0 00.45 0c4.968-1.56 8.55-6.301 8.55-11.84 0-1.592-.304-3.116-.855-4.514L12 5.964z" />
                </svg>
                Gerenciar Permissões
              </a>
            </div>
          }

          <div class="flex justify-end gap-3">
            <a routerLink=".." class="btn-secondary">Cancelar</a>
            <button type="submit" class="btn-primary" [disabled]="form.invalid">
              Criar usuário
            </button>
          </div>
        </form>
      </app-card>
    </div>
  `,
})
export class UsersFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly userId = signal('');

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['user' as 'user' | 'admin', Validators.required],
  });

  constructor() {
    this.userId.set(this.route.snapshot.paramMap.get('id') ?? '');
  }

  submit(): void {
    if (this.form.invalid) return;
    console.log('criar usuário', this.form.value);
    this.router.navigate(['/admin/users']);
  }
}
