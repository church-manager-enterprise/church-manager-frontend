import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

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
  private apiUrl = ''; //TODO:  ADD MS Events URL

  constructor(private http: HttpClient) {}
  getUserEvents(): Observable<Event[]> {
    if (!this.apiUrl) {
      return this.simulateUserEvents();
    }

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.get<Event[]>(`${this.apiUrl}/events/user`, { headers });
  }

  getAllEvents(): Observable<Event[]> {
    if (!this.apiUrl) {
      return this.simulateUserEvents();
    }

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<Event[]>(`${this.apiUrl}/events`, { headers });
  }

  getEventById(id: string): Observable<Event> {
    if (!this.apiUrl) {
      return this.simulateEventById(id);
    }

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<Event>(`${this.apiUrl}/events/${id}`, { headers });
  }

  confirmAttendance(eventId: string): Observable<any> {
    if (!this.apiUrl) {
      return of({ success: true, message: 'Presença confirmada' }).pipe(delay(500));
    }

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/events/${eventId}/confirm`, {}, { headers });
  }

  private simulateUserEvents(): Observable<Event[]> {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: 'Culto de Celebração',
        description: 'Culto especial de celebração com louvor e pregação da palavra.',
        date: '2025-12-01T10:00:00',
        location: 'Templo Principal',
        participants: 150,
        status: 'confirmado',
      },
      {
        id: '2',
        title: 'Reunião de Oração',
        description: 'Momento de oração e intercessão pela igreja e comunidade.',
        date: '2025-12-05T19:00:00',
        location: 'Sala de Oração',
        participants: 45,
        status: 'confirmado',
      },
      {
        id: '3',
        title: 'Escola Bíblica Dominical',
        description: 'Estudo aprofundado das escrituras para todas as idades.',
        date: '2025-12-08T09:00:00',
        location: 'Salas de Aula',
        participants: 80,
        status: 'pendente',
      },
      {
        id: '4',
        title: 'Encontro de Jovens',
        description: 'Reunião especial para jovens com atividades e dinâmicas.',
        date: '2025-12-12T18:00:00',
        location: 'Salão de Eventos',
        participants: 120,
        status: 'pendente',
      },
      {
        id: '5',
        title: 'Retiro Espiritual',
        description: 'Fim de semana de retiro espiritual e renovação.',
        date: '2025-12-15T08:00:00',
        location: 'Chácara Santa Cruz',
        participants: 60,
        status: 'confirmado',
      },
      {
        id: '6',
        title: 'Natal na Igreja',
        description: 'Celebração especial de Natal com apresentações e confraternização.',
        date: '2025-12-24T19:00:00',
        location: 'Templo Principal',
        participants: 250,
        status: 'pendente',
      },
    ];

    return of(mockEvents).pipe(delay(1000));
  }

  private simulateEventById(id: string): Observable<Event> {
    const mockEvent: Event = {
      id: id,
      title: 'Evento Exemplo',
      description: 'Descrição do evento',
      date: '2025-12-01T10:00:00',
      location: 'Local do Evento',
      participants: 100,
      status: 'confirmado',
    };

    return of(mockEvent).pipe(delay(500));
  }
}
