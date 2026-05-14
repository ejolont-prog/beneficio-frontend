import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogEstadoTransporteComponent } from './dialog-estado-transporte/dialog-estado-transporte.component';
// Angular Material Imports
import { MatTableDataSource, MatTableModule, MatTable } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TransporteService } from '../../services/transporte.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-transporte',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './transporte.component.html',
  styleUrls: ['./transporte.component.css']
})
export class TransporteComponent implements OnInit {
  @ViewChild(MatTable) table!: MatTable<any>;
  private transporteService = inject(TransporteService) as any;
  private dialog = inject(MatDialog);

  dataSource = new MatTableDataSource<any>([]);
  // Columnas solicitadas: agricultor, placa, estado, observaciones, acciones
  public displayedColumns: string[] = ['agricultor', 'placa', 'estado', 'observaciones', 'acciones'];
  public cargando: boolean = true;

  public listaEstados: any[] = [];
  filtroPlaca: string = '';
  filtroEstado: string = '';

  ngOnInit(): void {
    this.cargarDatos();
    this.cargarEstados();
    this.configurarFiltroPersonalizado();
  }

  cargarEstados(): void {
      this.transporteService.obtenerEstadosTransporte().subscribe({
        next: (res: any[]) => {
          this.listaEstados = res; // Se espera que traiga [{id: 7, nombre: 'Activo'}, ...]
        },
        error: (err: any) => console.error('Error al cargar catálogo de estados', err)
      });
    }

  cargarDatos(): void {
    this.cargando = true;

    this.transporteService.obtenerTransportesBeneficio().subscribe({
      next: (data: any) => {
        this.dataSource.data = data;
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error:', err);
        this.cargando = false;
      }
    });
  }

 configurarFiltroPersonalizado() {
   this.dataSource.filterPredicate = (data: any, filter: string) => {
     const searchTerms = JSON.parse(filter);
     const placaMatch = data.placa
       ?.toLowerCase()
       .includes((searchTerms.placa || '').toLowerCase());

     // CAMBIO AQUÍ: data.nombre_estado ahora es data.estado por el alias del SQL
    const estadoMatch = searchTerms.estado ? data.estado === searchTerms.estado : true;

     return placaMatch && estadoMatch;
   };
 }

  aplicarFiltroPlaca(event: Event) {
    const valor = (event.target as HTMLInputElement).value;
      this.filtroPlaca = valor.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      this.ejecutarFiltro();
  }

  aplicarFiltroEstado(valor: string) {
    this.filtroEstado = valor;
    this.ejecutarFiltro();
  }

  ejecutarFiltro() {
    this.dataSource.filter = JSON.stringify({
      placa: this.filtroPlaca,
      estado: this.filtroEstado
    });
  }

  limpiarFiltros(input: HTMLInputElement) {
    input.value = '';
    this.filtroPlaca = '';
    this.filtroEstado = '';
    this.dataSource.filter = '';
  }

  getBadgeClass(estado: string): string {
    return estado === 'Activo' ? 'bg-success text-white' : 'bg-danger text-white';
  }

  validarInputPlaca(event: Event): void {
    const input = event.target as HTMLInputElement;

    // Elimina todo lo que NO sea letra o número
    input.value = input.value.replace(/[^a-zA-Z0-9]/g, '');

    // Opcional: convertir a mayúsculas automáticamente
    input.value = input.value.toUpperCase();

    this.filtroPlaca = input.value;
  }

  cambiarEstado(element: any) {
    const dialogRef = this.dialog.open(DialogEstadoTransporteComponent, {
      width: '90%',
      maxWidth: '700px',
      data: {
        ...element,
        estadoOriginal: element.nombreEstado // Para la validación de "Sin cambios"
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        // El loading ya se inició en el diálogo, aquí procesamos la respuesta
        this.transporteService.actualizarEstadoSincronizado(result).subscribe({
          next: () => {
            // 1. Cerramos el loading de "Procesando"
            Swal.close();

            // 2. Mensaje de éxito
            Swal.fire({
              icon: 'success',
              title: 'Se actualizó con éxito.',
              text: 'El estado del transporte se actualizó con éxito',
              confirmButtonColor: '#2c3e50',
              confirmButtonText: 'Ok'
            }).then(() => {
              this.cargarDatos(); // Recarga la tabla para ver el cambio
            });
          },
          error: (err: any) => {
            // 1. Cerramos el loading
            Swal.close();

            console.error("Error en la actualización:", err);

            // 2. Manejo de mensaje de error dinámico
            let mensajeError = "No se pudo conectar con el servidor o el acceso fue denegado (403).";
            if (err.error && typeof err.error === 'string') {
              mensajeError = err.error;
            } else if (err.error?.message) {
              mensajeError = err.error.message;
            }

            Swal.fire({
              icon: 'error',
              title: 'Error al sincronizar',
              text: mensajeError,
              confirmButtonColor: '#2c3e50',
              confirmButtonText: 'Ok'
            });
          }
        });
      }
    });
  }
}
