import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../../../shared/components/card/card';
import { TableColumn, TableComponent } from '../../../../shared/components/table/table';
import { Reseller } from '../../models/reseller.model';
import { ResellerService } from '../../services/reseller';

@Component({
  selector: 'app-resellers-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CardComponent, TableComponent],
  template: `
    <div class="p-6">
      <header class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Revendedores</h1>
          <p class="mt-1 text-sm text-neutral-500">Gerencie revendedores e suas comissões.</p>
        </div>
        <a routerLink="./new" class="btn-primary">+ Novo revendedor</a>
      </header>

      <app-card>
        <div class="mb-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            class="form-input flex-1"
            placeholder="Buscar por nome ou email..."
            [value]="search()"
            (input)="search.set($any($event.target).value)"
          />
          <select
            class="form-input sm:w-48"
            [value]="statusFilter()"
            (change)="statusFilter.set($any($event.target).value)"
          >
            <option value="">Todos os status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
            <option value="suspended">Suspenso</option>
          </select>
        </div>

        <app-table
          [columns]="columns"
          [data]="$any(filtered())"
          [pageSize]="10"
          [showActions]="true"
          (rowEdit)="onEdit($any($event))"
          (rowDelete)="onDelete($any($event))"
        />
      </app-card>
    </div>
  `,
})
export class ResellersListComponent {
  private readonly resellerService = inject(ResellerService);

  readonly search = signal('');
  readonly statusFilter = signal<'' | 'active' | 'inactive' | 'suspended'>('');
  private readonly resellersSignal = signal<Reseller[]>([]);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  readonly columns: TableColumn[] = [
    { key: 'name', label: 'Nome', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'commissionRate', label: 'Taxa de Comissão', sortable: true, format: (v) => `${v}%` },
    { key: 'totalSales', label: 'Total de Vendas', sortable: true, format: (v) => `R$ ${(v as number).toLocaleString('pt-BR')}` },
    { key: 'totalCommission', label: 'Total de Comissão', sortable: true, format: (v) => `R$ ${(v as number).toLocaleString('pt-BR')}` },
    {
      key: 'status',
      label: 'Status',
      format: (v) => this.formatStatus(String(v)),
    },
    { key: 'createdAt', label: 'Criado em', sortable: true },
  ];

  readonly filtered = computed(() => {
    const term = this.search().toLowerCase().trim();
    const status = this.statusFilter();
    return this.resellersSignal().filter((r) => {
      if (status && r.status !== status) return false;
      if (!term) return true;
      return r.name.toLowerCase().includes(term) || r.email.toLowerCase().includes(term);
    });
  });

  constructor() {
    this.loadResellers();
  }

  private loadResellers(): void {
    this.resellerService.list().subscribe({
      next: (resellers) => {
        this.resellersSignal.set(resellers);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Erro ao carregar revendedores');
        this.isLoading.set(false);
      },
    });
  }

  onEdit(reseller: Reseller): void {
    console.log('edit', reseller);
  }

  onDelete(reseller: Reseller): void {
    console.log('delete', reseller);
  }

  private formatStatus(status: string): string {
    const labels: Record<string, string> = {
      active: 'Ativo',
      inactive: 'Inativo',
      suspended: 'Suspenso',
    };
    return labels[status] ?? status;
  }
}
