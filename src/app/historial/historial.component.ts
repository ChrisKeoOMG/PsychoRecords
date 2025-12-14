// src/app/features/ventas/historial/historial.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { VentasService, Venta } from '../services/ventas.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styleUrls: ['./historial.component.css']
})
export class HistorialComponent implements OnInit {

  historialVentas: Venta[] = [];
  loading: boolean = true;
  errorMessage: string | null = null;
  idUsuario: number | null = null;

  constructor(
    private authService: AuthService,
    private ventasService: VentasService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = this.authService.getAuthHeader();
    if (!id) {
      this.router.navigate(['/login']);
      return;
    }
    this.idUsuario = Number(id);
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    if (!this.idUsuario) return;

    this.loading = true;
    this.errorMessage = null;

    this.ventasService.getHistorialVentas(this.idUsuario).subscribe({
      next: (data) => {
        // Ordenar por fecha de venta, más reciente primero
        this.historialVentas = data.sort((a, b) =>
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Ocurrió un error al obtener tu historial de pedidos.';
        console.error('Error al cargar historial de ventas:', err);
      }
    });
  }

  /**
   * Formatea la fecha y hora.
   */
  formatDate(dateString: string): string {
    console.log(dateString);
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Devuelve la clase de color para el estado de la venta.
   */
  getEstadoClass(estado: string): string {
    switch (estado.toUpperCase()) {
      case 'COMPLETADO':
        return 'badge bg-success';
      case 'PENDIENTE':
        return 'badge bg-warning text-dark';
      case 'CANCELADO':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }
}