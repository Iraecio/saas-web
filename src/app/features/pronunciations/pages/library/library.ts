import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, of, switchMap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import {
  BookOpen,
  FileAudio,
  Info,
  LoaderCircle,
  Mic2,
  Plus,
  Search,
  Trash2,
  Upload,
  Volume2,
  X,
  LucideAngularModule,
} from 'lucide-angular';
import {
  ClientPronunciation,
  PronunciationPolicy,
} from '../../../../core/models/pronunciation.model';
import { NotificationService } from '../../../../core/services/notification';
import { PronunciationService } from '../../services/pronunciation';
import { ConfirmDialogComponent } from '../../../../shared/ui/dialog/confirm-dialog';

@Component({
  selector: 'app-pronunciation-library',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, LucideAngularModule],
  template: `
    <div class="mx-auto max-w-5xl space-y-8 p-5 lg:p-8">
      <section class="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <header
          class="flex items-start gap-4 border-b border-border bg-surface-subtle px-5 py-5 sm:px-6"
        >
          <span
            class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-sm"
          >
            <lucide-icon [img]="Mic2" class="size-5" />
          </span>
          <div>
            <h2 class="text-lg font-bold text-foreground">Nova pronúncia</h2>
            <p class="mt-1 max-w-2xl text-sm leading-6 text-muted">
              Crie orientações reutilizáveis para que os profissionais pronunciem nomes, marcas e
              termos exatamente como você espera.
            </p>
          </div>
        </header>

        <div class="space-y-5 p-5 sm:p-6">
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="space-y-2 text-sm font-semibold text-foreground">
              Palavra ou termo
              <div class="relative">
                <lucide-icon
                  [img]="BookOpen"
                  class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
                />
                <input
                  class="form-input pl-10"
                  maxlength="120"
                  placeholder="Ex.: Nike"
                  [value]="term()"
                  (input)="term.set($any($event.target).value)"
                />
              </div>
              <span class="block text-xs font-normal text-muted"
                >Digite o termo na grafia correta.</span
              >
            </label>
            <label class="space-y-2 text-sm font-semibold text-foreground">
              Como deve ser pronunciado
              <div class="relative">
                <lucide-icon
                  [img]="Volume2"
                  class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
                />
                <input
                  class="form-input pl-10"
                  maxlength="240"
                  placeholder="Ex.: naike"
                  [value]="pronunciationText()"
                  (input)="pronunciationText.set($any($event.target).value)"
                />
              </div>
              <span class="block text-xs font-normal text-muted"
                >Escreva de forma simples, como o som deve ser falado.</span
              >
            </label>
          </div>

          <div class="rounded-lg border border-dashed border-border-strong bg-surface-subtle p-4">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex items-start gap-3">
                <span
                  class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface text-brand ring-1 ring-border"
                  ><lucide-icon [img]="FileAudio" class="size-5"
                /></span>
                <div>
                  <p class="text-sm font-semibold text-foreground">
                    Amostra de áudio <span class="font-normal text-muted">(opcional)</span>
                  </p>
                  <p class="mt-1 text-xs text-muted">
                    Envie um MP3 curto demonstrando a pronúncia correta.
                  </p>
                </div>
              </div>
              <label
                class="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-border-strong bg-surface px-4 text-sm font-semibold text-foreground transition-colors hover:bg-surface-subtle"
              >
                <lucide-icon [img]="Upload" class="size-4" />Selecionar MP3
                <input
                  id="creation-pronunciation-audio"
                  type="file"
                  class="sr-only"
                  accept="audio/mpeg,.mp3"
                  [disabled]="saving()"
                  (change)="selectCreationAudio($event)"
                />
              </label>
            </div>
            @if (creationAudio(); as audio) {
              <div
                class="mt-4 flex items-center gap-3 rounded-lg border border-brand/20 bg-brand-subtle p-3"
              >
                <lucide-icon [img]="FileAudio" class="size-4 shrink-0 text-brand" />
                <span class="min-w-0 flex-1 truncate text-sm font-medium">{{ audio.name }}</span>
                <span class="text-xs text-muted">{{ audio.size / 1024 | number: '1.0-0' }} KB</span>
                <button
                  type="button"
                  class="rounded-md p-2 text-muted transition-colors hover:bg-surface hover:text-danger"
                  aria-label="Remover áudio selecionado"
                  (click)="clearCreationAudio()"
                >
                  <lucide-icon [img]="X" class="size-4" />
                </button>
              </div>
            }
          </div>

          <div class="flex justify-end">
            <button
              type="button"
              class="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand px-5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-hover disabled:pointer-events-none disabled:opacity-50"
              [disabled]="saving() || !term().trim() || !pronunciationText().trim()"
              (click)="create()"
            >
              <lucide-icon
                [img]="saving() ? LoaderCircle : Plus"
                class="size-4"
                [class.animate-spin]="saving()"
              />{{ saving() ? 'Cadastrando...' : 'Cadastrar pronúncia' }}
            </button>
          </div>
        </div>
      </section>

      <section class="space-y-4">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 class="text-lg font-bold text-foreground">Sua biblioteca</h2>
            <p class="mt-1 text-sm text-muted">
              {{ items().length }}
              {{ items().length === 1 ? 'pronúncia encontrada' : 'pronúncias encontradas' }}
            </p>
          </div>
          <div class="relative w-full sm:max-w-sm">
            <lucide-icon
              [img]="Search"
              class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            />
            <input
              class="form-input pl-10"
              placeholder="Buscar palavra ou pronúncia"
              [value]="query()"
              (input)="query.set($any($event.target).value)"
              (keyup.enter)="load()"
            />
            <button
              type="button"
              class="absolute right-1 top-1/2 -translate-y-1/2 rounded-md px-3 py-2 text-xs font-semibold text-brand hover:bg-brand-subtle"
              (click)="load()"
            >
              Buscar
            </button>
          </div>
        </div>
        @if (loading()) {
          <div
            class="flex items-center justify-center gap-3 rounded-xl border border-border bg-surface py-14 text-sm text-muted"
          >
            <lucide-icon [img]="LoaderCircle" class="size-5 animate-spin text-brand" />Carregando
            sua biblioteca...
          </div>
        } @else if (!items().length) {
          <div
            class="rounded-xl border border-dashed border-border-strong bg-surface px-6 py-14 text-center"
          >
            <span
              class="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-subtle text-muted"
              ><lucide-icon [img]="BookOpen" class="size-6"
            /></span>
            <h3 class="mt-4 font-semibold text-foreground">Nenhuma pronúncia encontrada</h3>
            <p class="mx-auto mt-1 max-w-sm text-sm text-muted">
              Cadastre sua primeira orientação ou tente buscar por outro termo.
            </p>
          </div>
        } @else {
          <div class="grid gap-4 md:grid-cols-2">
            @for (item of items(); track item.id) {
              <article
                class="rounded-xl border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div class="flex items-start justify-between gap-4">
                  <div class="flex min-w-0 items-start gap-3">
                    <span
                      class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-subtle text-brand"
                      ><lucide-icon [img]="Volume2" class="size-5"
                    /></span>
                    <div class="min-w-0">
                      <h3 class="truncate font-bold text-foreground">{{ item.term }}</h3>
                      <p class="mt-1 text-sm text-muted">
                        Pronunciar como
                        <strong class="font-semibold text-foreground"
                          >“{{ item.pronunciationText }}”</strong
                        >
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    class="rounded-md p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                    [attr.aria-label]="'Remover ' + item.term"
                    (click)="remove(item)"
                  >
                    <lucide-icon [img]="Trash2" class="size-4" />
                  </button>
                </div>
                <div class="mt-4 space-y-2 border-t border-border pt-4">
                  @for (audio of item.audios ?? []; track audio.id) {
                    <div class="flex items-center gap-2 rounded-lg bg-surface-subtle p-2.5 text-sm">
                      <lucide-icon [img]="FileAudio" class="size-4 shrink-0 text-brand" /><span
                        class="min-w-0 flex-1 truncate"
                        >{{ audio.originalName }}</span
                      ><button
                        type="button"
                        class="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-semibold text-brand hover:bg-brand-subtle"
                        (click)="play(item, audio.id)"
                      >
                        <lucide-icon [img]="Volume2" class="size-3.5" />Ouvir</button
                      ><button
                        type="button"
                        class="rounded-md p-1.5 text-muted hover:bg-danger/10 hover:text-danger"
                        aria-label="Excluir áudio"
                        (click)="confirmRemoveAudio(item, audio.id)"
                      >
                        <lucide-icon [img]="Trash2" class="size-3.5" />
                      </button>
                    </div>
                  } @empty {
                    <p class="flex items-center gap-2 text-xs text-muted">
                      <lucide-icon [img]="Info" class="size-3.5" />Nenhuma amostra de áudio
                      cadastrada.
                    </p>
                  }
                  <label
                    class="inline-flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-xs font-semibold text-brand transition-colors hover:bg-brand-subtle"
                    [class.pointer-events-none]="uploadingId() === item.id || !canUpload(item)"
                    [class.opacity-50]="uploadingId() === item.id || !canUpload(item)"
                    ><lucide-icon
                      [img]="uploadingId() === item.id ? LoaderCircle : Upload"
                      class="size-3.5"
                      [class.animate-spin]="uploadingId() === item.id" />{{
                      uploadingId() === item.id ? 'Enviando...' : 'Adicionar áudio MP3'
                    }}<input
                      type="file"
                      class="sr-only"
                      accept="audio/mpeg,.mp3"
                      [disabled]="uploadingId() === item.id || !canUpload(item)"
                      (change)="upload(item, $event)"
                  /></label>
                </div>
              </article>
            }
          </div>
        }
      </section>

      @if (policy(); as p) {
        <div
          class="flex items-start gap-3 rounded-lg border border-border bg-surface-subtle p-4 text-xs text-muted"
        >
          <lucide-icon [img]="Info" class="mt-0.5 size-4 shrink-0 text-brand" />
          <p>
            <strong class="text-foreground">Limites de áudio:</strong>
            {{ p.currentClientAudioCount }} de {{ p.maxAudiosPerClient }} arquivos utilizados, até
            {{ p.maxAudiosPerPronunciation }} por pronúncia e
            {{ p.maxFileSizeBytes / 1048576 | number: '1.0-1' }} MB por MP3.
          </p>
        </div>
      }
    </div>
  `,
})
export class PronunciationLibraryPage {
  protected readonly BookOpen = BookOpen;
  protected readonly FileAudio = FileAudio;
  protected readonly Info = Info;
  protected readonly LoaderCircle = LoaderCircle;
  protected readonly Mic2 = Mic2;
  protected readonly Plus = Plus;
  protected readonly Search = Search;
  protected readonly Trash2 = Trash2;
  protected readonly Upload = Upload;
  protected readonly Volume2 = Volume2;
  protected readonly X = X;
  private readonly service = inject(PronunciationService);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  readonly items = signal<ClientPronunciation[]>([]);
  readonly policy = signal<PronunciationPolicy | null>(null);
  readonly query = signal('');
  readonly term = signal('');
  readonly pronunciationText = signal('');
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly creationAudio = signal<File | null>(null);
  readonly uploadingId = signal<string | null>(null);

