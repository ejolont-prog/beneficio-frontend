import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Definimos la interfaz según lo que devuelve el backend
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
  // Ajusta la URL al puerto 8083 y tu endpoint
  private apiUrl = 'http://localhost:8083/api/cuentas/listar';

  constructor(private http: HttpClient) { }

  getCuentas(): Observable<CuentaDetalle[]> {
    return this.http.get<CuentaDetalle[]>(this.apiUrl);
  }
}
