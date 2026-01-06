import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

/**
 * Guard de Autenticação
 *
 * Este guard protege rotas que requerem autenticação.
 * Se o usuário não estiver autenticado, redireciona para o login.
 *
 * Benefício: Impede que código da área logada seja carregado
 * se o usuário não tiver permissão de acesso.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  // Verifica se o usuário está autenticado
  if (authService.isAuthenticated()) {
    return true; // Permite acesso à rota
  }

  // Redireciona para login se não estiver autenticado
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url } // Salva a URL original para redirecionamento pós-login
  });
  return false;
};
