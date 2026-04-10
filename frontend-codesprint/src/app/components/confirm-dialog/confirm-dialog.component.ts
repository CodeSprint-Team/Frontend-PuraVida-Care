import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="p-6 max-w-[500px]">
      <h2 class="text-xl font-semibold text-slate-800 mb-4">
        {{ data.title }}
      </h2>

      <p class="text-sm text-slate-600 leading-6 break-words whitespace-normal mb-6">
        {{ data.message }}
      </p>

      <div class="flex justify-end gap-3">
        <button
          type="button"
          mat-button
          (click)="close(false)"
          class="!px-5 !py-2 !rounded-xl !bg-slate-100 hover:!bg-slate-200 !text-slate-700"
        >
          Cancelar
        </button>

        <button
          type="button"
          mat-button
          (click)="close(true)"
          class="!px-5 !py-2 !rounded-xl !bg-red-600 hover:!bg-red-700 !text-white"
        >
          Confirmar
        </button>
      </div>
    </div>
  `
})
export class ConfirmDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string },
    private dialogRef: MatDialogRef<ConfirmDialogComponent>
  ) {}

  close(result: boolean): void {
    this.dialogRef.close(result);
  }
}