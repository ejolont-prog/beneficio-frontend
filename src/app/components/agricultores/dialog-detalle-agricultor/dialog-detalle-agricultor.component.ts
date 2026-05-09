import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AgricultoresService } from '../../../services/agricultores.service';

@Component({
  selector: 'app-dialog-detalle-agricultor',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './dialog-detalle-agricultor.component.html',
  styleUrls: ['./dialog-detalle-agricultor.component.css']
})
export class DialogDetalleAgricultorComponent implements OnInit {

  conteos = {
    cuentas: 0,
    transportes: 0,
    transportistas: 0
  };
  cargando = true;

  constructor(
    public dialogRef: MatDialogRef<DialogDetalleAgricultorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, // Recibe el objeto Agricultor
    private service: AgricultoresService
  ) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.service.obtenerConteosDetalle(this.data.nit).subscribe({
      next: (res) => {
        this.conteos = res;
        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }

  cerrar() {
    this.dialogRef.close();
  }
}
