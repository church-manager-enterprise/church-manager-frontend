import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { EventService, Event } from '../../services/event.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin implements OnInit {
  currentUser: User | null = null;
  userName = 'Administrador';
  userEmail = '';
  events: Event[] = [];
  isLoading = true;
  errorMessage = '';
  showCreateModal = false;
  createEventForm: FormGroup;
  isSubmitting = false;
  successMessage = '';

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.createEventForm = this.fb.group({
      churchId: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      startDatetime: ['', Validators.required],
      endDatetime: ['', Validators.required],
      location: ['', Validators.required],
      createdBy: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.currentUser = this.authService.getUser();
    if (this.currentUser) {
      this.userName = this.currentUser.name;
      this.userEmail = this.currentUser.email;

      if (this.currentUser.role !== 'ADMIN') {
        console.warn('Acesso negado: usuário não é administrador');
        this.router.navigate(['/dashboard']);
        return;
      }

      console.log('Dados do admin carregados:', this.currentUser);

      this.loadAllEvents();
    } else {
      console.warn('Nenhum dado de usuário encontrado');
      this.router.navigate(['/login']);
    }
  }

  loadAllEvents(): void {
    this.isLoading = true;
    this.errorMessage = '';

    console.log('🔄 Carregando todos os eventos...');

    this.eventService.getAllChurchEvents(this.currentUser?.churchId || '').subscribe({
      next: (events: any) => {
        console.log('Eventos carregados:', events);
        this.events = events as Event[];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('erro ao carregar eventos:', error);
        this.errorMessage = error.message || 'Erro ao carregar eventos. Tente novamente.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.createEventForm.reset({
      churchId: this.currentUser?.churchId || '',
      createdBy: this.currentUser?.username || '',
    });
    this.successMessage = '';
    this.errorMessage = '';
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.createEventForm.reset();
    this.successMessage = '';
    this.errorMessage = '';
  }

  onSubmitCreate(): void {
    if (this.createEventForm.invalid) {
      this.markFormGroupTouched(this.createEventForm);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.createEventForm.value;

    // Converter datas para formato ISO
    const eventData = {
      ...formValue,
      startDatetime: new Date(formValue.startDatetime).toISOString(),
      endDatetime: new Date(formValue.endDatetime).toISOString(),
    };

    console.log('📤 Criando evento:', eventData);

    this.eventService.createEvent(eventData).subscribe({
      next: (response) => {
        console.log('evento criado com sucesso:', response);
        this.successMessage = 'Evento criado com sucesso!';
        this.isSubmitting = false;

        // Recarregar lista de eventos
        setTimeout(() => {
          this.closeCreateModal();
          this.loadAllEvents();
        }, 1500);
      },
      error: (error) => {
        console.error('erro ao criar evento:', error);
        this.errorMessage = error.message || 'Erro ao criar evento.';
        this.isSubmitting = false;
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

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Getters para validação do formulário
  get name() {
    return this.createEventForm.get('name');
  }

  get description() {
    return this.createEventForm.get('description');
  }

  get startDatetime() {
    return this.createEventForm.get('startDatetime');
  }

  get endDatetime() {
    return this.createEventForm.get('endDatetime');
  }

  get location() {
    return this.createEventForm.get('location');
  }
}
