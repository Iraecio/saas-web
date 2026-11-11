import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';
import {
  CreditPurchase,
  PaginatedResult,
  PaymentTransaction,
  PaymentTransactionStatus,
  PlatformCreditPrice,
  PlatformPaymentMethod,
} from '../../../../core/models/reseller-credit.model';
import { ResellerCreditService } from '../../services/reseller-credit';

@Component({
  selector: 'app-credit-purchases',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, CurrencyPipe, DatePipe],
  template: `
    <div class="kuber-page space-y-8">
      <header
        class="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p class="text-sm font-medium text-brand">Estoque da revenda</p>
          <h1 class="mt-1 text-2xl font-semibold tracking-tight sm:text-[28px]">
            Comprar créditos
          </h1>
          <p class="mt-1 max-w-xl text-sm text-muted">
            Escolha a quantidade e a forma de pagamento. O valor é calculado na hora.
          </p>
        </div>
        <button
          type="button"
          class="btn-ghost self-start sm:self-auto"
          [disabled]="loading() || refreshing()"
          (click)="load(false)"
        >
          @if (loading() || refreshing()) {
            <span
              class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            ></span>
            Atualizando…
          } @else {
            Atualizar
          }
        </button>
      </header>

      @if (error()) {
        <div
          role="alert"
          class="flex items-center justify-between gap-4 rounded-lg border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          <span class="flex-1">{{ error() }}</span>
          <button type="button" class="font-semibold underline" (click)="load(false)">
            Tentar novamente
          </button>
        </div>
      }
      @if (copied()) {
        <div
          class="fixed bottom-5 right-5 z-[60] rounded-lg bg-neutral-900 px-4 py-3 text-sm font-medium text-white shadow-xl dark:bg-white dark:text-neutral-900"
          role="status"
        >
          Copiado para a área de transferência.
        </div>
      }
      @if (transactionLoading()) {
        <div
          class="flex items-center gap-3 rounded-lg border border-brand/20 bg-brand/10 p-4 text-sm text-brand"
          role="status"
        >
          <span
            class="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent"
          ></span
          >Carregando todos os detalhes do pagamento…
        </div>
      }
      @if (proofViewerLoading()) {
        <div
          class="fixed inset-0 z-[70] flex items-center justify-center bg-black/60"
          role="status"
        >
          <div
            class="flex items-center gap-3 rounded-xl bg-white p-5 text-sm font-medium text-neutral-800 shadow-xl dark:bg-neutral-900 dark:text-white"
          >
            <span
              class="h-5 w-5 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"
            ></span
            >Abrindo comprovante original…
          </div>
        </div>
      }

      @if (loading()) {
        <section
          aria-label="Carregando compra"
          aria-live="polite"
          class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]"
        >
          <div class="h-[28rem] animate-pulse rounded-lg bg-surface-subtle"></div>
          <div class="h-72 animate-pulse rounded-lg bg-surface-subtle"></div>
          <span class="sr-only">Carregando dados da compra…</span>
        </section>
      } @else {
        <section class="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div
            class="rounded-lg border border-border bg-surface p-5 shadow-[var(--ui-shadow-card)] sm:p-6"
          >
            <div
              class="grid gap-6 xl:grid-cols-[minmax(16rem,0.85fr)_minmax(20rem,1.15fr)] xl:gap-8"
            >
              <section aria-labelledby="credit-amount-title">
                <div class="flex items-center gap-3">
                  <span
                    class="grid size-8 place-items-center rounded-md bg-brand/10 text-sm font-semibold text-brand"
                    >1</span
                  >
                  <div>
                    <h2 id="credit-amount-title" class="font-semibold">Quantos créditos?</h2>
                    <p class="text-xs text-muted">Escolha uma opção ou digite outro valor.</p>
                  </div>
                </div>

                <label class="mt-5 block text-sm font-medium text-foreground">
                  Quantidade
                  <div class="relative mt-2">
                    <input
                      class="form-input w-full pr-20 text-xl font-semibold tabular-nums"
                      type="number"
                      min="1"
                      step="1"
                      inputmode="numeric"
                      [ngModel]="amount()"
                      (ngModelChange)="amount.set($event)"
                    />
                    <span
                      class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted"
                      >créditos</span
                    >
                  </div>
                </label>

                <div class="mt-3 grid grid-cols-2 gap-2" aria-label="Quantidades sugeridas">
                  @for (suggestion of amountSuggestions; track suggestion) {
                    <button
                      type="button"
                      class="min-h-10 rounded-md border px-3 text-sm font-medium tabular-nums transition active:translate-y-px"
                      [class]="
                        amount() === suggestion
                          ? 'border-brand bg-brand/10 text-brand'
                          : 'border-border-strong bg-surface text-foreground hover:border-brand/50 hover:text-brand'
                      "
                      (click)="amount.set(suggestion)"
                    >
                      {{ suggestion }}
                    </button>
                  }
                </div>
              </section>

              <fieldset>
                <legend class="flex items-center gap-3">
                  <span
                    class="grid size-8 place-items-center rounded-md bg-brand/10 text-sm font-semibold text-brand"
                    >2</span
                  >
                  <span>
                    <strong class="block font-semibold">Como você quer pagar?</strong>
                    <small class="block text-xs font-normal text-muted"
                      >Selecione uma opção disponível.</small
                    >
                  </span>
                </legend>

                <div class="mt-5 space-y-2">
                  @for (method of methods(); track method.id) {
                    <button
                      type="button"
                      class="flex w-full items-center gap-3 rounded-md border p-3 text-left transition active:translate-y-px"
                      [class]="methodCardClass(method.id)"
                      (click)="selectedMethodId.set(method.id)"
                    >
                      <span
                        class="grid size-9 shrink-0 place-items-center rounded-md bg-surface-subtle text-base"
                        aria-hidden="true"
                      >
                        {{ paymentMethodIcon(method) }}
                      </span>
                      <span class="min-w-0 flex-1">
                        <span class="block font-medium text-foreground">{{
                          method.policy.displayName
                        }}</span>
                        <span class="block truncate text-xs text-muted">{{
                          methodDescription(method)
                        }}</span>
                      </span>
                      <span
                        class="grid size-5 shrink-0 place-items-center rounded-full border text-[11px]"
                        [class]="
                          selectedMethodId() === method.id
                            ? 'border-brand bg-brand text-white'
                            : 'border-border-strong text-transparent'
                        "
                        aria-hidden="true"
                        >✓</span
                      >
                    </button>
                  } @empty {
                    <div
                      class="rounded-md border border-warning/30 bg-warning/10 p-4 text-sm text-foreground"
                    >
                      Nenhuma forma de pagamento disponível. Atualize a página ou fale com o
                      suporte.
                    </div>
                  }
                </div>

                @if (selectedMethod(); as method) {
                  @if (publicPaymentInstructions(method).length) {
                    <details class="mt-3 rounded-md bg-surface-subtle px-4 py-3 text-sm">
                      <summary class="cursor-pointer font-medium text-foreground">
                        Ver dados de pagamento
                      </summary>
                      <dl class="mt-3 space-y-3 border-t border-border pt-3">
                        @for (item of publicPaymentInstructions(method); track item.key) {
                          <div>
                            <dt class="text-xs text-muted">{{ item.label }}</dt>
                            <dd
                              class="mt-0.5 flex items-start justify-between gap-3 break-all font-medium text-foreground"
                            >
                              <span>{{ item.value }}</span>
                              <button
                                type="button"
                                class="shrink-0 text-xs font-semibold text-brand hover:underline"
                                (click)="copyInstruction(item.value)"
                              >
                                Copiar
                              </button>
                            </dd>
                          </div>
                        }
                      </dl>
                    </details>
                  }
                }
              </fieldset>
            </div>
          </div>

          <aside class="sticky top-5 rounded-lg bg-surface-subtle p-5 ring-1 ring-border">
            <p class="text-xs font-medium text-muted">Resumo</p>
            <p class="mt-2 text-3xl font-semibold tracking-tight text-foreground tabular-nums">
              {{ totalCents() / 100 | currency: 'BRL' }}
            </p>
            <p class="mt-1 text-sm text-muted">valor total da compra</p>
            <dl class="mt-5 space-y-3 border-t border-border pt-4 text-sm">
              <div class="flex justify-between gap-4">
                <dt class="text-muted">Créditos</dt>
                <dd class="font-medium tabular-nums">{{ validAmount() }}</dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-muted">Por crédito</dt>
                <dd class="font-medium tabular-nums">{{ unitPrice() / 100 | currency: 'BRL' }}</dd>
              </div>
            </dl>
            @if (!price()) {
              <p class="mt-4 rounded-md bg-warning/10 p-3 text-xs text-foreground">
                O preço do crédito ainda não foi configurado. Não é possível iniciar uma compra.
              </p>
            }
            <button
              type="button"
              class="btn-primary mt-5 w-full"
              [disabled]="busy() || !selectedMethodId() || validAmount() < 1 || !price()"
              (click)="purchase()"
            >
              @if (purchaseLoading()) {
                <span
                  class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent align-middle"
                ></span
                >Iniciando pagamento…
              } @else {
                Continuar para pagamento
              }
            </button>
            <p class="mt-3 text-center text-xs leading-5 text-muted">
              Os créditos entram no estoque após a confirmação do pagamento.
            </p>
          </aside>
        </section>
      }

      @if (transaction(); as payment) {
        <section
          class="rounded-2xl border border-primary-200 bg-white p-4 shadow-sm dark:border-primary-900 dark:bg-neutral-900 sm:p-6"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold text-neutral-900 dark:text-white">
                Acompanhar pagamento
              </h2>
              <p class="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {{ payment.configuration.policy.displayName }} ·
                {{ payment.amountCents / 100 | currency: payment.currency }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <span
                class="rounded-full px-3 py-1 text-xs font-semibold"
                [class]="paymentStatusClass(payment.status)"
              >
                {{ paymentStatusLabel(payment.status) }}
              </span>
              <button type="button" class="btn-secondary" (click)="closeTransaction()">
                Fechar
              </button>
            </div>
          </div>

          @if (checkoutUrl(payment); as url) {
            <a
              class="btn-primary mt-5 inline-flex"
              [href]="url"
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir página de pagamento
            </a>
          } @else {
            @if (qrCodeImage(payment); as qrCode) {
              <div class="mt-5 flex justify-center rounded-lg bg-white p-4 dark:bg-neutral-900">
                <img class="h-56 w-56" [src]="qrCode" alt="QR Code para pagamento" />
              </div>
            }
            <dl
              class="mt-5 grid gap-3 rounded-lg bg-white p-4 text-sm md:grid-cols-2 dark:bg-neutral-900"
            >
              @for (item of paymentInstructions(payment); track item.key) {
                <div [class.md:col-span-2]="item.wide">
                  <dt class="text-neutral-500">{{ item.label }}</dt>
                  <dd class="mt-0.5 break-all font-medium text-neutral-900 dark:text-white">
                    {{ item.value }}
                  </dd>
                </div>
              }
            </dl>

            @if (latestProof(payment); as sentProof) {
              <div class="mt-5 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                <p class="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Comprovante enviado
                </p>
                <button
                  type="button"
                  class="mt-2 flex w-full items-center gap-3 text-left"
                  (click)="openProof(payment, sentProof)"
                >
                  <span
                    class="flex h-16 w-20 items-center justify-center overflow-hidden rounded bg-neutral-100 dark:bg-neutral-800"
                  >
                    @if (proofThumbnailUrl() && sentProof.mimeType.startsWith('image/')) {
                      <img
                        class="h-full w-full object-cover"
                        [src]="proofThumbnailUrl()"
                        [alt]="sentProof.originalName"
                      />
                    } @else {
                      <span class="text-xs font-bold text-red-500">{{
                        sentProof.mimeType === 'application/pdf' ? 'PDF' : 'ARQUIVO'
                      }}</span>
                    }
                  </span>
                  <span class="min-w-0">
                    <span
                      class="block truncate text-sm font-medium text-neutral-900 dark:text-white"
                      >{{ sentProof.originalName }}</span
                    >
                    <span class="text-xs text-violet-600 dark:text-violet-400"
                      >Clique para visualizar</span
                    >
                  </span>
                </button>
              </div>
            }

            @if (canSubmitProof(payment)) {
              <div class="mt-5">
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {{
                    latestProof(payment)
                      ? 'Editar e reenviar comprovante'
                      : 'Comprovante de pagamento'
                  }}
                  <input
                    class="form-input mt-1 w-full"
                    type="file"
                    [accept]="paymentProofAccept"
                    (change)="selectProof($event)"
                  />
                  <span class="mt-1 block text-xs font-normal text-neutral-500">
                    JPG, PNG, WebP, HEIC, HEIF ou PDF, com até 10 MB.
                  </span>
                </label>
                @if (proof(); as selectedProof) {
                  <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                    Arquivo selecionado: <strong>{{ selectedProof.name }}</strong>
                  </p>
                }
                <button
                  type="button"
                  class="btn-primary mt-3"
                  [disabled]="busy() || !proof()"
                  (click)="submitProof()"
                >
                  {{
                    proofLoading()
                      ? 'Enviando comprovante...'
                      : latestProof(payment)
                        ? 'Reenviar comprovante'
                        : 'Enviar comprovante'
                  }}
                </button>
              </div>
            } @else if (payment.status === 'AWAITING_REVIEW') {
              <p class="mt-5 text-sm font-medium text-emerald-800 dark:text-emerald-300">
                Comprovante enviado. O pagamento está aguardando análise da plataforma.
              </p>
            } @else if (payment.status === 'PAID') {
              <p class="mt-5 text-sm font-medium text-emerald-800 dark:text-emerald-300">
                Pagamento aprovado. Os créditos foram liberados para a revenda.
              </p>
            } @else if (payment.status === 'DECLINED') {
              <p class="mt-5 text-sm font-medium text-red-700 dark:text-red-300">
                O comprovante foi recusado. Consulte a resolução abaixo para mais informações.
              </p>
            } @else {
              <p class="mt-5 text-sm font-medium text-neutral-600 dark:text-neutral-300">
                {{ paymentStatusDescription(payment.status) }}
              </p>
            }
          }

          @if (payment.events.length) {
            <div class="mt-6 border-t border-emerald-200 pt-5 dark:border-emerald-900">
              <h3 class="text-sm font-semibold text-neutral-900 dark:text-white">
                Histórico da resolução
              </h3>
              <ol class="mt-3 space-y-3">
                @for (event of payment.events; track event.id ?? $index) {
                  <li class="flex gap-3 text-sm">
                    <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-500"></span>
                    <div>
                      <p class="font-medium text-neutral-900 dark:text-white">
                        {{ paymentEventLabel(event.type) }}
                      </p>
                      @if (event.reason) {
                        <p class="mt-0.5 text-neutral-600 dark:text-neutral-400">
                          {{ event.reason }}
                        </p>
                      }
                      @if (event.createdAt || event.occurredAt; as eventDate) {
                        <time class="mt-0.5 block text-xs text-neutral-500">
                          {{ eventDate | date: 'short' }}
                        </time>
                      }
                    </div>
                  </li>
                }
              </ol>
            </div>
          }
          <div class="mt-6 border-t border-emerald-200 pt-5 dark:border-emerald-900">
            <h3 class="text-sm font-semibold text-neutral-900 dark:text-white">
              Conversa sobre o pagamento
            </h3>
            <div class="mt-3 max-h-72 space-y-3 overflow-y-auto">
              @for (message of payment.messages ?? []; track message.id) {
                <article
                  class="rounded-lg bg-white p-3 text-sm dark:bg-neutral-900"
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
                  <p class="mt-1 whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                    {{ message.message }}
                  </p>
                  @if (canReplyTo(payment, message.id)) {
                    @if (!replying()) {
                      <button type="button" class="btn-secondary mt-3" (click)="replying.set(true)">
                        Responder
                      </button>
                    } @else {
                      <div class="mt-3 border-t pt-3 dark:border-neutral-700">
                        <textarea
                          class="form-input min-h-20 w-full"
                          [ngModel]="messageDraft()"
                          (ngModelChange)="messageDraft.set($event)"
                          maxlength="2000"
                          placeholder="Escreva sua resposta..."
                        ></textarea>
                        <div class="mt-2 flex gap-2">
                          <button
                            type="button"
                            class="btn-primary"
                            [disabled]="messageLoading() || !messageDraft().trim()"
                            (click)="sendMessage()"
                          >
                            {{ messageLoading() ? 'Enviando…' : 'Enviar resposta' }}</button
                          ><button type="button" class="btn-secondary" (click)="cancelReply()">
                            Cancelar
                          </button>
                        </div>
                      </div>
                    }
                  }
                </article>
              } @empty {
                <p class="text-sm text-neutral-500">Nenhuma mensagem nesta conversa.</p>
              }
            </div>
          </div>
        </section>
      }

      @if (proofModalUrl(); as proofUrl) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          (click)="closeProof()"
        >
          <div
            class="flex h-[90vh] w-full max-w-5xl flex-col rounded-xl bg-white p-4 dark:bg-neutral-950"
            (click)="$event.stopPropagation()"
          >
            <div class="mb-3 flex items-center justify-between gap-3">
              <p class="truncate font-semibold text-neutral-900 dark:text-white">
                {{ proofModalName() }}
              </p>
              <button type="button" class="btn-secondary" (click)="closeProof()">Fechar</button>
            </div>
            @if (proofModalMime().startsWith('image/')) {
              <img
                class="min-h-0 flex-1 object-contain"
                [src]="proofUrl"
                [alt]="proofModalName()"
              />
            } @else {
              <iframe
                class="min-h-0 flex-1 rounded border-0"
                [src]="proofModalSafeUrl()"
                title="Comprovante em PDF"
              ></iframe>
            }
            <a
              class="mt-3 text-center text-sm font-medium text-violet-600"
              [href]="proofUrl"
              target="_blank"
              rel="noopener"
              >Abrir arquivo original</a
            >
          </div>
        </div>
      }

      <section class="space-y-4" aria-labelledby="purchase-history-title">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="purchase-history-title" class="text-lg font-semibold">Compras recentes</h2>
            <p class="mt-1 text-sm text-muted">
              Acompanhe pagamentos e envie comprovantes pendentes.
            </p>
          </div>
          <span class="text-xs font-medium text-muted">{{ purchases().length }} compras</span>
        </div>
        @if (refreshing()) {
          <div class="flex items-center gap-3 rounded-lg bg-surface-subtle p-4 text-sm text-muted">
            <span
              class="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent"
            ></span
            >Atualizando histórico…
          </div>
        }
        @if (purchases().length) {
          <div class="kuber-table-shell hidden overflow-auto md:block">
            <table class="w-full min-w-[48rem] text-sm">
              <thead class="bg-surface-subtle text-left text-xs font-medium text-muted">
                <tr>
                  <th class="p-3">Créditos</th>
                  <th class="p-3">Total</th>
                  <th class="p-3">Situação</th>
                  <th class="p-3">Pagamento</th>
                  <th class="p-3">Data</th>
                  <th class="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (purchase of purchases(); track purchase.id) {
                  <tr class="border-t border-border transition hover:bg-surface-subtle">
                    <td class="p-4">
                      <strong>{{ purchase.creditAmount }}</strong
                      ><span class="ml-1 text-xs text-muted">créditos</span>
                    </td>
                    <td class="p-4 font-medium">
                      {{ purchase.totalCents / 100 | currency: 'BRL' }}
                    </td>
                    <td class="p-3">{{ purchaseStatus(purchase.status) }}</td>
                    <td class="p-3">
                      @if (transactionForPurchase(purchase.id); as payment) {
                        <span
                          class="rounded-full px-2.5 py-1 text-xs font-semibold"
                          [class]="paymentStatusClass(payment.status)"
                        >
                          {{ paymentStatusLabel(payment.status) }}
                        </span>
                      } @else {
                        <span class="text-muted">—</span>
                      }
                    </td>
                    <td class="p-4 whitespace-nowrap">
                      {{ purchase.createdAt | date: 'dd/MM/yyyy HH:mm' }}
                    </td>
                    <td class="p-3 text-right">
                      @if (transactionForPurchase(purchase.id); as payment) {
                        <button
                          type="button"
                          class="btn-secondary whitespace-nowrap"
                          [disabled]="busy()"
                          (click)="openTransaction(payment)"
                        >
                          {{
                            transactionLoading()
                              ? 'Abrindo…'
                              : payment.status === 'AWAITING_PAYMENT'
                                ? 'Enviar comprovante'
                                : 'Acompanhar'
                          }}
                        </button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="grid gap-3 md:hidden">
            @for (purchase of purchases(); track purchase.id) {
              <article
                class="rounded-lg border border-border bg-surface p-4 shadow-[var(--ui-shadow-card)]"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-xs text-muted">
                      {{ purchase.createdAt | date: 'dd/MM/yyyy HH:mm' }}
                    </p>
                    <strong class="mt-1 block text-lg">{{ purchase.creditAmount }} créditos</strong>
                    <p class="text-sm text-muted">
                      {{ purchase.totalCents / 100 | currency: 'BRL' }}
                    </p>
                  </div>
                  @if (transactionForPurchase(purchase.id); as payment) {
                    <span
                      class="rounded-full px-2.5 py-1 text-xs font-semibold"
                      [class]="paymentStatusClass(payment.status)"
                      >{{ paymentStatusLabel(payment.status) }}</span
                    >
                  }
                </div>
                <div
                  class="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3"
                >
                  <span class="text-xs text-muted">{{ purchaseStatus(purchase.status) }}</span>
                  @if (transactionForPurchase(purchase.id); as payment) {
                    <button
                      type="button"
                      class="btn-secondary"
                      [disabled]="busy()"
                      (click)="openTransaction(payment)"
                    >
                      {{
                        transactionLoading()
                          ? 'Abrindo…'
                          : payment.status === 'AWAITING_PAYMENT'
                            ? 'Enviar comprovante'
                            : 'Acompanhar'
                      }}
                    </button>
                  }
                </div>
              </article>
            }
          </div>
        } @else if (!loading()) {
          <div
            class="rounded-lg border border-dashed border-border-strong bg-surface p-10 text-center"
          >
            <div class="text-3xl" aria-hidden="true">🪙</div>
            <p class="mt-3 font-semibold">Nenhuma compra realizada</p>
            <p class="mt-1 text-sm text-muted">
              Escolha uma quantidade acima para fazer sua primeira compra.
            </p>
          </div>
        }
      </section>
    </div>
  `,
})
export class CreditPurchasesPage {
  private readonly service = inject(ResellerCreditService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroyRef = inject(DestroyRef);

  readonly methods = signal<PlatformPaymentMethod[]>([]);
  readonly purchases = signal<CreditPurchase[]>([]);
  readonly paymentTransactions = signal<PaymentTransaction[]>([]);
  readonly price = signal<PlatformCreditPrice | null>(null);
  readonly selectedMethodId = signal<string | null>(null);
  readonly transaction = signal<PaymentTransaction | null>(null);
  readonly proof = signal<File | null>(null);
  readonly messageDraft = signal('');
  readonly replying = signal(false);
  readonly proofThumbnailUrl = signal<string | null>(null);
  readonly proofModalUrl = signal<string | null>(null);
  readonly proofModalSafeUrl = signal<SafeResourceUrl | null>(null);
  readonly proofModalName = signal('');
  readonly proofModalMime = signal('');
  readonly loading = signal(true);
  readonly refreshing = signal(false);
  readonly busy = signal(false);
  readonly purchaseLoading = signal(false);
  readonly transactionLoading = signal(false);
  readonly proofLoading = signal(false);
  readonly proofViewerLoading = signal(false);
  readonly messageLoading = signal(false);
  readonly error = signal('');
  readonly amount = signal(100);
  readonly copied = signal(false);
  readonly amountSuggestions = [100, 500, 1000, 5000];
  readonly paymentProofAccept = PAYMENT_PROOF_ACCEPT;

  readonly validAmount = computed(() => Math.max(0, Math.floor(Number(this.amount()) || 0)));
  readonly unitPrice = computed(() => this.price()?.unitPriceCents ?? 0);
  readonly totalCents = computed(() => this.validAmount() * this.unitPrice());
  readonly selectedMethod = computed(
    () => this.methods().find((method) => method.id === this.selectedMethodId()) ?? null,
  );

  constructor() {
    this.load();
  }

  load(initial = true): void {
    if (initial && !this.methods().length) this.loading.set(true);
    else this.refreshing.set(true);
    this.error.set('');
    forkJoin({
      methods: this.service.listPlatformPaymentMethods(),
      price: this.service.getPlatformPrice(),
      purchases: this.service.listPurchases(),
      paymentTransactions: this.service.listPaymentTransactions(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ methods, price, purchases, paymentTransactions }) => {
          this.methods.set(methods);
          this.price.set(price);
          this.purchases.set(this.unwrapPurchases(purchases));
          this.paymentTransactions.set(paymentTransactions.items ?? []);
          if (!this.selectedMethodId()) this.selectedMethodId.set(methods[0]?.id ?? null);
          this.loading.set(false);
          this.refreshing.set(false);
        },
        error: (error: Error) => {
          this.error.set(error.message);
          this.loading.set(false);
          this.refreshing.set(false);
        },
      });
  }

