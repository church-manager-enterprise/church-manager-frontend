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

export interface AddParticipantRequest {
  eventId: string;
  memberId: string;
  role: string;
  registeredAt?: string;
}

export interface AddParticipantsRequest {
  eventId: string;
  participants: Array<{
    memberId: string;
    role: string;
    registeredAt?: string;
  }>;
}

export interface AddParticipantResponse {
  id: string;
  eventId: string;
  memberId: string;
  role: string;
  registeredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddParticipantsResponse {
  count: number;
  participants: AddParticipantResponse[];
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
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}/events/user/${userId}`;

    return this.http.get<EventResponse[]>(url, { headers }).pipe(
      map((events: EventResponse[]) => {
        console.log('resposta eventService:', events);
        const mapped = this.mapEventsToUI(events);
        return mapped;
      }),
      catchError((error) => {
        console.error('erro no EventService:', error);
        return this.handleError(error);
      })
    );
  }

  getAllChurchEvents(churchId: string): Observable<Event[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http
      .get<EventResponse[]>(`${this.apiUrl}/events`, { headers, params: { churchId } })
      .pipe(
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

  getEventDetails(id: string): Observable<EventResponse> {
    console.log('EventService.getEventDetails chamado para evento:', id);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}/events/${id}`;

    return this.http.get<EventResponse>(url, { headers }).pipe(
      map((event: EventResponse) => {
        console.log('✅ Detalhes do evento carregados:', event);
        return event;
      }),
      catchError((error) => {
        console.error('❌ Erro ao carregar detalhes do evento:', error);
        return this.handleError(error);
      })
    );
  }

  confirmAttendance(eventId: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http
      .post(`${this.apiUrl}/events/${eventId}/confirm`, {}, { headers })
      .pipe(catchError(this.handleError));
  }
  createEvent(eventData: any): Observable<EventResponse> {
    console.log('EventService.createEvent chamado com:', eventData);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}/events`;
    console.log('URL completa:', url);

    return this.http.post<EventResponse>(url, eventData, { headers }).pipe(
      map((response: EventResponse) => {
        console.log('Evento criado com sucesso:', response);
        return response;
      }),
      catchError((error) => {
        console.error('Erro ao criar evento:', error);
        return this.handleError(error);
      })
    );
  }

  updateEvent(eventId: string, eventData: any): Observable<EventResponse> {
    console.log('EventService.updateEvent chamado com:', eventId, eventData);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}/events/${eventId}`;
    console.log('URL completa:', url);

    return this.http.put<EventResponse>(url, eventData, { headers }).pipe(
      map((response: EventResponse) => {
        console.log('Evento atualizado com sucesso:', response);
        return response;
      }),
      catchError((error) => {
        console.error('Erro ao atualizar evento:', error);
        return this.handleError(error);
      })
    );
  }

  deleteEvent(eventId: string): Observable<void> {
    console.log('EventService.deleteEvent chamado com:', eventId);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}/events/${eventId}`;
    console.log('URL completa:', url);

    return this.http.delete<void>(url, { headers }).pipe(
      map(() => {
        console.log('Evento excluído com sucesso');
      }),
      catchError((error) => {
        console.error('Erro ao excluir evento:', error);
        return this.handleError(error);
      })
    );
  }

  addParticipant(participantData: AddParticipantRequest): Observable<AddParticipantResponse> {
    console.log('EventService.addParticipant chamado com:', participantData);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}/events/${participantData.eventId}/participants`;

    const body = {
      memberId: participantData.memberId,
      role: participantData.role,
      registeredAt: participantData.registeredAt || new Date().toISOString()
    };

    console.log('URL completa:', url);
    console.log('Body da requisição:', body);

    return this.http.post<AddParticipantResponse>(url, body, { headers }).pipe(
      map((response) => {
        console.log('✅ Participante adicionado com sucesso:', response);
        return response;
      }),
      catchError((error) => {
        console.error('❌ Erro ao adicionar participante:', error);
        return this.handleError(error);
      })
    );
  }

  addParticipants(requestData: AddParticipantsRequest): Observable<AddParticipantsResponse> {
    console.log('EventService.addParticipants chamado com:', requestData);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.apiUrl}/events/${requestData.eventId}/participants`;

    const body = requestData.participants.map(p => ({
      memberId: p.memberId,
      role: p.role,
      registeredAt: p.registeredAt || new Date().toISOString()
    }));

    console.log('URL completa:', url);
    console.log('Body da requisição (array):', body);

    return this.http.post<AddParticipantsResponse>(url, body, { headers }).pipe(
      map((response) => {
        console.log('✅ Participantes adicionados com sucesso:', response);
        return response;
      }),
      catchError((error) => {
        console.error('❌ Erro ao adicionar participantes:', error);
        return this.handleError(error);
      })
    );
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
