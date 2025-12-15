import { Component, OnInit } from '@angular/core';
import { ReportesService } from '../services/reportes.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [FormsModule,NgClass, CommonModule,NgxChartsModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent implements OnInit {
  reporteRentables: any[] = [];
  reporteVentasFormato: any[] = [];
  
  loadingRentables: boolean = true;
  loadingFormato: boolean = true;
  
  errorMessage: string | null = null;
  movimientoInventarioData: any[] = []; // Nueva propiedad

trazabilidadStockData: any[] = [];
    selectedProdId: number | null = null;
    loadingTrazabilidad: boolean = false; // <-- Debes tener esta
    
    // Configuración General
    view: [number, number] = [700, 400]; // <-- DEBE EXISTIR
    legend = false; // Lo pusiste en false en el HTML
    showXAxis = true; // <-- DEBE EXISTIR
    showYAxis = true; // <-- DEBE EXISTIR
    showXAxisLabel = true; // <-- DEBE EXISTIR
    showYAxisLabel = true; // <-- DEBE EXISTIR
    
    // Configuración específica de Trazabilidad (Eje X, Y)
    xAxisLabelTrazabilidad = 'Fecha y Hora del Cambio'; // <-- DEBE EXISTIR
    yAxisLabelTrazabilidad = 'Nivel de Stock'; // <-- DEBE EXISTIR

  constructor(private reportesService: ReportesService, private authService:AuthService) { }

  ngOnInit(): void {
    this.cargarReporteRentables();
    this.cargarReporteVentasFormato();
    this.cargarReporteRentables();
  }


  onSelectProduct(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const id = Number(target.value);

    this.selectedProdId = id;
    if (id) {
        this.cargarTrazabilidadStock(id);
    } else {
        this.trazabilidadStockData = [];
    }
}
  

  cargarReporteRentables(): void {
    this.loadingRentables = true;
    this.reportesService.getReporteRentables().subscribe({
      next: (data) => {
        // Mapear los datos para asegurar que los números se manejen correctamente
        this.reporteRentables = data.map(r => ({
          ...r,
          total_ingreso_generado: Number(r.total_ingreso_generado)
        }));
        this.loadingRentables = false;
      },
      error: (err) => {
        this.loadingRentables = false;
        this.errorMessage = 'Error al cargar reporte de rentabilidad.';
        console.error('Error en rentables:', err);
      }
    });
  }

  cargarReporteVentasFormato(): void {
    this.loadingFormato = true;
    this.reportesService.getReporteVentasFormato().subscribe({
      next: (data) => {
        // Mapear los datos para asegurar que los números se manejen correctamente
        this.reporteVentasFormato = data.map(r => ({
          ...r,
          ingreso_bruto: Number(r.ingreso_bruto)
        }));
        this.loadingFormato = false;
      },
      error: (err) => {
        this.loadingFormato = false;
        this.errorMessage = 'Error al cargar reporte de ventas por formato.';
        console.error('Error en formato:', err);
      }
    });
  }
  
  // Función para determinar si una fila de ROLLUP es un subtotal o total
  esFilaRollup(artista: string | null, formato: string | null): boolean {
      return artista === null || formato === null;
  }

  cargarTrazabilidadStock(idProd: number): void {
    this.loadingTrazabilidad = true;
    
    // Ya no necesitas obtener userId, ni httpOptions aquí. El servicio lo hace.

    this.reportesService.getTrazabilidadStock(idProd).subscribe({ // <--- ¡USAR EL SERVICIO!
        next: (data) => {
            this.trazabilidadStockData = data;
            this.loadingTrazabilidad = false;
        },
        error: (err: any) => { // Cambiado a 'any' para evitar conflictos de tipo de HttpErrorResponse
            // ... (manejo de errores) ...
            console.error('Error al cargar trazabilidad de stock:', err);
            this.loadingTrazabilidad = false;
        }
    });
  }
}

