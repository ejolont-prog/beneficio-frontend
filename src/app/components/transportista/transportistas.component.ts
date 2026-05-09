import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon'; // 1. IMPORTANTE: Agregar esto

// 2. Ajuste de ruta (verificar si son 2 o 3 niveles de puntos)
import { TransportistaService } from '../../services/transportista.service';
import { DialogEstadoTransportistaComponent } from './dialog-estado-transportista/dialog-estado-transportista.component';

@Component({
  selector: 'app-transportistas',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule // 3. IMPORTANTE: Agregar esto aquí
  ],
  templateUrl: './transportistas.component.html',
  styleUrls: ['./transportistas.component.css'],

})
export class TransportistasComponent implements OnInit {

  public columnas: string[] = ['agricultor', 'cui', 'nombrecompleto', 'estado', 'observaciones', 'acciones'];

  public dataSource = new MatTableDataSource<any>([]);
  public listaEstados: any[] = [];
  public estadoSeleccionado: string = '';

  // 4. Definir el tipo explícitamente para evitar el error 'unknown'
  private transportistaService: TransportistaService = inject(TransportistaService);
  private dialog = inject(MatDialog);
  filtroCui: string = '';
  filtroEstado: string = '';

  ngOnInit(): void {
    this.configurarFiltroPersonalizado();
    this.cargarTransportistas();
    this.cargarEstados();
  }

  configurarFiltroPersonalizado() {

    this.dataSource.filterPredicate = (data: any, filter: string) => {

      const searchTerms = JSON.parse(filter);

      const cuiMatch = data.cui
        ?.toLowerCase()
        .includes((searchTerms.cui || '').toLowerCase());

      const estadoMatch = searchTerms.estado
        ? data.estado === searchTerms.estado
        : true;

      return cuiMatch && estadoMatch;
    };

  }

  cargarTransportistas(): void {
    this.transportistaService.listarTodoDetalle().subscribe({
      next: (res: any) => {
        this.dataSource.data = res;
      },
      error: (err: any) => console.error("Error al cargar transportistas:", err)
    });
  }

  cargarEstados(): void {
    this.transportistaService.obtenerEstadosTransporte().subscribe({
      next: (res: any) => {
        this.listaEstados = res;
      },
      error: (err: any) => console.error("Error al cargar estados:", err)
    });
  }

  aplicarFiltro(event: Event): void {

    this.filtroCui = (event.target as HTMLInputElement).value;

    this.ejecutarFiltro();
  }

  filtrarPorEstado(estado: string): void {

    this.filtroEstado = estado;

    this.ejecutarFiltro();
  }

ejecutarFiltro(): void {

  this.dataSource.filter = JSON.stringify({
    cui: this.filtroCui,
    estado: this.filtroEstado
  });

}

  limpiarFiltros(): void {

    this.filtroCui = '';
    this.filtroEstado = '';
    this.estadoSeleccionado = '';

    this.dataSource.filter = JSON.stringify({
      cui: '',
      estado: ''
    });

  }

  abrirDialogoEstado(element: any): void {
    const dialogRef = this.dialog.open(DialogEstadoTransportistaComponent, {
      width: '90%',
            maxWidth: '700px',
      data: {
        idtransportista: element.idtransportista,
        cui: element.cui,
        estado: element.estado,
        observaciones: element.observaciones
      }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result) {

        this.transportistaService
          .actualizarEstadoSincronizado(result)
          .subscribe({

            next: (res: any) => {

              console.log("Estado actualizado", res);

              alert("Estado actualizado correctamente");

              this.cargarTransportistas();

            },

            error: (err: any) => {

              console.error("Error actualizando estado", err);

              alert(
                err?.error ||
                "Error al actualizar estado"
              );

            }

          });

      }

    });
  }
}