  purchase(): void {
    const configurationId = this.selectedMethodId();
    if (!configurationId || this.validAmount() < 1 || this.busy()) return;
    this.busy.set(true);
    this.purchaseLoading.set(true);
    this.error.set('');
    this.transaction.set(null);
    this.service
      .purchase(this.validAmount(), configurationId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (transaction) => {
          this.transaction.set(transaction);
          this.upsertPaymentTransaction(transaction);
          this.busy.set(false);
          this.purchaseLoading.set(false);
          this.refreshPurchases();
        },
        error: (error: Error) => {
          this.error.set(error.message);
          this.busy.set(false);
          this.purchaseLoading.set(false);
        },
      });
  }

  selectProof(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    const validationError = validatePaymentProof(file);
    if (validationError) {
      this.proof.set(null);
      this.error.set(validationError);
      input.value = '';
      return;
    }
    this.error.set('');
    this.proof.set(file);
  }

  submitProof(): void {
    const transaction = this.transaction();
    const file = this.proof();
    if (!transaction || !file || this.busy()) return;
    this.busy.set(true);
    this.proofLoading.set(true);
    this.error.set('');
    this.service
      .submitPaymentProof(transaction.id, file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.transaction.set(updated);
          this.upsertPaymentTransaction(updated);
          this.proof.set(null);
          this.loadProofThumbnail(updated);
          this.busy.set(false);
          this.proofLoading.set(false);
        },
        error: (error: Error) => {
          this.error.set(error.message);
          this.busy.set(false);
          this.proofLoading.set(false);
        },
      });
  }

  latestProof(transaction: PaymentTransaction) {
    return transaction.proofs?.at(-1) ?? null;
  }

  canSubmitProof(transaction: PaymentTransaction): boolean {
    return ['AWAITING_PAYMENT', 'AWAITING_REVIEW', 'DECLINED'].includes(transaction.status);
  }

  openProof(
    transaction: PaymentTransaction,
    proof: NonNullable<PaymentTransaction['proofs']>[number],
  ): void {
    this.proofViewerLoading.set(true);
    this.service
      .getPaymentProofUrl(transaction.id, proof.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (url) => {
          this.proofThumbnailUrl.set(url);
          this.proofModalUrl.set(url);
          this.proofModalSafeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
          this.proofModalName.set(proof.originalName);
          this.proofModalMime.set(proof.mimeType);
          this.proofViewerLoading.set(false);
        },
        error: (error: Error) => {
          this.error.set(error.message);
          this.proofViewerLoading.set(false);
        },
      });
  }

  closeProof(): void {
    this.proofModalUrl.set(null);
    this.proofModalSafeUrl.set(null);
  }
  sendMessage(): void {
    const transaction = this.transaction();
    const message = this.messageDraft().trim();
    if (!transaction || !message || this.busy()) return;
    this.busy.set(true);
    this.messageLoading.set(true);
    this.service
      .sendPaymentMessage(transaction.id, message)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.transaction.set(updated);
          this.upsertPaymentTransaction(updated);
          this.messageDraft.set('');
          this.replying.set(false);
          this.busy.set(false);
          this.messageLoading.set(false);
        },
        error: (error: Error) => {
          this.error.set(error.message);
          this.busy.set(false);
          this.messageLoading.set(false);
        },
      });
  }
  canReplyTo(transaction: PaymentTransaction, messageId: string): boolean {
    const messages = transaction.messages ?? [];
    const message = messages.find((item) => item.id === messageId);
    return messages.at(-1)?.id === messageId && message?.author.role === 'SUPER_ADMIN';
  }

  cancelReply(): void {
    this.replying.set(false);
    this.messageDraft.set('');
  }

  private loadProofThumbnail(transaction: PaymentTransaction): void {
    const proof = this.latestProof(transaction);
    this.proofThumbnailUrl.set(null);
    if (!proof || !proof.mimeType.startsWith('image/')) return;
    this.service
      .getPaymentProofUrl(transaction.id, proof.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (url) => this.proofThumbnailUrl.set(url),
      });
  }

  methodDescription(method: PlatformPaymentMethod): string {
    if (method.policy.providerCode === 'BANK_TRANSFER_MANUAL') {
      return 'Transferência bancária com envio de comprovante.';
    }
    if (method.policy.providerCode === 'MERCADO_PAGO') {
      return 'Pagamento online pelo Mercado Pago.';
    }
    return method.name;
  }

  paymentMethodIcon(method: PlatformPaymentMethod): string {
    if (method.policy.methodType === 'PIX') return '⌁';
    if (method.policy.providerCode === 'BANK_TRANSFER_MANUAL') return '↔';
    return '↗';
  }

  methodCardClass(methodId: string): string {
    return this.selectedMethodId() === methodId
      ? 'border-brand bg-brand/5 ring-1 ring-brand'
      : 'border-border bg-surface hover:border-brand/50 hover:bg-surface-subtle';
  }

  copyInstruction(value: string): void {
    void navigator.clipboard.writeText(value).then(() => {
      this.copied.set(true);
      window.setTimeout(() => this.copied.set(false), 1800);
    });
  }

  checkoutUrl(transaction: PaymentTransaction): string | null {
    const value = this.instructionData(transaction)['checkoutUrl'];
    return typeof value === 'string' ? value : null;
  }

  publicPaymentInstructions(method: PlatformPaymentMethod): PaymentInstructionItem[] {
    return paymentInstructionItems(method.publicConfig);
  }

  paymentInstructions(transaction: PaymentTransaction): PaymentInstructionItem[] {
    return paymentInstructionItems(this.instructionData(transaction));
  }

  qrCodeImage(transaction: PaymentTransaction): string | null {
    const config = this.instructionData(transaction);
    const value = config['qrCodeUrl'] ?? config['qrCodeBase64'] ?? config['qrCode'];
    return typeof value === 'string' &&
      (value.startsWith('data:image/') || value.startsWith('https://'))
      ? value
      : null;
  }

  paymentStatusLabel(status: PaymentTransactionStatus): string {
    return PAYMENT_STATUS_LABEL[status];
  }

  paymentStatusClass(status: PaymentTransactionStatus): string {
    return PAYMENT_STATUS_CLASS[status];
  }

  paymentStatusDescription(status: PaymentTransactionStatus): string {
    return PAYMENT_STATUS_DESCRIPTION[status];
  }

  paymentEventLabel(type?: string): string {
    return PAYMENT_EVENT_LABEL[type ?? ''] ?? 'Atualização do pagamento';
  }

  transactionForPurchase(purchaseId: string): PaymentTransaction | null {
    return (
      this.paymentTransactions().find(
        (transaction) => transaction.creditPurchaseId === purchaseId,
      ) ?? null
    );
  }

  openTransaction(summary: PaymentTransaction): void {
    if (this.busy()) return;
    this.busy.set(true);
    this.transactionLoading.set(true);
    this.error.set('');
    this.proof.set(null);
    this.service
      .getPaymentTransaction(summary.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (transaction) => {
          this.transaction.set(transaction);
          this.upsertPaymentTransaction(transaction);
          this.loadProofThumbnail(transaction);
          this.busy.set(false);
          this.transactionLoading.set(false);
        },
        error: (error: Error) => {
          this.error.set(error.message);
          this.busy.set(false);
          this.transactionLoading.set(false);
        },
      });
  }

  closeTransaction(): void {
    this.transaction.set(null);
    this.proof.set(null);
  }

  purchaseStatus(status: CreditPurchase['status']): string {
    return {
      PENDING_PAYMENT: 'Aguardando pagamento',
      CONFIRMED: 'Confirmada',
      CANCELLED: 'Cancelada',
    }[status];
  }

  private instructionData(transaction: PaymentTransaction): Record<string, unknown> {
    const publicConfig = transaction.configurationSnapshot['publicConfig'];
    const data: Record<string, unknown> =
      publicConfig && typeof publicConfig === 'object'
        ? { ...(publicConfig as Record<string, unknown>) }
        : {};
    for (const event of transaction.events ?? []) {
      if (event.payload && typeof event.payload === 'object') Object.assign(data, event.payload);
    }
    return data;
  }

  private refreshPurchases(): void {
    forkJoin({
      purchases: this.service.listPurchases(),
      paymentTransactions: this.service.listPaymentTransactions(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ purchases, paymentTransactions }) => {
          this.purchases.set(this.unwrapPurchases(purchases));
          this.paymentTransactions.set(paymentTransactions.items ?? []);
        },
      });
  }

  private upsertPaymentTransaction(transaction: PaymentTransaction): void {
    this.paymentTransactions.update((items) => [
      transaction,
      ...items.filter((item) => item.id !== transaction.id),
    ]);
  }

  private unwrapPurchases(
    result: PaginatedResult<CreditPurchase> | CreditPurchase[],
  ): CreditPurchase[] {
    return Array.isArray(result) ? result : (result.data ?? result.items ?? []);
  }
}

