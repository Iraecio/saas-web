import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ResellerCreditService } from '../../services/reseller-credit';
import { CreditPackage, ResellerPricing } from '../../../../core/models/reseller-credit.model';

@Component({ selector: 'app-reseller-pricing', changeDetection: ChangeDetectionStrategy.OnPush, imports: [FormsModule, CurrencyPipe], template: `
<div class="p-6 space-y-6"><h1 class="text-3xl font-bold">Preço e pacotes</h1>
@if (error()) { <p class="text-red-600">{{ error() }}</p> }
<section class="card p-5 space-y-3"><p>Preço da plataforma: {{ platformPriceCents / 100 | currency:'BRL' }} por crédito</p><label>Preço ao cliente (centavos)<input class="form-input" type="number" [(ngModel)]="unitPriceCents"></label><label class="block"><input type="checkbox" [(ngModel)]="allowDirectPurchase"> Permitir compra direta</label><button class="btn-primary" (click)="save()">Salvar</button></section>
<section class="card p-5"><h2 class="font-semibold">Pacotes</h2>@for (p of packages(); track p.id) { <div class="flex justify-between py-2"><span>{{p.creditAmount}} créditos · {{p.priceCents / 100 | currency:'BRL'}}</span><button class="btn-secondary" (click)="toggle(p)">{{p.isActive?'Desativar':'Ativar'}}</button></div> }</section></div>` })
export class ResellerPricingPage {
  private readonly svc=inject(ResellerCreditService); private readonly destroyRef=inject(DestroyRef);
  readonly packages=signal<CreditPackage[]>([]); readonly error=signal(''); platformPriceCents=0; unitPriceCents=0; allowDirectPurchase=false;
  constructor(){ this.svc.getPlatformPrice().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:p=>this.platformPriceCents=p.unitPriceCents,error:e=>this.error.set(e.message)}); this.reload(); }
  reload(){this.svc.getPricing().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:(p:ResellerPricing)=>{this.unitPriceCents=p.unitPriceCents;this.allowDirectPurchase=p.allowDirectPurchase;this.packages.set(p.packages??[]);},error:e=>this.error.set(e.message)});}
  save(){this.svc.updatePricing({unitPriceCents:this.unitPriceCents,allowDirectPurchase:this.allowDirectPurchase}).subscribe({next:()=>this.reload(),error:e=>this.error.set(e.message)});}
  toggle(p:CreditPackage){this.svc.togglePackage(p.id,!p.isActive).subscribe({next:()=>this.reload(),error:e=>this.error.set(e.message)});}
}
