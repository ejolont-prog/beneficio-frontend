import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Angular Material Imports
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

interface Agricultor {
  idUsuario: number;
  nombreCompleto: string;
  dpi: string;
  ubicacion: string;
  estado: boolean;
}

@Component({
  selector: 'app-agricultores',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './agricultores.component.html',
  styleUrls: ['./agricultores.component.css']
})
export class AgricultoresComponent implements OnInit {

  displayedColumns: string[] = ['idUsuario', 'nombreCompleto', 'dpi', 'ubicacion', 'estado', 'acciones'];
  public agricultores: Agricultor[] = [];
  public cargando: boolean = true;

  constructor() { }

  ngOnInit(): void {
    this.cargarAgricultores();
  }

  cargarAgricultores(): void {
    this.cargando = true;
    // Simulación de carga (Sustituir por tu servicio de Spring Boot)
    setTimeout(() => {
      this.agricultores = [
        { idUsuario: 101, nombreCompleto: 'Juan Pérez García', dpi: '2541 45874 0101', ubicacion: 'Aldea El Socorro', estado: true },
        { idUsuario: 102, nombreCompleto: 'María López Hernández', dpi: '1890 32145 0501', ubicacion: 'Finca La Esperanza', estado: true },
        { idUsuario: 103, nombreCompleto: 'Carlos Ruíz Ortiz', dpi: '3005 11223 0101', ubicacion: 'Sector Los Planes', estado: false }
      ];
      this.cargando = false;
    }, 800);
  }

  editarAgricultor(agricultor: Agricultor): void {
    console.log('Editando agricultor:', agricultor.idUsuario);
  }

  eliminarAgricultor(id: number): void {
    if (confirm('¿Desea eliminar este registro de agricultor?')) {
      this.agricultores = this.agricultores.filter(a => a.idUsuario !== id);
    }
  }
}
