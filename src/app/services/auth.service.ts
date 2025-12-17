import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  username: string;
  churchId: string;
}

export interface LoginResponse {
  token: string;
  user: User;
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
  private apiUrl = 'http://localhost:8080/api';
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  constructor(private http: HttpClient) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  login(email: string, password: string): Observable<LoginResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { email, password };

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, body, { headers }).pipe(
      tap((response) => {
        console.log('Login bem-sucedido, salvando token e dados do usuário');
        this.setToken(response.token);
        this.setUser(response.user);
      }),
      catchError(this.handleError)
    );
  }

  register(data: RegisterData): Observable<LoginResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/register`, data, { headers }).pipe(
      tap((response) => {
        console.log('Registro bem-sucedido, salvando token e dados do usuário');
        this.setToken(response.token);
        this.setUser(response.user);
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      console.log('Logout realizado - token e dados do usuário removidos');
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

  getUser(): User | null {
    if (this.isBrowser) {
      const userJson = localStorage.getItem(this.userKey);
      if (userJson) {
        try {
          return JSON.parse(userJson);
        } catch (error) {
          console.error('Erro ao parsear dados do usuário:', error);
          return null;
        }
      }
    }
    return null;
  }

  private setToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem(this.tokenKey, token);
      console.log('Token salvo com sucesso');
    }
  }

  private setUser(user: User): void {
    if (this.isBrowser) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
      console.log('Dados do usuário salvos com sucesso:', user);
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Erro desconhecido ao processar requisição.';
    let statusCode = error.status;

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = 'Dados inválidos. Verifique os campos e tente novamente.';
          break;
        case 401:
          errorMessage = 'Email ou senha incorretos.';
          break;
        case 403:
          errorMessage = 'Acesso negado.';
          break;
        case 404:
          errorMessage = 'Serviço não encontrado. Verifique se o servidor está rodando.';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
          break;
        case 0:
          errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
          break;
        default:
          errorMessage = error.error?.message || error.message || 'Erro ao processar requisição.';
      }
    }

    console.error('Erro HTTP:', {
      status: statusCode,
      message: errorMessage,
      error: error
    });

    return throwError(() => ({ status: statusCode, message: errorMessage }));
  }
}
