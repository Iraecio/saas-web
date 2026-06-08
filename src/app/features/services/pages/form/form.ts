import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppStateService } from '../../../../core/services/app-state';
import { NotificationService } from '../../../../core/services/notification';
import { ServiceCatalogService } from '../../services/service-catalog';
import {
  CreateServiceDto,
  ProfessionalRole,
  ServiceScope,
  UpdateServiceDto,
} from '../../../../core/models/service.model';

@Component({
  selector: 'app-service-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="p-6 max-w-2xl mx-auto space-y-6">
      <header>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">
          {{ isEdit() ? 'Editar serviço' : 'Novo serviço' }}
        </h1>
        <p class="mt-1 text-sm text-neutral-500">
          {{ isAdmin() ? 'Serviço global da plataforma' : 'Serviço particular da sua revenda' }}
        </p>
      </header>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
        <div>
          <label class="form-label">Nome</label>
          <input class="form-input w-full" formControlName="name" />
        </div>

        <div>
          <label class="form-label">Descrição</label>
          <textarea class="form-input w-full" rows="2" formControlName="description"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-label">Tipo de profissional</label>
            <select class="form-input w-full" formControlName="professionalRole">
              <option value="VOICE_ACTOR">Locução</option>
              <option value="PRODUCER">Produção</option>
            </select>
          </div>
          <div>
            <label class="form-label">Custo (créditos)</label>
            <input type="number" min="1" class="form-input w-full" formControlName="creditCost" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-label">Prazo de entrega (horas)</label>
            <input type="number" min="1" class="form-input w-full" formControlName="defaultDeliveryHours" />
          </div>
          <div>
            <label class="form-label">Revisões incluídas</label>
            <input type="number" min="0" class="form-input w-full" formControlName="maxRevisions" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-label">
              Repasse ao profissional (centavos){{ isAdmin() ? '' : ' (opcional)' }}
            </label>
            <input type="number" min="1" class="form-input w-full" formControlName="professionalPayout" />
          </div>
          <div>
            <label class="form-label">Duração máx. (s) (opcional)</label>
            <input type="number" min="1" class="form-input w-full" formControlName="maxDurationSeconds" />
          </div>
        </div>

        @if (isEdit() && criticalChanged()) {
          <div class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
            ⚠️ Você alterou campos críticos (custo, prazo ou revisões). A mudança afetará
            <strong>novos pedidos</strong>. Ao salvar, a confirmação de impacto será enviada.
          </div>
        }

        <div class="flex gap-3 pt-2">
          <button type="submit" class="btn-primary" [disabled]="form.invalid || saving()">
            {{ saving() ? 'Salvando...' : 'Salvar' }}
          </button>
          <button type="button" class="btn-secondary" (click)="cancel()">Cancelar</button>
        </div>
      </form>
    </div>
  `,
})
export class ServiceFormPage {
  private readonly fb = inject(FormBuilder);
  private readonly catalog = inject(ServiceCatalogService);
  private readonly appState = inject(AppStateService);
  private readonly notify = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly serviceId = signal<string | null>(this.route.snapshot.paramMap.get('id'));
  readonly isEdit = computed(() => this.serviceId() !== null);
  readonly isAdmin = computed(() => this.appState.isAdmin());
  readonly saving = signal(false);
  readonly criticalChanged = signal(false);

  // Valores originais dos campos críticos (para detectar alteração na edição).
  private originalCritical: { creditCost?: number; defaultDeliveryHours?: number; maxRevisions?: number } = {};

  readonly form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    professionalRole: ['VOICE_ACTOR' as ProfessionalRole, Validators.required],
    creditCost: [1, [Validators.required, Validators.min(1)]],
    defaultDeliveryHours: [48, [Validators.required, Validators.min(1)]],
    maxRevisions: [2, [Validators.required, Validators.min(0)]],
    professionalPayout: [null as number | null],
    maxDurationSeconds: [null as number | null],
  });

  constructor() {
    const id = this.serviceId();
    if (id) {
      this.catalog
        .getById(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (svc) => {
            this.form.patchValue({
              name: svc.name,
              description: svc.description ?? '',
              professionalRole: svc.professionalRole,
              creditCost: svc.creditCost,
              defaultDeliveryHours: svc.defaultDeliveryHours,
              maxRevisions: svc.maxRevisions,
              professionalPayout: svc.professionalPayout ?? null,
              maxDurationSeconds: svc.maxDurationSeconds ?? null,
            });
            this.originalCritical = {
              creditCost: svc.creditCost,
              defaultDeliveryHours: svc.defaultDeliveryHours,
              maxRevisions: svc.maxRevisions,
            };
          },
          error: (err) => this.notify.error(err.message ?? 'Erro ao carregar serviço'),
        });

      // Detecta alteração de campos críticos para exibir o aviso de impacto.
      this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((v) => {
        const changed =
          v.creditCost !== this.originalCritical.creditCost ||
          v.defaultDeliveryHours !== this.originalCritical.defaultDeliveryHours ||
          v.maxRevisions !== this.originalCritical.maxRevisions;
        this.criticalChanged.set(changed);
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const raw = this.form.getRawValue();

    if (this.isEdit()) {
      const dto: UpdateServiceDto = {
        name: raw.name!,
        description: raw.description ?? undefined,
        professionalRole: raw.professionalRole!,
        creditCost: raw.creditCost!,
        defaultDeliveryHours: raw.defaultDeliveryHours!,
        maxRevisions: raw.maxRevisions!,
        professionalPayout: raw.professionalPayout ?? undefined,
        maxDurationSeconds: raw.maxDurationSeconds ?? undefined,
      };
      this.catalog.update(this.serviceId()!, dto).subscribe({
        next: () => this.onSaved('Serviço atualizado.'),
        error: (err) => this.onError(err),
      });
    } else {
      // ADMIN cria GLOBAL; RESELLER cria PARTICULAR (escopo inferido pela API).
      const scope: ServiceScope | undefined = this.isAdmin() ? 'GLOBAL' : undefined;
      const dto: CreateServiceDto = {
        name: raw.name!,
        description: raw.description ?? undefined,
        professionalRole: raw.professionalRole!,
        scope,
        creditCost: raw.creditCost!,
        defaultDeliveryHours: raw.defaultDeliveryHours!,
        maxRevisions: raw.maxRevisions!,
        professionalPayout: raw.professionalPayout ?? undefined,
        maxDurationSeconds: raw.maxDurationSeconds ?? undefined,
      };
      this.catalog.create(dto).subscribe({
        next: () => this.onSaved('Serviço criado.'),
        error: (err) => this.onError(err),
      });
    }
  }

  private onSaved(message: string): void {
    this.saving.set(false);
    this.notify.success(message);
    this.router.navigate(['/admin/services']);
  }

  private onError(err: { message?: string }): void {
    this.saving.set(false);
    this.notify.error(err.message ?? 'Erro ao salvar serviço');
  }

  cancel(): void {
    this.router.navigate(['/admin/services']);
  }
}
