import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Participant {
  id: string;
  memberId: string;
  role: string;
  registeredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organizer {
  id: string;
  memberId: string;
  role: string;
  assignedAt: string;
}

export interface EventResponse {
  id: string;
  churchId: string;
  name: string;
  description: string;
  startDatetime: string;
  endDatetime: string;
  location: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  participants: Participant[];
  organizers: Organizer[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  participants: number;
  status: 'confirmado' | 'pendente' | 'cancelado';
}

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}
  getUserEvents(userId: string): Observable<Event[]> {
    console.log('🌐 EventService.getUserEvents chamado com userId:', userId);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}/events/user/${userId}`;
    console.log('🔗 URL completa:', url);

    return this.http.get<EventResponse[]>(url, { headers }).pipe(
      map((events: EventResponse[]) => {
        console.log('📦 Resposta recebida do backend:', events);
        const mapped = this.mapEventsToUI(events);
        console.log('🔄 Eventos mapeados para UI:', mapped);
        return mapped;
      }),
      catchError((error) => {
        console.error('💥 Erro capturado no EventService:', error);
        return this.handleError(error);
      })
    );
  }

  getAllEvents(): Observable<Event[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<EventResponse[]>(`${this.apiUrl}/events`, { headers }).pipe(
      map((events: EventResponse[]) => this.mapEventsToUI(events)),
      catchError(this.handleError)
    );
  }

  getEventById(id: string): Observable<Event> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<EventResponse>(`${this.apiUrl}/events/${id}`, { headers }).pipe(
      map((event: EventResponse) => this.mapEventToUI(event)),
      catchError(this.handleError)
    );
  }

  confirmAttendance(eventId: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http
      .post(`${this.apiUrl}/events/${eventId}/confirm`, {}, { headers })
      .pipe(catchError(this.handleError));
  }

  private mapEventsToUI(events: EventResponse[]): Event[] {
    return events.map((event) => this.mapEventToUI(event));
  }

  private mapEventToUI(event: EventResponse): Event {
    return {
      id: event.id,
      title: event.name,
      description: event.description,
      date: event.startDatetime,
      location: event.location,
      participants: event.participants.length,
      status: this.determineEventStatus(event.startDatetime),
    };
  }

  private determineEventStatus(startDatetime: string): 'confirmado' | 'pendente' | 'cancelado' {
    const eventDate = new Date(startDatetime);
    const now = new Date();
    const daysDiff = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) {
      return 'confirmado';
    } else if (daysDiff <= 7) {
      return 'confirmado';
    } else {
      return 'pendente';
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Erro ao carregar eventos.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 404:
          errorMessage = 'Eventos não encontrados.';
          break;
        case 401:
          errorMessage = 'Não autorizado. Faça login novamente.';
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

    console.error('Erro ao buscar eventos:', {
      status: error.status,
      message: errorMessage,
      error: error,
    });

    return throwError(() => ({ status: error.status, message: errorMessage }));
  }
}
