// src/app/core/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs'; // Asume que tienes un archivo de entorno

// Interface para el objeto de usuario (coincide con la respuesta de tu API)
export interface UserAuth {
  idUsuario: number;
  nombre: string;
  correoElectronico: string;
  rol: 'cliente' | 'admin'; // Añadimos el rol aquí
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `http://localhost:3000/api/usuarios`;

  // Sujetos reactivos para el estado
  private loggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.loggedInSubject.asObservable();

  private userSubject = new BehaviorSubject<UserAuth | null>(null);
  currentUser$ = this.userSubject.asObservable();

  private isAdminSubject = new BehaviorSubject<boolean>(false);
  isAdmin$ = this.isAdminSubject.asObservable();

  constructor(private http: HttpClient) {
    // Cargar el estado al iniciar el servicio (ej: al refrescar la página)
    this.loadUserFromStorage();
  }

  /** Carga la sesión desde el almacenamiento local si existe. */
  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      const user: UserAuth = JSON.parse(userJson);
      this.setUserState(user);
    }
  }

  /** Actualiza todos los sujetos de estado. */
  private setUserState(user: UserAuth | null): void {
    this.userSubject.next(user);
    this.loggedInSubject.next(!!user);
    this.isAdminSubject.next(user?.rol === 'admin' ? true : false);
  }

  /**
   * Envía las credenciales al backend para autenticación.
   */
  login(correoElectronico: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { correoElectronico, password }).pipe(
      tap(response => {
        // La respuesta de tu API contiene: { message, usuario: { idUsuario, nombre, correoElectronico } }

        // IMPORTANTE: Tienes que asegurarte de que tu API devuelva el ROL también en la respuesta del login.
        // Si no lo hace, necesitarías hacer una petición adicional a /api/usuarios/:id o modificar el backend.
        // ASUMO que la API devuelve { idUsuario, nombre, correoElectronico, rol }

        const user: UserAuth = {
          ...response.usuario,
          rol: response.usuario.rol || 'cliente' // Por defecto, es 'cliente'
        };

        // Guardar la sesión en localStorage y actualizar el estado
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.setUserState(user);
      })
    );
  }

  /**
   * Cierra la sesión, limpia el almacenamiento y el estado.
   */
  logout(): void {
    localStorage.removeItem('currentUser');
    this.setUserState(null);
    // Redireccionar al inicio o login
    // this.router.navigate(['/login']); 
  }

  /**
   * Obtiene el token de autorización (simulado con el ID del usuario)
   * Útil para añadir la cabecera 'x-user-id' a peticiones de Admin/Perfil/Historial.
   */
  getAuthHeader(): string | null {
    const user = this.userSubject.getValue();
    return user ? String(user.idUsuario) : null;
  }
}