import { Injectable } from '@angular/core';
import {FRONTEND_LOGIN_URL} from "../api.config";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'session_token';

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Verifica si el usuario está logueado Y si el token no ha expirado.
   */
  isLoggedIn(): boolean {
    const token = this.getToken();

    // 1. Si no hay token, no está logueado
    if (!token) return false;

    // 2. Validar expiración del JWT
    try {
      // Un JWT tiene 3 partes separadas por puntos: header.payload.signature
      // El payload (parte central) contiene la fecha de expiración 'exp'
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));

      // 'exp' está en segundos, JS trabaja en milisegundos
      const expiryTime = decodedPayload.exp * 1000;
      const currentTime = Date.now();

      // Si el tiempo de expiración es mayor al actual, el token sigue siendo válido
      return expiryTime > currentTime;
    } catch (error) {
      // Si el token está mal formado o no es un JWT válido, consideramos que no está logueado
      console.error('Error al validar el token:', error);
      return false;
    }
  }

  logout(): void {
    // 1. Limpia el token local del sistema de pesajes (Puerto 4500)
    localStorage.removeItem(this.TOKEN_KEY);

    // 2. Redirige al login enviando el parámetro de cierre forzado
    // Esto le avisa a la otra app que también debe borrar su token
    window.location.href = `${FRONTEND_LOGIN_URL}?logout=true`;
  }

  /**
   * Opcional: Obtener los datos del usuario que vienen dentro del token
   */
  getUserData(): any {
    const token = this.getToken();
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }
}
