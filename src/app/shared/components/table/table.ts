import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  format?: (value: unknown, row: Record<string, unknown>) => string;
}

type Row = Record<string, unknown>;

@Component({
  selector: 'app-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="overflow-x-auto rounded-lg">
      <table class="w-full border-collapse">
        <thead class="border-b border-neutral-200 dark:border-neutral-800">
          <tr>
            @for (col of columns(); track col.key) {
              <th
                class="table-cell select-none text-left text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
                [style.width]="col.width ?? null"
                [class.cursor-pointer]="col.sortable"
                (click)="col.sortable && toggleSort(col.key)"
              >
                {{ col.label }}
                @if (col.sortable && sortKey() === col.key) {
                  <span class="ml-1 text-xs">{{ sortDir() === 'asc' ? '↑' : '↓' }}</span>
                }
              </th>
            }
            @if (showActions()) {
              <th class="table-cell text-right text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Ações
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of pagedRows(); track trackKey(row); let i = $index) {
            <tr class="border-b border-neutral-100 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50">
              @for (col of columns(); track col.key) {
                <td class="table-cell">
                  {{ col.format ? col.format(row[col.key], row) : row[col.key] }}
                </td>
              }
              @if (showActions()) {
                <td class="table-cell text-right">
                  <button
                    class="mr-4 text-sm text-neutral-600 underline-offset-2 hover:text-neutral-900 hover:underline dark:text-neutral-400 dark:hover:text-white"
                    (click)="rowEdit.emit(row)"
                  >
                    Editar
                  </button>
                  <button
                    class="text-sm text-neutral-600 underline-offset-2 hover:text-neutral-900 hover:underline dark:text-neutral-400 dark:hover:text-white"
                    (click)="rowDelete.emit(row)"
                  >
                    Excluir
                  </button>
                </td>
              }
            </tr>
          } @empty {
            <tr>
              <td
                class="table-cell text-center text-neutral-500"
                [attr.colspan]="columns().length + (showActions() ? 1 : 0)"
              >
                Nenhum registro encontrado.
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    @if (totalPages() > 1) {
      <nav class="mt-4 flex items-center justify-between">
        <p class="text-sm text-neutral-500">
          Página {{ page() }} de {{ totalPages() }} — {{ sortedRows().length }} itens
        </p>
        <div class="flex gap-2">
          <button
            class="btn-secondary"
            [disabled]="page() === 1"
            (click)="previousPage()"
          >
            Anterior
          </button>
          <button
            class="btn-secondary"
            [disabled]="page() === totalPages()"
            (click)="nextPage()"
          >
            Próxima
          </button>
        </div>
      </nav>
    }
  `,
})
export class TableComponent {
  readonly columns = input.required<TableColumn[]>();
  readonly data = input.required<Row[]>();
  readonly pageSize = input(10);
  readonly showActions = input(false);
  readonly trackBy = input<string>('id');

  readonly rowEdit = output<Row>();
  readonly rowDelete = output<Row>();

  private readonly pageSignal = signal(1);
  private readonly sortKeySignal = signal<string | null>(null);
  private readonly sortDirSignal = signal<'asc' | 'desc'>('asc');

  readonly page = this.pageSignal.asReadonly();
  readonly sortKey = this.sortKeySignal.asReadonly();
  readonly sortDir = this.sortDirSignal.asReadonly();

  readonly sortedRows = computed(() => {
    const rows = [...this.data()];
    const key = this.sortKeySignal();
    if (!key) return rows;
    const dir = this.sortDirSignal() === 'asc' ? 1 : -1;
    return rows.sort((a, b) => {
      const av = a[key] as string | number | null | undefined;
      const bv = b[key] as string | number | null | undefined;
      if (av == null) return 1;
      if (bv == null) return -1;
      return av > bv ? dir : av < bv ? -dir : 0;
    });
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.sortedRows().length / this.pageSize())),
  );

  readonly pagedRows = computed(() => {
    const start = (this.pageSignal() - 1) * this.pageSize();
    return this.sortedRows().slice(start, start + this.pageSize());
  });

  trackKey(row: Row): unknown {
    return row[this.trackBy()];
  }

  toggleSort(key: string): void {
    if (this.sortKeySignal() === key) {
      this.sortDirSignal.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKeySignal.set(key);
      this.sortDirSignal.set('asc');
    }
    this.pageSignal.set(1);
  }

  previousPage(): void {
    this.pageSignal.update((p) => Math.max(1, p - 1));
  }

  nextPage(): void {
    this.pageSignal.update((p) => Math.min(this.totalPages(), p + 1));
  }
}
