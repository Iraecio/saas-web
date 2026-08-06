import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppStateService } from '../../../../core/services/app-state';
import { NotificationService } from '../../../../core/services/notification';
import { ServiceCatalogService } from '../../services/service-catalog';
import { ProfessionalRole, Service } from '../../../../core/models/service.model';

@Component({
  selector: 'app-services-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="p-6 max-w-6xl mx-auto space-y-6">
      <header class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Catálogo de Serviços</h1>
          <p class="mt-1 text-sm text-neutral-500">
            {{ isReseller() ? 'Serviços da sua revenda' : 'Serviços da plataforma e das revendas' }}
          </p>
        </div>
        <a routerLink="../services/new" class="btn-primary">+ Novo serviço</a>
      </header>

      <div class="flex flex-col gap-3 sm:flex-row">
        <select
          class="form-input sm:w-56"
          [value]="roleFilter()"
          (change)="onRoleFilter($any($event.target).value)"
        >
          <option value="">Todos os tipos</option>
          <option value="VOICE_ACTOR">Locução</option>
          <option value="PRODUCER">Produção</option>
        </select>

        @if (canSeeInactiveToggle()) {
          <label class="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
            <input
              type="checkbox"
              [checked]="includeInactive()"
              (change)="onIncludeInactive($any($event.target).checked)"
            />
            Incluir inativos
          </label>
        }
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div
            class="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"
          ></div>
        </div>
      } @else if (services().length === 0) {
        <p class="py-12 text-center text-sm text-neutral-500">Nenhum serviço encontrado.</p>
      } @else {
        <div class="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
          <table class="w-full text-sm">
            <thead class="bg-neutral-50 dark:bg-neutral-900 text-left text-neutral-500">
              <tr>
                <th class="px-4 py-3 font-medium">Nome</th>
                <th class="px-4 py-3 font-medium">Tipo</th>
                <th class="px-4 py-3 font-medium">Escopo</th>
                <th class="px-4 py-3 font-medium text-right">Créditos</th>
                <th class="px-4 py-3 font-medium text-center">Revisões</th>
                <th class="px-4 py-3 font-medium text-center">Status</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
              @for (svc of services(); track svc.id) {
                <tr class="bg-white dark:bg-neutral-950">
                  <td class="px-4 py-3 font-medium text-neutral-900 dark:text-white">
                    {{ svc.name }}
                  </td>
                  <td class="px-4 py-3">
                    {{ svc.professionalRole === 'VOICE_ACTOR' ? 'Locução' : 'Produção' }}
                  </td>
                  <td class="px-4 py-3">{{ svc.scope === 'GLOBAL' ? 'Global' : 'Particular' }}</td>
                  <td class="px-4 py-3 text-right">{{ svc.creditCost | number }}</td>
                  <td class="px-4 py-3 text-center">{{ svc.maxRevisions }}</td>
                  <td class="px-4 py-3 text-center">
                    @if (svc.isActive) {
                      <span
                        class="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        >Ativo</span
                      >
                    } @else {
                      <span
                        class="inline-flex rounded-full bg-neutral-200 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                        >Inativo</span
                      >
                    }
                  </td>
                  <td class="px-4 py-3 text-right whitespace-nowrap">
                    <a
                      [routerLink]="['../services', svc.id, 'audit']"
                      class="text-xs text-blue-600 hover:underline dark:text-blue-400"
                      >Histórico</a
                    >
                    @if (canManage(svc)) {
                      <a
                        [routerLink]="['../services', svc.id, 'edit']"
                        class="ml-3 text-xs text-blue-600 hover:underline dark:text-blue-400"
                        >Editar</a
                      >
                      @if (svc.isActive) {
                        <button
                          class="ml-3 text-xs text-red-600 hover:underline"
                          (click)="deactivate(svc)"
                        >
                          Inativar
                        </button>
                      } @else {
                        <button
                          class="ml-3 text-xs text-green-600 hover:underline"
                          (click)="activate(svc)"
                        >
                          Reativar
                        </button>
                      }
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class ServicesListPage {
  private readonly catalog = inject(ServiceCatalogService);
  private readonly appState = inject(AppStateService);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly roleFilter = signal<ProfessionalRole | ''>('');
  readonly includeInactive = signal(false);
  readonly services = signal<Service[]>([]);
  readonly loading = signal(true);

  readonly isReseller = computed(() => this.appState.isReseller());
  readonly isAdmin = computed(() => this.appState.isAdmin());
  readonly canSeeInactiveToggle = computed(() => this.isAdmin() || this.isReseller());

  constructor() {
    this.load();
  }

  onRoleFilter(value: string): void {
    this.roleFilter.set((value as ProfessionalRole) || '');
    this.load();
  }

  onIncludeInactive(checked: boolean): void {
    this.includeInactive.set(checked);
    this.load();
  }

  // O dono pode gerenciar: ADMIN gerencia GLOBAIS; RESELLER gerencia PARTICULARES próprios.
  canManage(svc: Service): boolean {
    if (svc.scope === 'GLOBAL') return this.isAdmin();
    if (svc.scope === 'PARTICULAR') {
      return this.isReseller() && svc.ownerId === this.appState.user()?.resellerId;
    }
    return false;
  }

  private load(): void {
    this.loading.set(true);
    this.catalog
      .list({
        professionalRole: this.roleFilter() || undefined,
        includeInactive: this.includeInactive() || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          this.services.set(list);
          this.loading.set(false);
        },
        error: (err) => {
          this.notify.error(err.message ?? 'Erro ao carregar serviços');
          this.loading.set(false);
        },
      });
  }

  deactivate(svc: Service): void {
    this.catalog.deactivate(svc.id).subscribe({
      next: () => {
        this.notify.success('Serviço inativado.');
        this.load();
      },
      error: (err) => this.notify.error(err.message ?? 'Erro ao inativar serviço'),
    });
  }

  activate(svc: Service): void {
    this.catalog.activate(svc.id).subscribe({
      next: () => {
        this.notify.success('Serviço reativado.');
        this.load();
      },
      error: (err) => this.notify.error(err.message ?? 'Erro ao reativar serviço'),
    });
  }
}
