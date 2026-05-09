import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransportistaService {
  private http = inject(HttpClient);

  // Ajusta la URL según donde corra tu backend de Beneficio
  private urlBeneficio = 'http://localhost:8083/api/transportes-beneficio';
  private urlBeneficioTrans = 'http://localhost:8083/api/transportistas-beneficio';
  private urlAgricultor = 'http://localhost:8081/api/catalogos';

  constructor() { }

  // Método para la tabla de Gestión de Transporte (El que cruza datos)
  obtenerTransportesBeneficio(): Observable<any[]> {
    return this.http.get<any[]>(`${this.urlBeneficio}/todo-detalle`);
  }

  // Método para cargar el select de licencias en el formulario
  obtenerTiposLicencia(): Observable<any[]> {
    return this.http.get<any[]>(`${this.urlAgricultor}/licencias`);
  }

  // Método para crear el transportista (El que ya teníamos)
  crearTransportista(datos: any): Observable<any> {
    return this.http.post<any>(`http://localhost:8081/api/transportistas`, datos);
  }

  // Método para el botón "Cambiar Estado"
  cambiarEstadoTransporte(id: number, nuevoEstado: number): Observable<any> {
    return this.http.put(`${this.urlBeneficio}/cambiar-estado/${id}`, { estado: nuevoEstado });
  }

  obtenerEstadosTransporte(): Observable<any[]> {
    // Ahora apunta a la ruta que creamos en el punto 3
    return this.http.get<any[]>(`http://localhost:8083/api/catalogos/estados`);
  }

  listarTodoDetalle(): Observable<any[]> {
      // Ahora esta variable sí existe
      return this.http.get<any[]>(`${this.urlBeneficioTrans}/todo-detalle`);
    }

    actualizarEstadoSincronizado(payload: any): Observable<any> {
      return this.http.put(`${this.urlBeneficioTrans}/actualizar-estado-completo`, payload);
    }
}