  constructor() {
    this.load();
    this.loadPolicy();
  }

  load(): void {
    this.loading.set(true);
    this.service
      .list(this.query().trim())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          this.items.set(items);
          this.loading.set(false);
        },
        error: (error) => {
          this.loading.set(false);
          this.notify.error(error.message ?? 'Erro ao carregar pronúncias.');
        },
      });
  }

  create(): void {
    const audio = this.creationAudio();
    const policy = this.policy();
    if (audio && policy && !this.isValidAudio(audio, policy)) return;
    this.saving.set(true);
    this.service
      .create(this.term().trim(), this.pronunciationText().trim())
      .pipe(
        switchMap((created) => (audio ? this.service.uploadAudio(created.id, audio) : of(null))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.term.set('');
          this.pronunciationText.set('');
          this.clearCreationAudio();
          this.notify.success(audio ? 'Pronúncia e áudio cadastrados.' : 'Pronúncia cadastrada.');
          this.load();
          if (audio) this.loadPolicy();
        },
        error: (error) => {
          this.saving.set(false);
          this.notify.error(error.message ?? 'Erro ao adicionar pronúncia.');
        },
      });
  }

  selectCreationAudio(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (file && this.policy() && !this.isValidAudio(file, this.policy()!)) {
      input.value = '';
      return;
    }
    this.creationAudio.set(file);
  }

  clearCreationAudio(): void {
    this.creationAudio.set(null);
    const input = document.getElementById(
      'creation-pronunciation-audio',
    ) as HTMLInputElement | null;
    if (input) input.value = '';
  }

  remove(item: ClientPronunciation): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: `Remover “${item.term}”?`,
          description:
            'A pronúncia deixará de aparecer na sua biblioteca. Pedidos que já utilizam essa orientação não serão alterados.',
          confirmLabel: 'Remover pronúncia',
          destructive: true,
        },
        width: '28rem',
      })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(() => this.service.remove(item.id)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.notify.success('Pronúncia removida da biblioteca.');
          this.load();
        },
        error: (error) => this.notify.error(error.message ?? 'Não foi possível remover.'),
      });
  }

  confirmRemoveAudio(item: ClientPronunciation, audioId: string): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Excluir amostra de áudio?',
          description:
            'O áudio será removido desta pronúncia. Cópias já preservadas em pedidos não serão alteradas.',
          confirmLabel: 'Excluir áudio',
          destructive: true,
        },
        width: '28rem',
      })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(() => this.service.removeAudio(item.id, audioId)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.notify.success('Áudio excluído.');
          this.load();
          this.loadPolicy();
        },
        error: (error) => this.notify.error(error.message ?? 'Não foi possível excluir o áudio.'),
      });
  }

  canUpload(item: ClientPronunciation): boolean {
    const p = this.policy();
    return (
      !p ||
      ((item.audios?.length ?? 0) < p.maxAudiosPerPronunciation &&
        p.currentClientAudioCount < p.maxAudiosPerClient)
    );
  }

  upload(item: ClientPronunciation, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const p = this.policy();
    if (p && !this.isValidAudio(file, p)) {
      input.value = '';
      return;
    }
    this.uploadingId.set(item.id);
    this.service
      .uploadAudio(item.id, file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.uploadingId.set(null);
          input.value = '';
          this.notify.success('Áudio adicionado.');
          this.load();
          this.loadPolicy();
        },
        error: (error) => {
          this.uploadingId.set(null);
          input.value = '';
          this.notify.error(error.message ?? 'Erro ao enviar áudio.');
        },
      });
  }

  private isValidAudio(file: File, policy: PronunciationPolicy): boolean {
    if (!policy.allowedMimeTypes.includes(file.type) || file.size > policy.maxFileSizeBytes) {
      this.notify.error(
        `Envie um MP3 de até ${(policy.maxFileSizeBytes / 1048576).toFixed(1)} MB.`,
      );
      return false;
    }
    if (policy.currentClientAudioCount >= policy.maxAudiosPerClient) {
      this.notify.error('Você atingiu o limite total de áudios de pronúncia.');
      return false;
    }
    return true;
  }

  play(item: ClientPronunciation, audioId: string): void {
    this.service
      .audioAccess(item.id, audioId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ signedUrl }) => window.open(signedUrl, '_blank', 'noopener'),
        error: (error) => this.notify.error(error.message),
      });
  }

  private loadPolicy(): void {
    this.service
      .getPolicy()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (policy) => this.policy.set(policy), error: () => {} });
  }
}
