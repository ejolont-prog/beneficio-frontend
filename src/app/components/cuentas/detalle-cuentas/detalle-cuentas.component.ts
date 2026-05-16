import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CuentasService } from '../../../services/cuentas.service';
import { DetalleCuentaService } from '../../../services/detalle-cuenta.service'; //
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalle-cuentas',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule
  ],
  templateUrl: './detalle-cuentas.component.html',
  styleUrls: ['./detalle-cuentas.component.css']
})
export class DetalleCuentasComponent implements OnInit {
  noCuenta: string = '';
  listadoEnvios: any[] = [];
  cargando: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private cuentasService: CuentasService,
    private detalleCuentaService: DetalleCuentaService //
  ) {}

  ngOnInit(): void {
    // Captura el parámetro de la URL (Debe coincidir con la ruta configurada en tu app.routes.ts)
    this.noCuenta = this.route.snapshot.paramMap.get('noCuenta') || '';

    if (this.noCuenta) {
      this.cargarDatos();
    }
  }

  cargarDatos(): void {
    this.cargando = true;
    this.cuentasService.getDetalleCuentaPorNoCuenta(this.noCuenta).subscribe({
      next: (data: any) => {
        this.listadoEnvios = data;
        this.cargando = false;
        console.log('Envíos cargados en el detalle:', this.listadoEnvios);
      },
      error: (err: any) => {
        console.error('Error al cargar envíos', err);
        this.cargando = false;
      }
    });
  }

  //  Ejecuta la validación técnica con retraso visual de 3 segundos
  ejecutarVerificacion(envio: any): void {
    Swal.fire({
      title: 'Validando Credenciales',
      html: 'Validando estados de <b>Transporte y Transportista</b> en la base de datos...',
      timer: 3000,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false
    }).then((result) => {
      // Al cumplirse los 3 segundos exactos del cronómetro
      if (result.dismiss === Swal.DismissReason.timer) {

        // Evaluamos dinámicamente si tu DTO mapea la llave primaria en minúsculas o camelCase
        const idClave = envio.iddetallecuenta || envio.idDetalleCuenta;

        if (!idClave) {
          Swal.fire('Error local', 'No se detectó el ID de la parcialidad en la fila elegida.', 'warning');
          return;
        }

        // Golpeamos al endpoint del Backend enviando los query params recolectados de la fila
        this.detalleCuentaService.validarRecepcionEnvio(
          idClave,
          envio.placa,
          envio.cuitransportista
        ).subscribe({
          next: (res: any) => {
            if (res.exito) {
              Swal.fire({
                title: '¡Recibido!',
                text: res.mensaje,
                icon: 'success',
                confirmButtonColor: '#2b170e' // Color café de tu paleta
              });
            } else {
              Swal.fire({
                title: 'Rechazado',
                text: res.mensaje,
                icon: 'error',
                confirmButtonColor: '#2b170e'
              });
            }
            // Refrescamos la tabla para que se actualice el estado (ID 21 o 68) en pantalla
            this.cargarDatos();
          },
          error: (err: any) => {
            console.error('Error en la verificación HTTP:', err);
            Swal.fire('Error del sistema', 'No se pudo completar el proceso de validación en la base de datos.', 'error');
          }
        });
      }
    });
  }
}