export interface PaymentInstructionItem {
  key: string;
  label: string;
  value: string;
  wide: boolean;
}

export function paymentInstructionItems(config: Record<string, unknown>): PaymentInstructionItem[] {
  const fields: Array<[string, string, boolean]> = [
    ['pixKey', 'Chave PIX', true],
    ['pixKeyType', 'Tipo da chave PIX', false],
    ['qrCodeCopyPaste', 'PIX copia e cola', true],
    ['pixCopyPaste', 'PIX copia e cola', true],
    ['copyPaste', 'Código copia e cola', true],
    ['bankName', 'Banco', false],
    ['agency', 'Agência', false],
    ['account', 'Conta', false],
    ['accountType', 'Tipo de conta', false],
    ['holderName', 'Titular', false],
    ['holderDocument', 'CPF/CNPJ', false],
    ['beneficiaryName', 'Favorecido', false],
    ['beneficiaryDocument', 'CPF/CNPJ do favorecido', false],
    ['instructions', 'Instruções', true],
  ];
  return fields
    .map(([key, label, wide]) => ({ key, label, wide, value: String(config[key] ?? '') }))
    .filter((item) => item.value.trim().length > 0);
}

const PAYMENT_STATUS_LABEL: Record<PaymentTransactionStatus, string> = {
  CREATED: 'Criado',
  AWAITING_PAYMENT: 'Aguardando pagamento',
  AWAITING_REVIEW: 'Em análise',
  PROCESSING: 'Processando',
  PAID: 'Aprovado',
  DECLINED: 'Recusado',
  EXPIRED: 'Expirado',
  CANCELLED: 'Cancelado',
  DIVERGENT: 'Em divergência',
  REFUNDED: 'Estornado',
  DISPUTED: 'Em contestação',
};

