import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransporteService {
  private http = inject(HttpClient);

  // URLs específicas de Transporte
  private urlBeneficio = 'http://localhost:8083/api/transportes-beneficio';
  private urlCatalogo = 'http://localhost:8083/api/catalogos';

  constructor() { }

  // Carga la tabla principal de transportes
  obtenerTransportesBeneficio(): Observable<any[]> {
    return this.http.get<any[]>(`${this.urlBeneficio}/todo-detalle`);
  }

  // Carga los estados (Activo/Inactivo) para el modal
  obtenerEstadosTransporte(): Observable<any[]> {
    return this.http.get<any[]>(`${this.urlCatalogo}/estados`);
  }

  // EL MÉTODO CLAVE: Sincronización completa
  // Asegúrate de que el nombre coincida con el que llamas en tu componente
  actualizarEstadoSincronizado(payload: any): Observable<any> {
    // Apuntamos a la ruta de TRANSPORTES
    return this.http.put(`${this.urlBeneficio}/actualizar-estado-completo`, payload);
  }
}
