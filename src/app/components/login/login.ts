import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      const user = this.authService.getUser();
      console.log('Usuário já autenticado:', user);

      if (user?.role === 'ADMIN') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Login bem-sucedido');

          // Redirecionar baseado no role do usuário
          const user = this.authService.getUser();
          if (user?.role === 'ADMIN') {
            console.log('Redirecionando para painel de administração');
            this.router.navigate(['/admin']);
          } else {
            console.log('Redirecionando para dashboard de usuário');
            this.router.navigate(['/dashboard']);
          }
        },
        error: (error) => {
          this.isLoading = false;

          if (error.status === 401) {
            this.errorMessage = 'Email ou senha incorretos. Por favor, tente novamente.';
          } else if (error.status === 404 || error.status === 0) {
            this.errorMessage = 'Não foi possível conectar ao servidor. Verifique se ele está rodando em http://localhost:8080';
          } else if (error.status === 400) {
            this.errorMessage = 'Dados inválidos. Verifique os campos e tente novamente.';
          } else if (error.status === 500) {
            this.errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
          } else {
            this.errorMessage = error.message || 'Erro ao fazer login. Por favor, tente novamente.';
          }

          console.error('Erro no login:', error);
        }
      });
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
