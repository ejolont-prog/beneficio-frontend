import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ZXingScannerModule } from '@zxing/ngx-scanner'; // Librería que instalaste
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
  qrResultString: string = '';
  scannerEnabled: boolean = true;

  // Se ejecuta cuando el escáner detecta algo
  onCodeResult(resultString: string) {
    this.qrResultString = resultString;
    console.log('Contenido del QR:', resultString);
    // Podrías desactivar el escáner tras la primera lectura si quisieras:
    // this.scannerEnabled = false;
  }

  limpiarLectura() {
    this.qrResultString = '';
    this.scannerEnabled = true;
  }
}
