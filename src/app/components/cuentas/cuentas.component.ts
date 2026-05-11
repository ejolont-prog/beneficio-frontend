import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // 👈 Agregar esto
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CuentasService, CuentaDetalle } from '../../services/cuentas.service';

@Component({
  selector: 'app-cuentas',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink, // 👈 Agregar esto
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './cuentas.component.html',
  styleUrls: ['./cuentas.component.css']
})
export class CuentasComponent implements OnInit {

  // Variables necesarias para la tabla
  dataSource = new MatTableDataSource<CuentaDetalle>([]);
  columnas: string[] = ['noCuenta', 'agricultor', 'pesoTotal', 'parcialidades', 'fecha', 'estado', 'acciones'];
  cargando: boolean = true;

  constructor(private cuentasService: CuentasService) { }

  ngOnInit(): void {
    this.obtenerCuentas();
  }

  obtenerCuentas(): void {
    this.cargando = true;
    this.cuentasService.getCuentas().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.cargando = false;
      }
    });
  }

  // Métodos para los filtros que pide el HTML
  aplicarFiltro(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  limpiarFiltro(input: HTMLInputElement) {
    input.value = '';
    this.dataSource.filter = '';
  }


  // Define estas variables en tu clase
  mostrarDetalle = false;
  cuentaSeleccionada: string = '';
  parcialidades: any[] = [];

// Función para el botón "Ver Detalle"
  verDetalle(noCuenta: string) {
    this.cuentaSeleccionada = noCuenta;
    this.cuentasService.getDetallesParcialidad(noCuenta).subscribe({
      next: (data) => {
        this.parcialidades = data;
        this.mostrarDetalle = true;
      },
      error: (err) => console.error('Error al cargar detalles', err)
    });
  }

  regresarAListado() {
    this.mostrarDetalle = false;
    this.parcialidades = [];
  }

}
