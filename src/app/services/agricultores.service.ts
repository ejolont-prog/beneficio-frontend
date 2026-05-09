import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AgricultoresService {

  // Definimos la base para reutilizarla
  private API_URL_BASE = 'http://localhost:8083/api/agricultores';

  constructor(private http: HttpClient) { }

  getAgricultores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL_BASE}/listar`);
  }

  obtenerConteosDetalle(nit: string): Observable<any> {
    // Ahora API_URL_BASE sí existe
    return this.http.get(`${this.API_URL_BASE}/conteos/${nit}`);
  }
}
