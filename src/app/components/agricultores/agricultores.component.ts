import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AgricultoresService } from '../../services/agricultores.service';
import { HttpClientModule } from '@angular/common/http';
// --- NUEVOS IMPORTS ---
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogDetalleAgricultorComponent } from './dialog-detalle-agricultor/dialog-detalle-agricultor.component';

export interface Agricultor {
  nit: string;
  nombre: string;
  observaciones?: string;
  fechaCreacion: Date;
}

@Component({
  selector: 'app-agricultores',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    HttpClientModule,
    MatDialogModule // <--- Importante añadirlo aquí también
  ],
  templateUrl: './agricultores.component.html',
  styleUrls: ['./agricultores.component.css']
})
export class AgricultoresComponent implements OnInit {

  displayedColumns: string[] = ['nit', 'nombre', 'observaciones', 'fechaCreacion', 'acciones'];
  dataSource = new MatTableDataSource<Agricultor>([]);
  cargando: boolean = false;

  constructor(
    private agricultoresService: AgricultoresService,
    private dialog: MatDialog // Ahora MatDialog será reconocido
  ) { }

  ngOnInit(): void {
    this.obtenerAgricultores();
  }

  obtenerAgricultores() {
    this.cargando = true;
    this.agricultoresService.getAgricultores().subscribe({
      next: (datos: Agricultor[]) => {
        this.dataSource.data = datos;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al obtener agricultores:', error);
        this.cargando = false;
      }
    });
  }

  soloNumerosYGuion(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    const charStr = String.fromCharCode(charCode);
    if (!/^[0-9-]+$/.test(charStr)) {
      event.preventDefault();
    }
  }

  aplicarFiltroNit(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  limpiarFiltros(input: HTMLInputElement) {
    input.value = '';
    this.dataSource.filter = '';
  }

  verDetalle(agricultor: Agricultor) {
    this.dialog.open(DialogDetalleAgricultorComponent, {
      width: '600px',
      data: agricultor,
      autoFocus: false
    });
  }
}
