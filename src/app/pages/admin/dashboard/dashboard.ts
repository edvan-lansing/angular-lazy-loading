import { Component, signal } from '@angular/core';

/**
 * Componente Dashboard da Área Administrativa
 *
 * ⚡ LAZY LOADED - Este componente NÃO é carregado no bundle inicial!
 *
 * Ele só será baixado quando o usuário:
 * 1. Fizer login com sucesso
 * 2. Navegar para /admin/dashboard
 *
 * Isso reduz significativamente o tamanho inicial da aplicação,
 * melhorando o tempo de carregamento inicial (First Contentful Paint).
 */
@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  // Signal com nome do usuário (em app real viria do serviço de auth)
  username = signal<string>('Admin');
}
