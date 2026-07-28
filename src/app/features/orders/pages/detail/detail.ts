import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppStateService } from '../../../../core/services/app-state';
import { NotificationService } from '../../../../core/services/notification';
import { OrderService } from '../../services/order';
import { ORDER_STATUS_LABELS } from '../../order-status.util';
import {
  OrderActionsComponent,
  OrderActionEvent,
} from '../../components/order-actions/order-actions';
import { AudioDeliveryComponent } from '../../components/audio-delivery/audio-delivery';
import { OrderTimelineComponent } from '../../components/order-timeline/order-timeline';
import { buildActionContext } from '../../components/order-actions/order-actions.logic';
import { DeliverDto, Order, OrderStatusHistoryEntry } from '../../../../core/models/order.model';
import { OrderPronunciation } from '../../../../core/models/pronunciation.model';

@Component({
  selector: 'app-order-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
    OrderActionsComponent,
    AudioDeliveryComponent,
    OrderTimelineComponent,
  ],
  template: `
    <div class="p-6 max-w-3xl mx-auto space-y-6">
      <header class="flex items-center justify-between">
        <a
          routerLink="/admin/orders"
          class="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >← Pedidos</a
        >
      </header>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div
            class="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"
          ></div>
        </div>
      } @else if (order(); as o) {
        @if (o.lineItems.length > 1) {
          <nav class="flex flex-wrap gap-2" aria-label="Itens do pedido">
            @for (item of o.lineItems; track item.id; let index = $index) {
              <button
                type="button"
                class="rounded-lg border px-3 py-2 text-sm"
                [class.border-blue-600]="selectedItemId() === item.id"
                [class.bg-blue-50]="selectedItemId() === item.id"
                (click)="selectItem(item.id)"
              >
                Item {{ index + 1 }} · {{ item.itemType === 'VOICE' ? 'Locução' : 'Produção' }} ·
                {{ statusLabel(item.status) }}
              </button>
            }
          </nav>
        }
        <section
          class="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"
        >
          <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">
              {{ selectedItem()?.itemType === 'VOICE' ? 'Locução' : 'Produção' }}
            </h1>
            <span
              class="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            >
              {{ statusLabel(selectedItem()?.status ?? o.status) }}
            </span>
          </div>
          <dl class="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt class="text-neutral-500">Créditos</dt>
              <dd>{{ selectedItem()?.creditCost | number }}</dd>
            </div>
            <div>
              <dt class="text-neutral-500">Revisões</dt>
              <dd>{{ selectedItem()?.revisionCount }} / {{ selectedItem()?.maxRevisions }}</dd>
            </div>
            <div>
              <dt class="text-neutral-500">Prazo</dt>
              <dd>
                {{
                  selectedItem()?.deadlineAt ? (selectedItem()?.deadlineAt | date: 'short') : '—'
                }}
              </dd>
            </div>
            <div>
              <dt class="text-neutral-500">Criado em</dt>
              <dd>{{ o.createdAt | date: 'short' }}</dd>
            </div>
          </dl>
        </section>

        <!-- Briefing atual -->
        @if (selectedItem()?.currentBrief; as b) {
          <section
            class="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"
          >
            <h2 class="mb-2 text-lg font-semibold">Briefing (v{{ b.versionNumber }})</h2>
            <p class="whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
              {{ b.briefingText }}
            </p>
            @if (b.briefingFileUrl) {
              <a
                [href]="b.briefingFileUrl"
                download
                class="mt-2 inline-block text-xs text-blue-600 hover:underline dark:text-blue-400"
                >Baixar arquivo do briefing</a
              >
            }
            @if (b.revisionReason) {
              <p class="mt-2 text-xs text-amber-600">Motivo da revisão: {{ b.revisionReason }}</p>
            }
          </section>
        }

        <section
          class="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"
        >
          <h2 class="mb-3 text-lg font-semibold">Pronúncias</h2>
          @if (loadingPronunciations()) {
            <p class="text-sm text-neutral-500">Carregando orientações...</p>
          } @else if (!pronunciations().length) {
            <p class="text-sm text-neutral-500">Nenhuma orientação de pronúncia para este item.</p>
          } @else {
            <div class="space-y-3">
              @for (instruction of pronunciations(); track instruction.id) {
                <div
                  class="flex items-center gap-3 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900"
                >
                  <div class="min-w-0 flex-1">
                    <strong>{{ instruction.currentVersion.term }}</strong>
                    <p class="text-sm text-neutral-600 dark:text-neutral-300">
                      Pronunciar: {{ instruction.currentVersion.pronunciationText }}
                    </p>
                  </div>
                  @if (instruction.currentVersion.audioId) {
                    <button
                      type="button"
                      class="btn-secondary text-sm"
                      (click)="playPronunciation(instruction)"
                    >
                      Ouvir áudio
                    </button>
                  }
                </div>
              }
            </div>
          }
        </section>

        <!-- Entrega / re-entrega -->
        <section
          class="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"
        >
          <h2 class="mb-2 text-lg font-semibold">Entrega</h2>
          <app-audio-delivery
            [current]="selectedItem()?.currentDelivery"
            [showUpload]="showDeliveryUpload()"
            [isRedelivery]="selectedItem()?.status === 'REVIEW'"
            [progress]="uploadProgress()"
            [submitting]="acting()"
            (deliver)="onDeliver($event)"
            (cancel)="showDeliveryUpload.set(false)"
          />
        </section>

        <!-- Reenvio de briefing (cliente, AWAITING_BRIEF) -->
        @if (showBriefUpdate()) {
          <section
            class="space-y-2 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"
          >
            <h2 class="text-lg font-semibold">Reenviar briefing</h2>
            <textarea
              class="form-input"
              rows="3"
              placeholder="Briefing atualizado"
              [value]="briefText()"
              (input)="briefText.set($any($event.target).value)"
            ></textarea>
            <input
              type="file"
              accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac"
              class="form-input"
              (change)="onBriefFile($any($event.target).files)"
            />
            @if (uploadProgress() !== null) {
              <div
                class="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
              >
                <div
                  class="h-full bg-blue-600 transition-all"
                  [style.width.%]="uploadProgress()"
                ></div>
              </div>
            }
            <div class="flex gap-2">
              <button
                type="button"
                class="btn-primary"
                [disabled]="!briefText().trim() || acting()"
                (click)="submitBriefUpdate()"
              >
                Enviar
              </button>
              <button type="button" class="btn-secondary" (click)="showBriefUpdate.set(false)">
                Cancelar
              </button>
            </div>
          </section>
        }

        <!-- Ações -->
        <section
          class="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"
        >
          <h2 class="mb-3 text-lg font-semibold">Ações</h2>
          <app-order-actions
            [context]="actionContext()!"
            [disabled]="acting()"
            (run)="onAction($event)"
            (fileAction)="onFileAction($event)"
          />
        </section>

        <!-- Histórico -->
        <section
          class="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"
        >
          <h2 class="mb-3 text-lg font-semibold">Histórico</h2>
          <app-order-timeline [entries]="history()" />
        </section>
      } @else {
        <p class="py-12 text-center text-sm text-neutral-500">Pedido não encontrado.</p>
      }
    </div>
  `,
})
export class OrderDetailPage {
  private readonly orders = inject(OrderService);
  private readonly appState = inject(AppStateService);
  private readonly notify = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  private readonly orderId = this.route.snapshot.paramMap.get('id')!;

