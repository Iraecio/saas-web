import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { SlicePipe, isPlatformBrowser } from '@angular/common';
import { StorageService, UploadProgress } from '../../services/storage';
import { StorageBucket, UploadResponse, SignedUrlResponse } from '../../../../core/models/storage.model';

interface FileEntry {
  path: string;
  size: number;
  mimeType: string;
  bucket: StorageBucket;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

@Component({
  selector: 'app-file-manager',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SlicePipe],
  template: `
    <div class="p-6 max-w-4xl mx-auto space-y-6">
      <header>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Gerenciador de Arquivos</h1>
        <p class="mt-1 text-sm text-neutral-500">Upload e gestão de arquivos na plataforma</p>
      </header>

      <!-- Seletor de bucket -->
      <div class="flex gap-3">
        @for (b of buckets; track b.value) {
          <button (click)="selectedBucket.set(b.value)"
            class="px-4 py-2 text-sm rounded-lg font-medium transition-colors"
            [class]="selectedBucket() === b.value
              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
              : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'">
            {{ b.icon }} {{ b.label }}
          </button>
        }
      </div>

      <!-- Área de upload -->
      <section class="bg-white dark:bg-neutral-900 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 p-8 text-center space-y-4"
        [class.border-primary-400]="isDragOver()"
        (dragover)="onDragOver($event)"
        (dragleave)="isDragOver.set(false)"
        (drop)="onDrop($event)">

        @if (!uploading()) {
          <div class="space-y-3">
            <div class="w-12 h-12 mx-auto rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <svg class="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-neutral-600 dark:text-neutral-400">
                Arraste um arquivo aqui ou
                <label class="text-primary-600 hover:underline cursor-pointer">
                  selecione do computador
                  <input type="file" class="sr-only" (change)="onFileSelected($event)" />
                </label>
              </p>
              <p class="text-xs text-neutral-400 mt-1">Tamanho máximo: 50MB</p>
            </div>
          </div>
        } @else {
          <div class="space-y-3">
            <p class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {{ uploadProgress() }}%
            </p>
            <div class="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 max-w-xs mx-auto">
              <div class="bg-primary-600 h-2 rounded-full transition-all duration-300"
                [style.width.%]="uploadProgress()"></div>
            </div>
            <p class="text-xs text-neutral-500">Fazendo upload...</p>
          </div>
        }

        @if (uploadError()) {
          <p class="text-sm text-red-500">{{ uploadError() }}</p>
        }
        @if (uploadedFile()) {
          <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-left">
            <p class="text-sm font-medium text-green-800 dark:text-green-300">✓ Upload concluído</p>
            <p class="text-xs text-green-600 dark:text-green-400 font-mono mt-0.5">{{ uploadedFile()!.path }}</p>
          </div>
        }
      </section>

      <!-- Tabela de arquivos recentes -->
      @if (recentFiles().length > 0) {
        <section class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <div class="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
            <h2 class="text-lg font-semibold text-neutral-900 dark:text-white">Arquivos recentes</h2>
          </div>
          <table class="w-full text-sm">
            <thead class="bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th class="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase">Caminho</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase">Tipo</th>
                <th class="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase">Tamanho</th>
                <th class="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
              @for (file of recentFiles(); track file.path) {
                <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td class="px-6 py-3 font-mono text-xs text-neutral-600 dark:text-neutral-400 max-w-xs truncate">{{ file.path }}</td>
                  <td class="px-6 py-3 text-neutral-500 text-xs">{{ file.mimeType }}</td>
                  <td class="px-6 py-3 text-neutral-500 text-xs">{{ formatSize(file.size) }}</td>
                  <td class="px-6 py-3">
                    <div class="flex items-center justify-end gap-2">
                      <button (click)="generateLink(file)" [disabled]="generatingLink() === file.path"
                        class="text-xs text-primary-600 hover:underline disabled:opacity-50">
                        {{ generatingLink() === file.path ? 'Gerando...' : 'Gerar link' }}
                      </button>
                      <button (click)="deleteFile(file)"
                        class="text-xs text-red-500 hover:text-red-700">
                        Deletar
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </section>
      }

      <!-- Dialog de link gerado -->
      @if (signedUrl()) {
        <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div class="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 max-w-lg w-full space-y-4">
            <h3 class="text-lg font-bold text-neutral-900 dark:text-white">Link temporário gerado</h3>
            <p class="text-xs text-neutral-500">Este link expira em: {{ signedUrl()!.expiresAt | slice:0:10 }}</p>
            <div class="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3 font-mono text-xs text-neutral-700 dark:text-neutral-300 break-all">
              {{ signedUrl()!.signedUrl }}
            </div>
            <div class="flex gap-3 justify-end">
              <button (click)="copyLink()"
                class="px-4 py-2 text-sm bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:opacity-90 transition-opacity">
                {{ linkCopied() ? '✓ Copiado!' : 'Copiar link' }}
              </button>
              <button (click)="signedUrl.set(null)"
                class="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900">
                Fechar
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Confirmação de deleção -->
      @if (confirmDelete()) {
        <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div class="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 max-w-sm w-full space-y-4">
            <h3 class="text-lg font-bold text-neutral-900 dark:text-white">Confirmar exclusão</h3>
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
              Deseja excluir o arquivo <span class="font-mono font-medium">{{ confirmDelete()!.path }}</span>? Esta ação não pode ser desfeita.
            </p>
            <div class="flex gap-3 justify-end">
              <button (click)="confirmDelete.set(null)"
                class="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400">Cancelar</button>
              <button (click)="doDelete()" [disabled]="deleting()"
                class="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
                {{ deleting() ? 'Excluindo...' : 'Excluir' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class FileManagerPage {
  private readonly storageService = inject(StorageService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly selectedBucket = signal<StorageBucket>('images');
  readonly uploading = signal(false);
  readonly uploadProgress = signal(0);
  readonly uploadError = signal<string | undefined>(undefined);
  readonly uploadedFile = signal<UploadResponse | null>(null);
  readonly isDragOver = signal(false);
  readonly recentFiles = signal<FileEntry[]>([]);
  readonly generatingLink = signal<string | null>(null);
  readonly signedUrl = signal<SignedUrlResponse | null>(null);
  readonly linkCopied = signal(false);
  readonly confirmDelete = signal<FileEntry | null>(null);
  readonly deleting = signal(false);

  readonly buckets: { value: StorageBucket; label: string; icon: string }[] = [
    { value: 'images', label: 'Imagens', icon: '🖼️' },
    { value: 'audios', label: 'Áudios', icon: '🎵' },
    { value: 'documents', label: 'Documentos', icon: '📄' },
  ];

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) this.processFile(file);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.processFile(file);
    input.value = '';
  }

  private processFile(file: File): void {
    if (file.size > MAX_FILE_SIZE) {
      this.uploadError.set(`Arquivo muito grande. Tamanho máximo: 50MB (${this.formatSize(file.size)} selecionado)`);
      return;
    }

    this.uploadError.set(undefined);
    this.uploadedFile.set(null);
    this.uploading.set(true);
    this.uploadProgress.set(0);

    this.storageService.uploadFile(file, this.selectedBucket()).subscribe({
      next: (progress: UploadProgress) => {
        this.uploadProgress.set(progress.progress);
        if (progress.complete && progress.response) {
          this.uploading.set(false);
          this.uploadedFile.set(progress.response);
          this.recentFiles.update((files) => [
            {
              path: progress.response!.path,
              size: progress.response!.size,
              mimeType: progress.response!.mimeType,
              bucket: progress.response!.bucket,
            },
            ...files,
          ]);
        }
      },
      error: (err: Error) => {
        this.uploading.set(false);
        this.uploadError.set(err.message);
      },
    });
  }

  generateLink(file: FileEntry): void {
    this.generatingLink.set(file.path);
    this.storageService.getSignedUrl(file.bucket, file.path).subscribe({
      next: (res) => {
        this.generatingLink.set(null);
        this.signedUrl.set(res);
      },
      error: (err: Error) => {
        this.generatingLink.set(null);
        this.uploadError.set(err.message);
      },
    });
  }

  copyLink(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const url = this.signedUrl()?.signedUrl;
    if (url) {
      navigator.clipboard.writeText(url).then(() => {
        this.linkCopied.set(true);
        setTimeout(() => this.linkCopied.set(false), 2000);
      });
    }
  }

  deleteFile(file: FileEntry): void {
    this.confirmDelete.set(file);
  }

  doDelete(): void {
    const file = this.confirmDelete();
    if (!file) return;
    this.deleting.set(true);
    this.storageService.deleteFile({ bucket: file.bucket, path: file.path }).subscribe({
      next: () => {
        this.deleting.set(false);
        this.confirmDelete.set(null);
        this.recentFiles.update((files) => files.filter((f) => f.path !== file.path));
      },
      error: (err: Error) => {
        this.deleting.set(false);
        this.uploadError.set(err.message);
      },
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
