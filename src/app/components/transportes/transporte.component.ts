import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Angular Material Imports
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

interface Transporte {
  idTransporte: number;
  placa: string;
  tipoVehiculo: string;
  capacidadMaxima: string;
  marca: string;
  estado: 'Disponible' | 'En Ruta' | 'Mantenimiento';
}

@Component({
  selector: 'app-transporte',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule
  ],
  templateUrl: './transporte.component.html',
  styleUrls: ['./transporte.component.css']
})
export class TransporteComponent implements OnInit {

  displayedColumns: string[] = ['idTransporte', 'placa', 'tipoVehiculo', 'capacidad', 'estado', 'acciones'];
  public transportes: Transporte[] = [];
  public cargando: boolean = true;

  constructor() { }

  ngOnInit(): void {
    this.cargarTransportes();
  }

  cargarTransportes(): void {
    this.cargando = true;
    // Simulación de datos de la flota
    setTimeout(() => {
      this.transportes = [
        { idTransporte: 1, placa: 'C-123ABC', tipoVehiculo: 'Camión 10 Ton', capacidadMaxima: '200 Quintales', marca: 'Hino', estado: 'Disponible' },
        { idTransporte: 2, placa: 'C-456DEF', tipoVehiculo: 'Pick-up', capacidadMaxima: '25 Quintales', marca: 'Toyota', estado: 'En Ruta' },
        { idTransporte: 3, placa: 'C-789GHI', tipoVehiculo: 'Trailer', capacidadMaxima: '500 Quintales', marca: 'Freightliner', estado: 'Mantenimiento' }
      ];
      this.cargando = false;
    }, 700);
  }

  getBadgeClass(estado: string): string {
    switch (estado) {
      case 'Disponible': return 'bg-success';
      case 'En Ruta': return 'bg-info text-dark';
      case 'Mantenimiento': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  }

  editarTransporte(t: Transporte): void {
    console.log('Editando unidad:', t.placa);
  }

  eliminarTransporte(id: number): void {
    if (confirm('¿Desea eliminar esta unidad de la flota?')) {
      this.transportes = this.transportes.filter(t => t.idTransporte !== id);
    }
  }
}
