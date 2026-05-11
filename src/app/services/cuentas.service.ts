import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CuentaDetalle {
  idCuenta: number;
  noCuenta: string;
  razonSocial: string;
  pesoTotal: number;
  cantParcialidades: number;
  fechaEnvio: string;
  estadoNombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class CuentasService {
  private apiUrl = 'http://localhost:8083/api';

  constructor(private http: HttpClient) { }

  // 1. Obtener listado general de cuentas
  getCuentas(): Observable<CuentaDetalle[]> {
    return this.http.get<CuentaDetalle[]>(`${this.apiUrl}/cuentas/listar`);
  }

  // 2. Este parece ser el que necesitas para el componente de detalles
  // Ajustado a la ruta real de tu Controlador Java: /api/detalle-cuenta/listar/{nocuenta}
  getDetalleCuentaPorNoCuenta(noCuenta: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/detalle-cuenta/listar/${noCuenta}`);
  }

  // 3. Nota: Si tienes otro método en Java para "por-cuenta", mantenlo,
  // de lo contrario, puedes borrar este para no confundirte.
  getDetallesParcialidad(noCuenta: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/detalle-cuenta/por-cuenta/${noCuenta}`);
  }
}
