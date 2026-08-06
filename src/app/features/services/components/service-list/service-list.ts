import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Service } from '../../../../core/models/service.model';

@Component({
  selector: 'app-service-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, RouterLink],
  template: `
    <div class="hidden overflow-hidden rounded-xl bg-surface ring-1 ring-border md:block">
      <table class="w-full text-sm">
        <thead class="bg-surface-subtle text-left text-xs text-muted">
          <tr>
            <th class="px-5 py-3 font-medium">Serviço</th>
            <th class="px-4 py-3 font-medium">Profissional</th>
            <th class="px-4 py-3 font-medium">Escopo</th>
            <th class="px-4 py-3 text-right font-medium">Créditos</th>
            <th class="px-4 py-3 text-center font-medium">Status</th>
            <th class="px-5 py-3"><span class="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          @for (service of services(); track service.id) {
            <tr class="transition-colors hover:bg-surface-subtle/70">
              <td class="px-5 py-4">
                <p class="font-semibold text-foreground">{{ service.name }}</p>
                <p class="mt-0.5 max-w-md truncate text-xs text-muted">
                  {{ service.description || 'Sem descrição' }}
                </p>
              </td>
              <td class="px-4 py-4 text-muted">
                {{ service.professionalRole === 'VOICE_ACTOR' ? 'Locutor' : 'Produtor' }}
              </td>
              <td class="px-4 py-4 text-muted">
                {{ service.scope === 'GLOBAL' ? 'Global' : 'Revenda' }}
              </td>
              <td class="px-4 py-4 text-right font-mono tabular-nums text-foreground">
                {{ service.creditCost | number }}
              </td>
              <td class="px-4 py-4 text-center">
                <span
                  class="rounded-md px-2 py-1 text-xs font-semibold"
                  [class]="
                    service.isActive
                      ? 'bg-accent/15 text-foreground'
                      : 'bg-surface-subtle text-muted'
                  "
                >
                  {{ service.isActive ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
              <td class="px-5 py-4 text-right whitespace-nowrap">
                <a [routerLink]="[service.id, 'audit']" class="btn-link text-xs">Histórico</a>
                @if (canManage()(service)) {
                  <a [routerLink]="[service.id, 'edit']" class="btn-link ml-3 text-xs">Editar</a>
                  <button
                    type="button"
                    class="btn-link ml-3 text-xs"
                    (click)="toggle.emit(service)"
                  >
                    {{ service.isActive ? 'Inativar' : 'Reativar' }}
                  </button>
                }
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <div class="grid gap-4 md:hidden">
      @for (service of services(); track service.id) {
        <article class="rounded-xl bg-surface p-4 ring-1 ring-border">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="font-semibold text-foreground">{{ service.name }}</p>
              <p class="mt-1 text-xs text-muted">
                {{ service.professionalRole === 'VOICE_ACTOR' ? 'Locutor' : 'Produtor' }} ·
                {{ service.scope === 'GLOBAL' ? 'Global' : 'Revenda' }}
              </p>
            </div>
            <span class="rounded-md bg-surface-subtle px-2 py-1 text-xs font-semibold text-muted">
              {{ service.isActive ? 'Ativo' : 'Inativo' }}
            </span>
          </div>
          <p class="mt-4 font-mono text-lg font-semibold tabular-nums text-foreground">
            {{ service.creditCost | number }} créditos
          </p>
          <div class="mt-4 flex min-h-11 flex-wrap items-center gap-4 border-t border-border pt-3">
            <a [routerLink]="[service.id, 'audit']" class="btn-link text-sm">Histórico</a>
            @if (canManage()(service)) {
              <a [routerLink]="[service.id, 'edit']" class="btn-link text-sm">Editar</a>
              <button type="button" class="btn-link text-sm" (click)="toggle.emit(service)">
                {{ service.isActive ? 'Inativar' : 'Reativar' }}
              </button>
            }
          </div>
        </article>
      }
    </div>
  `,
})
export class ServiceListComponent {
  readonly services = input.required<Service[]>();
  readonly canManage = input.required<(service: Service) => boolean>();
  readonly toggle = output<Service>();
}
