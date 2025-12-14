import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
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
  currentUser: User | null = null;
  userName = 'Usuário';
  userEmail = '';
  userRole = '';
  events: UserEvent[] = [];
  isLoading = true;
  errorMessage = '';

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

    console.log('🔄 Iniciando carregamento - isLoading:', this.isLoading);
    this.isLoading = true;
    this.errorMessage = '';

    this.eventService.getUserEvents(this.currentUser.id).subscribe({
      next: (events: any) => {
        console.log('✅ Eventos recebidos:', events);
        console.log('📊 Total:', events.length);
        this.events = events as UserEvent[];
        console.log('⏳ Setando isLoading = false');
        this.isLoading = false;
        console.log('🔍 isLoading agora é:', this.isLoading);
        this.cdr.detectChanges();
        console.log('🔄 detectChanges() chamado');
      },
      error: (error: any) => {
        console.error('❌ Erro ao carregar eventos:', error);
        this.errorMessage = error.message || 'Erro ao carregar eventos. Tente novamente.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('🏁 Requisição finalizada - isLoading:', this.isLoading);
      }
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
}
