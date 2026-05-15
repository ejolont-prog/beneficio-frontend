import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core'; // <--- MODIFICADO
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

// Websockets
import SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';

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
export class TransporteComponent implements OnInit, OnDestroy { // <--- MODIFICADO
  @ViewChild(MatTable) table!: MatTable<any>;
  private transporteService = inject(TransporteService) as any;
  private dialog = inject(MatDialog);

  private stompClient: any; // <--- AÑADIDO

  dataSource = new MatTableDataSource<any>([]);
  public displayedColumns: string[] = ['agricultor', 'placa', 'estado', 'observaciones', 'acciones'];
  public cargando: boolean = true;

  public listaEstados: any[] = [];
  filtroPlaca: string = '';
  filtroEstado: string = '';

  ngOnInit(): void {
    this.cargarDatos();
    this.cargarEstados();
    this.configurarFiltroPersonalizado();
    this.conectarWebSocket(); // <--- AÑADIDO
  }

  ngOnDestroy(): void {
    // <--- AÑADIDO
    if (this.stompClient) {
      this.stompClient.disconnect();
    }
  }

  conectarWebSocket(): void {
      // 1. Apuntamos al endpoint definido en el Backend de Beneficio
      const socket = new SockJS('http://localhost:8083/ws-beneficio');
      this.stompClient = Stomp.over(socket);

      // Desactiva los mensajes de log en la consola para limpieza,
      // puedes comentarlo si quieres ver el tráfico de datos
      this.stompClient.debug = () => {};

      // 2. Intentamos la conexión
      this.stompClient.connect({}, (frame: any) => {
        console.log('✅ Beneficio conectado a WebSockets');

        // 3. Nos suscribimos al canal (Debe ser el mismo que pusiste en messagingTemplate.convertAndSend)
        this.stompClient.subscribe('/topic/actualizacion-transporte-beneficio', (notificacion: any) => {
          const respuesta = JSON.parse(notificacion.body);
          const data = [...this.dataSource.data]; // Copia de la data actual

          // 4. Buscamos el transporte por ID para actualizar solo esa fila
          const index = data.findIndex(t => t.idtransporte === respuesta.idtransporte);

          if (index !== -1) {
            // Actualizamos los campos que el backend envió en el Map/Payload
            data[index].estado = respuesta.estado || data[index].estado;
            data[index].observaciones = respuesta.observaciones || data[index].observaciones;

            // 5. Refrescamos la tabla de Angular Material
            this.dataSource.data = data;
            console.log('Fila actualizada por WebSocket:', respuesta);
          } else {
            // Si no existe el ID (ej. es un registro nuevo), recargamos la lista completa
            this.cargarDatos();
          }
        });

      }, (error: any) => {
        // 6. Si falla la conexión (ej. servidor caído), reintenta cada 5 segundos
        console.error('Error WS Beneficio:', error);
        setTimeout(() => this.conectarWebSocket(), 5000);
      });
    }

  cargarEstados(): void {
      this.transporteService.obtenerEstadosTransporte().subscribe({
        next: (res: any[]) => {
          this.listaEstados = res;
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
    input.value = input.value.replace(/[^a-zA-Z0-9]/g, '');
    input.value = input.value.toUpperCase();
    this.filtroPlaca = input.value;
  }

  cambiarEstado(element: any) {
    const dialogRef = this.dialog.open(DialogEstadoTransporteComponent, {
      width: '90%',
      maxWidth: '700px',
      data: {
        ...element,
        estadoOriginal: element.nombreEstado
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.transporteService.actualizarEstadoSincronizado(result).subscribe({
          next: () => {
            Swal.close();
            Swal.fire({
              icon: 'success',
              title: 'Se actualizó con éxito.',
              text: 'El estado del transporte se actualizó con éxito',
              confirmButtonColor: '#2c3e50',
              confirmButtonText: 'Ok'
            }).then(() => {
              // Ya no es estrictamente necesario recargar aquí porque el WebSocket lo hará solo,
              // pero lo dejamos por seguridad.
              this.cargarDatos();
            });
          },
          error: (err: any) => {
            Swal.close();
            console.error("Error en la actualización:", err);
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
