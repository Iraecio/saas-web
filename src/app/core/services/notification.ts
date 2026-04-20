import { Injectable, signal } from '@angular/core';

export type NotificationKind = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: number;
  kind: NotificationKind;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly listSignal = signal<Notification[]>([]);
  private nextId = 1;

  readonly notifications = this.listSignal.asReadonly();

  show(kind: NotificationKind, message: string, ttlMs = 4000): number {
    const id = this.nextId++;
    this.listSignal.update((list) => [...list, { id, kind, message }]);
    if (ttlMs > 0) setTimeout(() => this.dismiss(id), ttlMs);
    return id;
  }

  success(message: string, ttlMs?: number) {
    return this.show('success', message, ttlMs);
  }

  error(message: string, ttlMs?: number) {
    return this.show('error', message, ttlMs);
  }

  info(message: string, ttlMs?: number) {
    return this.show('info', message, ttlMs);
  }

  warning(message: string, ttlMs?: number) {
    return this.show('warning', message, ttlMs);
  }

  dismiss(id: number): void {
    this.listSignal.update((list) => list.filter((n) => n.id !== id));
  }
}