  readonly order = signal<Order | null>(null);
  readonly selectedItemId = signal<string | null>(null);
  readonly selectedItem = computed(
    () =>
      this.order()?.lineItems.find((item) => item.id === this.selectedItemId()) ??
      this.order()?.lineItems[0] ??
      null,
  );
  readonly history = signal<OrderStatusHistoryEntry[]>([]);
  readonly loading = signal(true);
  readonly acting = signal(false);
  readonly uploadProgress = signal<number | null>(null);
  readonly pronunciations = signal<OrderPronunciation[]>([]);
  readonly loadingPronunciations = signal(false);

  readonly showDeliveryUpload = signal(false);
  readonly showBriefUpdate = signal(false);
  readonly briefText = signal('');
  private briefFile: File | null = null;

  readonly actionContext = computed(() => {
    const o = this.order();
    const user = this.appState.user();
    const item = this.selectedItem();
    if (!o || !item || !user) return null;
    const canResolve =
      this.appState.isAdmin() || (this.appState.isReseller() && Boolean(o.resellerId));
    return buildActionContext(o, item, user.id, user.role, canResolve);
  });

  constructor() {
    this.reload();
  }

  statusLabel(status: Order['status']): string {
    return ORDER_STATUS_LABELS[status] ?? status;
  }

  selectItem(itemId: string): void {
    this.selectedItemId.set(itemId);
    this.history.set([]);
    this.showDeliveryUpload.set(false);
    this.showBriefUpdate.set(false);
    this.loadHistory(itemId);
    this.loadPronunciations(itemId);
  }

