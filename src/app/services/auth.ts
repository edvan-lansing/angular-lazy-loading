import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Serviço de Autenticação
 *
 * Gerencia o estado de autenticação do usuário.
 * Utiliza signals para reatividade automática em toda a aplicação.
 */
@Injectable({
  providedIn: 'root', // Serviço disponível globalmente como singleton
})
export class Auth {
  // Signal que armazena o estado de autenticação (reativo)
  private isAuthenticatedSignal = signal<boolean>(false);

  // Expõe o signal como readonly para componentes
  readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();

  constructor(private router: Router) {
    // Verifica se há sessão salva no localStorage
    const savedAuth = localStorage.getItem('isAuthenticated');
    if (savedAuth === 'true') {
      this.isAuthenticatedSignal.set(true);
    }
  }

  /**
   * Simula um login
   * Em uma aplicação real, aqui seria feita uma chamada HTTP para API
   */
  login(username: string, password: string): boolean {
    // Simulação simples - aceita qualquer usuário/senha não vazios
    if (username && password) {
      this.isAuthenticatedSignal.set(true);
      localStorage.setItem('isAuthenticated', 'true');
      return true;
    }
    return false;
  }

  /**
   * Realiza logout e redireciona para home
   */
  logout(): void {
    this.isAuthenticatedSignal.set(false);
    localStorage.removeItem('isAuthenticated');
    this.router.navigate(['/']);
  }
}
