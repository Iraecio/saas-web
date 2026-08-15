import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AdminWalletOverview } from '../../../../core/models/wallet-admin.model';
import { WalletAdminService } from '../../services/wallet-admin';
import { walletRoleLabel } from '../../services/wallet-admin.presentation';

@Component({
  selector: 'app-wallet-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DecimalPipe],
  template: `
    <main class="overview-shell">
      <header>
        <div>
          <span class="kicker">Operação financeira</span>
          <h1>Carteiras sob controle.</h1>
          <p>Uma leitura direta dos saldos, reservas e pontos que precisam da sua atenção.</p>
        </div>
        <div class="actions">
          <a routerLink="wallets" class="secondary">Abrir todas as carteiras</a
          ><a routerLink="issue-credits" class="primary">Emitir créditos</a>
        </div>
      </header>
      @if (loading()) {
        <div class="loading-grid" aria-label="Carregando visão geral">
          @for (_ of [1, 2, 3, 4]; track $index) {
            <span></span>
          }
        </div>
      } @else if (error()) {
        <section class="state" role="alert">
          <strong>Visão geral indisponível</strong>
          <p>{{ error() }}</p>
          <button (click)="load()">Tentar novamente</button>
        </section>
      } @else if (overview(); as data) {
        <section class="hero-grid" aria-label="Resumo financeiro">
          <article class="balance">
            <span>Saldo disponível na plataforma</span
            ><strong>{{ data.availableCredits | number }}</strong>
            <p>créditos distribuídos em {{ data.wallets | number }} carteiras</p>
            <a routerLink="wallets">Explorar composição →</a>
          </article>
          <article>
            <span>Em reserva</span><strong>{{ data.frozenCredits | number }}</strong>
            <p>Créditos comprometidos em operações</p>
            <a routerLink="wallets" [queryParams]="{ hasReservations: true }">Ver reservas →</a>
          </article>
          <article [class.warning]="data.discrepancies">
            <span>Divergências</span><strong>{{ data.discrepancies | number }}</strong>
            <p>Carteiras que pedem reconciliação</p>
            <a routerLink="wallets" [queryParams]="{ hasDiscrepancy: true }">Revisar agora →</a>
          </article>
        </section>
        <section class="lower-grid">
          <article class="role-panel">
            <div class="section-title">
              <div>
                <span>Distribuição</span>
                <h2>Carteiras por papel</h2>
              </div>
              <a routerLink="wallets">Ver lista</a>
            </div>
            <div class="role-list">
              @for (item of data.byRole; track item.role) {
                <a routerLink="wallets" [queryParams]="{ role: item.role }"
                  ><span>{{ roleLabel(item.role) }}</span
                  ><i><b [style.width.%]="roleWidth(item.count, data.wallets)"></b></i
                  ><strong>{{ item.count | number }}</strong></a
                >
              }
            </div>
          </article>
          <article class="movement-panel">
            <div class="section-title">
              <div>
                <span>Fluxo histórico</span>
                <h2>Movimentação de créditos</h2>
              </div>
            </div>
            <dl>
              <div>
                <dt>Emitidos</dt>
                <dd>{{ data.totalIssued | number }}</dd>
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
                <dd>{{ data.totalExpired | number }}</dd>
              </div>
            </dl>
            <nav>
              <a routerLink="credits">Examinar créditos</a
              ><a routerLink="reconciliation">Abrir conciliação</a
              ><a routerLink="audit">Consultar auditoria</a>
            </nav>
          </article>
        </section>
      }
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .overview-shell {
        max-width: 88rem;
        margin: auto;
        padding: clamp(1.25rem, 4vw, 3.5rem) clamp(1rem, 4vw, 3.5rem) 5rem;
        color: #18181b;
      }
      header {
        display: flex;
        justify-content: space-between;
        align-items: end;
        gap: 2rem;
        margin-bottom: 3rem;
      }
      .kicker,
      .section-title span {
        font-size: 0.7rem;
        letter-spacing: 0.13em;
        text-transform: uppercase;
        font-weight: 750;
        color: #64748b;
      }
      h1 {
        font-size: clamp(2.6rem, 6vw, 5.25rem);
        letter-spacing: -0.065em;
        line-height: 0.92;
        margin: 0.8rem 0 1.1rem;
        max-width: 13ch;
      }
      header p {
        max-width: 42rem;
        color: #64748b;
        line-height: 1.6;
      }
      .actions {
        display: flex;
        gap: 0.7rem;
      }
      .primary,
      .secondary {
        padding: 0.8rem 1rem;
        border-radius: 0.65rem;
        font-size: 0.85rem;
        font-weight: 700;
      }
      .primary {
        background: #172554;
        color: #fff;
      }
      .secondary {
        border: 1px solid #d4d4d8;
      }
      .hero-grid {
        display: grid;
        grid-template-columns: 1.45fr 1fr 1fr;
        background: #172554;
        color: #fff;
        border-radius: 1.1rem;
        overflow: hidden;
        box-shadow: 0 1.4rem 4rem #1725541c;
      }
      .hero-grid article {
        padding: clamp(1.4rem, 3vw, 2.5rem);
        min-height: 14rem;
        display: flex;
        flex-direction: column;
        border-left: 1px solid #ffffff1c;
      }
      .hero-grid article:first-child {
        border: 0;
      }
      .hero-grid article.warning {
        background: #7f1d1d;
      }
      .hero-grid span {
        font-size: 0.75rem;
        color: #cbd5e1;
      }
      .hero-grid strong {
        font-size: clamp(2.25rem, 5vw, 4.5rem);
        letter-spacing: -0.05em;
        font-variant-numeric: tabular-nums;
        margin-top: 1.1rem;
      }
      .hero-grid p {
        color: #cbd5e1;
        font-size: 0.82rem;
      }
      .hero-grid a {
        margin-top: auto;
        color: #fff;
        font-size: 0.78rem;
        font-weight: 700;
      }
      .lower-grid {
        display: grid;
        grid-template-columns: 1.35fr 1fr;
        gap: 1.25rem;
        margin-top: 1.25rem;
      }
      .lower-grid > article {
        border: 1px solid #e4e4e7;
        border-radius: 1rem;
        padding: 1.5rem;
        background: #fff;
      }
      .section-title {
        display: flex;
        justify-content: space-between;
        align-items: start;
      }
      .section-title h2 {
        font-size: 1.25rem;
        margin-top: 0.25rem;
      }
      .section-title a {
        font-size: 0.75rem;
        color: #1e3a8a;
      }
      .role-list {
        margin-top: 1.4rem;
        display: grid;
        gap: 0.9rem;
      }
      .role-list a {
        display: grid;
        grid-template-columns: 9rem 1fr 3rem;
        align-items: center;
        gap: 0.8rem;
        font-size: 0.78rem;
      }
      .role-list i {
        height: 0.35rem;
        background: #e4e4e7;
        border-radius: 1rem;
        overflow: hidden;
      }
      .role-list b {
        display: block;
        height: 100%;
        background: #172554;
      }
      .role-list strong {
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      .movement-panel dl {
        display: grid;
        grid-template-columns: 1fr 1fr;
        margin: 1.2rem 0;
      }
      .movement-panel dl div {
        padding: 1rem 0;
        border-bottom: 1px solid #e4e4e7;
      }
      .movement-panel dt {
        font-size: 0.72rem;
        color: #64748b;
      }
      .movement-panel dd {
        font-size: 1.35rem;
        font-weight: 750;
        font-variant-numeric: tabular-nums;
      }
      .movement-panel nav {
        display: grid;
      }
      .movement-panel nav a {
        padding: 0.7rem 0;
        border-bottom: 1px solid #e4e4e7;
        font-size: 0.78rem;
        font-weight: 700;
      }
      .loading-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
      }
      .loading-grid span {
        height: 14rem;
        border-radius: 1rem;
        background: linear-gradient(90deg, #f4f4f5, #e4e4e7, #f4f4f5);
        background-size: 200%;
        animation: pulse 1.5s infinite;
      }
      .state {
        text-align: center;
        padding: 5rem;
        border: 1px solid #e4e4e7;
        border-radius: 1rem;
      }
      .state p {
        color: #64748b;
        margin: 0.5rem;
      }
      .state button {
        padding: 0.7rem 1rem;
        border: 1px solid #d4d4d8;
        border-radius: 0.5rem;
      }
      @keyframes pulse {
        to {
          background-position: -200%;
        }
      }
      :focus-visible {
        outline: 3px solid #60a5fa;
        outline-offset: 3px;
      }
      @media (max-width: 800px) {
        header {
          align-items: stretch;
          flex-direction: column;
        }
        .hero-grid,
        .lower-grid {
          grid-template-columns: 1fr;
        }
        .hero-grid article {
          border-left: 0;
          border-top: 1px solid #ffffff1c;
          min-height: 11rem;
        }
        .role-list a {
          grid-template-columns: 7rem 1fr 2.5rem;
        }
      }
      @media (max-width: 480px) {
        .actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .overview-shell {
          padding-top: 2rem;
        }
        .hero-grid strong {
          font-size: 2.75rem;
        }
        .lower-grid > article {
          padding: 1.1rem;
        }
      }
      :host-context(.dark) .overview-shell {
        color: #fafafa;
      }
      :host-context(.dark) .lower-grid > article {
        background: #18181b;
        border-color: #3f3f46;
      }
      :host-context(.dark) .secondary {
        border-color: #52525b;
      }
      :host-context(.dark) .primary {
        background: #dbeafe;
        color: #172554;
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
export class WalletOverviewPage implements OnInit {
  private service = inject(WalletAdminService);
  private destroyRef = inject(DestroyRef);
  readonly overview = signal<AdminWalletOverview | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  ngOnInit(): void {
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.service
      .getOverview()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.overview.set(data);
          this.loading.set(false);
        },
        error: (e) => {
          this.error.set(e.message || 'Verifique a conexão.');
          this.loading.set(false);
        },
      });
  }
  roleLabel = walletRoleLabel;
  roleWidth(count: number, total: number): number {
    return total ? Math.max(3, (count / total) * 100) : 0;
  }
}
