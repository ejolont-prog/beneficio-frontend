import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // 👈 Importante para los filtros
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select'; // 👈 Nuevo
import { MatDatepickerModule } from '@angular/material/datepicker'; // 👈 Nuevo
import { MatNativeDateModule } from '@angular/material/core'; // 👈 Nuevo
import { CuentasService, CuentaDetalle } from '../../services/cuentas.service';

import { MatMenuModule } from '@angular/material/menu'; // 👈 ESTA FALTA

@Component({
  selector: 'app-cuentas',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule,
  ],
  templateUrl: './cuentas.component.html',
  styleUrls: ['./cuentas.component.css']
})
export class CuentasComponent implements OnInit {
  dataSource = new MatTableDataSource<CuentaDetalle>([]);
  columnas: string[] = ['noCuenta', 'agricultor', 'pesoTotal', 'parcialidades', 'fecha', 'estado', 'acciones'];
  cargando: boolean = true;

  // Variables para filtros FA01-FA04
  filtroEstado: string = '';
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;

  listaEstados = ['Creada', 'En Proceso', 'Finalizada', 'Liquidada'];

  constructor(private cuentasService: CuentasService) { }

  ngOnInit(): void {
    this.obtenerCuentas();
    this.configurarPredicadoFiltro();
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

  // FA01 - FA04: Configuración de filtro avanzado
  configurarPredicadoFiltro() {
    this.dataSource.filterPredicate = (data: CuentaDetalle, filter: string) => {
      const searchTerms = JSON.parse(filter);

      // Filtro por NoCuenta o Agricultor
      const matchTexto = data.noCuenta.toLowerCase().includes(searchTerms.texto) ||
        data.razonSocial.toLowerCase().includes(searchTerms.texto);

      // Filtro por Estado
      const matchEstado = searchTerms.estado ? data.estadoNombre === searchTerms.estado : true;

      // Filtro por Rango de Fechas
      let matchFecha = true;
      if (searchTerms.inicio && searchTerms.fin) {
        const fechaEnvio = new Date(data.fechaEnvio).getTime();
        matchFecha = fechaEnvio >= new Date(searchTerms.inicio).getTime() &&
          fechaEnvio <= new Date(searchTerms.fin).getTime();
      }

      return matchTexto && matchEstado && matchFecha;
    };
  }

  aplicarFiltrosGlobales(valorTexto: string = '') {
    const filtros = {
      texto: valorTexto.trim().toLowerCase(),
      estado: this.filtroEstado,
      inicio: this.fechaInicio,
      fin: this.fechaFin
    };
    this.dataSource.filter = JSON.stringify(filtros);
  }

  limpiarFiltros(inputBusqueda: HTMLInputElement) {
    inputBusqueda.value = '';
    this.filtroEstado = '';
    this.fechaInicio = null;
    this.fechaFin = null;
    this.dataSource.filter = '';
  }

  // FA14: Simulación de cambio de estado (requiere endpoint en service)
  cambiarEstado(cuenta: CuentaDetalle, nuevoEstado: string) {
    // Aquí validarías lógica de negocio (ej. no pasar de Creada a Liquidada directo)
    console.log(`Cambiando cuenta ${cuenta.noCuenta} a ${nuevoEstado}`);
    // this.cuentasService.actualizarEstado(cuenta.idCuenta, nuevoEstado)...
  }
}
