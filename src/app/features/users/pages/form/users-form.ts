import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['user' as 'user' | 'admin', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) return;
    console.log('criar usuário', this.form.value);
    this.router.navigate(['/admin/users']);
  }
}
