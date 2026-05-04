import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Angular Material Imports
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

interface Cuenta {
  idUsuario: number; // Basado en tu estructura de base de datos
  nombreCuenta: string;
  tipo: string;
  estado: boolean;
}

@Component({
  selector: 'app-cuentas',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './cuentas.component.html',
  styleUrls: ['./cuentas.component.css']
})
export class CuentasComponent implements OnInit {

  // Definimos las columnas que se mostrarán en la mat-table
  displayedColumns: string[] = ['idUsuario', 'nombreCuenta', 'tipo', 'estado', 'acciones'];

  public cuentas: Cuenta[] = [];
  public cargando: boolean = true;

  constructor() { }

  ngOnInit(): void {
    this.cargarCuentas();
  }

  cargarCuentas(): void {
    this.cargando = true;
    // Simulación de carga (Sustituir por tu Servicio de Spring Boot)
    setTimeout(() => {
      this.cuentas = [
        { idUsuario: 1, nombreCuenta: 'Caja Chica Central', tipo: 'Efectivo', estado: true },
        { idUsuario: 2, nombreCuenta: 'Banco Industrial - Operaciones', tipo: 'Banco', estado: true },
        { idUsuario: 3, nombreCuenta: 'Cuenta de Gastos Varios', tipo: 'Gasto', estado: false }
      ];
      this.cargando = false;
    }, 800);
  }

  editarCuenta(cuenta: Cuenta): void {
    console.log('Editando:', cuenta.idUsuario);
  }

  eliminarCuenta(id: number): void {
    if (confirm('¿Desea eliminar esta cuenta?')) {
      this.cuentas = this.cuentas.filter(c => c.idUsuario !== id);
    }
  }
}
