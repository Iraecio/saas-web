import { DatePipe, DecimalPipe, SlicePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminWalletDetail } from '../../../../core/models/wallet-admin.model';
import { WalletAdminService } from '../../services/wallet-admin';
import { walletRoleLabel, walletStatusLabel } from '../../services/wallet-admin.presentation';

type DetailSection = 'overview' | 'credits' | 'pending' | 'audit';
@Component({
  selector: 'app-wallet-detail-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, DecimalPipe, SlicePipe],
  template: ` <main class="detail-shell">
    <nav class="breadcrumb" aria-label="Navegação estrutural">
      <a routerLink="../../wallets" [queryParams]="returnQuery()">Carteiras</a><span>/</span
      ><span aria-current="page">Detalhe</span>
    </nav>
    @if (loading()) {
      <div class="detail-skeleton" aria-label="Carregando carteira"><i></i><i></i><i></i></div>
    } @else if (error()) {
      <section class="state" role="alert">
        <strong>Não foi possível abrir esta carteira</strong>
        <p>{{ error() }}</p>
        <button (click)="load()">Tentar novamente</button>
      </section>
    } @else if (wallet(); as data) {
      <header>
        <div class="identity">
          <span class="avatar">{{ initials(data.ownerName) }}</span>
          <div>
            <div class="meta">
              <span>{{ roleLabel(data.role) }}</span
              ><span class="status"
                ><i [class]="data.accountStatus.toLowerCase()"></i
                >{{ statusLabel(data.accountStatus) }}</span
              >
            </div>
            <h1>{{ data.ownerName }}</h1>
            <p>{{ data.ownerEmail }} · {{ data.userId }}</p>
          </div>
        </div>
        <div class="actions">
          <a
            [routerLink]="['/admin/wallet-admin/issue-credits']"
            [queryParams]="{ userId: data.userId }"
            class="primary"
            >Emitir créditos</a
          ><button type="button" class="secondary" (click)="copyId(data.walletId)">
            {{ copied() ? 'ID copiado' : 'Copiar ID' }}
          </button>
        </div>
      </header>
      <section class="balance-board" aria-label="Composição do saldo">
        <article class="main-balance">
          <span>Disponível agora</span><strong>{{ data.availableCredits | number }}</strong
          ><small
            >{{ data.currency }} · atualizado {{ data.updatedAt | date: 'dd/MM, HH:mm' }}</small
          >
        </article>
        <article>
          <span>Reservado</span><strong>{{ data.frozenCredits | number }}</strong
          ><small>Em operações ativas</small>
        </article>
        <article>
          <span>A expirar</span><strong>{{ data.expiringCredits | number }}</strong
          ><small>Nos próximos 7 dias</small>
        </article>
        <article>
          <span>Histórico líquido</span
          ><strong>{{ data.totalReceived - data.totalSpent | number }}</strong
          ><small>{{ data.totalReceived | number }} recebidos</small>
        </article>
      </section>
      @if (data.hasDiscrepancy) {
        <aside class="alert" role="alert">
          <div>
            <strong>Esta carteira apresenta divergência</strong>
            <p>Revise a conciliação antes de realizar uma correção financeira.</p>
          </div>
          <a routerLink="/admin/wallet-admin/reconciliation">Abrir conciliação →</a>
        </aside>
      }
      <nav class="tabs" aria-label="Seções da carteira">
        @for (tab of tabs; track tab.id) {
          <button
            type="button"
            [class.active]="section() === tab.id"
            [attr.aria-current]="section() === tab.id ? 'page' : null"
            (click)="selectSection(tab.id)"
          >
            {{ tab.label }}<span>{{ count(tab.id, data) }}</span>
          </button>
        }
      </nav>
      <section class="section-content">
        @if (section() === 'overview') {
          <div class="overview-grid">
            <article>
              <div class="section-title">
                <span>Composição</span>
                <h2>Ciclo dos créditos</h2>
              </div>
              <dl>
                <div>
                  <dt>Recebidos</dt>
                  <dd>{{ data.totalReceived | number }}</dd>
                </div>
                <div>
                  <dt>Consumidos</dt>
                  <dd>{{ data.totalSpent | number }}</dd>
                </div>
                <div>
                  <dt>Estornados</dt>
                  <dd>{{ data.totalRefunded | number }}</dd>
                </div>
                <div>
                  <dt>Expirados</dt>
                  <dd>{{ data.expiredCredits | number }}</dd>
                </div>
              </dl>
            </article>
            <article>
              <div class="section-title">
                <span>Dados da conta</span>
                <h2>Contexto operacional</h2>
              </div>
              <dl class="context">
                <div>
                  <dt>Papel</dt>
                  <dd>{{ roleLabel(data.role) }}</dd>
                </div>
                <div>
                  <dt>Revenda</dt>
                  <dd>{{ data.resellerName || data.resellerId || 'Plataforma' }}</dd>
                </div>
                <div>
                  <dt>Carteira criada</dt>
                  <dd>{{ data.createdAt | date: 'dd/MM/yyyy' }}</dd>
                </div>
                <div>
                  <dt>Versão</dt>
                  <dd>{{ data.version | slice: 0 : 19 }}</dd>
                </div>
              </dl>
            </article>
          </div>
        } @else if (section() === 'credits') {
          <div class="section-title">
            <span>Rastreabilidade</span>
            <h2>Créditos recentes</h2>
          </div>
          @if (data.credits?.length) {
            <div class="rows">
              @for (credit of data.credits; track credit.id) {
                <article>
                  <div>
                    <strong>{{ credit.type }}</strong
                    ><small
                      >{{ credit.originType }} · {{ credit.issuedAt | date: 'dd/MM/yyyy' }}</small
                    >
                  </div>
                  <div class="row-end">
                    <span [class]="'credit-status ' + credit.status.toLowerCase()">{{
                      credit.status
                    }}</span
                    ><strong>{{ credit.valueCents | number }}</strong>
                  </div>
                </article>
              }
            </div>
          } @else {
            <div class="empty">Nenhum crédito encontrado nesta carteira.</div>
          }
        } @else if (section() === 'pending') {
          <div class="pending-grid">
            <article>
              <div class="section-title">
                <span>Revisão</span>
                <h2>Estornos</h2>
              </div>
              @if (data.refunds?.length) {
                @for (item of data.refunds; track item.id) {
                  <p class="pending-item">
                    <span>{{ item.reason }}</span
                    ><strong>{{ item.status }}</strong>
                  </p>
                }
              } @else {
                <p class="empty">Nenhum estorno pendente.</p>
              }
            </article>
            <article>
              <div class="section-title">
                <span>Análise</span>
                <h2>Disputas</h2>
              </div>
              @if (data.disputes?.length) {
                @for (item of data.disputes; track item.id) {
                  <p class="pending-item">
                    <span>{{ item.reason }}</span
                    ><strong>{{ item.status }}</strong>
                  </p>
                }
              } @else {
                <p class="empty">Nenhuma disputa registrada.</p>
              }
            </article>
          </div>
        } @else {
          <div class="section-title">
            <span>Auditoria</span>
            <h2>Atividade administrativa</h2>
          </div>
          @if (data.audit?.length) {
            <ol class="timeline">
              @for (entry of data.audit; track entry.id) {
                <li>
                  <i></i>
                  <div>
                    <strong>{{ entry.action }}</strong
                    ><small
                      >{{ entry.createdAt | date: 'dd/MM/yyyy, HH:mm' }} ·
                      {{ entry.performedBy }}</small
                    >
                  </div>
                </li>
              }
            </ol>
          } @else {
            <div class="empty">Nenhum evento administrativo encontrado.</div>
          }
        }
      </section>
    }
  </main>`,
  styles: [
    `
      :host {
        display: block;
      }
      .detail-shell {
        max-width: 84rem;
        margin: auto;
        padding: 1.5rem clamp(1rem, 4vw, 3.5rem) 5rem;
        color: #18181b;
      }
      .breadcrumb {
        display: flex;
        gap: 0.5rem;
        color: #71717a;
        font-size: 0.75rem;
        margin-bottom: 2rem;
      }
      .breadcrumb a:hover {
        text-decoration: underline;
      }
      header {
        display: flex;
        justify-content: space-between;
        gap: 2rem;
        align-items: end;
        margin-bottom: 2rem;
      }
      .identity {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .avatar {
        width: 4rem;
        height: 4rem;
        border-radius: 1rem;
        background: #e0e7ff;
        color: #1e3a8a;
        display: grid;
        place-items: center;
        font-weight: 800;
        font-size: 1.1rem;
      }
      .meta {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        font-size: 0.68rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #64748b;
      }
      .status {
        display: flex;
        gap: 0.3rem;
        align-items: center;
      }
      .status i {
        width: 0.4rem;
        height: 0.4rem;
        border-radius: 50%;
        background: #16a34a;
      }
      .status i.blocked {
        background: #dc2626;
      }
      .status i.archived {
        background: #71717a;
      }
      h1 {
        font-size: clamp(2rem, 4vw, 3.6rem);
        line-height: 1;
        letter-spacing: -0.05em;
        margin: 0.45rem 0;
      }
      .identity p {
        font-size: 0.78rem;
        color: #64748b;
      }
      .actions {
        display: flex;
        gap: 0.6rem;
      }
      .primary,
      .secondary,
      .state button {
        padding: 0.75rem 1rem;
        border-radius: 0.6rem;
        font-weight: 700;
        font-size: 0.82rem;
      }
      .primary {
        background: #172554;
        color: #fff;
      }
      .secondary,
      .state button {
        border: 1px solid #d4d4d8;
      }
      .balance-board {
        display: grid;
        grid-template-columns: 1.5fr repeat(3, 1fr);
        border-radius: 1rem;
        background: #172554;
        color: #fff;
        overflow: hidden;
      }
      .balance-board article {
        padding: 1.5rem;
        border-left: 1px solid #ffffff20;
        display: flex;
        flex-direction: column;
        min-height: 10rem;
      }
      .balance-board article:first-child {
        border: 0;
      }
      .balance-board span {
        color: #cbd5e1;
        font-size: 0.72rem;
      }
      .balance-board strong {
        font-size: 2rem;
        letter-spacing: -0.04em;
        margin-top: 0.8rem;
        font-variant-numeric: tabular-nums;
      }
      .balance-board .main-balance strong {
        font-size: 3.5rem;
      }
      .balance-board small {
        margin-top: auto;
        color: #94a3b8;
        font-size: 0.68rem;
      }
      .alert {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        background: #fff7ed;
        border: 1px solid #fed7aa;
        padding: 1rem 1.2rem;
        border-radius: 0.75rem;
        margin-top: 1rem;
        color: #9a3412;
      }
      .alert p {
        font-size: 0.75rem;
        margin-top: 0.2rem;
      }
      .alert a {
        font-size: 0.75rem;
        font-weight: 800;
      }
      .tabs {
        display: flex;
        gap: 1.5rem;
        border-bottom: 1px solid #e4e4e7;
        margin-top: 2.25rem;
        overflow: auto;
      }
      .tabs button {
        padding: 0.8rem 0;
        font-size: 0.78rem;
        color: #71717a;
        border-bottom: 2px solid transparent;
        white-space: nowrap;
      }
      .tabs button.active {
        color: #172554;
        border-color: #172554;
        font-weight: 750;
      }
      .tabs span {
        font-size: 0.65rem;
        background: #f4f4f5;
        border-radius: 0.3rem;
        padding: 0.1rem 0.3rem;
        margin-left: 0.35rem;
      }
      .section-content {
        padding-top: 1.5rem;
      }
      .overview-grid,
      .pending-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
      .overview-grid > article,
      .pending-grid > article {
        border: 1px solid #e4e4e7;
        border-radius: 0.85rem;
        padding: 1.3rem;
      }
      .section-title > span {
        font-size: 0.66rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #64748b;
      }
      .section-title h2 {
        font-size: 1.08rem;
        margin-top: 0.25rem;
      }
      .overview-grid dl {
        display: grid;
        grid-template-columns: 1fr 1fr;
        margin-top: 1rem;
      }
      .overview-grid dl div {
        padding: 0.8rem 0;
        border-bottom: 1px solid #e4e4e7;
      }
      .overview-grid dt {
        font-size: 0.7rem;
        color: #64748b;
      }
      .overview-grid dd {
        font-size: 1.1rem;
        font-weight: 750;
        font-variant-numeric: tabular-nums;
      }
      .overview-grid .context dd {
        font-size: 0.8rem;
      }
      .rows {
        margin-top: 1rem;
        border-top: 1px solid #e4e4e7;
      }
      .rows article {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.9rem;
        border-bottom: 1px solid #e4e4e7;
      }
      .rows small {
        display: block;
        font-size: 0.68rem;
        color: #64748b;
        margin-top: 0.2rem;
      }
      .row-end {
        display: flex;
        gap: 1rem;
        align-items: center;
      }
      .credit-status {
        font-size: 0.65rem;
        padding: 0.25rem 0.4rem;
        background: #f4f4f5;
        border-radius: 0.3rem;
      }
      .credit-status.available {
        background: #f0fdf4;
        color: #166534;
      }
      .pending-item {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.8rem 0;
        border-bottom: 1px solid #e4e4e7;
        font-size: 0.75rem;
      }
      .pending-item strong {
        font-size: 0.65rem;
      }
      .timeline {
        margin-top: 1rem;
      }
      .timeline li {
        display: flex;
        gap: 0.8rem;
        padding: 0 0 1.2rem;
      }
      .timeline i {
        width: 0.55rem;
        height: 0.55rem;
        border-radius: 50%;
        background: #172554;
        margin-top: 0.25rem;
      }
      .timeline small {
        display: block;
        color: #64748b;
        font-size: 0.68rem;
        margin-top: 0.2rem;
      }
      .empty {
        padding: 2rem;
        text-align: center;
        color: #71717a;
        font-size: 0.78rem;
      }
      .state {
        text-align: center;
        border: 1px solid #e4e4e7;
        border-radius: 1rem;
        padding: 4rem;
      }
      .state p {
        color: #64748b;
        margin: 0.5rem 0 1rem;
      }
      .detail-skeleton {
        display: grid;
        gap: 1rem;
      }
      .detail-skeleton i {
        height: 9rem;
        border-radius: 1rem;
        background: #e4e4e7;
        animation: pulse 1.4s infinite alternate;
      }
      @keyframes pulse {
        to {
          opacity: 0.4;
        }
      }
      :focus-visible {
        outline: 3px solid #60a5fa;
        outline-offset: 3px;
      }
      @media (max-width: 850px) {
        .balance-board {
          grid-template-columns: 1fr 1fr;
        }
        .balance-board article {
          border-top: 1px solid #ffffff20;
        }
        .overview-grid,
        .pending-grid {
          grid-template-columns: 1fr;
        }
      }
      @media (max-width: 600px) {
        header {
          align-items: stretch;
          flex-direction: column;
        }
        .actions > * {
          flex: 1;
          text-align: center;
        }
        .balance-board {
          grid-template-columns: 1fr 1fr;
        }
        .balance-board article {
          padding: 1rem;
          min-height: 8rem;
        }
        .balance-board .main-balance strong {
          font-size: 2.6rem;
        }
        .identity {
          align-items: flex-start;
        }
        .avatar {
          width: 3rem;
          height: 3rem;
          border-radius: 0.75rem;
        }
        .tabs {
          gap: 1rem;
        }
      }
      :host-context(.dark) .detail-shell {
        color: var(--ui-foreground);
      }
      :host-context(.dark) .secondary,
      :host-context(.dark) .overview-grid > article,
      :host-context(.dark) .pending-grid > article {
        color: var(--ui-foreground);
        background: var(--ui-surface);
        border-color: var(--ui-border);
      }
      :host-context(.dark) .tabs {
        border-color: var(--ui-border);
      }
      :host-context(.dark) .tabs button.active {
        color: var(--ui-primary);
        border-color: var(--ui-primary);
      }
      :host-context(.dark) .primary {
        color: var(--ui-primary-foreground);
        background: var(--ui-primary);
      }
      :host-context(.dark) .breadcrumb,
      :host-context(.dark) .identity p,
      :host-context(.dark) .meta,
      :host-context(.dark) .section-title > span,
      :host-context(.dark) .overview-grid dt,
      :host-context(.dark) .rows small,
      :host-context(.dark) .timeline small,
      :host-context(.dark) .empty,
      :host-context(.dark) .state p {
        color: var(--ui-muted);
      }
      :host-context(.dark) .avatar {
        color: #b9e3df;
        background: #244047;
      }
      :host-context(.dark) .secondary,
      :host-context(.dark) .state button {
        color: var(--ui-foreground);
        background: var(--ui-surface);
        border-color: var(--ui-border-strong);
      }
      :host-context(.dark) .alert {
        color: #f8cf8d;
        background: #362d20;
        border-color: #72592e;
      }
      :host-context(.dark) .tabs button {
        color: var(--ui-muted);
      }
      :host-context(.dark) .tabs span,
      :host-context(.dark) .credit-status {
        color: var(--ui-muted);
        background: var(--ui-surface-subtle);
      }
      :host-context(.dark) .credit-status.available {
        color: #8ce0bc;
        background: #19382f;
      }
      :host-context(.dark) .overview-grid dl div,
      :host-context(.dark) .rows,
      :host-context(.dark) .rows article,
      :host-context(.dark) .pending-item {
        border-color: var(--ui-border);
      }
      :host-context(.dark) .timeline i {
        background: var(--ui-primary);
      }
      :host-context(.dark) .detail-skeleton i {
        background: var(--ui-surface-subtle);
      }
      :host-context(.dark) .balance-board {
        background: #15272b;
        box-shadow: inset 0 0 0 1px #ffffff0d;
      }
      @media (prefers-reduced-motion: reduce) {
        * {
          animation: none !important;
          transition: none !important;
        }
      }
    `,
  ],
})
export class WalletDetailAdminPage implements OnInit {
  private service = inject(WalletAdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  readonly wallet = signal<AdminWalletDetail | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly copied = signal(false);
  readonly section = signal<DetailSection>('overview');
  readonly returnQuery = computed(() => history.state?.returnQuery || {});
  readonly tabs: Array<{ id: DetailSection; label: string }> = [
    { id: 'overview', label: 'Resumo' },
    { id: 'credits', label: 'Créditos' },
    { id: 'pending', label: 'Pendências' },
    { id: 'audit', label: 'Auditoria' },
  ];
  ngOnInit(): void {
    this.section.set(
      (this.route.snapshot.queryParamMap.get('section') as DetailSection) || 'overview',
    );
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.error.set('');
    const id = this.route.snapshot.paramMap.get('userId') || '';
    this.service
      .getWalletDetails(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.wallet.set(data);
          this.loading.set(false);
        },
        error: (e) => {
          this.error.set(e.message || 'Verifique sua conexão.');
          this.loading.set(false);
        },
      });
  }
  selectSection(section: DetailSection): void {
    this.section.set(section);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { section },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
  count(section: DetailSection, data: AdminWalletDetail): number | string {
    return section === 'credits'
      ? data.credits?.length || 0
      : section === 'pending'
        ? (data.refunds?.length || 0) + (data.disputes?.length || 0)
        : section === 'audit'
          ? data.audit?.length || 0
          : '';
  }
  copyId(id: string): void {
    navigator.clipboard?.writeText(id);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1600);
  }
  initials(name: string): string {
    return (
      name
        .split(/\s+/)
        .slice(0, 2)
        .map((x) => x[0])
        .join('')
        .toUpperCase() || 'US'
    );
  }
  roleLabel = walletRoleLabel;
  statusLabel = walletStatusLabel;
}
