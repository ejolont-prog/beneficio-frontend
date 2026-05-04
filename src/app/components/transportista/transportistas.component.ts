import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Angular Material Imports
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

interface Transportista {
  idUsuario: number;
  nombreCompleto: string;
  licencia: string;
  telefono: string;
  estado: boolean;
}

@Component({
  selector: 'app-transportistas',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './transportistas.component.html',
  styleUrls: ['./transportistas.component.css']
})
export class TransportistasComponent implements OnInit {

  displayedColumns: string[] = ['idUsuario', 'nombreCompleto', 'licencia', 'telefono', 'estado', 'acciones'];
  public transportistas: Transportista[] = [];
  public cargando: boolean = true;

  constructor() { }

  ngOnInit(): void {
    this.cargarTransportistas();
  }

  cargarTransportistas(): void {
    this.cargando = true;
    // Simulación de carga desde el backend
    setTimeout(() => {
      this.transportistas = [
        { idUsuario: 201, nombreCompleto: 'Ricardo Méndez', licencia: 'A-458792', telefono: '+502 5544-3322', estado: true },
        { idUsuario: 202, nombreCompleto: 'Esteban Quito', licencia: 'B-112233', telefono: '+502 4433-2211', estado: true },
        { idUsuario: 203, nombreCompleto: 'Mario Bros', licencia: 'A-998877', telefono: '+502 3322-1100', estado: false }
      ];
      this.cargando = false;
    }, 800);
  }

  editarTransportista(t: Transportista): void {
    console.log('Editando transportista ID:', t.idUsuario);
  }

  eliminarTransportista(id: number): void {
    if (confirm('¿Desea dar de baja a este transportista?')) {
      this.transportistas = this.transportistas.filter(t => t.idUsuario !== id);
    }
  }
}
