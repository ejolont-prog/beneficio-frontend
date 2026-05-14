import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider'; // Añadido para mejor diseño
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BarcodeFormat } from '@zxing/library';
import Swal from 'sweetalert2';

// Interfaz basada en tu SELECT exitoso
interface DatosParcialidad {
  no_parcialidad: number;
  fecha_recepcion: string | null;
  transporte_placa: string;
  transporte_estado: string;
  transporte_observaciones: string;
  transportista_cui: string;
  transportista_nombre: string;
  transportista_estado: string;
  transportista_observaciones: string;
}

@Component({
  selector: 'app-lectura-qr',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ZXingScannerModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatDividerModule, HttpClientModule
  ],
  templateUrl: './lectura-qr.component.html',
  styleUrls: ['./lectura-qr.component.css']
})
export class LecturaQrComponent {
  allowedFormats = [ BarcodeFormat.QR_CODE ];
  qrResultString: string | null = null;
  scannerEnabled: boolean = true;
  datosParcialidad: DatosParcialidad | null = null; // Almacena el resultado del SQL

  isPaused: boolean = false;
  port: any;
  writer: any;

  constructor(private http: HttpClient) {}

  async conectarArduino() {
    try {
      this.port = await (navigator as any).serial.requestPort();
      await this.port.open({ baudRate: 9600 });
      this.writer = this.port.writable.getWriter();
    } catch (error) {
      console.error("Error Arduino:", error);
    }
  }

  consultarDatos(dto: any) {
    const url = 'http://localhost:8083/api/beneficio/consulta-qr';

    console.log("Enviando petición a:", url, "con el DTO:", dto);

    this.http.post<DatosParcialidad>(url, dto).subscribe({
      next: (res) => {
        console.log("Datos recibidos de Beneficio:", res);
        this.datosParcialidad = res;
      },
      error: (err) => {
        // Si recibes 404 aquí ahora, será el mensaje de "No existe en la DB"
        console.error("Error en la consulta:", err);
        if(err.status === 404) {
          alert("La parcialidad no existe en los registros de Beneficio.");
        }
      }
    });
  }

  onCodeResult(result: string) {
    // Si estamos en pausa, ignoramos cualquier nueva lectura del sensor
    if (this.isPaused) return;

    try {
      this.isPaused = true; // Bloqueamos nuevas lecturas lógicas
      this.qrResultString = result;
      const dataObj = JSON.parse(result);

      this.consultarDatos(dataObj);

      // Esperamos 5 segundos antes de permitir otra lectura
      setTimeout(() => {
        this.isPaused = false;
        // Opcional: si quieres que al terminar la pausa se limpie la info anterior
        // this.datosParcialidad = null;
      }, 5000);

    } catch (e) {
      console.error("QR no válido", e);
      this.isPaused = false;
    }
  }

  // Actualiza también el limpiar para que sea coherente
  limpiarLectura() {
    this.qrResultString = null;
    this.datosParcialidad = null;
    this.scannerEnabled = true; // Aseguramos que esté encendido
  }


  async abrirTalanquera() {
    if (!this.datosParcialidad) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Primero debe escanear una parcialidad válida',
        confirmButtonColor: '#5D4037' // Un tono café acorde a tu tema
      });
      return;
    }

    const url = 'http://localhost:8083/api/beneficio/movimiento-talanquera';
    const body = {
      noParcialidad: this.datosParcialidad.no_parcialidad,
      idUsuario: 1 // Idealmente: this.authService.getUsuarioId()
    };

    this.http.post(url, body).subscribe({
      next: async (res: any) => {
        // 1. Abrir físicamente con Arduino
        if (!this.writer) await this.conectarArduino();

        if (this.writer) {
          try {
            const encoder = new TextEncoder();
            await this.writer.write(encoder.encode("OPEN_GATE\n"));

            // 2. Mostrar feedback visual con Swal
            Swal.fire({
              icon: 'success',
              title: 'Acceso Concedido',
              text: res.mensaje, // "Ingreso registrado" o "Salida registrada"
              timer: 3000,
              timerProgressBar: true,
              showConfirmButton: false
            });

            setTimeout(() => this.limpiarLectura(), 6000);
          } catch (error) {
            console.error("Error al escribir en Arduino:", error);
            Swal.fire('Error', 'No se pudo comunicar con la talanquera física', 'error');
          }
        }
      },
      error: (err) => {
        console.error("Error en el servidor:", err);
        Swal.fire({
          icon: 'error',
          title: 'Error de seguridad',
          text: 'No se pudo registrar el movimiento en bitácora. La talanquera no se abrirá.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  // Métodos para los botones FA10 y FA11
  procesarRecepcion(tipo: string) {
    console.log(`Procesando ${tipo} para parcialidad:`, this.datosParcialidad?.no_parcialidad);
    // Aquí llamarías a un POST para actualizar el estado a FA10 o FA11
  }
}
