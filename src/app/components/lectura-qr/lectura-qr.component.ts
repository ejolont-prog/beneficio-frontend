import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-lectura-qr',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ZXingScannerModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './lectura-qr.component.html',
  styleUrls: ['./lectura-qr.component.css']
})
export class LecturaQrComponent {
  // Cambiamos el tipo para que acepte null al limpiar
  qrResultString: string | null = null;
  scannerEnabled: boolean = true;

  port: any;
  writer: any;

  // 1. CONEXIÓN ARDUINO
  async conectarArduino() {
    try {
      this.port = await (navigator as any).serial.requestPort();
      await this.port.open({ baudRate: 9600 });
      this.writer = this.port.writable.getWriter();
      console.log("Conectado al puerto serial");
    } catch (error) {
      console.error("No se pudo conectar al Arduino:", error);
      alert("Error al conectar con el puerto USB. Asegúrate de seleccionar el dispositivo.");
    }
  }

  // 2. UNA SOLA VERSIÓN DE LA FUNCIÓN DE LECTURA
  onCodeResult(result: string) {
    this.qrResultString = result;
    console.log('Contenido del QR:', result);
  }

  // 3. LIMPIEZA DE PANTALLA
  limpiarLectura() {
    this.qrResultString = null;
    this.scannerEnabled = false;
    // Reiniciamos el scanner tras un breve delay
    setTimeout(() => this.scannerEnabled = true, 100);
  }

  // 4. LÓGICA DE LA TALANQUERA
  async abrirTalanquera() {
    if (!this.writer) {
      await this.conectarArduino();
    }

    if (this.writer) {
      try {
        const encoder = new TextEncoder();
        await this.writer.write(encoder.encode("OPEN_GATE\n"));
        console.log("Comando enviado: OPEN_GATE");

        // Esperamos a que el proceso de Arduino (5 seg) termine + margen
        setTimeout(() => {
          this.limpiarLectura();
        }, 6000);

      } catch (error) {
        console.error("Error al enviar datos al Arduino", error);
      }
    }
  }

  irParcialidad() {
    console.log('Navegando a parcialidad...');
    this.limpiarLectura();
    // Aquí puedes añadir: this.router.navigate(['/ruta']);
  }
}
