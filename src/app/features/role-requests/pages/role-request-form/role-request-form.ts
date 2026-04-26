import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppStateService } from '../../../../core/services/app-state';
import { CreateRoleRequestDto, RequestableRole } from '../../../../core/models/role-request.model';
import { RoleRequestService } from '../../services/role-request';

const VOICE_STYLES = [
  { id: 'impacto', label: 'Impacto' },
  { id: 'jovem', label: 'Jovem' },
  { id: 'padrao', label: 'Padrão' },
  { id: 'narracao', label: 'Narração' },
  { id: 'comercial', label: 'Comercial' },
  { id: 'institucional', label: 'Institucional' },
] as const;

const SPECIALTIES = [
  { id: 'audio', label: 'Áudio' },
  { id: 'video', label: 'Vídeo' },
  { id: 'ambos', label: 'Áudio e Vídeo' },
] as const;

@Component({
  selector: 'app-role-request-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-3xl p-6 space-y-6">
      <header>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Solicitar mudança de papel</h1>
        <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Preencha os dados para solicitar atuação como Revendedor, Locutor ou Produtor.
        </p>
      </header>

      @if (!isEligible()) {
        <div class="rounded-xl bg-red-50 p-6 ring-1 ring-red-200 dark:bg-red-900/20 dark:ring-red-800">
          <h2 class="text-lg font-semibold text-red-700 dark:text-red-400">Ação não disponível</h2>
          <p class="mt-2 text-sm text-red-600 dark:text-red-300">
            Apenas usuários cadastrados diretamente no SaaS podem solicitar mudança de papel.
          </p>
          <a routerLink="/admin/dashboard"
             class="mt-4 inline-block text-sm font-semibold text-red-700 hover:underline dark:text-red-400">
            ← Voltar ao dashboard
          </a>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()"
              class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-neutral-200 space-y-6 dark:bg-neutral-800 dark:ring-neutral-700">

          <!-- Seleção de papel -->
          <div>
            <label class="block text-sm font-semibold text-neutral-900 dark:text-white mb-3">
              Qual papel deseja solicitar?
            </label>
            <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
              @for (option of roleOptions; track option.id) {
                <label class="flex cursor-pointer flex-col rounded-lg border-2 p-4 transition"
                       [class.border-violet-500]="selectedRole() === option.id"
                       [class.border-neutral-200]="selectedRole() !== option.id"
                       [class.dark:border-neutral-700]="selectedRole() !== option.id">
                  <input type="radio" formControlName="requestedRole" [value]="option.id" class="sr-only" />
                  <span class="text-2xl">{{ option.icon }}</span>
                  <span class="mt-2 font-semibold text-neutral-900 dark:text-white">{{ option.label }}</span>
                  <span class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{{ option.description }}</span>
                </label>
              }
            </div>
          </div>

          <!-- Justificativa -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Justificativa <span class="text-red-500">*</span>
            </label>
            <textarea formControlName="justification" rows="4"
                      placeholder="Conte por que você quer atuar nesse papel (mínimo 20 caracteres)"
                      class="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"></textarea>
            @if (form.get('justification')?.invalid && form.get('justification')?.touched) {
              <p class="mt-1 text-xs text-red-500">Mínimo 20 caracteres.</p>
            }
          </div>

          <!-- Campos para VOICE_ACTOR -->
          @if (selectedRole() === 'VOICE_ACTOR') {
            <fieldset class="space-y-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
              <legend class="px-2 text-sm font-semibold text-violet-700 dark:text-violet-400">🎙️ Dados de locutor</legend>

              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Estilos de voz que domina
                </label>
                <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  @for (style of voiceStylesList; track style.id) {
                    <label class="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm transition hover:border-violet-300 dark:border-neutral-700">
                      <input type="checkbox"
                             [checked]="voiceStyles().includes(style.id)"
                             (change)="toggleStyle(style.id)"
                             class="h-4 w-4 rounded text-violet-600 focus:ring-violet-500" />
                      <span class="text-neutral-700 dark:text-neutral-300">{{ style.label }}</span>
                    </label>
                  }
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Notas de portfólio
                </label>
                <textarea formControlName="portfolioNotes" rows="3"
                          placeholder="Conte sobre sua experiência, clientes, formação..."
                          class="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"></textarea>
              </div>

              <div class="rounded-lg bg-neutral-100 p-3 text-sm text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
                <button type="button" disabled
                        class="cursor-not-allowed opacity-60 inline-flex items-center gap-2 rounded-lg bg-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300">
                  📎 Enviar arquivos de áudio
                </button>
                <span class="ml-2">Em breve</span>
              </div>
            </fieldset>
          }

          <!-- Campos para RESELLER -->
          @if (selectedRole() === 'RESELLER') {
            <fieldset class="space-y-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
              <legend class="px-2 text-sm font-semibold text-violet-700 dark:text-violet-400">🏢 Dados de revendedor</legend>

              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Nome da empresa <span class="text-red-500">*</span>
                </label>
                <input type="text" formControlName="companyName"
                       placeholder="Razão social ou nome fantasia"
                       class="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white" />
                @if (form.get('companyName')?.invalid && form.get('companyName')?.touched) {
                  <p class="mt-1 text-xs text-red-500">Nome da empresa é obrigatório.</p>
                }
              </div>
            </fieldset>
          }

          <!-- Campos para PRODUCER -->
          @if (selectedRole() === 'PRODUCER') {
            <fieldset class="space-y-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
              <legend class="px-2 text-sm font-semibold text-violet-700 dark:text-violet-400">🎬 Dados de produtor</legend>

              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Especialidade <span class="text-red-500">*</span>
                </label>
                <select formControlName="specialty"
                        class="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white">
                  <option value="">Selecione...</option>
                  @for (specialty of specialtiesList; track specialty.id) {
                    <option [value]="specialty.id">{{ specialty.label }}</option>
                  }
                </select>
                @if (form.get('specialty')?.invalid && form.get('specialty')?.touched) {
                  <p class="mt-1 text-xs text-red-500">Selecione a especialidade.</p>
                }
              </div>
            </fieldset>
          }

          <!-- Erro -->
          @if (error()) {
            <div class="rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-800">
              ⚠️ {{ error() }}
            </div>
          }

          <!-- Botões -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <a routerLink="/admin/dashboard"
               class="rounded-lg px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700">
              Cancelar
            </a>
            <button type="submit"
                    [disabled]="form.invalid || loading()"
                    class="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50">
              @if (loading()) {
                <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Enviando...
              } @else {
                Enviar solicitação
              }
            </button>
          </div>
        </form>
      }
    </div>
  `,
})
export class RoleRequestFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly roleRequestService = inject(RoleRequestService);
  private readonly appState = inject(AppStateService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | undefined>(undefined);
  protected readonly voiceStyles = signal<string[]>([]);

  protected readonly isEligible = computed(() => {
    const user = this.appState.user();
    return !!user && user.role === 'CLIENT' && !user.resellerId;
  });

  protected readonly roleOptions = [
    {
      id: 'VOICE_ACTOR' as RequestableRole,
      label: 'Locutor',
      icon: '🎙️',
      description: 'Locuções, narrações e vinhetas',
    },
    {
      id: 'RESELLER' as RequestableRole,
      label: 'Revendedor',
      icon: '🏢',
      description: 'Gerencie clientes próprios',
    },
    {
      id: 'PRODUCER' as RequestableRole,
      label: 'Produtor',
      icon: '🎬',
      description: 'Produza áudio e vídeo',
    },
  ];

  protected readonly voiceStylesList = VOICE_STYLES;
  protected readonly specialtiesList = SPECIALTIES;

  protected readonly form = this.fb.nonNullable.group({
    requestedRole: ['VOICE_ACTOR' as RequestableRole, Validators.required],
    justification: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
    portfolioNotes: [''],
    companyName: [''],
    specialty: [''],
  });

  protected readonly selectedRole = signal<RequestableRole>('VOICE_ACTOR');

  constructor() {
    this.form.controls.requestedRole.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((role) => {
        this.selectedRole.set(role);
        this.applyConditionalValidators(role);
      });
    this.applyConditionalValidators('VOICE_ACTOR');
  }

  protected toggleStyle(id: string): void {
    this.voiceStyles.update((current) =>
      current.includes(id) ? current.filter((s) => s !== id) : [...current, id],
    );
  }

  private applyConditionalValidators(role: RequestableRole): void {
    const company = this.form.controls.companyName;
    const specialty = this.form.controls.specialty;

    company.clearValidators();
    specialty.clearValidators();

    if (role === 'RESELLER') {
      company.setValidators([Validators.required, Validators.maxLength(200)]);
    }
    if (role === 'PRODUCER') {
      specialty.setValidators([Validators.required]);
    }

    company.updateValueAndValidity({ emitEvent: false });
    specialty.updateValueAndValidity({ emitEvent: false });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(undefined);

    const value = this.form.getRawValue();
    const dto: CreateRoleRequestDto = {
      requestedRole: value.requestedRole,
      justification: value.justification,
      portfolioNotes: value.portfolioNotes || undefined,
      companyName: value.companyName || undefined,
      specialty: value.specialty || undefined,
      voiceStyles: value.requestedRole === 'VOICE_ACTOR' ? this.voiceStyles() : undefined,
    };

    this.roleRequestService
      .create(dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/admin/role-requests/my']);
        },
        error: (err: HttpErrorResponse | Error) => {
          this.loading.set(false);
          this.error.set(this.extractMessage(err));
        },
      });
  }

  private extractMessage(err: HttpErrorResponse | Error): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as { message?: string; errors?: string[] } | null;
      if (body?.message) return body.message;
      if (body?.errors?.length) return body.errors.join(' · ');
      if (err.status === 409) return 'Você já tem uma solicitação pendente.';
      if (err.status === 403) return 'Você não pode solicitar mudança de papel.';
      if (err.status === 0) return 'Sem conexão com o servidor.';
      return `Erro ${err.status}`;
    }
    return err.message ?? 'Falha ao enviar solicitação';
  }
}
