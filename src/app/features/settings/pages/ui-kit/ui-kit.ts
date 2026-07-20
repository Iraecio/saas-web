import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Bell, Check, Plus, Search, Trash2, LucideAngularModule } from 'lucide-angular';
import { UiBadgeComponent } from '../../../../shared/ui/badge/ui-badge';
import { UiButtonComponent } from '../../../../shared/ui/button/ui-button';
import { UiCardComponent } from '../../../../shared/ui/card/ui-card';
import { ConfirmDialogComponent } from '../../../../shared/ui/dialog/confirm-dialog';

@Component({
  selector: 'app-ui-kit',
  imports: [
    LucideAngularModule,
    MatFormField,
    MatInput,
    MatLabel,
    UiBadgeComponent,
    UiButtonComponent,
    UiCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-6xl space-y-8 p-5 lg:p-8">
      <header
        class="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end"
      >
        <div>
          <p class="text-xs font-semibold uppercase text-brand">Fundamentos</p>
          <h1 class="mt-2 text-2xl font-bold text-foreground">UI Kit</h1>
          <p class="mt-1 max-w-2xl text-sm text-muted">
            Primitivas acessíveis, tokens semânticos e componentes próprios para as interfaces do
            produto.
          </p>
        </div>
        <ui-badge tone="success"
          ><lucide-icon [img]="Check" class="mr-1 size-3" />Angular Material + Tailwind</ui-badge
        >
      </header>

      <section class="grid gap-4 md:grid-cols-3">
        @for (color of colors; track color.name) {
          <div class="flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
            <span
              class="size-10 rounded-md border border-border"
              [style.background]="color.value"
            ></span>
            <div>
              <p class="text-sm font-semibold">{{ color.name }}</p>
              <code class="text-xs text-muted">{{ color.token }}</code>
            </div>
          </div>
        }
      </section>

      <ui-card
        title="Ações"
        description="Hierarquia previsível para comandos primários e auxiliares."
      >
        <div class="flex flex-wrap gap-3">
          <ui-button><lucide-icon [img]="Plus" class="size-4" />Criar pedido</ui-button>
          <ui-button variant="secondary"
            ><lucide-icon [img]="Search" class="size-4" />Pesquisar</ui-button
          >
          <ui-button variant="ghost"
            ><lucide-icon [img]="Bell" class="size-4" />Notificações</ui-button
          >
          <ui-button variant="destructive" (click)="openDialog()"
            ><lucide-icon [img]="Trash2" class="size-4" />Excluir</ui-button
          >
          <ui-button [loading]="true">Processando</ui-button>
        </div>
      </ui-card>

      <div class="grid gap-5 lg:grid-cols-2">
        <ui-card
          title="Formulários"
          description="Material fornece semântica, foco, erro e teclado; tokens controlam o visual."
        >
          <div class="grid gap-3 sm:grid-cols-2">
            <mat-form-field appearance="outline"
              ><mat-label>Nome do projeto</mat-label
              ><input matInput value="Campanha de julho" /></mat-form-field
            ><mat-form-field appearance="outline"
              ><mat-label>Responsável</mat-label
              ><input matInput placeholder="Selecione ou pesquise"
            /></mat-form-field>
          </div>
        </ui-card>
        <ui-card title="Status" description="Cores sempre acompanhadas por texto.">
          <div class="flex flex-wrap gap-2">
            <ui-badge>Rascunho</ui-badge><ui-badge tone="brand">Em produção</ui-badge
            ><ui-badge tone="success">Concluído</ui-badge
            ><ui-badge tone="warning">Aguardando</ui-badge><ui-badge tone="danger">Falhou</ui-badge>
          </div>
        </ui-card>
      </div>
    </div>
  `,
})
export class UiKitComponent {
  private readonly dialog = inject(MatDialog);
  protected readonly Plus = Plus;
  protected readonly Search = Search;
  protected readonly Bell = Bell;
  protected readonly Trash2 = Trash2;
  protected readonly Check = Check;
  protected readonly colors = [
    { name: 'Ação', token: '--ui-primary', value: 'var(--ui-primary)' },
    { name: 'Confirmação', token: '--ui-accent', value: 'var(--ui-accent)' },
    { name: 'Superfície', token: '--ui-surface', value: 'var(--ui-surface)' },
  ];
  protected openDialog(): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Excluir item?',
        description: 'Esta ação é permanente e não poderá ser desfeita.',
        confirmLabel: 'Excluir',
        destructive: true,
      },
      width: '28rem',
    });
  }
}
