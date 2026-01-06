import { Component, signal } from '@angular/core';

/**
 * Componente Profile da Área Administrativa
 *
 * ⚡ LAZY LOADED - Carregado sob demanda junto com o módulo admin!
 *
 * Faz parte do mesmo chunk que o Dashboard, sendo carregado
 * quando qualquer rota /admin/* é acessada pela primeira vez.
 */
@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  username = signal<string>('Admin User');

  /**
   * Retorna as iniciais do nome para o avatar
   */
  getInitials(): string {
    return this.username()
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  /**
   * Retorna a data atual formatada
   */
  getCurrentDate(): string {
    return new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

