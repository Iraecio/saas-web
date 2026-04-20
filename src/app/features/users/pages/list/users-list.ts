import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../../../shared/components/card/card';
import { TableColumn, TableComponent } from '../../../../shared/components/table/table';
import { UserListItem } from '../../models/user.model';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-users-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CardComponent, TableComponent],
  template: `
    <div class="p-6">
      <header class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Usuários</h1>
          <p class="mt-1 text-sm text-neutral-500">Gerencie membros e permissões.</p>
        </div>
        <a routerLink="./new" class="btn-primary">+ Novo usuário</a>
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
            [value]="roleFilter()"
            (change)="roleFilter.set($any($event.target).value)"
          >
            <option value="">Todas as funções</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
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
export class UsersListComponent {
  private readonly userService = inject(UserService);

  readonly search = signal('');
  readonly roleFilter = signal<'' | 'admin' | 'user'>('');
  private readonly usersSignal = signal<UserListItem[]>([]);

  readonly columns: TableColumn[] = [
    { key: 'name', label: 'Nome', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Função', sortable: true },
    {
      key: 'status',
      label: 'Status',
      format: (v) => this.formatStatus(String(v)),
    },
    { key: 'createdAt', label: 'Criado em', sortable: true },
  ];

  readonly filtered = computed(() => {
    const term = this.search().toLowerCase().trim();
    const role = this.roleFilter();
    return this.usersSignal().filter((u) => {
      if (role && u.role !== role) return false;
      if (!term) return true;
      return u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
    });
  });

  constructor() {
    this.userService.list().subscribe((users) => this.usersSignal.set(users));
  }

  onEdit(user: UserListItem): void {
    console.log('edit', user);
  }

  onDelete(user: UserListItem): void {
    console.log('delete', user);
  }

  private formatStatus(status: string): string {
    const labels: Record<string, string> = {
      active: 'Ativo',
      invited: 'Convidado',
      disabled: 'Desativado',
    };
    return labels[status] ?? status;
  }
}