  private reload(): void {
    this.loading.set(true);
    this.orders
      .getById(this.orderId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (o) => {
          this.order.set(o);
          const itemId =
            this.route.snapshot.queryParamMap.get('itemId') ?? o.lineItems[0]?.id ?? null;
          this.selectedItemId.set(itemId);
          if (itemId) this.loadHistory(itemId);
          if (itemId) this.loadPronunciations(itemId);
          this.loading.set(false);
        },
        error: (err) => {
          this.notify.error(err.message ?? 'Erro ao carregar pedido');
          this.loading.set(false);
        },
      });
  }

  private loadHistory(itemId: string): void {
    this.orders
      .getHistory(this.orderId, itemId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (h) => this.history.set(h), error: () => {} });
  }

  private loadPronunciations(itemId: string): void {
    this.loadingPronunciations.set(true);
    this.pronunciations.set([]);
    this.orders
      .listPronunciations(this.orderId, itemId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          this.pronunciations.set(items);
          this.loadingPronunciations.set(false);
        },
        error: () => this.loadingPronunciations.set(false),
      });
  }

  playPronunciation(instruction: OrderPronunciation): void {
    const itemId = this.selectedItemId();
    const version = instruction.currentVersion;
    if (!itemId || !version.audioId) return;
    this.orders
      .pronunciationAudioAccess(this.orderId, itemId, instruction.id, version.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ signedUrl }) => window.open(signedUrl, '_blank', 'noopener'),
        error: (error) => this.notify.error(error.message ?? 'Não foi possível abrir o áudio.'),
      });
  }

  onFileAction(action: 'deliver' | 'update-brief'): void {
    if (action === 'deliver') this.showDeliveryUpload.set(true);
    else this.showBriefUpdate.set(true);
  }

  onAction(ev: OrderActionEvent): void {
    const id = this.orderId;
    const itemId = this.selectedItemId();
    if (!itemId) return;
    let req: Observable<Order>;
    switch (ev.action) {
      case 'accept':
        req = this.orders.accept(id, itemId);
        break;
      case 'approve':
        req = this.orders.approve(id, itemId);
        break;
      case 'cancel':
        req = this.orders.cancel(id, itemId);
        break;
      case 'refuse':
        req = this.orders.refuse(id, itemId, { reason: ev.text ?? '' });
        break;
      case 'request-brief-revision':
        req = this.orders.requestBriefRevision(id, itemId, { reason: ev.text ?? '' });
        break;
      case 'request-revision':
        req = this.orders.requestRevision(id, itemId, { instructions: ev.text ?? '' });
        break;
      case 'dispute':
        req = this.orders.dispute(id, itemId, { justification: ev.text ?? '' });
        break;
      case 'resolve':
        req = this.orders.resolve(id, itemId, {
          decision: ev.decision ?? 'FAVOR_CLIENT',
          notes: ev.text ?? '',
        });
        break;
      default:
        return;
    }
    this.acting.set(true);
    req.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.acting.set(false);
        this.notify.success('Ação realizada.');
        this.reload();
      },
      error: (err) => {
        this.acting.set(false);
        this.notify.error(err.message ?? 'Erro ao executar ação');
      },
    });
  }

  onDeliver(dto: DeliverDto): void {
    const itemId = this.selectedItemId();
    if (itemId)
      this.runUpload(this.orders.deliver(this.orderId, itemId, dto), () =>
        this.showDeliveryUpload.set(false),
      );
  }

  onBriefFile(files: FileList | null): void {
    this.briefFile = files?.[0] ?? null;
  }

  submitBriefUpdate(): void {
    if (!this.briefText().trim()) return;
    this.runUpload(
      this.orders.updateBrief(this.orderId, this.selectedItemId()!, {
        briefingText: this.briefText().trim(),
        file: this.briefFile ?? undefined,
      }),
      () => {
        this.showBriefUpdate.set(false);
        this.briefText.set('');
        this.briefFile = null;
      },
    );
  }

  // Trata upload com progresso e refaz o load ao concluir.
  private runUpload(req: Observable<HttpEvent<Order>>, onDone: () => void): void {
    this.acting.set(true);
    this.uploadProgress.set(0);
    req.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress.set(Math.round((100 * event.loaded) / event.total));
        } else if (event.type === HttpEventType.Response) {
          this.acting.set(false);
          this.uploadProgress.set(null);
          this.notify.success('Enviado com sucesso.');
          onDone();
          this.reload();
        }
      },
      error: (err) => {
        this.acting.set(false);
        this.uploadProgress.set(null);
        this.notify.error(err.message ?? 'Erro no envio');
      },
    });
  }
}
