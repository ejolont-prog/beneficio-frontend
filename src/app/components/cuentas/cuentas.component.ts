import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CuentasService, CuentaDetalle, EstadoCatalogo } from '../../services/cuentas.service';

// =========================================================================
// COMPONENTE MODAL INTERNO (FORMULARIO DE CAMBIO DE ESTADO)
// =========================================================================
@Component({
  selector: 'app-cambiar-estado-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatButtonModule, MatIconModule, ReactiveFormsModule],
  template: `
    <h2 mat-dialog-title style="margin-bottom: 10px;">Cambiar Estado de Cuenta #{{data.noCuenta}}</h2>
    <mat-dialog-content [formGroup]="form">
      <p style="color: #666; margin-bottom: 15px;">Seleccione el nuevo estado para cerrar o avanzar en el ciclo de la cuenta del beneficio.</p>

      <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 8px;">
        <mat-form-field appearance="outline" style="width: 100%;">
          <mat-label>Nuevo Estado</mat-label>
          <mat-select formControlName="estadoSeleccionado" (selectionChange)="onEstadoChange($event.value)">
            <mat-option *ngFor="let est of data.listaEstados" [value]="est">
              {{est.nombre}}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field *ngIf="mostrarPeso" appearance="outline" style="width: 100%;">
          <mat-label>Peso Total Recibido (Peso Cabal)</mat-label>
          <input matInput type="number" formControlName="pesoCabalTotal" placeholder="0.00">
          <mat-icon matSuffix>scale</mat-icon>
          <mat-error *ngIf="form.get('pesoCabalTotal')?.hasError('required')">
            El peso real de la báscula es obligatorio para confirmar la cuenta.
          </mat-error>
        </mat-form-field>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end" style="padding-top: 12px;">
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
    @Inject(MAT_DIALOG_DATA) public data: { noCuenta: string, listaEstados: EstadoCatalogo[] }
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      estadoSeleccionado: [null, Validators.required],
      pesoCabalTotal: [0]
    });
  }

  onEstadoChange(estado: any): void {
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
      this.dialogRef.close({
        idEstadoPesaje: value.estadoSeleccionado.id,
        estadoNombre: value.estadoSeleccionado.nombre,
        pesoCabalTotal: value.pesoCabalTotal
      });
    }
  }
}

// =========================================================================
// COMPONENTE PRINCIPAL (CUENTAS COMPONENT)
// =========================================================================
@Component({
  selector: 'app-cuentas',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './cuentas.component.html',
  styleUrls: ['./cuentas.component.css']
})
export class CuentasComponent implements OnInit {
  dataSource = new MatTableDataSource<CuentaDetalle>([]);
  columnas: string[] = ['noCuenta', 'agricultor', 'pesoTotal', 'parcialidades', 'fecha', 'estado', 'acciones'];
  cargando: boolean = true;

  filtroEstado: string = '';
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;

  // CORRECCIÓN CENTRAL: Estas listas se llenarán de forma dinámica desde la Base de Datos
  listaEstadosFiltro: string[] = [];
  listaEstadosCatalogo: EstadoCatalogo[] = [];

  constructor(
    private cuentasService: CuentasService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.cargarEstadosYComponente();
    this.configurarPredicadoFiltro();
  }

  /**
   * CORRECCIÓN: Llama al nuevo endpoint del catálogo para obtener los IDs reales (26 al 32)
   */
  cargarEstadosYComponente(): void {
    this.cargando = true;
    this.cuentasService.getEstadosCatalogo().subscribe({
      next: (estados) => {
        this.listaEstadosCatalogo = estados;
        // Mapea los nombres de texto plano dinámicamente para que los filtros funcionen
        this.listaEstadosFiltro = estados.map(e => e.nombre);

        // Una vez mapeado el catálogo con éxito, cargamos el listado de las cuentas
        this.obtenerCuentas();
      },
      error: (err) => {
        console.error('Error al cargar catálogo de estados desde el backend:', err);
        this.snackBar.open('Error al sincronizar el catálogo de estados.', 'Cerrar', { duration: 4000 });
        this.obtenerCuentas(); // Intenta forzar la carga de la tabla aun si falla el catálogo
      }
    });
  }

  obtenerCuentas(): void {
    this.cuentasService.getCuentas().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.cargando = false;
      }
    });
  }

  configurarPredicadoFiltro() {
    this.dataSource.filterPredicate = (data: CuentaDetalle, filter: string) => {
      const searchTerms = JSON.parse(filter);

      const matchTexto = data.noCuenta.toLowerCase().includes(searchTerms.texto) ||
        data.razonSocial.toLowerCase().includes(searchTerms.texto);

      const matchEstado = searchTerms.estado ? data.estadoNombre === searchTerms.estado : true;

      let matchFecha = true;
      if (searchTerms.inicio && searchTerms.fin) {
        const fechaEnvio = new Date(data.fechaEnvio).getTime();
        matchFecha = fechaEnvio >= new Date(searchTerms.inicio).getTime() &&
          fechaEnvio <= new Date(searchTerms.fin).getTime();
      }

      return matchTexto && matchEstado && matchFecha;
    };
  }

  aplicarFiltrosGlobales(valorTexto: string = '') {
    const filtros = {
      texto: valorTexto.trim().toLowerCase(),
      estado: this.filtroEstado,
      inicio: this.fechaInicio,
      fin: this.fechaFin
    };
    this.dataSource.filter = JSON.stringify(filtros);
  }

  limpiarFiltros(inputBusqueda: HTMLInputElement) {
    inputBusqueda.value = '';
    this.filtroEstado = '';
    this.fechaInicio = null;
    this.fechaFin = null;
    this.dataSource.filter = '';
  }

  abrirFormularioEstado(cuenta: CuentaDetalle): void {
    const dialogRef = this.dialog.open(CambiarEstadoDialogComponent, {
      width: '450px',
      disableClose: true,
      data: {
        noCuenta: cuenta.noCuenta,
        listaEstados: this.listaEstadosCatalogo // Pasa los estados con los IDs dinámicos reales
      }
    });

    dialogRef.afterClosed().subscribe(payload => {
      if (payload) {
        this.cuentasService.cambiarEstadoCuenta(cuenta.noCuenta, payload).subscribe({
          next: (cuentaActualizada) => {
            this.snackBar.open('Estado de cuenta actualizado exitosamente.', 'Cerrar', { duration: 4000 });

            if (cuentaActualizada.resultadoTolerancia) {
              this.snackBar.open(`Dictamen: ${cuentaActualizada.resultadoTolerancia} (${cuentaActualizada.tolerancia}%)`, 'OK', { duration: 7000 });
            }

            this.obtenerCuentas();
          },
          error: (err) => {
            const errorMsg = err.error?.mensaje || 'Error al procesar el cambio de estado.';
            this.snackBar.open(errorMsg, 'Entendido', { duration: 6000 });
          }
        });
      }
    });
  }
}
