import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppStateService } from '../../../../core/services/app-state';
import { ProfileService } from '../../services/my-profile';

@Component({
  selector: 'app-profile-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="p-6 max-w-2xl mx-auto space-y-8">
      <header>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Meu Perfil</h1>
        <p class="mt-1 text-sm text-neutral-500">Gerencie suas informações pessoais</p>
      </header>

      <!-- Dados gerais -->
      <section class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
        <h2 class="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Informações gerais</h2>

        <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nome</label>
              <input type="text" formControlName="name" class="form-input w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Email</label>
              <input type="email" [value]="user()?.email ?? ''" disabled class="form-input w-full opacity-50 cursor-not-allowed" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Departamento</label>
              <input type="text" formControlName="department" class="form-input w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Cargo</label>
              <input type="text" formControlName="jobTitle" class="form-input w-full" />
            </div>
          </div>

          @if (saveSuccess()) {
            <p class="text-sm text-green-600 dark:text-green-400">✓ Perfil atualizado com sucesso</p>
          }
          @if (saveError()) {
            <p class="text-sm text-red-500">{{ saveError() }}</p>
          }

          <div class="flex justify-end">
            <button type="submit" [disabled]="saving()"
              class="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
              {{ saving() ? 'Salvando...' : 'Salvar alterações' }}
            </button>
          </div>
        </form>
      </section>

      <!-- Papel -->
      <section class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
        <h2 class="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Papel na plataforma</h2>
        <span class="inline-block px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-full text-sm font-mono">
          {{ user()?.role ?? '—' }}
        </span>
      </section>

    </div>
  `,
})
export class ProfileOverviewComponent {
  private readonly fb = inject(FormBuilder);
  private readonly appState = inject(AppStateService);
  private readonly profileService = inject(ProfileService);
  private readonly destroyRef = inject(DestroyRef);

  readonly user = this.appState.user;
  readonly saving = signal(false);
  readonly saveSuccess = signal(false);
  readonly saveError = signal<string | undefined>(undefined);

  readonly form = this.fb.nonNullable.group({
    name: [this.user()?.name ?? ''],
    department: [this.user()?.department ?? ''],
    jobTitle: [this.user()?.jobTitle ?? ''],
  });

  save(): void {
    const userId = this.user()?.id;
    if (!userId) return;
    this.saving.set(true);
    this.saveSuccess.set(false);
    this.saveError.set(undefined);

    const { name, department, jobTitle } = this.form.getRawValue();
    this.profileService
      .updateMe({ name: name || undefined, department: department || undefined, jobTitle: jobTitle || undefined })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.appState.setUser(updated);
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

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }
}
