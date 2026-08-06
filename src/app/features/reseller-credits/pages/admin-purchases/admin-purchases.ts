import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { forkJoin, Observable } from 'rxjs';
import {
  CreditPurchase,
  PaginatedResult,
  PaymentProof,
  PaymentTransaction,
} from '../../../../core/models/reseller-credit.model';
import { ResellerCreditService } from '../../services/reseller-credit';

@Component({
  selector: 'app-admin-credit-purchases',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, CurrencyPipe, DatePipe],
  template: `
    <div class="space-y-6 p-6">
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase text-violet-600">Gestão financeira</p>
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Compras de Créditos</h1>
          <p class="text-sm text-neutral-500">
            Controle completo das compras realizadas pelas revendas.
          </p>
        </div>
        <button class="btn-secondary" type="button" (click)="exportCsv()">
          Exportar relatório CSV
        </button>
      </header>
      @if (error()) {
        <div class="rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ error() }}</div>
      }

      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article class="card p-4">
          <span class="text-xs text-neutral-500">Total de pedidos</span
          ><strong class="mt-1 block text-2xl">{{ purchases().length }}</strong>
        </article>
        <article class="card p-4">
          <span class="text-xs text-neutral-500">Valor movimentado</span
          ><strong class="mt-1 block text-2xl">{{ totalValue() / 100 | currency: 'BRL' }}</strong>
        </article>
        <article class="card p-4">
          <span class="text-xs text-neutral-500">Créditos comprados</span
          ><strong class="mt-1 block text-2xl">{{ totalCredits() }}</strong>
        </article>
        <article class="card p-4">
          <span class="text-xs text-neutral-500">Aguardando conclusão</span
          ><strong class="mt-1 block text-2xl text-amber-600">{{ pendingCount() }}</strong>
        </article>
      </section>

      <section class="card grid gap-3 p-4 md:grid-cols-4">
        <label class="text-xs text-neutral-500"
          >Buscar<input
            class="form-input mt-1 w-full"
            [ngModel]="search()"
            (ngModelChange)="search.set($event)"
            placeholder="Revenda, responsável ou ID"
        /></label>
        <label class="text-xs text-neutral-500"
          >Status<select
            class="form-input mt-1 w-full"
            [ngModel]="status()"
            (ngModelChange)="status.set($event)"
          >
            <option value="">Todos</option>
            <option value="PENDING_PAYMENT">Pendente</option>
            <option value="CONFIRMED">Confirmada</option>
            <option value="CANCELLED">Cancelada</option>
          </select></label
        >
        <label class="text-xs text-neutral-500"
          >Data inicial<input
            class="form-input mt-1 w-full"
            type="date"
            [ngModel]="startDate()"
            (ngModelChange)="startDate.set($event)"
        /></label>
        <label class="text-xs text-neutral-500"
          >Data final<input
            class="form-input mt-1 w-full"
            type="date"
            [ngModel]="endDate()"
            (ngModelChange)="endDate.set($event)"
        /></label>
      </section>

      <section
        class="overflow-auto rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
      >
        <table class="w-full min-w-[70rem] text-sm">
          <thead class="bg-neutral-50 text-left text-neutral-500 dark:bg-neutral-800">
            <tr>
              <th class="p-3">Pedido / data</th>
              <th class="p-3">Revenda</th>
              <th class="p-3">Solicitante</th>
              <th class="p-3">Créditos</th>
              <th class="p-3">Valor</th>
              <th class="p-3">Meio de pagamento</th>
              <th class="p-3">Status</th>
              <th class="p-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (purchase of filtered(); track purchase.id) {
              <tr class="border-t border-neutral-100 dark:border-neutral-800">
                <td class="p-3">
                  <code class="text-xs">{{ purchase.id.slice(0, 8) }}</code
                  ><span class="block text-xs text-neutral-500">{{
                    purchase.createdAt | date: 'dd/MM/yyyy HH:mm'
                  }}</span>
                </td>
                <td class="p-3 font-medium">
                  {{ purchase.reseller?.companyName || purchase.resellerId }}
                </td>
                <td class="p-3">
                  {{ transactionFor(purchase)?.payer?.name || purchase.reseller?.owner?.name || '—'
                  }}<span class="block text-xs text-neutral-500">{{
                    transactionFor(purchase)?.payer?.email || purchase.reseller?.owner?.email
                  }}</span>
                </td>
                <td class="p-3">{{ purchase.creditAmount }}</td>
                <td class="p-3">{{ purchase.totalCents / 100 | currency: 'BRL' }}</td>
                <td class="p-3">{{ paymentMethod(transactionFor(purchase)) }}</td>
                <td class="p-3">
                  <span class="rounded-full bg-neutral-100 px-2 py-1 text-xs dark:bg-neutral-800">{{
                    statusLabel(purchase.status)
                  }}</span>
                </td>
                <td class="space-x-2 p-3 text-right">
                  <button class="btn-secondary" (click)="open(purchase)">Ver pedido</button>
                  @if (canApprove(purchase)) {
                    <button class="btn-primary" (click)="confirm(purchase)">Confirmar</button>
                  }
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8" class="p-8 text-center text-neutral-500">
                  Nenhuma compra encontrada.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </section>

      @if (selected(); as purchase) {
        <div class="fixed inset-0 z-40 flex justify-end bg-black/60" (click)="close()">
          <aside
            class="h-full w-full max-w-2xl overflow-y-auto bg-white p-6 dark:bg-neutral-950"
            (click)="$event.stopPropagation()"
          >
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs uppercase text-violet-600">Detalhes do pedido</p>
                <h2 class="text-xl font-bold">{{ purchase.id }}</h2>
              </div>
              <button class="btn-secondary" (click)="close()">Fechar</button>
            </div>
            <dl class="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <dt class="text-xs text-neutral-500">Revenda</dt>
                <dd class="font-medium">{{ purchase.reseller?.companyName }}</dd>
              </div>
              <div>
                <dt class="text-xs text-neutral-500">Solicitante</dt>
                <dd>
                  {{ selectedTransaction()?.payer?.name
                  }}<span class="block text-xs text-neutral-500">{{
                    selectedTransaction()?.payer?.email
                  }}</span>
                </dd>
              </div>
              <div>
                <dt class="text-xs text-neutral-500">Créditos</dt>
                <dd>{{ purchase.creditAmount }}</dd>
              </div>
              <div>
                <dt class="text-xs text-neutral-500">Valor total</dt>
                <dd>{{ purchase.totalCents / 100 | currency: 'BRL' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-neutral-500">Preço unitário</dt>
                <dd>{{ purchase.unitPriceCents / 100 | currency: 'BRL' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-neutral-500">Meio de pagamento</dt>
                <dd>{{ paymentMethod(selectedTransaction()) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-neutral-500">Criado em</dt>
                <dd>{{ purchase.createdAt | date: 'dd/MM/yyyy HH:mm' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-neutral-500">Status do pagamento</dt>
                <dd>{{ selectedTransaction()?.status || '—' }}</dd>
              </div>
            </dl>
            @if (selectedTransaction(); as payment) {
              @if (payment.proofs?.length) {
                <h3 class="mt-6 font-semibold">Comprovantes</h3>
                <div class="mt-2 grid gap-2 sm:grid-cols-2">
                  @for (proof of payment.proofs; track proof.id) {
                    <button
                      class="overflow-hidden rounded-lg border text-left dark:border-neutral-700"
                      (click)="openProof(payment, proof)"
                    >
                      <span
                        class="flex h-32 items-center justify-center bg-neutral-100 dark:bg-neutral-800"
                      >
                        @if (proofPreviewUrls()[proof.id] && proof.mimeType.startsWith('image/')) {
                          <img
                            class="h-full w-full object-cover"
                            [src]="proofPreviewUrls()[proof.id]"
                            [alt]="proof.originalName"
                          />
                        } @else if (proof.mimeType === 'application/pdf') {
                          <span class="text-lg font-bold text-red-500">PDF</span>
                        } @else {
                          <span class="text-xs text-neutral-500">Carregando preview...</span>
                        }
                      </span>
                      <span class="block p-3"
                        ><span class="flex items-center justify-between gap-2"
                          ><span class="text-xs text-violet-500">{{
                            proof.mimeType === 'application/pdf' ? 'PDF' : 'Imagem'
                          }}</span
                          ><span
                            class="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                            [class]="proofStatusClass(proof)"
                            >{{ proofStatusLabel(proof) }}</span
                          ></span
                        ><strong class="block truncate">{{ proof.originalName }}</strong
                        ><span class="text-xs text-neutral-500">{{
                          proof.createdAt | date: 'dd/MM/yyyy HH:mm'
                        }}</span>
                        @if (proof.reviewReason) {
                          <span class="mt-1 block text-xs text-neutral-500">{{
                            proof.reviewReason
                          }}</span>
                        }
                      </span>
                    </button>
                  }
                </div>
              }
              <h3 class="mt-6 font-semibold">Histórico do pagamento</h3>
              <ol class="mt-2 space-y-3 border-l pl-4 dark:border-neutral-700">
                @for (event of payment.events; track event.id ?? $index) {
                  <li>
                    <strong class="text-sm">{{ event.type }}</strong
                    ><span class="block text-xs text-neutral-500">{{
                      event.createdAt || event.occurredAt | date: 'dd/MM/yyyy HH:mm'
                    }}</span>
                    @if (event.reason) {
                      <p class="text-sm text-neutral-600">{{ event.reason }}</p>
                    }
                  </li>
                }
              </ol>
              <h3 class="mt-6 font-semibold">Conversa com o comprador</h3>
              <div
                class="mt-2 max-h-72 space-y-3 overflow-y-auto rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900"
              >
                @for (message of payment.messages ?? []; track message.id) {
                  <article
                    class="rounded-lg bg-white p-3 text-sm dark:bg-neutral-800"
                    [class.ml-8]="message.author.role !== 'SUPER_ADMIN'"
                  >
                    <div class="flex justify-between gap-3">
                      <strong>{{
                        message.author.role === 'SUPER_ADMIN'
                          ? 'Administrador'
                          : message.author.name || message.author.email
                      }}</strong
                      ><time class="text-xs text-neutral-500">{{
                        message.createdAt | date: 'dd/MM/yyyy HH:mm'
                      }}</time>
                    </div>
                    <p class="mt-1 whitespace-pre-wrap">{{ message.message }}</p>
                  </article>
                } @empty {
                  <p class="text-sm text-neutral-500">Nenhuma mensagem enviada.</p>
                }
              </div>
              <textarea
                class="form-input mt-3 min-h-24 w-full"
                [ngModel]="messageDraft()"
                (ngModelChange)="messageDraft.set($event)"
                maxlength="2000"
                placeholder="Ex.: Envie um novo comprovante com melhor qualidade e legibilidade."
              ></textarea>
              <button
                class="btn-primary mt-2"
                [disabled]="!messageDraft().trim()"
                (click)="sendMessage()"
              >
                Enviar mensagem
              </button>
            }
            @if (canApprove(purchase)) {
              <div class="mt-6 flex gap-2">
                <button class="btn-primary" (click)="confirm(purchase)">Confirmar pagamento</button
                ><button class="btn-secondary" (click)="cancel(purchase.id)">
                  Cancelar pedido
                </button>
              </div>
            }
          </aside>
        </div>
      }
      @if (proofUrl(); as url) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          (click)="closeProof()"
        >
          <div
            class="flex h-[90vh] w-full max-w-5xl flex-col rounded-xl bg-white p-4 dark:bg-neutral-950"
            (click)="$event.stopPropagation()"
          >
            <div class="mb-3 flex justify-between">
              <strong>{{ proofName() }}</strong
              ><button class="btn-secondary" (click)="closeProof()">Fechar</button>
            </div>
            @if (proofMime().startsWith('image/')) {
              <img class="min-h-0 flex-1 object-contain" [src]="url" [alt]="proofName()" />
            } @else {
              <iframe
                class="min-h-0 flex-1 border-0"
                [src]="proofSafeUrl()"
                title="Comprovante"
              ></iframe>
            }
            <a class="mt-3 text-center text-violet-600" [href]="url" target="_blank"
              >Abrir original</a
            >
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminCreditPurchasesPage {
  private readonly service = inject(ResellerCreditService);
  private readonly sanitizer = inject(DomSanitizer);
  readonly purchases = signal<CreditPurchase[]>([]);
  readonly transactions = signal<PaymentTransaction[]>([]);
  readonly selected = signal<CreditPurchase | null>(null);
  readonly selectedTransaction = signal<PaymentTransaction | null>(null);
  readonly error = signal('');
  readonly search = signal('');
  readonly status = signal('');
  readonly startDate = signal('');
  readonly endDate = signal('');
  readonly proofUrl = signal<string | null>(null);
  readonly proofSafeUrl = signal<SafeResourceUrl | null>(null);
  readonly proofName = signal('');
  readonly proofMime = signal('');
  readonly messageDraft = signal('');
  readonly proofPreviewUrls = signal<Record<string, string>>({});
  readonly filtered = computed(() =>
    this.purchases().filter((p) => {
      const text =
        `${p.id} ${p.reseller?.companyName} ${p.reseller?.owner?.name} ${p.reseller?.owner?.email}`.toLowerCase();
      const date = p.createdAt.slice(0, 10);
      return (
        (!this.search() || text.includes(this.search().toLowerCase())) &&
        (!this.status() || p.status === this.status()) &&
        (!this.startDate() || date >= this.startDate()) &&
        (!this.endDate() || date <= this.endDate())
      );
    }),
  );
  readonly totalValue = computed(() => this.filtered().reduce((sum, p) => sum + p.totalCents, 0));
  readonly totalCredits = computed(() =>
    this.filtered().reduce((sum, p) => sum + p.creditAmount, 0),
  );
  readonly pendingCount = computed(
    () => this.filtered().filter((p) => p.status === 'PENDING_PAYMENT').length,
  );
  constructor() {
    this.load();
  }
  load(): void {
    forkJoin({
      purchases: this.service.listAdminPurchases({ page: 1, limit: 100 }),
      transactions: this.service.listPaymentTransactions(1, 100),
    }).subscribe({
      next: ({ purchases, transactions }) => {
        this.purchases.set(
          Array.isArray(purchases)
            ? purchases
            : ((purchases as PaginatedResult<CreditPurchase>).items ??
                (purchases as PaginatedResult<CreditPurchase>).data ??
                []),
        );
        this.transactions.set(transactions.items);
      },
      error: (e: Error) => this.error.set(e.message),
    });
  }
  transactionFor(p: CreditPurchase): PaymentTransaction | null {
    return this.transactions().find((t) => t.creditPurchaseId === p.id) ?? null;
  }
  paymentMethod(t: PaymentTransaction | null): string {
    return (
      t?.configuration?.policy?.displayName || String(t?.configurationSnapshot?.['name'] ?? '—')
    );
  }
  statusLabel(status: CreditPurchase['status']): string {
    return {
      PENDING_PAYMENT: 'Aguardando pagamento',
      CONFIRMED: 'Confirmada',
      CANCELLED: 'Cancelada',
    }[status];
  }
  proofStatusLabel(proof: PaymentProof): string {
    if (proof.reviewReason?.startsWith('Substituído pelo pagador')) return 'Substituído';
    return (
      { SUBMITTED: 'Atual', APPROVED: 'Aprovado', REJECTED: 'Recusado' }[proof.status] ??
      proof.status
    );
  }
  proofStatusClass(proof: PaymentProof): string {
    if (proof.reviewReason?.startsWith('Substituído pelo pagador')) {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    }
    return (
      {
        SUBMITTED: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
        APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      }[proof.status] ?? 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
    );
  }
  open(p: CreditPurchase): void {
    this.selected.set(p);
    const summary = this.transactionFor(p);
    if (!summary) return;
    this.service.getPaymentTransaction(summary.id).subscribe({
      next: (t) => {
        this.selectedTransaction.set(t);
        this.loadProofPreviews(t);
      },
      error: (e: Error) => this.error.set(e.message),
    });
  }
  close(): void {
    this.selected.set(null);
    this.selectedTransaction.set(null);
    this.proofPreviewUrls.set({});
    this.messageDraft.set('');
  }
  canApprove(purchase: CreditPurchase): boolean {
    const transaction = this.transactionFor(purchase);
    return transaction?.status === 'AWAITING_REVIEW';
  }
  confirm(purchase: CreditPurchase): void {
    const transaction = this.selectedTransaction() ?? this.transactionFor(purchase);
    const request: Observable<unknown> = transaction
      ? this.service.approvePaymentTransaction(transaction.id)
      : this.service.confirmPurchase(purchase.id);
    request.subscribe({
      next: () => {
        this.close();
        this.load();
      },
      error: (e: Error) => this.error.set(e.message),
    });
  }
  cancel(id: string): void {
    const reason = window.prompt('Motivo do cancelamento:');
    if (!reason) return;
    const purchase = this.purchases().find((item) => item.id === id);
    const transaction = purchase
      ? (this.selectedTransaction() ?? this.transactionFor(purchase))
      : null;
    const request: Observable<unknown> =
      transaction?.status === 'AWAITING_REVIEW'
        ? this.service.rejectPaymentTransaction(transaction.id, reason)
        : this.service.cancelPurchase(id, reason);
    request.subscribe({
      next: () => {
        this.close();
        this.load();
      },
      error: (e: Error) => this.error.set(e.message),
    });
  }
  openProof(t: PaymentTransaction, p: PaymentProof): void {
    this.service.getPaymentProofUrl(t.id, p.id).subscribe({
      next: (url) => {
        this.proofUrl.set(url);
        this.proofSafeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
        this.proofName.set(p.originalName);
        this.proofMime.set(p.mimeType);
      },
      error: (e: Error) => this.error.set(e.message),
    });
  }
  closeProof(): void {
    this.proofUrl.set(null);
    this.proofSafeUrl.set(null);
  }
  sendMessage(): void {
    const transaction = this.selectedTransaction();
    const message = this.messageDraft().trim();
    if (!transaction || !message) return;
    this.service.sendPaymentMessage(transaction.id, message).subscribe({
      next: (updated) => {
        this.selectedTransaction.set(updated);
        this.messageDraft.set('');
      },
      error: (e: Error) => this.error.set(e.message),
    });
  }
  private loadProofPreviews(transaction: PaymentTransaction): void {
    this.proofPreviewUrls.set({});
    for (const proof of transaction.proofs ?? []) {
      if (!proof.mimeType.startsWith('image/')) continue;
      this.service.getPaymentProofUrl(transaction.id, proof.id).subscribe({
        next: (url) => this.proofPreviewUrls.update((urls) => ({ ...urls, [proof.id]: url })),
        error: () => undefined,
      });
    }
  }
  exportCsv(): void {
    const rows = [
      [
        'Pedido',
        'Data',
        'Revenda',
        'Responsável',
        'E-mail',
        'Créditos',
        'Valor',
        'Pagamento',
        'Status',
      ],
      ...this.filtered().map((p) => [
        p.id,
        p.createdAt,
        p.reseller?.companyName ?? '',
        p.reseller?.owner?.name ?? '',
        p.reseller?.owner?.email ?? '',
        String(p.creditAmount),
        (p.totalCents / 100).toFixed(2),
        this.paymentMethod(this.transactionFor(p)),
        p.status,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(';'))
      .join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
    link.download = `compras-creditos-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}
