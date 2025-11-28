import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onEntrar(): void {
    this.authService.login('usuario@church.com', '123456').subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Erro ao fazer login:', error);
      }
    });
  }
}
