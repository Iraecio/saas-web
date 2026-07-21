import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppStateService } from '../../../core/services/app-state';
import { WalletAdminService } from '../../wallet-admin/services/wallet-admin';
import { ResellerCreditService } from '../../reseller-credits/services/reseller-credit';
import { WalletAnalytics } from '../../../core/models/wallet.model';
import { CreditSale, PaginatedResult } from '../../../core/models/reseller-credit.model';

@Component({ selector:'app-reports-home', changeDetection:ChangeDetectionStrategy.OnPush, imports:[DecimalPipe,CurrencyPipe], template:`
<div class="p-6 space-y-6"><header><h1 class="text-3xl font-bold">Relatórios oficiais</h1><p class="text-sm text-neutral-500">Somente dados disponíveis nas fontes oficiais.</p></header>
@if(loading()){<p>Carregando...</p>}@else if(error()){<p class="text-red-600">{{error()}}</p>}
@if(analytics();as a){<section class="grid gap-4 sm:grid-cols-4"><div class="card p-5">Emitidos<br><strong>{{a.totalIssued|number}}</strong></div><div class="card p-5">Gastos<br><strong>{{a.totalSpent|number}}</strong></div><div class="card p-5">Estornados<br><strong>{{a.totalRefunded|number}}</strong></div><div class="card p-5">Expirados<br><strong>{{a.totalExpired|number}}</strong></div></section>}
@if(sales().length){<section class="card overflow-auto"><h2 class="p-4 font-semibold">Vendas e margem</h2><table class="w-full"><tbody>@for(x of sales();track x.id){<tr><td class="p-3">{{x.clientId}}</td><td>{{x.creditAmount}} créditos</td><td>{{x.totalSaleCents/100|currency:'BRL'}}</td><td>{{x.marginCents/100|currency:'BRL'}}</td></tr>}</tbody></table></section>}
@if(!loading()&&!analytics()&&!sales().length&&!error()){<p class="text-neutral-500">Nenhum relatório oficial disponível para este papel.</p>}</div>`})
export class ReportsHomeComponent{
  private state=inject(AppStateService);private wallet=inject(WalletAdminService);private trade=inject(ResellerCreditService);private destroyRef=inject(DestroyRef);
  readonly analytics=signal<WalletAnalytics|null>(null);readonly sales=signal<CreditSale[]>([]);readonly loading=signal(true);readonly error=signal('');
  constructor(){if(this.state.isAdmin()){this.wallet.getAnalytics().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:x=>{this.analytics.set(x);this.loading.set(false)},error:e=>{this.error.set(e.message);this.loading.set(false)}})}else if(this.state.isReseller()){this.trade.listSales({limit:50}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:r=>{this.sales.set(Array.isArray(r)?r:((r as PaginatedResult<CreditSale>).data??(r as PaginatedResult<CreditSale>).items??[]));this.loading.set(false)},error:e=>{this.error.set(e.message);this.loading.set(false)}})}else this.loading.set(false)}
}
