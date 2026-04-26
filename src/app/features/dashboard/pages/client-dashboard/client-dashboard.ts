import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AppStateService } from '../../../../core/services/app-state';
import { RoleRequest } from '../../../../core/models/role-request.model';
import { RoleRequestService } from '../../../role-requests/services/role-request';

const ROLE_LABEL: Record<string, string> = {
  RESELLER: 'Revendedor',
  VOICE_ACTOR: 'Locutor',
  PRODUCER: 'Produtor',
  CLIENT: 'Cliente',
};

@Component({
  selector: 'app-client-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="p-6 space-y-6">
      <header>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">
          Olá, {{ appState.userName() }} 👋
        </h1>
        <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {{ isDirectClient() ? 'Bem-vindo à plataforma. Vamos configurar seu perfil.' : 'O que você precisa hoje?' }}
        </p>
      </header>

      @if (isDirectClient()) {
        <!-- Card de boas-vindas / onboarding -->
        <section class="rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 p-6 text-white shadow-lg">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 class="text-xl font-bold">Quer atuar como Revendedor, Locutor ou Produtor?</h2>
              <p class="mt-1 text-sm text-white/80">
                Solicite a mudança de papel e nossa equipe vai analisar seu perfil.
              </p>
            </div>
            @if (!hasPendingRequest()) {
              <a
                routerLink="/admin/role-requests/new"
                class="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-violet-700 shadow transition hover:scale-105"
              >
                🎯 Solicitar Upgrade
              </a>
            }
          </div>
        </section>

        <!-- Status da última solicitação -->
        @if (latestRequest(); as req) {
          <section class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-start gap-4">
                <div class="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                     [class]="statusBgClass(req.status)">
                  {{ statusIcon(req.status) }}
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">
                    Solicitação para {{ roleLabel(req.requestedRole) }}
                  </h3>
                  <p class="text-sm text-neutral-500 dark:text-neutral-400">
                    Enviada em {{ formatDate(req.createdAt) }}
                  </p>
                  @if (req.status === 'REJECTED' && req.rejectionReason) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400">
                      <strong>Motivo:</strong> {{ req.rejectionReason }}
                    </p>
                  }
                </div>
              </div>
              <span class="rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap"
                    [class]="statusBadgeClass(req.status)">
                {{ statusLabel(req.status) }}
              </span>
            </div>
            <div class="mt-4 flex gap-2">
              <a routerLink="/admin/role-requests/my"
                 class="text-sm text-blue-600 hover:underline dark:text-blue-400">
                Ver histórico completo →
              </a>
            </div>
          </section>
        }

        <!-- Cards informativos -->
        <section class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
            <div class="text-3xl">🎙️</div>
            <h3 class="mt-3 font-semibold text-neutral-900 dark:text-white">Locutor</h3>
            <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Trabalhe com locuções comerciais, narrações e vinhetas.
            </p>
          </div>
          <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
            <div class="text-3xl">🏢</div>
            <h3 class="mt-3 font-semibold text-neutral-900 dark:text-white">Revendedor</h3>
            <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Gerencie seus clientes e revenda nossos serviços.
            </p>
          </div>
          <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
            <div class="text-3xl">🎬</div>
            <h3 class="mt-3 font-semibold text-neutral-900 dark:text-white">Produtor</h3>
            <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Produza conteúdo de áudio e vídeo para seus clientes.
            </p>
          </div>
        </section>
      } @else {
        <!-- Dashboard normal para clientes vinculados a um reseller -->
        <section class="rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 p-6 text-white shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold">Precisa de uma locução?</h2>
              <p class="mt-1 text-sm text-white/80">Faça seu pedido e receba em minutos.</p>
            </div>
            <a routerLink="/admin/orders/new"
               class="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-violet-700 shadow transition hover:scale-105">
              🎙️ Novo Pedido
            </a>
          </div>
        </section>

        <section class="grid grid-cols-2 gap-4 sm:grid-cols-4">
          @for (stat of stats; track stat.label) {
            <div class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
              <p class="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{{ stat.label }}</p>
              <p class="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">{{ stat.value }}</p>
              <p class="mt-1 text-xs text-neutral-400">{{ stat.sub }}</p>
            </div>
          }
        </section>
      }
    </div>
  `,
})
export class ClientDashboardComponent implements OnInit {
  protected readonly appState = inject(AppStateService);
  private readonly roleRequestService = inject(RoleRequestService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly requests = signal<RoleRequest[]>([]);

  protected readonly isDirectClient = computed(() => {
    const user = this.appState.user();
    return !!user && !user.resellerId;
  });

  protected readonly latestRequest = computed(() => this.requests()[0] ?? null);
  protected readonly hasPendingRequest = computed(() =>
    this.requests().some((r) => r.status === 'PENDING'),
  );

  protected readonly stats = [
    { label: 'Em andamento', value: '0', sub: 'pedidos ativos' },
    { label: 'Total de Pedidos', value: '0', sub: 'todos os tempos' },
    { label: 'Entregues', value: '0', sub: 'finalizados' },
    { label: 'Revisões', value: '0', sub: 'aguardando' },
  ];

  ngOnInit(): void {
    if (!this.isDirectClient()) return;
    this.roleRequestService
      .listMine()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (requests) => this.requests.set(requests),
        error: () => this.requests.set([]),
      });
  }

  protected roleLabel(role: string): string {
    return ROLE_LABEL[role] ?? role;
  }

  protected statusLabel(status: string): string {
    if (status === 'PENDING') return 'Em análise';
    if (status === 'APPROVED') return 'Aprovado';
    if (status === 'REJECTED') return 'Rejeitado';
    return status;
  }

  protected statusIcon(status: string): string {
    if (status === 'PENDING') return '⏳';
    if (status === 'APPROVED') return '✅';
    if (status === 'REJECTED') return '❌';
    return '📋';
  }

  protected statusBadgeClass(status: string): string {
    if (status === 'PENDING')
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    if (status === 'APPROVED')
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (status === 'REJECTED')
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    return 'bg-neutral-100 text-neutral-700';
  }

  protected statusBgClass(status: string): string {
    if (status === 'PENDING') return 'bg-yellow-100 dark:bg-yellow-900/30';
    if (status === 'APPROVED') return 'bg-emerald-100 dark:bg-emerald-900/30';
    if (status === 'REJECTED') return 'bg-red-100 dark:bg-red-900/30';
    return 'bg-neutral-100 dark:bg-neutral-700';
  }

  protected formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
