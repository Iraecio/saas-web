import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CustomDomainService } from '../../services/custom-domain';
import { AppStateService } from '../../../../core/services/app-state';
import { DatePipe } from '@angular/common';
import { CustomDomain } from '../../../../core/models/custom-domain.model';

@Component({
  selector: 'app-custom-domains-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DatePipe],
  template: `
    <div class="p-6 max-w-3xl mx-auto space-y-6">
      <header>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Domínios customizados</h1>
        <p class="mt-1 text-sm text-neutral-500">Gerencie os domínios da sua revenda</p>
      </header>

      <!-- Modal de instruções DNS -->
      @if (dnsInstructions()) {
        <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div class="bg-neutral-900 rounded-2xl border border-white/20 p-6 max-w-lg w-full space-y-4">
            <h3 class="text-lg font-bold text-white">✓ Domínio registrado!</h3>
            <p class="text-sm text-neutral-400">Configure o DNS do seu domínio conforme as instruções:</p>
            <div class="bg-neutral-800 rounded-lg p-4 font-mono text-sm text-green-400 whitespace-pre-wrap break-all">{{ dnsInstructions() }}</div>
            <button (click)="dnsInstructions.set(undefined)"
              class="w-full px-4 py-2 bg-white text-neutral-900 rounded-lg font-medium hover:bg-neutral-100 transition-colors">
              Entendido
            </button>
          </div>
        </div>
      }

      <!-- Lista de domínios -->
      <section class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
        <h2 class="text-lg font-semibold mb-4 text-neutral-900 dark:text-white">Domínios registrados</h2>

        @if (loading()) {
          <div class="flex justify-center py-8">
            <div class="w-5 h-5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else if (domains().length === 0) {
          <p class="text-neutral-500 text-sm py-4 text-center">Nenhum domínio registrado ainda.</p>
        } @else {
          <div class="divide-y divide-neutral-200 dark:divide-neutral-800">
            @for (domain of domains(); track domain.id) {
              <div class="py-3 flex items-center justify-between">
                <div>
                  <span class="font-mono text-sm text-neutral-900 dark:text-white">{{ domain.domain }}</span>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span [class]="domain.isActive
                      ? 'text-xs text-green-600 dark:text-green-400'
                      : 'text-xs text-neutral-500'">
                      {{ domain.isActive ? '● Ativo' : '○ Inativo' }}
                    </span>
                    <span class="text-xs text-neutral-400">desde {{ domain.createdAt | date:'dd/MM/yyyy' }}</span>
                  </div>
                </div>
                @if (domain.isActive) {
                  <button (click)="deactivate(domain)"
                    class="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    Desativar
                  </button>
                }
              </div>
            }
          </div>
        }
      </section>

      <!-- Formulário de registro -->
      <section class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
        <h2 class="text-lg font-semibold mb-4 text-neutral-900 dark:text-white">Registrar novo domínio</h2>

        <form [formGroup]="form" (ngSubmit)="register()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Domínio</label>
            <input type="text" formControlName="domain" placeholder="meudominio.com.br"
              class="form-input w-full font-mono" />
            @if (form.get('domain')?.invalid && form.get('domain')?.touched) {
              <p class="text-xs text-red-400 mt-1">Domínio é obrigatório</p>
            }
          </div>

          @if (registerError()) {
            <p class="text-sm text-red-500">{{ registerError() }}</p>
          }

          <div class="flex justify-end">
            <button type="submit" [disabled]="form.invalid || registering()"
              class="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
              {{ registering() ? 'Registrando...' : 'Registrar domínio' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  `,
})
export class CustomDomainsListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly appState = inject(AppStateService);
  private readonly domainService = inject(CustomDomainService);
  private readonly destroyRef = inject(DestroyRef);

  readonly domains = signal<CustomDomain[]>([]);
  readonly loading = signal(true);
  readonly registering = signal(false);
  readonly registerError = signal<string | undefined>(undefined);
  readonly dnsInstructions = signal<string | undefined>(undefined);

  private resellerId = '';

  readonly form = this.fb.nonNullable.group({
    domain: ['', Validators.required],
  });

  ngOnInit(): void {
    this.resellerId =
      this.route.snapshot.paramMap.get('resellerId') ??
      this.appState.user()?.resellerId ??
      '';
    this.loadDomains();
  }

  private loadDomains(): void {
    if (!this.resellerId) { this.loading.set(false); return; }
    this.domainService
      .listDomains(this.resellerId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (d) => { this.domains.set(d); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
  }

  register(): void {
    if (!this.resellerId) return;
    this.registering.set(true);
    this.registerError.set(undefined);

    this.domainService
      .registerDomain(this.resellerId, { domain: this.form.getRawValue().domain })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.registering.set(false);
          this.dnsInstructions.set(res.message);
          this.form.reset();
          this.loadDomains();
        },
        error: (err: Error) => {
          this.registering.set(false);
          if (err.message?.includes('409') || err.message?.toLowerCase().includes('already')) {
            this.registerError.set('Este domínio já está registrado.');
          } else {
            this.registerError.set(err.message ?? 'Erro ao registrar domínio');
          }
        },
      });
  }

  deactivate(domain: CustomDomain): void {
    if (!this.resellerId) return;
    this.domainService
      .deactivateDomain(this.resellerId, domain.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.domains.update((d) =>
            d.map((x) => (x.id === domain.id ? { ...x, isActive: false } : x)),
          );
        },
        error: (err: Error) => this.registerError.set(err.message ?? 'Erro ao desativar'),
      });
  }
}
