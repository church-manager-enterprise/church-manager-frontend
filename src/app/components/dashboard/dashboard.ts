import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { EventService, EventResponse } from '../../services/event.service';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  participants: number;
  status: 'confirmado' | 'pendente' | 'cancelado';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  currentUser: User | null = null;
  userName = 'Usuário';
  userEmail = '';
  userRole = '';
  events: Event[] = [];
  isLoading = true;
  errorMessage = '';
  showDetailsModal = false;
  selectedEventDetails: EventResponse | null = null;

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadUserEvents();
  }

  loadUserData(): void {
    this.currentUser = this.authService.getUser();
    if (this.currentUser) {
      this.userName = this.currentUser.name;
      this.userEmail = this.currentUser.email;
      this.userRole = this.currentUser.role;
      console.log('Dados do usuário carregados:', this.currentUser);
    } else {
      console.warn('Nenhum dado de usuário encontrado no localStorage');
      this.router.navigate(['/login']);
    }
  }

  loadUserEvents(): void {
    if (!this.currentUser || !this.currentUser.id) {
      console.error('ID do usuário não encontrado');
      this.errorMessage = 'Erro: ID do usuário não encontrado.';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.eventService.getUserEvents(this.currentUser.id).subscribe({
      next: (events: any) => {
        this.events = events as Event[];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('erro ao carregar eventos:', error);
        console.error('Status do erro:', error.status);
        console.error('Mensagem do erro:', error.message);
        this.errorMessage = error.message || 'Erro ao carregar eventos. Tente novamente.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('🏁 Requisição de eventos finalizada');
      },
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getEventStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      confirmado: 'status-confirmed',
      pendente: 'status-pending',
      cancelado: 'status-cancelled',
    };
    return statusMap[status.toLowerCase()] || 'status-pending';
  }

  getEventStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      confirmado: 'Confirmado',
      pendente: 'Pendente',
      cancelado: 'Cancelado',
    };
    return statusMap[status.toLowerCase()] || status;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getConfirmedEventsCount(): number {
    return this.events.filter((event) => event.status === 'confirmado').length;
  }

  getPendingEventsCount(): number {
    return this.events.filter((event) => event.status === 'pendente').length;
  }

  // Métodos para Modal de Detalhes
  openDetailsModal(event: Event): void {
    this.errorMessage = '';
    this.showDetailsModal = true;

    console.log('🔄 Carregando detalhes do evento:', event.id);

    this.eventService.getEventDetails(event.id).subscribe({
      next: (eventDetails) => {
        console.log('✅ Detalhes do evento carregados:', eventDetails);
        this.selectedEventDetails = eventDetails;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Erro ao carregar detalhes do evento:', error);
        this.errorMessage = error.message || 'Erro ao carregar detalhes do evento';
        this.cdr.detectChanges();
      }
    });
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedEventDetails = null;
    this.errorMessage = '';
  }

  getRoleLabel(role: string): string {
    const roleMap: { [key: string]: string } = {
      'PARTICIPANT': 'Participante',
      'ORGANIZER': 'Organizador',
      'VOLUNTEER': 'Voluntário',
      'SPEAKER': 'Palestrante',
      'COORDINATOR': 'Coordenador'
    };
    return roleMap[role] || role;
  }
}
