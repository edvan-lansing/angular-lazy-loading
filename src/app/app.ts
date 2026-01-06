import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from './services/auth';

/**
 * COMPONENTE RAIZ DA APLICAÇÃO (App Shell)
 *
 * Este é o componente principal que:
 * 1. Permanece sempre na tela (não é destruído)
 * 2. Contém o RouterOutlet onde os componentes das rotas são injetados
 * 3. Gerencia a navegação principal
 *
 * Observe que NÃO importamos os componentes das páginas aqui!
 * Eles são carregados dinamicamente pelo Router via lazy loading.
 */
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,      // Necessário para renderizar rotas
    RouterLink,        // Para navegação declarativa [routerLink]
    RouterLinkActive   // Para destacar link ativo
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'principais-funcionalidades';

  // Injeta o serviço de autenticação para usar no template
  constructor(public authService: Auth) {}

  /**
   * Realiza logout do usuário
   */
  logout(): void {
    this.authService.logout();
  }
}
