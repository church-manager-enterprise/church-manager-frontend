import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, catchError, tap } from 'rxjs/operators';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = ''; // URL vazia por enquanto
  private tokenKey = 'auth_token';
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  constructor(private http: HttpClient) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  login(email: string, password: string): Observable<LoginResponse> {
    if (!this.apiUrl) {
      return this.simulateLogin(email, password);
    }

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { email, password };

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, body, { headers }).pipe(
      tap((response) => this.setToken(response.token)),
      catchError(this.handleError)
    );
  }

  register(data: RegisterData): Observable<LoginResponse> {
    if (!this.apiUrl) {
      return this.simulateRegister(data);
    }

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/register`, data, { headers }).pipe(
      tap((response) => this.setToken(response.token)),
      catchError(this.handleError)
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.tokenKey);
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  private setToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  private simulateLogin(email: string, password: string): Observable<LoginResponse> {
    return of({
      token: 'fake-jwt-token-' + Date.now(),
      user: {
        id: '1',
        email: email,
        name: 'Usuário Teste',
      },
    }).pipe(
      delay(1000),
      tap((response) => {
        console.log('Login simulado:', response);
        this.setToken(response.token);
      })
    );
  }

  private simulateRegister(data: RegisterData): Observable<LoginResponse> {
    return of({
      token: 'fake-jwt-token-' + Date.now(),
      user: {
        id: '1',
        email: data.email,
        name: data.name,
      },
    }).pipe(
      delay(1000),
      tap((response) => {
        console.log('Registro simulado:', response);
        this.setToken(response.token);
      })
    );
  }


  private handleError(error: any): Observable<never> {
    console.error('Erro na requisição:', error);
    return throwError(() => new Error(error.message || 'Erro no servidor'));
  }
}
