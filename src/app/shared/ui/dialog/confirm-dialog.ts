import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { UiButtonComponent } from '../button/ui-button';

export interface ConfirmDialogData {
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
}

@Component({
  selector: 'ui-confirm-dialog',
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, UiButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title class="text-lg font-semibold">{{ data.title }}</h2>
    <mat-dialog-content
      ><p class="max-w-md text-sm leading-6 text-muted">
        {{ data.description }}
      </p></mat-dialog-content
    >
    <mat-dialog-actions align="end">
      <ui-button variant="ghost" [mat-dialog-close]="false">Cancelar</ui-button>
      <ui-button
        [variant]="data.destructive ? 'destructive' : 'primary'"
        [mat-dialog-close]="true"
        >{{ data.confirmLabel ?? 'Confirmar' }}</ui-button
      >
    </mat-dialog-actions>
  `,
})
export class ConfirmDialogComponent {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
