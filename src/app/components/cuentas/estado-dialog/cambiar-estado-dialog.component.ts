import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-cambiar-estado-dialog',
  template: `
    <h2 mat-dialog-title>Cambiar Estado de Cuenta #{{data.noCuenta}}</h2>
    <mat-dialog-content [formGroup]="form">
      <p>Seleccione el nuevo estado para cerrar o avanzar en el ciclo de la cuenta.</p>

      <div class="d-flex flex-column gap-3 mt-2">
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Nuevo Estado</mat-label>
          <mat-select formControlName="estadoSeleccionado" (selectionChange)="onEstadoChange($event.value)">
            <mat-option *ngFor="let est of data.listaEstados" [value]="est">
              {{est.nombre}}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field *ngIf="mostrarPeso" appearance="outline" class="w-100">
          <mat-label>Peso Total Recibido (Peso Cabal)</mat-label>
          <input matInput type="number" formControlName="pesoCabalTotal" placeholder="0.00">
          <mat-icon matSuffix>scale</mat-icon>
          <mat-error *ngIf="form.get('pesoCabalTotal')?.hasError('required')">
            El peso de la báscula es obligatorio para confirmar la cuenta.
          </mat-error>
        </mat-form-field>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancelar()">Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="guardar()">
        Actualizar Estado
      </button>
    </mat-dialog-actions>
  `
})
export class CambiarEstadoDialogComponent implements OnInit {
  form!: FormGroup;
  mostrarPeso: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CambiarEstadoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { noCuenta: string, listaEstados: any[] }
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      estadoSeleccionado: [null, Validators.required],
      pesoCabalTotal: [0] // Por defecto en 0, se valida dinámicamente
    });
  }

  onEstadoChange(estado: any): void {
    // Si el estado seleccionado incluye la frase "confirmada", exigimos el peso de báscula
    if (estado?.nombre?.toLowerCase().includes('confirmada')) {
      this.mostrarPeso = true;
      this.form.get('pesoCabalTotal')?.setValidators([Validators.required, Validators.min(0.01)]);
    } else {
      this.mostrarPeso = false;
      this.form.get('pesoCabalTotal')?.clearValidators();
      this.form.get('pesoCabalTotal')?.setValue(0);
    }
    this.form.get('pesoCabalTotal')?.updateValueAndValidity();
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  guardar(): void {
    if (this.form.valid) {
      const value = this.form.value;
      // Retornamos los datos estructurados exactamente como los espera el backend
      this.dialogRef.close({
        idEstadoPesaje: value.estadoSeleccionado.id,
        estadoNombre: value.estadoSeleccionado.nombre,
        pesoCabalTotal: value.pesoCabalTotal
      });
    }
  }
}
