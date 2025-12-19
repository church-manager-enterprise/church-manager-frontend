import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Church {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChurchService {
  private apiUrl = 'http://localhost:8080/api';

  // Mock data fallback for 404 responses
  private mockChurches: Church[] = [
    { id: 'church-1', name: 'Igreja Batista Central' },
    { id: 'church-2', name: 'Igreja Presbiteriana' },
    { id: 'church-3', name: 'Assembleia de Deus' },
  ];

  constructor(private http: HttpClient) {}

  getAllChurches(): Observable<Church[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}/churches`;

    console.log('🔄 Buscando igrejas disponíveis...');

    // // Dados temporarios  -> TODO: remover quando tiver a api de church
    // return of(this.mockChurches);

    return this.http.get<Church[]>(url, { headers }).pipe(
      map((churches: Church[]) => churches),
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<Church[]> {
    let errorMessage = 'Erro ao carregar igrejas.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 404:
          console.log('caiu no erro 404');
          errorMessage = `Nenchuma igreja encontrada`;
          break;
        case 401:
          errorMessage = 'Não autorizado.';
          break;
        case 500:
          errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
          break;
        case 0:
          errorMessage = 'Não foi possível conectar ao servidor.';
          break;
        default:
          errorMessage = error.error?.message || 'Erro ao processar requisição.';
      }
    }

    console.error('❌ Erro ao buscar igrejas:', {
      status: error.status,
      message: errorMessage,
      error: error,
    });

    return throwError(() => ({ status: error.status, message: errorMessage }));
  }
}
