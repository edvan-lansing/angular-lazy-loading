import { Component, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';

/**
 * Componente de Login
 *
 * Página de autenticação do usuário.
 * Carregada de forma eager (imediata) pois faz parte da área pública.
 */
@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule], // FormsModule para usar [(ngModel)]
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  // Campos do formulário
  username = '';
  password = '';

  // Signal para mensagens de erro (reativo)
  errorMessage = signal<string>('');

  constructor(
    private authService: Auth,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  /**
   * Processa o submit do formulário de login
   */
  onSubmit(event: Event): void {
    event.preventDefault();

    // Tenta fazer login
    const success = this.authService.login(this.username, this.password);

    if (success) {
      // Obtém a URL de retorno (se houver) ou vai para dashboard
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';

      // Redireciona para a área logada
      // Aqui o lazy loading será ativado pela primeira vez!
      this.router.navigate([returnUrl]);
    } else {
      this.errorMessage.set('Usuário ou senha inválidos');
    }
  }
}
