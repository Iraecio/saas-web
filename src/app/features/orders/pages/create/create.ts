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
import { NotificationService } from '../../../../core/services/notification';
import { OrderService } from '../../services/order';
import { ProfessionalService } from '../../../professionals/services/professional';
import { ServiceCatalogService } from '../../../services/services/service-catalog';
import { Professional } from '../../../../core/models/professional.model';
import { Service } from '../../../../core/models/service.model';
import { CreateOrderDto, OrderType } from '../../../../core/models/order.model';

const ACCEPTED_AUDIO = ['mp3', 'wav', 'ogg', 'm4a', 'flac'];
const MAX_FILE_BYTES = 100 * 1024 * 1024; // 100 MB

@Component({
  selector: 'app-order-create',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  template: `
    <div class="p-6 max-w-2xl mx-auto space-y-6">
      <header>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Novo pedido</h1>
        <p class="mt-1 text-sm text-neutral-500">Contrate um locutor ou produtor</p>
      </header>

      <!-- 1. Tipo de pedido -->
      <section class="space-y-2">
        <label class="form-label">Tipo de pedido</label>
        <div class="flex gap-3">
          <button
            type="button"
            class="flex-1 rounded-lg border p-3 text-sm transition-colors"
            [class.border-neutral-900]="orderType() === 'VOICE'"
            [class.dark:border-white]="orderType() === 'VOICE'"
            [class.border-neutral-200]="orderType() !== 'VOICE'"
            (click)="selectType('VOICE')"
          >
            🎙️ Locução
          </button>
          <button
            type="button"
            class="flex-1 rounded-lg border p-3 text-sm transition-colors"
            [class.border-neutral-900]="orderType() === 'PRODUCTION'"
            [class.dark:border-white]="orderType() === 'PRODUCTION'"
            [class.border-neutral-200]="orderType() !== 'PRODUCTION'"
            (click)="selectType('PRODUCTION')"
          >
            🎚️ Produção
          </button>
        </div>
      </section>

      <!-- 2. Profissional -->
      <section class="space-y-2">
        <label class="form-label">Profissional</label>
        @if (loadingProfessionals()) {
          <p class="text-sm text-neutral-500">Carregando profissionais...</p>
        } @else if (professionals().length === 0) {
          <p class="text-sm text-neutral-500">Nenhum profissional disponível para este tipo.</p>
        } @else {
          <select class="form-input" [value]="selectedProfessionalId()" (change)="selectProfessional($any($event.target).value)">
            <option value="">Selecione...</option>
            @for (p of professionals(); track p.id) {
              <option [value]="p.id">{{ p.name }} — {{ p.scope === 'GLOBAL' ? 'Global' : 'Particular' }}</option>
            }
          </select>
        }
      </section>

      <!-- 3. Serviço compatível -->
      @if (selectedProfessional()) {
        <section class="space-y-2">
          <label class="form-label">Serviço</label>
          @if (loadingServices()) {
            <p class="text-sm text-neutral-500">Carregando serviços...</p>
          } @else if (compatibleServices().length === 0) {
            <p class="text-sm text-amber-600">Nenhum serviço disponível para este profissional.</p>
          } @else {
            <select class="form-input" [value]="selectedServiceId()" (change)="selectService($any($event.target).value)">
              <option value="">Selecione...</option>
              @for (s of compatibleServices(); track s.id) {
                <option [value]="s.id">{{ s.name }} — {{ s.creditCost }} créditos ({{ s.creditType }})</option>
              }
            </select>
          }
        </section>
      }

      <!-- Indicador de carteira/crédito -->
      @if (selectedService(); as svc) {
        <div class="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
          Serão reservados <strong>{{ svc.creditCost | number }}</strong> créditos da carteira
          <strong>{{ svc.creditType === 'PLATFORM' ? 'PLATFORM' : 'RESELLER' }}</strong>.
        </div>
      }

      <!-- 4. Briefing -->
      <section class="space-y-2">
        <label class="form-label">{{ orderType() === 'VOICE' ? 'Script (texto a locucionar)' : 'Instruções de produção' }}</label>
        <textarea class="form-input" rows="4" [value]="briefingText()" (input)="briefingText.set($any($event.target).value)"></textarea>
      </section>

      <!-- 5. Upload (PRODUCTION) -->
      @if (orderType() === 'PRODUCTION') {
        <section class="space-y-2">
          <label class="form-label">Arquivo de áudio bruto (mp3, wav, ogg, m4a, flac — máx. 100 MB)</label>
          <input type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac" class="form-input" (change)="onFile($any($event.target).files)" />
          @if (file()) {
            <p class="text-xs text-neutral-500">{{ file()!.name }}</p>
          }
        </section>
      }

      @if (uploadProgress() !== null) {
        <div class="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
          <div class="h-full bg-blue-600 transition-all" [style.width.%]="uploadProgress()"></div>
        </div>
      }

      <div class="flex gap-3 pt-2">
        <button type="button" class="btn-primary" [disabled]="!canSubmit() || submitting()" (click)="submit()">
          {{ submitting() ? 'Enviando...' : 'Criar pedido' }}
        </button>
        <button type="button" class="btn-secondary" (click)="cancel()">Cancelar</button>
      </div>
    </div>
  `,
})
export class OrderCreatePage {
  private readonly orders = inject(OrderService);
  private readonly professionalSvc = inject(ProfessionalService);
  private readonly catalog = inject(ServiceCatalogService);
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
  readonly file = signal<File | null>(null);
  readonly submitting = signal(false);
  readonly uploadProgress = signal<number | null>(null);

