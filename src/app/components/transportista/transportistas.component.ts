import { Component, OnInit, OnDestroy, inject } from '@angular/core'; // <--- MODIFICADO
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { TransportistaService } from '../../services/transportista.service';
import { DialogEstadoTransportistaComponent } from './dialog-estado-transportista/dialog-estado-transportista.component';
import Swal from 'sweetalert2';

// Websockets
import SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';

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
    MatIconModule
  ],
  templateUrl: './transportistas.component.html',
  styleUrls: ['./transportistas.component.css'],
})
export class TransportistasComponent implements OnInit, OnDestroy { // <--- MODIFICADO

  public columnas: string[] = ['agricultor', 'cui', 'nombrecompleto', 'estado', 'observaciones', 'acciones'];

  public dataSource = new MatTableDataSource<any>([]);
  public listaEstados: any[] = [];
  public estadoSeleccionado: string = '';

  private transportistaService: TransportistaService = inject(TransportistaService);
  private dialog = inject(MatDialog);
  private stompClient: any; // <--- AÑADIDO

  filtroCui: string = '';
  filtroEstado: string = '';

  ngOnInit(): void {
    this.configurarFiltroPersonalizado();
    this.cargarTransportistas();
    this.cargarEstados();
    this.conectarWebSocket(); // <--- AÑADIDO
  }

  ngOnDestroy(): void {
    // <--- AÑADIDO
    if (this.stompClient) {
      this.stompClient.disconnect();
    }
  }

  conectarWebSocket(): void {
    // <--- AÑADIDO
    const socket = new SockJS('http://localhost:8083/ws-beneficio');
    this.stompClient = Stomp.over(socket);
    this.stompClient.debug = () => {};

    this.stompClient.connect({}, (frame: any) => {
      console.log('✅ Transportistas conectado a WebSockets');

      this.stompClient.subscribe('/topic/actualizacion-transportista-beneficio', (notificacion: any) => {
        const respuesta = JSON.parse(notificacion.body);
        const data = [...this.dataSource.data];

        // Buscamos por idtransportista
        const index = data.findIndex(t => t.idtransportista === respuesta.idtransportista);

        if (index !== -1) {
          data[index].estado = respuesta.estado || data[index].estado;
          data[index].observaciones = respuesta.observaciones || data[index].observaciones;
          this.dataSource.data = data;
        } else {
          this.cargarTransportistas(); // Recargar si es nuevo
        }
      });
    }, (error: any) => {
      console.error('Error WS Transportistas:', error);
      setTimeout(() => this.conectarWebSocket(), 5000);
    });
  }

  configurarFiltroPersonalizado() {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchTerms = JSON.parse(filter);
      const cuiMatch = data.cui
        ?.toLowerCase()
        .includes((searchTerms.cui || '').toLowerCase());
      const estadoMatch = searchTerms.estado ? data.estado === searchTerms.estado : true;
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
    this.dataSource.filter = JSON.stringify({ cui: '', estado: '' });
  }

  abrirDialogoEstado(element: any): void {
    const dialogRef = this.dialog.open(DialogEstadoTransportistaComponent, {
      width: '90%',
      maxWidth: '700px',
      data: {
        ...element,
        estadoOriginal: element.nombreEstado
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.transportistaService.actualizarEstadoSincronizado(result).subscribe({
          next: () => {
            Swal.close();
            Swal.fire({
              icon: 'success',
              title: 'Se actualizó con éxito.',
              text: 'El estado del transportista se actualizó con éxito',
              confirmButtonColor: '#2c3e50'
            }); // Ya no es obligatorio cargarTransportistas() aquí pues el WS lo hará
          },
          error: (err: any) => {
            Swal.close();
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: err?.error || "No se pudo actualizar el estado.",
              confirmButtonColor: '#2c3e50'
            });
          }
        });
      }
    });
  }

  soloNumeros(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  validarSoloNumeros(event: any): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
    this.filtroCui = input.value;
    this.ejecutarFiltro();
  }
}
