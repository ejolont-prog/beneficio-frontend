import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {API_BASE_URL, API_BENEFICIO} from '../api.config'; // Asegúrate de que apunte correctamente a tu config global

@Injectable({
  providedIn: 'root'
})
export class DetalleCuentaService {

  // URL base apuntando al controlador de DetalleCuentaREST en el backend (Puerto 8083 de Beneficio)
  private readonly URL = `${API_BENEFICIO}/detalle-cuenta`;

  constructor(private http: HttpClient) {}


  listarParcialidades(nocuenta: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.URL}/listar/${nocuenta}`);
  }

  listarCatalogosPorId(idCatalogo: number): Observable<any[]> {
    // ✅ CORREGIDO: Ahora apunta a http://localhost:8082/api/beneficio/catalogos/3
    // Esta ruta ya está permitida en tu JwtFilter mediante: path.startsWith("/api/beneficio/")
    return this.http.get<any[]>(`${this.URL}/catalogos/${idCatalogo}`);
  }
  validarRecepcionEnvio(idDetalle: number, placa: string, cui: string): Observable<any> {
    return this.http.put<any>(`${this.URL}/validar-recepcion/${idDetalle}?placa=${placa}&cui=${cui}`, {});
  }
}
