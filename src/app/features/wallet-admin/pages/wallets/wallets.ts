import { DatePipe, DecimalPipe } from '@angular/common';
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
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import {
  AdminWalletPage,
  AdminWalletQuery,
  AdminWalletSummary,
} from '../../../../core/models/wallet-admin.model';
import { WalletAdminQueryService } from '../../services/wallet-admin-query';
import { walletRoleLabel, walletStatusLabel } from '../../services/wallet-admin.presentation';
import { WalletAdminService } from '../../services/wallet-admin';

@Component({
  selector: 'app-wallets-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, DecimalPipe, ReactiveFormsModule],
  template: `
    <main id="wallet-content" class="wallet-shell">
      <header class="page-header">
        <div>
          <a routerLink="/admin/wallet-admin" class="eyebrow">← Visão geral</a>
          <h1>Carteiras</h1>
          <p>Consulte saldos, reservas e riscos de todos os perfis da plataforma.</p>
        </div>
        <div class="header-actions">
          <button type="button" class="secondary-button" (click)="downloadExport()">
            Exportar consulta
          </button>
          <a routerLink="/admin/wallet-admin/issue-credits" class="primary-button"
            >Emitir créditos</a
          >
        </div>
      </header>

      @if (page(); as currentPage) {
        <section class="metric-strip" aria-label="Totais da consulta">
          <article>
            <span>Carteiras</span><strong>{{ currentPage.total | number }}</strong>
          </article>
          <article>
            <span>Saldo disponível</span
            ><strong>{{ currentPage.totals.availableCredits | number }}</strong>
          </article>
          <article>
            <span>Reservado</span><strong>{{ currentPage.totals.frozenCredits | number }}</strong>
          </article>
          <article [class.attention]="currentPage.totals.discrepancies > 0">
            <span>Divergências</span
            ><strong>{{ currentPage.totals.discrepancies | number }}</strong>
          </article>
        </section>
      }

      <section class="workspace" aria-labelledby="wallet-list-title">
        <div class="toolbar">
          <div class="search-wrap">
            <label for="wallet-search" class="sr-only">Buscar carteiras</label>
            <span aria-hidden="true">⌕</span>
            <input
              id="wallet-search"
              type="search"
              [formControl]="filters.controls.search"
              placeholder="Nome, e-mail ou identificador"
            />
          </div>
          <button
            type="button"
            class="filter-button"
            (click)="filtersOpen.set(!filtersOpen())"
            [attr.aria-expanded]="filtersOpen()"
          >
            Filtros <span class="filter-count">{{ activeFilterCount() }}</span>
          </button>
          <label class="sort-field"
            >Ordenar
            <select [formControl]="filters.controls.sort">
              <option value="lastMovementAt">Movimentação recente</option>
              <option value="balance">Maior saldo</option>
              <option value="owner">Nome</option>
              <option value="createdAt">Mais recente</option>
            </select>
          </label>
        </div>

        @if (filtersOpen()) {
          <form class="filter-panel" [formGroup]="filters" (ngSubmit)="applyFilters()">
            <label
              >Papel<select formControlName="role">
                <option value="">Todos</option>
                @for (role of roles; track role.value) {
                  <option [value]="role.value">{{ role.label }}</option>
                }
              </select></label
            >
            <label
              >Situação<select formControlName="status">
                <option value="">Todas</option>
                <option value="ACTIVE">Ativa</option>
                <option value="BLOCKED">Bloqueada</option>
                <option value="ARCHIVED">Arquivada</option>
              </select></label
            >
            <label>Saldo mínimo<input type="number" min="0" formControlName="balanceMin" /></label>
            <label>Saldo máximo<input type="number" min="0" formControlName="balanceMax" /></label>
            <label class="check-row"
              ><input type="checkbox" formControlName="hasReservations" /> Com reservas</label
            >
            <label class="check-row"
              ><input type="checkbox" formControlName="hasDiscrepancy" /> Com divergência</label
            >
            <div class="filter-actions">
              <button type="button" (click)="clearFilters()">Limpar</button
              ><button type="submit" class="primary-button">Aplicar filtros</button>
            </div>
          </form>
        }

        <div class="list-heading">
          <div>
            <h2 id="wallet-list-title">Todas as carteiras</h2>
            <p>{{ page()?.total || 0 }} resultados encontrados</p>
          </div>
          @if (selected().size) {
            <button class="selection-chip" type="button" (click)="clearSelection()">
              {{ selected().size }} selecionadas · Limpar
            </button>
          }
        </div>

        <div aria-live="polite" class="sr-only">{{ liveMessage() }}</div>
        @if (loading()) {
          <div class="skeleton-list" aria-label="Carregando carteiras">
            @for (row of skeletonRows; track $index) {
              <div class="skeleton-row"></div>
            }
          </div>
        } @else if (error()) {
          <div class="state-panel" role="alert">
            <strong>Não foi possível carregar as carteiras</strong>
            <p>{{ error() }}</p>
            <button type="button" class="secondary-button" (click)="load()">
              Tentar novamente
            </button>
          </div>
        } @else if (!page()?.items?.length) {
          <div class="state-panel">
            <span class="state-mark">0</span
            ><strong>Nenhuma carteira corresponde à consulta</strong>
            <p>Revise a busca ou remova alguns filtros.</p>
            <button type="button" class="secondary-button" (click)="clearFilters()">
              Limpar filtros
            </button>
          </div>
        } @else {
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      aria-label="Selecionar página"
                      [checked]="allVisibleSelected()"
                      (change)="toggleVisible()"
                    />
                  </th>
                  <th>Proprietário</th>
                  <th>Papel</th>
                  <th>Disponível</th>
                  <th>Reservado</th>
                  <th>Sinais</th>
                  <th>Última atividade</th>
                  <th><span class="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody>
                @for (wallet of page()!.items; track wallet.walletId) {
                  <tr>
                    <td>
                      <input
                        type="checkbox"
                        [attr.aria-label]="'Selecionar carteira de ' + wallet.ownerName"
                        [checked]="selected().has(wallet.walletId)"
                        (change)="toggle(wallet.walletId)"
                      />
                    </td>
                    <td>
                      <div class="owner">
                        <span class="avatar">{{ initials(wallet.ownerName) }}</span>
                        <div>
                          <a [routerLink]="[wallet.walletId]">{{ wallet.ownerName }}</a
                          ><small>{{ wallet.ownerEmail }}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="role-label">{{ roleLabel(wallet.role) }}</span
                      ><small class="status-line"
                        ><i [class]="'status-dot ' + wallet.accountStatus.toLowerCase()"></i
                        >{{ statusLabel(wallet.accountStatus) }}</small
                      >
                    </td>
                    <td class="number">
                      <strong>{{ wallet.availableCredits | number }}</strong
                      ><small>créditos</small>
                    </td>
                    <td class="number">
                      <strong>{{ wallet.frozenCredits | number }}</strong
                      ><small>créditos</small>
                    </td>
                    <td>
                      <div class="signals">
                        @if (wallet.hasDiscrepancy) {
                          <span class="signal danger">Divergência</span>
                        }
                        @if (wallet.expiringCredits) {
                          <span class="signal">{{ wallet.expiringCredits }} a expirar</span>
                        }
                        @if (!wallet.hasDiscrepancy && !wallet.expiringCredits) {
                          <span class="muted">Sem alertas</span>
                        }
                      </div>
                    </td>
                    <td>
                      <time [dateTime]="wallet.lastMovementAt || wallet.updatedAt">{{
                        wallet.lastMovementAt || wallet.updatedAt | date: 'dd MMM, HH:mm'
                      }}</time>
                    </td>
                    <td>
                      <a
                        class="detail-link"
                        [routerLink]="[wallet.walletId]"
                        aria-label="Abrir detalhes da carteira"
                        >→</a
                      >
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="mobile-cards">
            @for (wallet of page()!.items; track wallet.walletId) {
              <article class="wallet-card">
                <div class="card-top">
                  <div class="owner">
                    <span class="avatar">{{ initials(wallet.ownerName) }}</span>
                    <div>
                      <a [routerLink]="[wallet.walletId]">{{ wallet.ownerName }}</a
                      ><small>{{ roleLabel(wallet.role) }}</small>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    [attr.aria-label]="'Selecionar carteira de ' + wallet.ownerName"
                    [checked]="selected().has(wallet.walletId)"
                    (change)="toggle(wallet.walletId)"
                  />
                </div>
                <div class="card-balance">
                  <span>Disponível</span><strong>{{ wallet.availableCredits | number }}</strong
                  ><small>{{ wallet.frozenCredits | number }} reservados</small>
                </div>
                <div class="card-footer">
                  <span class="status-line"
                    ><i [class]="'status-dot ' + wallet.accountStatus.toLowerCase()"></i
                    >{{ statusLabel(wallet.accountStatus) }}</span
                  ><a [routerLink]="[wallet.walletId]">Ver carteira →</a>
                </div>
              </article>
            }
          </div>

          <nav class="pagination" aria-label="Paginação">
            <span>Página {{ page()!.page }} de {{ page()!.totalPages }}</span>
            <div>
              <button
                type="button"
                (click)="goToPage(page()!.page - 1)"
                [disabled]="page()!.page <= 1"
              >
                Anterior</button
              ><button
                type="button"
                (click)="goToPage(page()!.page + 1)"
                [disabled]="page()!.page >= page()!.totalPages"
              >
                Próxima
              </button>
            </div>
          </nav>
        }
      </section>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
        color: var(--color-neutral-900);
      }
      .wallet-shell {
        max-width: 90rem;
        margin: auto;
        padding: 2rem clamp(1rem, 3vw, 3rem) 5rem;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        gap: 2rem;
        align-items: flex-end;
        margin-bottom: 2rem;
      }
      .eyebrow {
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #6b7280;
      }
      .page-header h1 {
        font-size: clamp(2rem, 4vw, 3.5rem);
        letter-spacing: -0.055em;
        line-height: 1;
        margin: 0.65rem 0;
      }
      .page-header p {
        color: #6b7280;
        max-width: 42rem;
      }
      .header-actions,
      .filter-actions {
        display: flex;
        gap: 0.75rem;
      }
      .primary-button,
      .secondary-button,
      .filter-button {
        min-height: 2.75rem;
        padding: 0.7rem 1rem;
        border-radius: 0.65rem;
        font-weight: 650;
        font-size: 0.875rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition:
          transform 0.2s,
          background 0.2s;
      }
      .primary-button {
        background: #172554;
        color: white;
      }
      .secondary-button,
      .filter-button {
        border: 1px solid #d4d4d8;
        background: white;
      }
      .primary-button:active,
      .secondary-button:active {
        transform: translateY(1px);
      }
      .metric-strip {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        background: #172554;
        color: white;
        border-radius: 1rem;
        margin-bottom: 1.25rem;
        overflow: hidden;
      }
      .metric-strip article {
        padding: 1.35rem 1.5rem;
        border-right: 1px solid #ffffff20;
      }
      .metric-strip span {
        display: block;
        color: #cbd5e1;
        font-size: 0.75rem;
      }
      .metric-strip strong {
        font-size: 1.55rem;
        font-variant-numeric: tabular-nums;
      }
      .metric-strip .attention {
        background: #7f1d1d;
      }
      .workspace {
        background: white;
        border: 1px solid #e4e4e7;
        border-radius: 1rem;
        overflow: hidden;
      }
      .toolbar {
        padding: 1rem;
        display: flex;
        gap: 0.75rem;
        border-bottom: 1px solid #e4e4e7;
      }
      .search-wrap {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 0.6rem;
        background: #f4f4f5;
        border-radius: 0.6rem;
        padding: 0 0.9rem;
      }
      .search-wrap input {
        width: 100%;
        min-height: 2.75rem;
        background: transparent;
        outline: none;
      }
      .filter-count {
        display: grid;
        place-items: center;
        background: #172554;
        color: white;
        border-radius: 50%;
        width: 1.35rem;
        height: 1.35rem;
        font-size: 0.7rem;
        margin-left: 0.4rem;
      }
      .sort-field {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.75rem;
        color: #71717a;
      }
      .sort-field select,
      .filter-panel select,
      .filter-panel input {
        min-height: 2.65rem;
        border: 1px solid #d4d4d8;
        border-radius: 0.55rem;
        background: white;
        padding: 0.5rem 0.7rem;
        color: inherit;
      }
      .filter-panel {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 1rem;
        padding: 1rem;
        background: #fafafa;
        border-bottom: 1px solid #e4e4e7;
      }
      .filter-panel label {
        display: grid;
        gap: 0.35rem;
        font-size: 0.75rem;
        font-weight: 650;
      }
      .filter-panel .check-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .filter-actions {
        grid-column: 1/-1;
        justify-content: flex-end;
      }
      .list-heading {
        padding: 1.25rem 1.4rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .list-heading h2 {
        font-size: 1.05rem;
        font-weight: 700;
      }
      .list-heading p {
        font-size: 0.8rem;
        color: #71717a;
      }
      .selection-chip {
        font-size: 0.75rem;
        background: #eff6ff;
        color: #1e3a8a;
        padding: 0.5rem 0.75rem;
        border-radius: 0.5rem;
      }
      .table-wrap {
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.84rem;
      }
      th {
        text-align: left;
        font-size: 0.68rem;
        letter-spacing: 0.07em;
        text-transform: uppercase;
        color: #71717a;
        padding: 0.7rem 1rem;
        background: #fafafa;
      }
      td {
        padding: 1rem;
        border-top: 1px solid #f0f0f2;
        vertical-align: middle;
      }
      .owner {
        display: flex;
        align-items: center;
        gap: 0.7rem;
        min-width: 12rem;
      }
      .avatar {
        width: 2.25rem;
        height: 2.25rem;
        border-radius: 0.65rem;
        background: #e0e7ff;
        color: #1e3a8a;
        display: grid;
        place-items: center;
        font-size: 0.72rem;
        font-weight: 750;
      }
      .owner a {
        font-weight: 700;
        color: inherit;
      }
      .owner small,
      .number small {
        display: block;
        color: #71717a;
        margin-top: 0.15rem;
      }
      .role-label {
        font-weight: 650;
      }
      .status-line {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        color: #71717a;
        font-size: 0.72rem;
        margin-top: 0.3rem;
      }
      .status-dot {
        width: 0.42rem;
        height: 0.42rem;
        border-radius: 50%;
        background: #16a34a;
      }
      .status-dot.blocked {
        background: #dc2626;
      }
      .status-dot.archived {
        background: #71717a;
      }
      .number {
        font-variant-numeric: tabular-nums;
      }
      .number strong {
        font-size: 0.95rem;
      }
      .signals {
        display: flex;
        gap: 0.3rem;
        flex-wrap: wrap;
      }
      .signal {
        font-size: 0.68rem;
        padding: 0.25rem 0.4rem;
        border-radius: 0.35rem;
        background: #fff7ed;
        color: #9a3412;
      }
      .signal.danger {
        background: #fef2f2;
        color: #b91c1c;
      }
      .muted,
      time {
        color: #71717a;
        font-size: 0.75rem;
      }
      .detail-link {
        font-size: 1.2rem;
        padding: 0.65rem;
      }
      .pagination {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.4rem;
        border-top: 1px solid #e4e4e7;
        font-size: 0.8rem;
        color: #71717a;
      }
      .pagination button {
        border: 1px solid #d4d4d8;
        padding: 0.55rem 0.75rem;
        background: white;
      }
      .pagination button:first-child {
        border-radius: 0.5rem 0 0 0.5rem;
      }
      .pagination button:last-child {
        border-radius: 0 0.5rem 0.5rem 0;
      }
      .pagination button:disabled {
        opacity: 0.4;
      }
      .mobile-cards {
        display: none;
      }
      .skeleton-list {
        padding: 0 1rem 1rem;
      }
      .skeleton-row {
        height: 4.75rem;
        margin: 0.5rem 0;
        border-radius: 0.65rem;
        background: linear-gradient(90deg, #f4f4f5, #e4e4e7, #f4f4f5);
        background-size: 200%;
        animation: pulse 1.6s infinite;
      }
      .state-panel {
        text-align: center;
        padding: 4rem 1rem;
        color: #52525b;
      }
      .state-panel strong {
        display: block;
        color: #18181b;
        font-size: 1.05rem;
      }
      .state-panel p {
        margin: 0.4rem 0 1.2rem;
      }
      .state-mark {
        display: grid;
        place-items: center;
        width: 3rem;
        height: 3rem;
        border-radius: 50%;
        background: #f4f4f5;
        margin: 0 auto 1rem;
        font-weight: 700;
      }
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
      @keyframes pulse {
        to {
          background-position: -200% 0;
        }
      }
      :focus-visible {
        outline: 3px solid #60a5fa;
        outline-offset: 2px;
      }
      @media (max-width: 900px) {
        .metric-strip {
          grid-template-columns: repeat(2, 1fr);
        }
        .filter-panel {
          grid-template-columns: repeat(2, 1fr);
        }
        th:nth-child(5),
        td:nth-child(5),
        th:nth-child(7),
        td:nth-child(7) {
          display: none;
        }
      }
      @media (max-width: 640px) {
        .wallet-shell {
          padding: 1.25rem 0.85rem 6rem;
        }
        .page-header {
          align-items: stretch;
          flex-direction: column;
        }
        .page-header h1 {
          font-size: 2.5rem;
        }
        .header-actions > * {
          flex: 1;
        }
        .metric-strip {
          border-radius: 0.8rem;
        }
        .metric-strip article {
          padding: 1rem;
        }
        .toolbar {
          flex-wrap: wrap;
        }
        .search-wrap {
          flex-basis: 100%;
        }
        .sort-field {
          flex: 1;
        }
        .filter-panel {
          position: fixed;
          z-index: 40;
          inset: auto 0 0;
          grid-template-columns: 1fr 1fr;
          max-height: 75dvh;
          overflow: auto;
          border-radius: 1rem 1rem 0 0;
          box-shadow: 0 -1rem 3rem #17255422;
        }
        .table-wrap {
          display: none;
        }
        .mobile-cards {
          display: grid;
          gap: 0.75rem;
          padding: 0 0.8rem 1rem;
        }
        .wallet-card {
          border: 1px solid #e4e4e7;
          border-radius: 0.8rem;
          padding: 1rem;
        }
        .card-top,
        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .card-balance {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: end;
          border-block: 1px solid #f0f0f2;
          padding: 1rem 0;
          margin: 1rem 0;
        }
        .card-balance span,
        .card-balance small {
          font-size: 0.72rem;
          color: #71717a;
        }
        .card-balance strong {
          grid-row: 2;
          font-size: 1.65rem;
          font-variant-numeric: tabular-nums;
        }
        .card-balance small {
          grid-column: 2;
          grid-row: 2;
        }
        .card-footer a {
          font-size: 0.8rem;
          font-weight: 700;
          color: #1e3a8a;
        }
      }
      :host-context(.dark) {
        color: var(--ui-foreground);
      }
      :host-context(.dark) .workspace,
      :host-context(.dark) .secondary-button,
      :host-context(.dark) .filter-button,
      :host-context(.dark) .sort-field select,
      :host-context(.dark) .filter-panel select,
      :host-context(.dark) .filter-panel input,
      :host-context(.dark) .pagination button,
      :host-context(.dark) .wallet-card {
        color: var(--ui-foreground);
        background: var(--ui-surface);
        border-color: var(--ui-border);
      }
      :host-context(.dark) .secondary-button:hover,
      :host-context(.dark) .filter-button:hover,
      :host-context(.dark) .pagination button:not(:disabled):hover,
      :host-context(.dark) tbody tr:hover {
        background: var(--ui-surface-subtle);
      }
      :host-context(.dark) .filter-panel,
      :host-context(.dark) th {
        color: var(--ui-muted);
        background: #1d272c;
      }
      :host-context(.dark) td,
      :host-context(.dark) .toolbar,
      :host-context(.dark) .list-heading,
      :host-context(.dark) .pagination,
      :host-context(.dark) .card-balance,
      :host-context(.dark) .wallet-card {
        border-color: var(--ui-border);
      }
      :host-context(.dark) .search-wrap,
      :host-context(.dark) .state-mark,
      :host-context(.dark) .tabs span {
        color: var(--ui-foreground);
        background: var(--ui-surface-subtle);
      }
      :host-context(.dark) .search-wrap input {
        color: var(--ui-foreground);
      }
      :host-context(.dark) .search-wrap input::placeholder {
        color: var(--ui-muted);
      }
      :host-context(.dark) .page-header p,
      :host-context(.dark) .eyebrow,
      :host-context(.dark) .list-heading p,
      :host-context(.dark) .sort-field,
      :host-context(.dark) .owner small,
      :host-context(.dark) .number small,
      :host-context(.dark) .status-line,
      :host-context(.dark) .muted,
      :host-context(.dark) time,
      :host-context(.dark) .card-balance span,
      :host-context(.dark) .card-balance small,
      :host-context(.dark) .state-panel {
        color: var(--ui-muted);
      }
      :host-context(.dark) .state-panel strong,
      :host-context(.dark) .owner a,
      :host-context(.dark) .number strong,
      :host-context(.dark) .role-label {
        color: var(--ui-foreground);
      }
      :host-context(.dark) .avatar {
        color: #b9e3df;
        background: #244047;
      }
      :host-context(.dark) .selection-chip {
        color: #b9e3df;
        background: #21383e;
      }
      :host-context(.dark) .signal {
        color: #f8cf8d;
        background: #3b3020;
      }
      :host-context(.dark) .signal.danger {
        color: #ffb4ad;
        background: #442625;
      }
      :host-context(.dark) .detail-link,
      :host-context(.dark) .card-footer a {
        color: var(--ui-primary);
      }
      :host-context(.dark) .primary-button {
        color: var(--ui-primary-foreground);
        background: var(--ui-primary);
      }
      :host-context(.dark) .metric-strip {
        background: #15272b;
        box-shadow: inset 0 0 0 1px #ffffff0d;
      }
      :host-context(.dark) .metric-strip .attention {
        background: #3d2524;
      }
      :host-context(.dark) .skeleton-row {
        background: linear-gradient(90deg, #1d272c, #2b373d, #1d272c);
        background-size: 200%;
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
export class WalletsListPage implements OnInit {
  private readonly service = inject(WalletAdminService);
  private readonly queryService = inject(WalletAdminQueryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  readonly page = signal<AdminWalletPage | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly filtersOpen = signal(false);
  readonly selected = signal(new Set<string>());
  readonly liveMessage = signal('');
  readonly skeletonRows = Array.from({ length: 6 });
  readonly roles = Object.entries({
    SUPER_ADMIN: 'Superadmin',
    ADMIN: 'Administrador',
    RESELLER: 'Revendedor',
    RESELLER_MANAGER: 'Gestor de revenda',
    VOICE_ACTOR: 'Locutor',
    PRODUCER: 'Produtor',
    CLIENT: 'Cliente',
  }).map(([value, label]) => ({ value, label }));
  readonly filters = this.fb.group({
    search: [''],
    role: [''],
    status: [''],
    balanceMin: [null as number | null],
    balanceMax: [null as number | null],
    hasReservations: [false],
    hasDiscrepancy: [false],
    sort: ['lastMovementAt'],
  });
  private query!: AdminWalletQuery;
  readonly activeFilterCount = computed(
    () =>
      [
        this.filters.value.role,
        this.filters.value.status,
        this.filters.value.balanceMin,
        this.filters.value.balanceMax,
        this.filters.value.hasReservations,
        this.filters.value.hasDiscrepancy,
      ].filter(Boolean).length,
  );
  readonly allVisibleSelected = computed(
    () =>
      !!this.page()?.items.length &&
      this.page()!.items.every((w) => this.selected().has(w.walletId)),
  );
  ngOnInit(): void {
    this.query = this.queryService.fromParams(this.route.snapshot.queryParams);
    this.filters.patchValue(
      {
        ...this.query,
        hasReservations: this.query.hasReservations === true,
        hasDiscrepancy: this.query.hasDiscrepancy === true,
      },
      { emitEvent: false },
    );
    this.filters.controls.search.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyFilters());
    this.load();
  }
  applyFilters(): void {
    const v = this.filters.getRawValue();
    this.query = {
      ...this.query,
      search: v.search || '',
      role: (v.role || '') as any,
      status: (v.status || '') as any,
      balanceMin: v.balanceMin,
      balanceMax: v.balanceMax,
      hasReservations: v.hasReservations ? true : null,
      hasDiscrepancy: v.hasDiscrepancy ? true : null,
      sort: (v.sort || 'lastMovementAt') as any,
      page: 1,
    };
    this.navigateAndLoad();
  }
  clearFilters(): void {
    this.filters.reset({
      search: '',
      role: '',
      status: '',
      balanceMin: null,
      balanceMax: null,
      hasReservations: false,
      hasDiscrepancy: false,
      sort: 'lastMovementAt',
    });
    this.query = this.queryService.fromParams({});
    this.navigateAndLoad();
  }
  goToPage(page: number): void {
    this.query = { ...this.query, page };
    this.navigateAndLoad();
  }
  private navigateAndLoad(): void {
    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: this.queryService.toParams(this.query),
        replaceUrl: true,
      })
      .then(() => this.load());
  }
  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.service
      .listWallets(this.query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (p) => {
          this.page.set(p);
          this.loading.set(false);
          this.liveMessage.set(`${p.total} carteiras encontradas`);
        },
        error: (e) => {
          this.error.set(e.message || 'Verifique sua conexão e tente novamente.');
          this.loading.set(false);
        },
      });
  }
  toggle(id: string): void {
    this.selected.update((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  toggleVisible(): void {
    this.selected.update((current) => {
      const next = new Set(current);
      const all = this.allVisibleSelected();
      for (const w of this.page()?.items || [])
        all ? next.delete(w.walletId) : next.add(w.walletId);
      return next;
    });
  }
  clearSelection(): void {
    this.selected.set(new Set());
  }
  downloadExport(): void {
    this.service.exportWallets(this.query).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `carteiras-${new Date().toISOString().slice(0, 10)}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
    });
  }
  initials(name: string): string {
    return (
      name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase() || 'US'
    );
  }
  roleLabel = walletRoleLabel;
  statusLabel = walletStatusLabel;
}
