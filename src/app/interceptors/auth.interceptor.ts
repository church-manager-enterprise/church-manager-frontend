import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Clona a requisição e adiciona token se disponível (exceto em rotas de auth)
  let clonedRequest = req;
  const isAuthRoute = req.url.includes('/auth/login') || req.url.includes('/auth/register');
  
  if (token && !isAuthRoute) {
    clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Trata TODAS as requisições de forma consistente
  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Verifica se é erro de autenticação/autorização
      if (error.status === 401 || error.status === 403) {
        // Para rotas de login/register, NÃO redireciona (deixa componente tratar)
        if (isAuthRoute) {
          console.log(`Erro ${error.status} em rota de autenticação. Componente irá tratar.`);
          return throwError(() => error);
        }

        // Para TODAS as outras rotas, redireciona automaticamente
        console.warn(`Erro ${error.status}: Acesso negado. Redirecionando para login...`);
        
        // Limpa dados de autenticação
        authService.logout();
        
        // Redireciona para login com informações contextuais
        router.navigate(['/login'], {
          queryParams: { 
            returnUrl: router.url,
            reason: error.status === 401 ? 'unauthorized' : 'forbidden'
          }
        });
      }
      
      // Propaga o erro para permitir tratamento adicional se necessário
      return throwError(() => error);
    })
  );
};