  readonly selectedProfessional = computed(() =>
    this.professionals().find((p) => p.id === this.selectedProfessionalId()) ?? null,
  );
  readonly selectedService = computed(() =>
    this.compatibleServices().find((s) => s.id === this.selectedServiceId()) ?? null,
  );

  readonly canSubmit = computed(() => {
    if (!this.selectedProfessional() || !this.selectedService()) return false;
    if (!this.briefingText().trim()) return false;
    if (this.orderType() === 'PRODUCTION' && !this.file()) return false;
    return true;
  });

  constructor() {
    this.loadProfessionals();
  }

  selectType(type: OrderType): void {
    if (this.orderType() === type) return;
    this.orderType.set(type);
    this.selectedProfessionalId.set('');
    this.selectedServiceId.set('');
    this.compatibleServices.set([]);
    this.file.set(null);
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

  // Carrega serviços do tipo correspondente e filtra pelo escopo do profissional.
  private loadServices(prof: Professional): void {
    this.loadingServices.set(true);
    const role = this.orderType() === 'VOICE' ? 'VOICE_ACTOR' : 'PRODUCER';
    this.catalog
      .list({ professionalRole: role })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          this.compatibleServices.set(
            list.filter((s) => s.isActive && s.scope === prof.scope),
          );
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

  onFile(files: FileList | null): void {
    const f = files?.[0] ?? null;
    if (!f) {
      this.file.set(null);
      return;
    }
    const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ACCEPTED_AUDIO.includes(ext)) {
      this.notify.error(`Formato inválido. Aceitos: ${ACCEPTED_AUDIO.join(', ')}.`);
      this.file.set(null);
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      this.notify.error('Arquivo excede o limite de 100 MB.');
      this.file.set(null);
      return;
    }
    this.file.set(f);
  }

  submit(): void {
    if (!this.canSubmit()) return;
    this.submitting.set(true);
    this.uploadProgress.set(this.orderType() === 'PRODUCTION' ? 0 : null);

    const dto: CreateOrderDto = {
      professionalId: this.selectedProfessionalId(),
      serviceId: this.selectedServiceId(),
      orderType: this.orderType(),
      briefingText: this.briefingText().trim(),
      file: this.file() ?? undefined,
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
