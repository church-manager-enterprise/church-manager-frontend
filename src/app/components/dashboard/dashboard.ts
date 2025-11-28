import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EventService } from '../../services/event.service';

interface UserEvent {
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
  userName = 'Usuário';
  userEmail = '';
  events: UserEvent[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadUserEvents();
  }

  loadUserData(): void {
    const token = this.authService.getToken();
    if (token) {
      this.userName = 'João Silva';
      this.userEmail = 'joao.silva@church.com';
    }
  }

  loadUserEvents(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.eventService.getUserEvents().subscribe({
      next: (events: any) => {
        this.events = events as UserEvent[];
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Erro ao carregar eventos. Tente novamente.';
        this.isLoading = false;
        console.error('Erro ao carregar eventos:', error);
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

  // Métodos auxiliares para filtros de eventos
  getConfirmedEventsCount(): number {
    return this.events.filter((event) => event.status === 'confirmado').length;
  }

  getPendingEventsCount(): number {
    return this.events.filter((event) => event.status === 'pendente').length;
  }
}
