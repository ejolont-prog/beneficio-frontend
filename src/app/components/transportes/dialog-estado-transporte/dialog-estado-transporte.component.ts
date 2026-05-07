import { Component, Inject, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { TransportistaService } from '../../../services/transportista.service'; // Ajusta la ruta si es necesario

@Component({
  selector: 'app-dialog-estado-transporte',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './dialog-estado-transporte.component.html',
  styleUrls: ['./dialog-estado-transporte.component.css']
})
export class DialogEstadoTransporteComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<DialogEstadoTransporteComponent>);
  private transporteService = inject(TransportistaService); // Inyectamos el servicio

  public listaEstados: any[] = [];
  public cargandoEstados: boolean = true;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
    this.cargarEstadosDesdeBD();
  }

  cargarEstadosDesdeBD(): void {
    this.transporteService.obtenerEstadosTransporte().subscribe({
      next: (res: any[]) => {
        this.listaEstados = res;
        this.cargandoEstados = false;

        // LÓGICA DE SELECCIÓN POR DEFECTO:
        // Si data.estado no viene como ID, sino como objeto o nombre, lo mapeamos aquí
        const estadoActual = this.listaEstados.find(
          e => e.nombre === this.data.estado
        );

        if (estadoActual) {
          this.data.estadoOriginal = this.data.estado;
          this.data.estado = estadoActual.id;
        }
      },
      error: (err: any) => {
        console.error('Error al cargar estados en modal', err);
        this.cargandoEstados = false;
      }
    });
  }

  // Validación: Todos los campos deben tener contenido
  formValido(): boolean {
    return this.data.placa &&
           this.data.estado &&
           this.data.observaciones?.trim().length > 0;
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  actualizar(): void {

    // OBTENER EL ESTADO SELECCIONADO
    const estadoSeleccionado = this.listaEstados.find(
      e => e.id === this.data.estado
    );

    const nombreNuevoEstado = estadoSeleccionado
      ? estadoSeleccionado.nombre
      : '';

    // VALIDAR SI ES EL MISMO ESTADO
    if (nombreNuevoEstado === this.data.estadoOriginal) {

      alert(`El transporte ya tiene estado "${nombreNuevoEstado}"`);

      return;
    }

    // PREPARAR PAYLOAD
    const payloadUpdate = {
      idtransporte: this.data.idtransporte,
      placa: this.data.placa,
      nuevoEstadoIdBeneficio: this.data.estado,
      nombreEstado: nombreNuevoEstado,
      observaciones: this.data.observaciones
    };

    // ENVIAR AL COMPONENTE PADRE
    this.dialogRef.close(payloadUpdate);
  }

}
