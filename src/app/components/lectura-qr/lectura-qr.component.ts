import { Component, OnInit, OnDestroy } from '@angular/core'; // Importamos OnInit y OnDestroy
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BarcodeFormat } from '@zxing/library';
import Swal from 'sweetalert2';

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
export class LecturaQrComponent implements OnInit, OnDestroy { // Implementamos los ciclos de vida
  allowedFormats = [ BarcodeFormat.QR_CODE ];
  qrResultString: string | null = null;
  scannerEnabled: boolean = true; // La cámara se encenderá automáticamente de inmediato
  datosParcialidad: DatosParcialidad | null = null;

  isPaused: boolean = false;
  port: any;
  writer: any;
  arduinoConectado: boolean = false;

  constructor(private http: HttpClient) {}

  // Se ejecuta al aperturar e iniciar la pestaña
  async ngOnInit() {
    console.log("Pestaña Lectura QR abierta. Iniciando cámara e intentando conectar Arduino...");
    await this.autoConectarArduino();
  }

  // Intenta conectar automáticamente si ya existían permisos previos
  async autoConectarArduino() {
    try {
      if ('serial' in navigator) {
        const ports = await (navigator as any).serial.getPorts();

        // Si hay puertos previamente autorizados por el usuario en esta máquina
        if (ports.length > 0) {
          this.port = ports[0]; // Toma el puerto conocido (ej. COM5)
          await this.port.open({ baudRate: 9600 });
          this.writer = this.port.writable.getWriter();
          this.arduinoConectado = true;
          console.log("Arduino conectado automáticamente sin preguntar.");
        } else {
          console.warn("No hay dispositivos Arduino aprobados previamente. Se requerirá activación manual por única vez.");
        }
      }
    } catch (error) {
      console.error("Error en la conexión automática de Arduino:", error);
    }
  }

  // Método de respaldo por si no se conectó automáticamente al abrir la pestaña
  async conectarArduinoManual() {
    try {
      this.port = await (navigator as any).serial.requestPort();
      await this.port.open({ baudRate: 9600 });
      this.writer = this.port.writable.getWriter();
      this.arduinoConectado = true;
      Swal.fire('Conectado', 'Conexión exitosa con el Arduino', 'success');
    } catch (error) {
      console.error("Error Arduino Manual:", error);
      Swal.fire('Error', 'No se pudo conectar al puerto seleccionado', 'error');
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
        console.error("Error en la consulta:", err);
        if(err.status === 404) {
          Swal.fire('No encontrado', 'La parcialidad no existe en los registros de Beneficio.', 'error');
        }
      }
    });
  }

  onCodeResult(result: string) {
    if (this.isPaused) return;

    try {
      this.isPaused = true;
      this.qrResultString = result;
      const dataObj = JSON.parse(result);

      this.consultarDatos(dataObj);

      // Espera de transferencia / lecturas consecutivas
      setTimeout(() => {
        this.isPaused = false;
      }, 5000);

    } catch (e) {
      console.error("QR no válido", e);
      this.isPaused = false;
    }
  }

  limpiarLectura() {
    this.qrResultString = null;
    this.datosParcialidad = null;
    this.scannerEnabled = true;
  }

  async abrirTalanquera() {
    if (!this.datosParcialidad) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Primero debe escanear una parcialidad válida',
        confirmButtonColor: '#5D4037'
      });
      return;
    }

    const url = 'http://localhost:8083/api/beneficio/movimiento-talanquera';
    const body = {
      noParcialidad: this.datosParcialidad.no_parcialidad,
      idUsuario: 1
    };

    this.http.post(url, body).subscribe({
      next: async (res: any) => {

        // Si la autoconexión falló o no se ha iniciado el puerto físico
        if (!this.writer) {
          Swal.fire({
            title: 'Arduino Desconectado',
            text: 'Presione OK para seleccionar el puerto COM de la talanquera',
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#5D4037'
          }).then(async (result) => {
            if (result.isConfirmed) {
              await this.conectarArduinoManual();
              this.enviarSenalApertura(res.mensaje);
            }
          });
        } else {
          this.enviarSenalApertura(res.mensaje);
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

  // Lógica aislada para enviar la transferencia de datos/instrucción string al Arduino Uno
  async enviarSenalApertura(mensajeServidor: string) {
    try {
      const encoder = new TextEncoder();
      await this.writer.write(encoder.encode("OPEN_GATE\n"));

      Swal.fire({
        icon: 'success',
        title: 'Acceso Concedido',
        text: mensajeServidor,
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

  procesarRecepcion(tipo: string) {
    console.log(`Procesando ${tipo} para parcialidad:`, this.datosParcialidad?.no_parcialidad);
  }

  // Buenas prácticas de arquitectura de sistemas: Liberar el buffer al salir de la pestaña
  async ngOnDestroy() {
    if (this.writer) {
      this.writer.releaseLock();
    }
    if (this.port) {
      await this.port.close();
    }
  }
}