const PAYMENT_STATUS_CLASS: Record<PaymentTransactionStatus, string> = {
  CREATED: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  AWAITING_PAYMENT: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  AWAITING_REVIEW: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
  PROCESSING: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
  PAID: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  DECLINED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  EXPIRED: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  CANCELLED: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  DIVERGENT: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  REFUNDED: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-300',
  DISPUTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const PAYMENT_STATUS_DESCRIPTION: Record<PaymentTransactionStatus, string> = {
  CREATED: 'O pagamento foi criado e aguarda inicialização.',
  AWAITING_PAYMENT: 'Realize o pagamento e envie o comprovante.',
  AWAITING_REVIEW: 'O comprovante está aguardando análise da plataforma.',
  PROCESSING: 'O provedor está processando o pagamento.',
  PAID: 'Pagamento aprovado e créditos liberados.',
  DECLINED: 'Pagamento recusado pela plataforma ou pelo provedor.',
  EXPIRED: 'O prazo para realizar este pagamento expirou.',
  CANCELLED: 'Este pagamento foi cancelado.',
  DIVERGENT: 'O pagamento possui uma divergência em análise.',
  REFUNDED: 'O pagamento foi estornado.',
  DISPUTED: 'O pagamento está em contestação.',
};

const PAYMENT_EVENT_LABEL: Record<string, string> = {
  CREATED: 'Pagamento iniciado',
  PROOF_SUBMITTED: 'Comprovante enviado',
  REVIEW_APPROVED: 'Comprovante aprovado',
  REVIEW_REJECTED: 'Comprovante recusado',
  PROVIDER_UPDATE: 'Atualização do provedor',
  STATUS_CHANGED: 'Situação atualizada',
  RECONCILED: 'Pagamento conciliado',
  REFUNDED: 'Pagamento estornado',
  DISPUTED: 'Pagamento contestado',
  PROCESSING_FAILED: 'Falha no processamento',
};

export const PAYMENT_PROOF_MAX_SIZE = 10 * 1024 * 1024;
export const PAYMENT_PROOF_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const;
export const PAYMENT_PROOF_ACCEPT =
  '.jpg,.jpeg,.png,.webp,.heic,.heif,.pdf,image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf';

export function validatePaymentProof(file: File | null): string | null {
  if (!file) return null;
  if (!(PAYMENT_PROOF_MIME_TYPES as readonly string[]).includes(file.type)) {
    return 'Formato inválido. Envie uma imagem JPG, PNG, WebP, HEIC, HEIF ou um arquivo PDF.';
  }
  if (file.size > PAYMENT_PROOF_MAX_SIZE) {
    return 'O comprovante deve ter no máximo 10 MB.';
  }
  return null;
}
