import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { EventService, Event, EventResponse } from '../../services/event.service';
import { MemberService, Member } from '../../services/member.service';

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
  showEditModal = false;
  editEventForm: FormGroup;
  selectedEvent: Event | null = null;
  showDeleteConfirm = false;
  eventToDelete: Event | null = null;
  showAddParticipantModal = false;
  selectedEventForParticipant: Event | null = null;
  addParticipantForm: FormGroup;
  churchMembers: Member[] = [];
  isLoadingMembers = false;
  showDetailsModal = false;
  selectedEventDetails: EventResponse | null = null;

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private memberService: MemberService,
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

    this.editEventForm = this.fb.group({
      churchId: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      startDatetime: ['', Validators.required],
      endDatetime: ['', Validators.required],
      location: ['', Validators.required],
      createdBy: ['', Validators.required],
    });

    this.addParticipantForm = this.fb.group({
      participants: this.fb.array([])
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

  openEditModal(event: Event): void {
    this.selectedEvent = event;
    this.showEditModal = true;

    const startDate = new Date(event.date);
    const startDatetimeLocal = this.formatDateTimeLocal(startDate);

    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    const endDatetimeLocal = this.formatDateTimeLocal(endDate);

    this.editEventForm.patchValue({
      churchId: this.currentUser?.churchId || '',
      name: event.title,
      description: event.description,
      startDatetime: startDatetimeLocal,
      endDatetime: endDatetimeLocal,
      location: event.location,
      createdBy: this.currentUser?.username || '',
    });

    this.successMessage = '';
    this.errorMessage = '';
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedEvent = null;
    this.editEventForm.reset();
    this.successMessage = '';
    this.errorMessage = '';
  }

  onSubmitEdit(): void {
    if (this.editEventForm.invalid || !this.selectedEvent) {
      this.markFormGroupTouched(this.editEventForm);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.editEventForm.value;

    const eventData = {
      ...formValue,
      startDatetime: new Date(formValue.startDatetime).toISOString(),
      endDatetime: new Date(formValue.endDatetime).toISOString(),
    };

    console.log('📤 Atualizando evento:', this.selectedEvent.id, eventData);

    this.eventService.updateEvent(this.selectedEvent.id, eventData).subscribe({
      next: (response) => {
        console.log('Evento atualizado com sucesso:', response);
        this.successMessage = 'Evento atualizado com sucesso!';
        this.isSubmitting = false;

        setTimeout(() => {
          this.closeEditModal();
          this.loadAllEvents();
        }, 1500);
      },
      error: (error) => {
        console.error('Erro ao atualizar evento:', error);
        this.errorMessage = error.message || 'Erro ao atualizar evento.';
        this.isSubmitting = false;
      },
    });
  }

  openDeleteConfirm(event: Event): void {
    this.eventToDelete = event;
    this.showDeleteConfirm = true;
    this.errorMessage = '';
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm = false;
    this.eventToDelete = null;
    this.errorMessage = '';
  }

  confirmDelete(): void {
    if (!this.eventToDelete) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    console.log('🗑️ Excluindo evento:', this.eventToDelete.id);

    this.eventService.deleteEvent(this.eventToDelete.id).subscribe({
      next: () => {
        console.log('Evento excluído com sucesso');
        this.isSubmitting = false;
        this.closeDeleteConfirm();
        this.loadAllEvents();
      },
      error: (error) => {
        console.error('Erro ao excluir evento:', error);
        this.errorMessage = error.message || 'Erro ao excluir evento.';
        this.isSubmitting = false;
      },
    });
  }

  private formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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

  get editName() {
    return this.editEventForm.get('name');
  }

  get editDescription() {
    return this.editEventForm.get('description');
  }

  get editStartDatetime() {
    return this.editEventForm.get('startDatetime');
  }

  get editEndDatetime() {
    return this.editEventForm.get('endDatetime');
  }

  get editLocation() {
    return this.editEventForm.get('location');
  }

  get participants(): FormArray {
    return this.addParticipantForm.get('participants') as FormArray;
  }

  createParticipantFormGroup(): FormGroup {
    return this.fb.group({
      memberId: ['', Validators.required],
      role: ['PARTICIPANT', Validators.required]
    });
  }

  addParticipantRow(): void {
    this.participants.push(this.createParticipantFormGroup());
  }

  removeParticipantRow(index: number): void {
    if (this.participants.length > 1) {
      this.participants.removeAt(index);
    }
  }

  openAddParticipantModal(event: Event): void {
    this.selectedEventForParticipant = event;
    this.successMessage = '';
    this.errorMessage = '';

    this.isLoadingMembers = true;
    const churchId = this.currentUser?.churchId || '';


    this.memberService.getChurchMembers(churchId).subscribe({
      next: (members) => {
        this.churchMembers = members;
        this.isLoadingMembers = false;

        this.participants.clear();
        this.addParticipantRow();

        this.showAddParticipantModal = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Erro ao carregar membros:', error);
        this.errorMessage = error.message || 'Erro ao carregar membros da igreja';
        this.isLoadingMembers = false;
        this.cdr.detectChanges();
      }
    });
  }

  closeAddParticipantModal(): void {
    this.showAddParticipantModal = false;
    this.selectedEventForParticipant = null;
    this.participants.clear();
    this.churchMembers = [];
    this.successMessage = '';
    this.errorMessage = '';
  }

  onSubmitAddParticipant(): void {
    if (this.addParticipantForm.valid && this.selectedEventForParticipant) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      const eventId = this.selectedEventForParticipant.id;
      const participantsData = this.participants.value;

      console.log(`📤 Adicionando ${participantsData.length} participante(s):`, participantsData);

      this.eventService.addParticipants({
        eventId: eventId,
        participants: participantsData.map((p: any) => ({
          memberId: p.memberId,
          role: p.role,
          registeredAt: new Date().toISOString()
        }))
      }).subscribe({
        next: (response) => {
          console.log('✅ Todos os participantes adicionados com sucesso:', response);
          const count = response.count || response.participants?.length || participantsData.length;
          this.successMessage = `${count} participante${count > 1 ? 's' : ''} adicionado${count > 1 ? 's' : ''} com sucesso!`;
          this.isSubmitting = false;

          this.loadAllEvents();

          setTimeout(() => {
            this.closeAddParticipantModal();
          }, 1500);
        },
        error: (error) => {
          console.error('❌ Erro ao adicionar participantes:', error);
          this.isSubmitting = false;

          if (error.status === 400) {
            this.errorMessage = 'Dados inválidos. Verifique os campos.';
          } else if (error.status === 404) {
            this.errorMessage = 'Evento ou membro não encontrado.';
          } else if (error.status === 409) {
            this.errorMessage = 'Um ou mais participantes já estão cadastrados neste evento.';
          } else {
            this.errorMessage = error.message || 'Erro ao adicionar participantes.';
          }
        }
      });
    } else {
      this.markFormGroupTouched(this.addParticipantForm);
    }
  }

  get memberId() {
    return this.addParticipantForm.get('memberId');
  }

  get role() {
    return this.addParticipantForm.get('role');
  }

  openDetailsModal(event: Event): void {
    this.errorMessage = '';
    this.successMessage = '';
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
    this.successMessage = '';
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
