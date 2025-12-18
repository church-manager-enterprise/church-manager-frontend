import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ChurchService, Church } from '../../services/church.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  churches: Church[] = [];
  isLoadingChurches = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private churchService: ChurchService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      churchId: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Se já está autenticado, redireciona
    if (this.authService.isAuthenticated()) {
      const user = this.authService.getUser();
      if (user?.role === 'ADMIN') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/dashboard']);
      }
      return;
    }

    // Carrega lista de igrejas
    this.loadChurches();
  }

  loadChurches(): void {
    this.isLoadingChurches = true;
    this.churchService.getAllChurches().subscribe({
      next: (churches) => {
        this.churches = churches;
        this.isLoadingChurches = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar igrejas:', error);
        this.errorMessage = 'Não foi possível carregar a lista de igrejas. Tente novamente.';
        this.isLoadingChurches = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Validador customizado para confirmar senha
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const { name, email, username, password, churchId } = this.registerForm.value;

      const registerData = {
        name,
        email,
        username,
        password,
        churchId
      };

      console.log('📤 Registrando usuário:', { ...registerData, password: '***' });

      this.authService.register(registerData).subscribe({
        next: (response) => {
          console.log('✅ Registro bem-sucedido:', response);
          this.successMessage = 'Cadastro realizado com sucesso! Redirecionando...';

          // Redireciona após 1.5 segundos
          setTimeout(() => {
            const user = this.authService.getUser();
            if (user?.role === 'ADMIN') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          }, 1500);
        },
        error: (error) => {
          console.error('❌ Erro no registro:', error);

          if (error.status === 400) {
            this.errorMessage = 'Dados inválidos. Verifique os campos.';
          } else if (error.status === 409) {
            this.errorMessage = 'Email ou username já cadastrado.';
          } else if (error.status === 404 || error.status === 0) {
            this.errorMessage = 'Servidor não encontrado';
          } else if (error.status === 500) {
            this.errorMessage = 'Erro interno do servidor';
          } else {
            this.errorMessage = error.message || 'Erro ao realizar cadastro';
          }
        },
        complete: () => {
          this.isLoading = false;
          this.cdr.detectChanges();
          console.log('Requisição de registro finalizada');
        }
      });
    } else {
      this.markFormGroupTouched(this.registerForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Getters para validação
  get name() {
    return this.registerForm.get('name');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get username() {
    return this.registerForm.get('username');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get churchId() {
    return this.registerForm.get('churchId');
  }
}
