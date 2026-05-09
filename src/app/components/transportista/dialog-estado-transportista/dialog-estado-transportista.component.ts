import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

// CORRECCIÓN DE RUTA: Subimos 3 niveles para llegar a la raíz de app y luego a services
import { TransportistaService } from '../../../services/transportista.service';

@Component({
  selector: 'app-dialog-estado-transportista',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './dialog-estado-transportista.component.html',
  styleUrls: ['./dialog-estado-transportista.component.css']
})
export class DialogEstadoTransportistaComponent implements OnInit {

  public listaEstados: any[] = [];

  // Especificamos el tipo explícitamente para evitar el error 'unknown'
  private service: TransportistaService = inject(TransportistaService);

  constructor(
    public dialogRef: MatDialogRef<DialogEstadoTransportistaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.cargarEstados();
  }

  cargarEstados() {

    this.service.obtenerEstadosTransporte().subscribe({

      next: (res: any[]) => {

        this.listaEstados = res;

        // CONVERTIR NOMBRE -> ID
        const estadoActual = this.listaEstados.find(
          (e: any) => e.nombre === this.data.estado
        );

        if (estadoActual) {

          this.data.estadoOriginal = this.data.estado;

          this.data.estado = estadoActual.id;
        }

      },

      error: (err: any) => {
        console.error('Error al cargar estados', err);
      }

    });

  }

  formValido(): boolean {

    return !!(
      this.data.cui &&
      this.data.estado &&
      this.data.observaciones &&
      this.data.observaciones.trim().length > 0
    );

  }

  actualizar(): void {

    const estadoSeleccionado = this.listaEstados.find(
      (e: any) => e.id === this.data.estado
    );

    const nombreNuevoEstado = estadoSeleccionado
      ? estadoSeleccionado.nombre
      : '';

    // VALIDAR SI ES EL MISMO
    if (
      nombreNuevoEstado?.trim().toLowerCase() ===
      this.data.estadoOriginal?.trim().toLowerCase()
    ) {

      alert(`El transportista ya tiene estado "${nombreNuevoEstado}"`);

      return;
    }

    const payloadUpdate = {
      idtransportista: this.data.idtransportista,
      cui: this.data.cui,
      nuevoEstadoIdBeneficio: this.data.estado,
      nombreEstado: nombreNuevoEstado,
      observaciones: this.data.observaciones
    };

    this.dialogRef.close(payloadUpdate);
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
