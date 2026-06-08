import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NotificationService } from '../../../../core/services/notification';
import { DeliverDto, OrderDelivery } from '../../../../core/models/order.model';

const ACCEPTED_AUDIO = ['mp3', 'wav', 'ogg', 'm4a', 'flac'];
const MAX_FILE_BYTES = 100 * 1024 * 1024;

@Component({
  selector: 'app-audio-delivery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  template: `
    <div class="space-y-4">
      <!-- Entrega atual -->
      @if (current(); as d) {
        <div class="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <div class="mb-2 flex items-center justify-between">
            <span class="text-sm font-medium">Entrega v{{ d.versionNumber }}</span>
            <span class="text-xs text-neutral-500">{{ d.deliveredAt | date: 'short' }}</span>
          </div>
          <audio controls [src]="d.audioUrl" class="w-full"></audio>
          @if (d.deliveryNotes) {
            <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{{ d.deliveryNotes }}</p>
          }
          <a [href]="d.audioUrl" download class="mt-2 inline-block text-xs text-blue-600 hover:underline dark:text-blue-400">Baixar áudio</a>
        </div>
      }

      <!-- Formulário de entrega / re-entrega -->
      @if (showUpload()) {
        <div class="space-y-2 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <p class="text-sm font-medium">{{ isRedelivery() ? 'Re-entregar áudio' : 'Entregar áudio' }}</p>
          <input type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac" class="form-input" (change)="onFile($any($event.target).files)" />
          @if (file()) {
            <p class="text-xs text-neutral-500">{{ file()!.name }}</p>
          }
          <textarea class="form-input" rows="2" placeholder="Notas da entrega (opcional)" [value]="notes()" (input)="notes.set($any($event.target).value)"></textarea>
          @if (isRedelivery()) {
            <textarea class="form-input" rows="2" placeholder="Motivo do reenvio (obrigatório)" [value]="redeliveryReason()" (input)="redeliveryReason.set($any($event.target).value)"></textarea>
          }
          @if (progress() !== null) {
            <div class="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
              <div class="h-full bg-blue-600 transition-all" [style.width.%]="progress()"></div>
            </div>
          }
          <div class="flex gap-2">
            <button type="button" class="btn-primary" [disabled]="!canSubmit() || submitting()" (click)="submit()">
              {{ submitting() ? 'Enviando...' : 'Enviar' }}
            </button>
            <button type="button" class="btn-secondary" (click)="cancel.emit()">Fechar</button>
          </div>
        </div>
      }
    </div>
  `,
})
export class AudioDeliveryComponent {
  private readonly notify = inject(NotificationService);

  readonly current = input<OrderDelivery | null | undefined>(null);
  readonly showUpload = input(false);
  readonly isRedelivery = input(false); // status REVIEW → re-entrega
  readonly progress = input<number | null>(null);
  readonly submitting = input(false);

  readonly deliver = output<DeliverDto>();
  readonly cancel = output<void>();

  readonly file = signal<File | null>(null);
  readonly notes = signal('');
  readonly redeliveryReason = signal('');

  readonly canSubmit = computed(() => {
    if (!this.file()) return false;
    if (this.isRedelivery() && !this.redeliveryReason().trim()) return false;
    return true;
  });

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
    this.deliver.emit({
      file: this.file()!,
      deliveryNotes: this.notes().trim() || undefined,
      redeliveryReason: this.isRedelivery() ? this.redeliveryReason().trim() : undefined,
    });
  }
}
