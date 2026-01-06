import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api, User } from '../../services/api';
import { ButtonComponent } from '../../components/button/button';
import { CardComponent } from '../../components/card/card';

/**
 * COMPONENTE USERS-LIST
 * =====================
 *
 * Demonstra como:
 * 1. Usar um service que retorna Observables
 * 2. Subscribir a um Observable
 * 3. Usar componentes reutilizáveis (@Input, @Output)
 * 4. Tratar estados de carregamento e erro
 * 5. Unsubscribe automático com async pipe (se usado)
 *
 * ARQUITETURA:
 *
 * Component (users-list)
 *         │
 *         ├─► Injeta Api Service
 *         │       │
 *         │       └─► HttpClient
 *         │
 *         ├─► Signals para estado
 *         │
 *         ├─► Usa componente Button (reutilizável)
 *         │
 *         └─► Usa componente Card (reutilizável)
 */

@Component({
  selector: 'app-users-list',
  imports: [CommonModule, ButtonComponent, CardComponent],
  templateUrl: './users-list.html',
  styleUrl: './users-list.css'
})
export class UsersListComponent implements OnInit {

  /**
   * SIGNALS - ESTADO REATIVO
   * =======================
   *
   * Signals são valores reativos que notificam quando mudam
   * Componente re-renderiza automaticamente
   */

  // Lista de usuários
  users = signal<User[]>([]);

  // Estado de carregamento
  isLoading = signal<boolean>(false);

  // Mensagem de erro
  errorMessage = signal<string>('');

  // Usuário selecionado (null = nenhum)
  selectedUser = signal<User | null>(null);

  constructor(private apiService: Api) {}

  /**
   * LIFECYCLE HOOK: OnInit
   * ======================
   *
   * Executado automaticamente após o componente ser inicializado
   * Lugar perfeito para carregar dados
   */
  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * MÉTODO: Carregar usuários
   * ==========================
   *
   * Demonstra fluxo completo:
   * 1. Service retorna Observable
   * 2. Component faz .subscribe()
   * 3. Operadores processam dados
   * 4. Errors são tratados
   * 5. UI é atualizada
   */
  loadUsers(): void {
    // 1. Mostrar estado de carregamento
    this.isLoading.set(true);
    this.errorMessage.set('');

    // 2. Chamar service
    // Observable não executa até aqui!
    this.apiService.getUsers().subscribe({
      // 3. next(): Executado quando dados chegam
      next: (users) => {
        // Atualizar signal com dados
        this.users.set(users);

        // Esconder loading
        this.isLoading.set(false);

        console.log('✓ Usuários carregados:', users);
      },

      // 4. error(): Executado se houver erro
      error: (error) => {
        // Mostrar mensagem de erro
        this.errorMessage.set(error.message);

        // Esconder loading
        this.isLoading.set(false);

        console.error('✗ Erro ao carregar usuários:', error);
      },

      // 5. complete(): Executado quando Observable termina
      complete: () => {
        console.log('✓ Observable completado');
      }
    });
  }

  /**
   * MÉTODO: Selecionar usuário
   * ===========================
   *
   * Demonstra Input e Output de componentes:
   * - Button emite 'buttonClick'
   * - Aqui capturamos com (buttonClick)="onSelectUser(...)"
   */
  onSelectUser(user: User): void {
    this.selectedUser.set(user);
    console.log('Usuário selecionado:', user);
  }

  /**
   * MÉTODO: Recarregar dados
   * =========================
   *
   * Usa o componente Button com @Output
   */
  onReload(): void {
    this.loadUsers();
  }

  /**
   * MÉTODO: Deletar usuário
   * =======================
   *
   * Demonstra DELETE request do service
   */
  onDeleteUser(user: User): void {
    // Confirma antes de deletar
    if (!confirm(`Tem certeza que deseja deletar ${user.name}?`)) {
      return;
    }

    this.apiService.deleteUser(user.id).subscribe({
      next: () => {
        // Remove da lista local
        const updatedUsers = this.users().filter(u => u.id !== user.id);
        this.users.set(updatedUsers);

        // Limpa seleção
        if (this.selectedUser()?.id === user.id) {
          this.selectedUser.set(null);
        }

        console.log('✓ Usuário deletado');
      },
      error: (error) => {
        this.errorMessage.set(`Erro ao deletar: ${error.message}`);
        console.error('Erro:', error);
      }
    });
  }
}
