import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Check,
  FileText,
  LoaderCircle,
  Mic2,
  Music2,
  Paperclip,
  Send,
  UserRound,
  X,
  LucideAngularModule,
} from 'lucide-angular';
import { NotificationService } from '../../../../core/services/notification';
import { OrderService } from '../../services/order';
import { ProfessionalService } from '../../../professionals/services/professional';
import { ServiceCatalogService } from '../../../services/services/service-catalog';
import { Professional } from '../../../../core/models/professional.model';
import { Service } from '../../../../core/models/service.model';
import { CreateOrderDto, OrderType } from '../../../../core/models/order.model';
import { StorageService } from '../../../storage/services/storage';
import {
  ClientPronunciation,
  OrderPronunciationInput,
} from '../../../../core/models/pronunciation.model';
import { PronunciationService } from '../../../pronunciations/services/pronunciation';

@Component({
  selector: 'app-order-create',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, LucideAngularModule],
  template: `
    <div class="mx-auto max-w-3xl space-y-6 p-5 lg:p-8">
      <header class="border-b border-border pb-6">
        <p class="text-xs font-semibold uppercase tracking-wider text-brand">Pedidos</p>
        <h1 class="mt-2 text-2xl font-bold tracking-tight text-foreground">Criar novo pedido</h1>
        <p class="mt-1 text-sm text-muted">
          Escolha o serviço, o profissional e descreva o trabalho.
        </p>
      </header>

      <!-- 1. Tipo de pedido -->
      <section class="card space-y-4">
        <div>
          <h2 class="text-base font-semibold text-foreground">1. Tipo de serviço</h2>
          <p class="mt-1 text-sm text-muted">O tipo define quais profissionais serão exibidos.</p>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            class="flex items-center gap-3 rounded-lg border p-4 text-left transition-colors"
            [class.border-brand]="orderType() === 'VOICE'"
            [class.bg-brand-subtle]="orderType() === 'VOICE'"
            [class.border-border]="orderType() !== 'VOICE'"
            (click)="selectType('VOICE')"
          >
            <span
              class="flex size-10 items-center justify-center rounded-md bg-surface-subtle text-brand"
              ><lucide-icon [img]="Mic2" class="size-5"
            /></span>
            <span class="flex-1"
              ><strong class="block text-sm text-foreground">Locução</strong
              ><span class="text-xs text-muted">Voz para seu conteúdo</span></span
            >
            @if (orderType() === 'VOICE') {
              <lucide-icon [img]="Check" class="size-5 text-brand" />
            }
          </button>
          <button
            type="button"
            class="flex items-center gap-3 rounded-lg border p-4 text-left transition-colors"
            [class.border-brand]="orderType() === 'PRODUCTION'"
            [class.bg-brand-subtle]="orderType() === 'PRODUCTION'"
            [class.border-border]="orderType() !== 'PRODUCTION'"
            (click)="selectType('PRODUCTION')"
          >
            <span
              class="flex size-10 items-center justify-center rounded-md bg-surface-subtle text-brand"
              ><lucide-icon [img]="Music2" class="size-5"
            /></span>
            <span class="flex-1"
              ><strong class="block text-sm text-foreground">Produção</strong
              ><span class="text-xs text-muted">Edição e produção de áudio</span></span
            >
            @if (orderType() === 'PRODUCTION') {
              <lucide-icon [img]="Check" class="size-5 text-brand" />
            }
          </button>
        </div>
      </section>

      <!-- 2. Profissional -->
      <section class="card space-y-3">
        <label class="form-label flex items-center gap-2"
          ><lucide-icon [img]="UserRound" class="size-4 text-brand" />2. Profissional</label
        >
        @if (loadingProfessionals()) {
          <p class="flex items-center gap-2 rounded-md bg-surface-subtle p-3 text-sm text-muted">
            <lucide-icon [img]="LoaderCircle" class="size-4 animate-spin" />Carregando
            profissionais...
          </p>
        } @else if (professionals().length === 0) {
          <p class="rounded-md border border-border bg-surface-subtle p-3 text-sm text-muted">
            Nenhum profissional disponível para este tipo.
          </p>
        } @else {
          <div
            class="max-h-80 space-y-2 overflow-y-auto pr-1"
            role="radiogroup"
            aria-label="Selecione um profissional"
          >
            @for (p of professionals(); track p.id) {
              <div
                class="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors"
                [class.border-brand]="selectedProfessionalId() === p.id"
                [class.bg-brand-subtle]="selectedProfessionalId() === p.id"
                [class.border-border]="selectedProfessionalId() !== p.id"
                [class.hover:bg-surface-subtle]="selectedProfessionalId() !== p.id"
                (click)="selectProfessional(p.id)"
              >
                <input
                  type="radio"
                  name="professional"
                  class="size-4 shrink-0 accent-[var(--ui-brand)]"
                  [value]="p.id"
                  [checked]="selectedProfessionalId() === p.id"
                  (change)="selectProfessional(p.id)"
                  [attr.aria-label]="'Selecionar ' + p.name"
                />
                @if (p.avatarUrl) {
                  <img
                    [src]="p.avatarUrl"
                    [alt]="'Foto de ' + p.name"
                    class="size-11 shrink-0 rounded-full object-cover ring-1 ring-border"
                  />
                } @else {
                  <span
                    class="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-sm font-bold text-brand ring-1 ring-border"
                    >{{ initials(p.name) }}</span
                  >
                }
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold text-foreground">{{ p.name }}</p>
                  <p class="text-xs text-muted">
                    {{ p.scope === 'GLOBAL' ? 'Profissional global' : 'Profissional da sua rede' }}
                  </p>
                </div>
                @if (p.demoUrl) {
                  <audio
                    controls
                    preload="none"
                    class="h-9 w-44 max-w-[45%]"
                    [src]="p.demoUrl"
                    (click)="$event.stopPropagation()"
                    (keydown)="$event.stopPropagation()"
                  >
                    Seu navegador não suporta reprodução de áudio.
                  </audio>
                } @else {
                  <span class="hidden text-xs text-muted sm:block">Sem demo</span>
                }
              </div>
            }
          </div>
        }
      </section>

      <!-- 3. Texto/briefing usado para definir a faixa do serviço -->
      @if (selectedProfessional()) {
        <section class="card space-y-3">
          <label class="form-label flex items-center gap-2"
            ><lucide-icon [img]="FileText" class="size-4 text-brand" />3.
            {{ orderType() === 'VOICE' ? 'Texto para locução' : 'Instruções de produção' }}</label
          >
          <textarea
            class="form-input min-h-32 resize-y"
            rows="5"
            [placeholder]="
              orderType() === 'VOICE'
                ? 'Cole aqui o texto para calcular o serviço e os créditos...'
                : 'Descreva o resultado esperado, referências e observações...'
            "
            [value]="briefingText()"
            (input)="updateBriefing($any($event.target).value)"
          ></textarea>
          @if (orderType() === 'VOICE' && briefingText().trim()) {
            <p class="text-xs text-muted">
              {{ wordCount() | number }} palavras · duração estimada de
              {{ estimatedDurationLabel() }}
            </p>
          }
        </section>

        <section class="card space-y-3">
          <label class="form-label">4. Serviço</label>
          @if (loadingServices()) {
            <p class="text-sm text-neutral-500">Carregando serviços...</p>
          } @else if (compatibleServices().length === 0) {
            <p class="text-sm text-amber-600">Nenhum serviço disponível para este profissional.</p>
          } @else if (orderType() === 'VOICE') {
            @if (!briefingText().trim()) {
              <p class="text-sm text-muted">Digite o texto da locução para definirmos o serviço.</p>
            } @else if (selectedService(); as svc) {
              <div class="rounded-lg border border-brand/30 bg-brand-subtle p-4">
                <p class="text-xs font-semibold uppercase tracking-wide text-brand">
                  Serviço definido pelo texto
                </p>
                <p class="mt-1 font-semibold text-foreground">{{ svc.name }}</p>
                <p class="mt-1 text-sm text-muted">{{ svc.description }}</p>
              </div>
            } @else {
              <p class="text-sm text-amber-600">
                O texto ultrapassa a maior faixa de locução disponível.
              </p>
            }
          } @else {
            <select
              class="form-input"
              [value]="selectedServiceId()"
              (change)="selectService($any($event.target).value)"
            >
              <option value="">Selecione...</option>
              @for (s of compatibleServices(); track s.id) {
                <option [value]="s.id">{{ s.name }} — {{ s.creditCost }} créditos</option>
              }
            </select>
          }
        </section>
      }

      <!-- Indicador de carteira/crédito -->
      @if (selectedService(); as svc) {
        <div
          class="rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
        >
          <p class="text-xs font-semibold uppercase tracking-wide">Créditos do serviço</p>
          <p class="mt-1 text-lg font-bold">{{ svc.creditCost | number }} créditos</p>
          <p class="mt-1 text-sm">
            O valor será reservado na carteira
            {{ svc.scope === 'GLOBAL' ? 'PLATFORM' : 'RESELLER' }} ao criar o pedido.
          </p>
        </div>
      }

      @if (selectedService()) {
        <section class="card space-y-4">
          <div>
            <h2 class="form-label">5. Pronúncias (opcional)</h2>
            <p class="mt-1 text-sm text-muted">
              Selecione orientações salvas ou adicione uma nova para este item.
            </p>
          </div>
          @if (loadingPronunciations()) {
            <p class="text-sm text-muted">Carregando sua biblioteca...</p>
          } @else {
            <div class="max-h-56 space-y-2 overflow-y-auto">
              @for (item of pronunciationLibrary(); track item.id) {
                <label class="flex items-start gap-3 rounded-lg border border-border p-3">
                  <input
                    type="checkbox"
                    class="mt-1 size-4"
                    [checked]="isPronunciationSelected(item.id)"
                    (change)="togglePronunciation(item)"
                  />
                  <span class="min-w-0 flex-1"
                    ><strong class="text-sm">{{ item.term }}</strong
                    ><span class="block text-xs text-muted">{{
                      item.pronunciationText
                    }}</span></span
                  >
                  @if ((item.audios?.length ?? 0) > 0 && isPronunciationSelected(item.id)) {
                    <select
                      class="form-input max-w-44 text-xs"
                      [value]="selectedAudio(item.id)"
                      (change)="selectPronunciationAudio(item.id, $any($event.target).value)"
                    >
                      <option value="">Sem áudio</option>
                      @for (audio of item.audios ?? []; track audio.id) {
                        <option [value]="audio.id">{{ audio.originalName }}</option>
                      }
                    </select>
                  }
                </label>
              }
            </div>
          }
          <div class="grid gap-3 rounded-lg bg-surface-subtle p-3 sm:grid-cols-2">
            <input
              class="form-input"
              maxlength="120"
              placeholder="Novo termo"
              [value]="inlinePronunciationTerm()"
              (input)="inlinePronunciationTerm.set($any($event.target).value)"
            />
            <input
              class="form-input"
              maxlength="240"
              placeholder="Como pronunciar"
              [value]="inlinePronunciationText()"
              (input)="inlinePronunciationText.set($any($event.target).value)"
            />
            <button
              type="button"
              class="btn-secondary sm:col-span-2"
              [disabled]="!inlinePronunciationTerm().trim() || !inlinePronunciationText().trim()"
              (click)="addInlinePronunciation()"
            >
              Adicionar ao pedido
            </button>
          </div>
          @if (inlinePronunciations().length) {
            <div class="space-y-2">
              <p class="text-xs font-semibold uppercase tracking-wide text-muted">
                Adicionadas somente a este pedido
              </p>
              @for (
                item of inlinePronunciations();
                track item.term + item.pronunciationText;
                let index = $index
              ) {
                <div
                  class="flex items-center gap-3 rounded-lg border border-brand/30 bg-brand-subtle p-3"
                >
                  <span class="min-w-0 flex-1 text-sm"
                    ><strong>{{ item.term }}</strong
                    ><span class="block text-xs text-muted">{{
                      item.pronunciationText
                    }}</span></span
                  >
                  <button
                    type="button"
                    class="text-xs text-danger hover:underline"
                    (click)="removeInlinePronunciation(index)"
                  >
                    Remover
                  </button>
                </div>
              }
            </div>
          }
        </section>

        <section class="card space-y-3">
          <label for="reference-file" class="form-label flex items-center gap-2"
            ><lucide-icon [img]="Paperclip" class="size-4 text-brand" />Anexo de referência
            (opcional)</label
          >
          <p class="text-sm text-muted">
            Envie um documento ou áudio para o profissional usar como guia.
          </p>
          <input
            id="reference-file"
            type="file"
            class="form-input"
            accept="audio/*,.pdf,.doc,.docx,.txt,.rtf"
            (change)="selectAttachment($event)"
          />
          @if (attachment(); as file) {
            <div
              class="flex items-center justify-between gap-3 rounded-md bg-surface-subtle p-3 text-sm"
            >
              <span class="truncate">{{ file.name }} · {{ attachmentSize() }}</span>
              <button type="button" class="text-danger hover:underline" (click)="clearAttachment()">
                Remover
              </button>
            </div>
          }
        </section>
      }

      @if (uploadProgress() !== null) {
        <div class="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
          <div class="h-full bg-blue-600 transition-all" [style.width.%]="uploadProgress()"></div>
        </div>
      }

      <div
        class="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end"
      >
        <button
          type="button"
          class="btn-secondary inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold"
          (click)="cancel()"
        >
          <lucide-icon [img]="X" class="size-4" />Cancelar
        </button>
        <button
          type="button"
          class="btn-primary inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          [disabled]="!canSubmit() || submitting()"
          (click)="submit()"
        >
          <lucide-icon
            [img]="submitting() ? LoaderCircle : Send"
            class="size-4"
            [class.animate-spin]="submitting()"
          />{{ submitting() ? 'Criando pedido...' : 'Criar pedido' }}
        </button>
      </div>
    </div>
  `,
})
export class OrderCreatePage {
  protected readonly Check = Check;
  protected readonly FileText = FileText;
  protected readonly LoaderCircle = LoaderCircle;
  protected readonly Mic2 = Mic2;
  protected readonly Music2 = Music2;
  protected readonly Paperclip = Paperclip;
  protected readonly Send = Send;
  protected readonly UserRound = UserRound;
  protected readonly X = X;
  private readonly orders = inject(OrderService);
  private readonly professionalSvc = inject(ProfessionalService);
  private readonly catalog = inject(ServiceCatalogService);
  private readonly storage = inject(StorageService);
  private readonly pronunciations = inject(PronunciationService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly orderType = signal<OrderType>('VOICE');
  readonly professionals = signal<Professional[]>([]);
  readonly loadingProfessionals = signal(false);
  readonly selectedProfessionalId = signal('');

  readonly compatibleServices = signal<Service[]>([]);
  readonly loadingServices = signal(false);
  readonly selectedServiceId = signal('');

  readonly briefingText = signal('');
  readonly attachment = signal<File | null>(null);
  readonly submitting = signal(false);
  readonly uploadProgress = signal<number | null>(null);
  readonly pronunciationLibrary = signal<ClientPronunciation[]>([]);
  readonly loadingPronunciations = signal(false);
  readonly selectedPronunciations = signal<Record<string, string | undefined>>({});
  readonly inlinePronunciations = signal<Array<{ term: string; pronunciationText: string }>>([]);
  readonly inlinePronunciationTerm = signal('');
  readonly inlinePronunciationText = signal('');

  readonly selectedProfessional = computed(
    () => this.professionals().find((p) => p.id === this.selectedProfessionalId()) ?? null,
  );
  readonly selectedService = computed(
    () => this.compatibleServices().find((s) => s.id === this.selectedServiceId()) ?? null,
  );
  readonly wordCount = computed(() => {
    const text = this.briefingText().trim();
    return text ? text.split(/\s+/).length : 0;
  });
  readonly estimatedDurationSeconds = computed(() =>
    Math.max(1, Math.ceil((this.wordCount() / 150) * 60)),
  );
  readonly estimatedDurationLabel = computed(() => {
    const seconds = this.estimatedDurationSeconds();
    if (seconds < 60) return `${seconds} s`;
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return remainder ? `${minutes} min ${remainder} s` : `${minutes} min`;
  });

  readonly canSubmit = computed(() => {
    if (!this.selectedProfessional() || !this.selectedService()) return false;
    if (!this.briefingText().trim()) return false;
    return true;
  });
  readonly attachmentSize = computed(() => {
    const bytes = this.attachment()?.size ?? 0;
    return bytes < 1024 * 1024
      ? `${Math.ceil(bytes / 1024)} KB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  });

  constructor() {
    this.loadProfessionals();
    this.loadPronunciations();
  }

  selectType(type: OrderType): void {
    if (this.orderType() === type) return;
    this.orderType.set(type);
    this.selectedProfessionalId.set('');
    this.selectedServiceId.set('');
    this.compatibleServices.set([]);
    this.loadProfessionals();
  }

  private loadProfessionals(): void {
    this.loadingProfessionals.set(true);
    const req =
      this.orderType() === 'VOICE'
        ? this.professionalSvc.listVoiceActors()
        : this.professionalSvc.listProducers();
    req.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.professionals.set(res.professionals ?? []);
        this.loadingProfessionals.set(false);
      },
      error: (err) => {
        this.notify.error(err.message ?? 'Erro ao carregar profissionais');
        this.loadingProfessionals.set(false);
      },
    });
  }

  selectProfessional(id: string): void {
    this.selectedProfessionalId.set(id);
    this.selectedServiceId.set('');
    this.compatibleServices.set([]);
    const prof = this.selectedProfessional();
    if (prof) this.loadServices(prof);
  }

  initials(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  // Carrega serviços do tipo correspondente e filtra pelo escopo do profissional.
  private loadServices(prof: Professional): void {
    this.loadingServices.set(true);
    const role = this.orderType() === 'VOICE' ? 'VOICE_ACTOR' : 'PRODUCER';
    this.catalog
      .list({ professionalRole: role })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          this.compatibleServices.set(list.filter((s) => s.isActive && s.scope === prof.scope));
          this.selectVoiceServiceByText();
          this.loadingServices.set(false);
        },
        error: (err) => {
          this.notify.error(err.message ?? 'Erro ao carregar serviços');
          this.loadingServices.set(false);
        },
      });
  }

  selectService(id: string): void {
    this.selectedServiceId.set(id);
  }

  updateBriefing(text: string): void {
    this.briefingText.set(text);
    this.selectVoiceServiceByText();
  }

  private selectVoiceServiceByText(): void {
    if (this.orderType() !== 'VOICE' || !this.briefingText().trim()) {
      if (this.orderType() === 'VOICE') this.selectedServiceId.set('');
      return;
    }

    const duration = this.estimatedDurationSeconds();
    const servicesByPrice = [...this.compatibleServices()].sort(
      (a, b) => a.creditCost - b.creditCost,
    );
    const service = servicesByPrice
      .map((item, index) => ({
        item,
        // O contrato ainda não possui maxDurationSeconds. A descrição é a
        // fonte principal; o fallback mantém as três faixas oficiais do catálogo.
        maxSeconds:
          this.maxDurationFromDescription(item.description) ?? [40, 80, 120][index] ?? null,
      }))
      .filter(({ maxSeconds }) => maxSeconds !== null && duration <= maxSeconds)
      .sort(
        (a, b) => a.maxSeconds! - b.maxSeconds! || a.item.creditCost - b.item.creditCost,
      )[0]?.item;

    this.selectedServiceId.set(service?.id ?? '');
  }

  private maxDurationFromDescription(description?: string): number | null {
    if (!description) return null;
    const durations: number[] = [];
    const pattern =
      /(\d+)\s*min(?:uto)?s?(?:\s*e\s*(\d+)\s*seg(?:undo)?s?)?|(\d+)\s*seg(?:undo)?s?/gi;
    for (const match of description.matchAll(pattern)) {
      durations.push(match[1] ? Number(match[1]) * 60 + Number(match[2] ?? 0) : Number(match[3]));
    }
    return durations.length ? Math.max(...durations) : null;
  }

  selectAttachment(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (file && file.size > 50 * 1024 * 1024) {
      this.notify.error('O anexo deve ter no máximo 50 MB.');
      input.value = '';
      return;
    }
    this.attachment.set(file);
  }

  clearAttachment(): void {
    this.attachment.set(null);
    const input = document.getElementById('reference-file') as HTMLInputElement | null;
    if (input) input.value = '';
  }

  isPronunciationSelected(id: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.selectedPronunciations(), id);
  }

  selectedAudio(id: string): string {
    return this.selectedPronunciations()[id] ?? '';
  }

  togglePronunciation(item: ClientPronunciation): void {
    this.selectedPronunciations.update((selected) => {
      const next = { ...selected };
      if (Object.prototype.hasOwnProperty.call(next, item.id)) delete next[item.id];
      else next[item.id] = item.audios?.length === 1 ? item.audios[0].id : undefined;
      return next;
    });
  }

  selectPronunciationAudio(id: string, audioId: string): void {
    this.selectedPronunciations.update((selected) => ({ ...selected, [id]: audioId || undefined }));
  }

  addInlinePronunciation(): void {
    const term = this.inlinePronunciationTerm().trim();
    const pronunciationText = this.inlinePronunciationText().trim();
    if (!term || !pronunciationText) return;
    const duplicate = this.inlinePronunciations().some(
      (item) =>
        item.term.toLocaleLowerCase() === term.toLocaleLowerCase() &&
        item.pronunciationText.toLocaleLowerCase() === pronunciationText.toLocaleLowerCase(),
    );
    if (!duplicate)
      this.inlinePronunciations.update((items) => [...items, { term, pronunciationText }]);
    this.inlinePronunciationTerm.set('');
    this.inlinePronunciationText.set('');
  }

  removeInlinePronunciation(index: number): void {
    this.inlinePronunciations.update((items) =>
      items.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  private loadPronunciations(): void {
    this.loadingPronunciations.set(true);
    this.pronunciations
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          this.pronunciationLibrary.set(items);
          this.loadingPronunciations.set(false);
        },
        error: () => this.loadingPronunciations.set(false),
      });
  }

  submit(): void {
    if (!this.canSubmit()) return;
    this.submitting.set(true);
    const attachment = this.attachment();
    if (attachment) {
      this.uploadProgress.set(0);
      const bucket = attachment.type.startsWith('audio/') ? 'audios' : 'documents';
      this.storage
        .uploadFile(attachment, bucket, 'orders/briefings')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (upload) => {
            this.uploadProgress.set(upload.progress);
            if (upload.complete && upload.response) {
              this.createOrder(upload.response.publicUrl ?? upload.response.fullPath);
            }
          },
          error: (err) => {
            this.submitting.set(false);
            this.uploadProgress.set(null);
            this.notify.error(err.message ?? 'Não foi possível enviar o anexo.');
          },
        });
      return;
    }
    this.createOrder();
  }

  private createOrder(briefingFileUrl?: string): void {
    const professional = this.selectedProfessional();
    const service = this.selectedService();
    if (!professional || !service) {
      this.submitting.set(false);
      return;
    }
    const pronunciationInputs: OrderPronunciationInput[] = [
      ...Object.entries(this.selectedPronunciations()).map(([clientPronunciationId, audioId]) => ({
        clientPronunciationId,
        ...(audioId ? { audioId } : {}),
      })),
      ...this.inlinePronunciations(),
    ];
    const dto: CreateOrderDto = {
      items: [
        {
          ref: 'service',
          professionalId: professional.id,
          serviceId: service.id,
          briefingText: this.briefingText().trim(),
          briefingFileUrl,
          pronunciations: pronunciationInputs.length ? pronunciationInputs : undefined,
        },
      ],
    };

    this.orders
      .create(dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.uploadProgress.set(Math.round((100 * event.loaded) / event.total));
          } else if (event.type === HttpEventType.Response) {
            this.submitting.set(false);
            this.uploadProgress.set(null);
            this.notify.success('Pedido criado com sucesso.');
            const created = event.body;
            this.router.navigate(['/admin/orders', created?.id ?? '']);
          }
        },
        error: (err) => {
          this.submitting.set(false);
          this.uploadProgress.set(null);
          this.notify.error(this.mapError(err));
        },
      });
  }

  // Mensagens específicas conforme os erros do contrato (402/403/422...).
  private mapError(err: { status?: number; message?: string }): string {
    switch (err.status) {
      case 402:
        return 'Saldo insuficiente na carteira para este serviço.';
      case 403:
        return 'Você não pode contratar este profissional.';
      case 422:
        return 'Serviço incompatível com o profissional selecionado.';
      default:
        return err.message ?? 'Erro ao criar pedido.';
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/orders']);
  }
}
