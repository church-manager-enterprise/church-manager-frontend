import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  churchId: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  churchId: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getChurchMembers(churchId: string): Observable<Member[]> {
    console.log('MemberService.getChurchMembers chamado com churchId:', churchId);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}/members/church/${churchId}`;

    console.log('URL completa:', url);

    return this.http.get<MemberResponse[]>(url, { headers }).pipe(
      map((members) => {
        console.log('✅ Membros carregados com sucesso:', members);
        return members as Member[];
      }),
      catchError((error) => {
        console.error('❌ Erro ao carregar membros:', error);
        return this.handleError(error);
      })
    );
  }

  getMemberById(memberId: string): Observable<Member> {
    console.log('MemberService.getMemberById chamado com memberId:', memberId);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}/members/${memberId}`;

    console.log('URL completa:', url);

    return this.http.get<MemberResponse>(url, { headers }).pipe(
      map((member) => {
        console.log('✅ Membro carregado com sucesso:', member);
        return member as Member;
      }),
      catchError((error) => {
        console.error('❌ Erro ao carregar membro:', error);
        return this.handleError(error);
      })
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Erro desconhecido ao carregar membros';

    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do lado do servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Requisição inválida';
          break;
        case 404:
          errorMessage = 'Igreja não encontrada';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor';
          break;
        default:
          errorMessage = error.error?.message || `Erro ${error.status}: ${error.statusText}`;
      }
    }

    console.error('Erro tratado:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
