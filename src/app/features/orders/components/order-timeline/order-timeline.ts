import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { OrderStatusHistoryEntry } from '../../../../core/models/order.model';
import { ORDER_STATUS_LABELS } from '../../order-status.util';

@Component({
  selector: 'app-order-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  template: `
    @if (entries().length === 0) {
      <p class="text-sm text-neutral-500">Sem histórico.</p>
    } @else {
      <ol class="space-y-3 border-l border-neutral-200 pl-4 dark:border-neutral-800">
        @for (e of entries(); track $index) {
          <li class="relative">
            <span class="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-blue-600"></span>
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-neutral-900 dark:text-white">
                {{ statusLabel(e.toStatus) }}
              </span>
              <span class="text-xs text-neutral-500">{{ e.createdAt | date: 'short' }}</span>
            </div>
            <p class="text-xs text-neutral-500">
              {{ e.fromStatus ? statusLabel(e.fromStatus) + ' → ' : '' }}por {{ e.actorRole }}
            </p>
            @if (e.notes) {
              <p class="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{{ e.notes }}</p>
            }
          </li>
        }
      </ol>
    }
  `,
})
export class OrderTimelineComponent {
  readonly entries = input.required<OrderStatusHistoryEntry[]>();

  statusLabel(status: string): string {
    return ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS] ?? status;
  }
}
