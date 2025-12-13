import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BaseDatosService {
  private apiUrl = 'http://localhost:3000/api/discos';

  constructor(private http: HttpClient) { }

  getDiscos(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
