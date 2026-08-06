import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, JsonPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from '../../../../core/services/notification';
import { ServiceCatalogService } from '../../services/service-catalog';
import { ServiceAuditEntry } from '../../../../core/models/service.model';

@Component({
  selector: 'app-service-audit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, JsonPipe],
  template: `
    <main class="min-h-full bg-canvas px-4 py-6 sm:px-6 lg:py-10">
      <div class="mx-auto max-w-4xl space-y-7">
        <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-sm font-semibold text-brand">Rastreabilidade</p>
            <h1 class="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              Histórico do serviço
            </h1>
            <p class="mt-2 text-sm text-muted">
              Todas as alterações administrativas em ordem cronológica.
            </p>
          </div>
          <a routerLink="/admin/services" class="btn-secondary">Voltar</a>
        </header>

        @if (loading()) {
          <div class="space-y-3">
            @for (item of [1, 2, 3]; track item) {
              <div class="h-28 animate-pulse rounded-xl bg-surface-subtle"></div>
            }
          </div>
        } @else if (entries().length === 0) {
          <p class="py-12 text-center text-sm text-neutral-500">Nenhum registro de auditoria.</p>
        } @else {
          <ol class="space-y-3">
            @for (e of entries(); track e.id) {
              <li class="rounded-xl bg-surface p-5 ring-1 ring-border">
                <div class="flex items-center justify-between">
                  <span
                    class="inline-flex rounded-md bg-brand/10 px-2 py-1 text-xs font-semibold text-brand"
                  >
                    {{ actionLabel(e.action) }}
                  </span>
                  <span class="text-xs text-neutral-500">{{ e.createdAt | date: 'short' }}</span>
                </div>
                <p class="mt-2 text-xs text-neutral-500">Por {{ e.actorRole }} ({{ e.actorId }})</p>
                <pre
                  class="mt-3 overflow-x-auto rounded-lg bg-surface-subtle p-3 text-xs text-foreground"
                  >{{ e.changedFields | json }}</pre
                >
              </li>
            }
          </ol>
        }
      </div>
    </main>
  `,
})
export class ServiceAuditPage {
  private readonly catalog = inject(ServiceCatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly entries = signal<ServiceAuditEntry[]>([]);
  readonly loading = signal(true);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.catalog
      .getAudit(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          this.entries.set(list);
          this.loading.set(false);
        },
        error: (err) => {
          this.notify.error(err.message ?? 'Erro ao carregar histórico');
          this.loading.set(false);
        },
      });
  }

  actionLabel(action: ServiceAuditEntry['action']): string {
    const labels: Record<ServiceAuditEntry['action'], string> = {
      CREATED: 'Criado',
      UPDATED: 'Atualizado',
      DEACTIVATED: 'Inativado',
      REACTIVATED: 'Reativado',
    };
    return labels[action] ?? action;
  }
}
