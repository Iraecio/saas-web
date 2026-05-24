import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppStateService } from '../../../../core/services/app-state';
import { ProfileService } from '../../services/my-profile';

@Component({
  selector: 'app-client-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="p-6 max-w-2xl mx-auto space-y-8">
      <header>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Perfil de Cliente</h1>
        <p class="mt-1 text-sm text-neutral-500">Configure suas informações de cliente</p>
      </header>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else {
        <section class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <form [formGroup]="form" (ngSubmit)="save()" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nome da empresa</label>
              <input type="text" formControlName="companyName" placeholder="Empresa LTDA"
                class="form-input w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Telefone</label>
              <input type="tel" formControlName="phone" placeholder="(11) 99999-9999"
                class="form-input w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Endereço</label>
              <input type="text" formControlName="address" placeholder="Rua, Número, Cidade"
                class="form-input w-full" />
            </div>

            @if (saveSuccess()) {
              <p class="text-sm text-green-600 dark:text-green-400">✓ Perfil de cliente atualizado</p>
            }
            @if (saveError()) {
              <p class="text-sm text-red-500">{{ saveError() }}</p>
            }

            <div class="flex justify-end">
              <button type="submit" [disabled]="saving()"
                class="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
                {{ saving() ? 'Salvando...' : 'Salvar' }}
              </button>
            </div>
          </form>
        </section>
      }
    </div>
  `,
})
export class ClientProfilePageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly appState = inject(AppStateService);
  private readonly profileService = inject(ProfileService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly saveSuccess = signal(false);
  readonly saveError = signal<string | undefined>(undefined);

  readonly form = this.fb.nonNullable.group({
    companyName: [''],
    phone: [''],
    address: [''],
  });

  ngOnInit(): void {
    const userId = this.appState.user()?.id;
    if (!userId) { this.loading.set(false); return; }

    this.profileService
      .getClientProfile(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (p) => {
          this.form.patchValue({
            companyName: p.companyName ?? '',
            phone: p.phone ?? '',
            address: p.address ?? '',
          });
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  save(): void {
    const userId = this.appState.user()?.id;
    if (!userId) return;
    this.saving.set(true);
    this.saveSuccess.set(false);
    this.saveError.set(undefined);

    const { companyName, phone, address } = this.form.getRawValue();
    this.profileService
      .updateClientProfile(userId, {
        companyName: companyName || undefined,
        phone: phone || undefined,
        address: address || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
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
}
