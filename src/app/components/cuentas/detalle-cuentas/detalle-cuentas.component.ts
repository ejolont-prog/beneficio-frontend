import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router'; // Necesario para routerLink
import { CommonModule } from '@angular/common'; // Necesario para Pipes (date, number) y ngClass
import { MatIconModule } from '@angular/material/icon'; // Necesario para <mat-icon>
import { CuentasService } from '../../../services/cuentas.service';

@Component({
  selector: 'app-detalle-cuentas',
  standalone: true, // Indica que el componente se gestiona a sí mismo
  imports: [
    CommonModule,   // Esto arregla los errores de Pipes (date, number)
    RouterModule,   // Esto arregla el error de routerLink
    MatIconModule   // Esto arregla el error de mat-icon
  ],
  templateUrl: './detalle-cuentas.component.html',
  styleUrls: ['./detalle-cuentas.component.css']
})
export class DetalleCuentasComponent implements OnInit {
  noCuenta: string = '';
  listadoEnvios: any[] = [];
  cargando: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private cuentasService: CuentasService
  ) {}

  ngOnInit(): void {
    // Captura el parámetro de la URL
    this.noCuenta = this.route.snapshot.paramMap.get('noCuenta') || '';

    if (this.noCuenta) {
      this.cargarDatos();
    }
  }

  cargarDatos() {
    this.cargando = true;
    // Asegúrate de que este nombre exista en cuentas.service.ts
    this.cuentasService.getDetalleCuentaPorNoCuenta(this.noCuenta).subscribe({
      next: (data: any) => {
        this.listadoEnvios = data;
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al cargar envíos', err);
        this.cargando = false;
      }
    });
  }
}
