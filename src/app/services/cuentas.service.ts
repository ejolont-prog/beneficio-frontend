import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CuentaDetalle {
  idCuenta: number;
  noCuenta: string;
  nitAgricultor?: string;       //
  razonSocial: string;
  pesoTotal: number;
  pesoTotalEsperado?: number;   //
  pesoTotalRecibido?: number;   //
  diferenciaTotal?: number;     //  Agregado
  tolerancia?: number;           //  Agregado
  resultadoTolerancia?: string; //  Agregado
  cantParcialidades: number;
  fechaEnvio: string;
  estadoNombre: string;
}
// Nueva interfaz para recibir el catálogo limpio del Backend
export interface EstadoCatalogo {
  id: number;
  nombre: string;
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
  getDetalleCuentaPorNoCuenta(noCuenta: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/detalle-cuenta/listar/${noCuenta}`);
  }

  // 3. Obtener detalles por parcialidad
  getDetallesParcialidad(noCuenta: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/detalle-cuenta/por-cuenta/${noCuenta}`);
  }

  // 4. Cambiar estado de la cuenta aplicando lógica de Peso Cabal y Tolerancias
  cambiarEstadoCuenta(noCuenta: string, payload: { idEstadoPesaje: number, estadoNombre: string, pesoCabalTotal: number }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/cuentas/${noCuenta}/cambiar-estado`, payload);
  }

  // =========================================================================
  // NUEVO: Método para jalar dinámicamente los estados del grupo 4 (Base de Datos)
  // =========================================================================
  getEstadosCatalogo(): Observable<EstadoCatalogo[]> {
    return this.http.get<EstadoCatalogo[]>(`${this.apiUrl}/cuentas/estados-catalogo`);
  }
  getResumenCuentaBackend(noCuenta: string): Observable<any> {
    // Apunta al nuevo endpoint público que no requiere pasar por el filtro estricto
    return this.http.get(`${this.apiUrl}/cuentas/publico/resumen-ojito/${noCuenta}`);
  }
}
