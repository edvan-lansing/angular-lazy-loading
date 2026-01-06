import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, finalize, retry } from 'rxjs/operators';

/**
 * SERVIÇO API - CONSUMINDO REST API COM OBSERVABLES
 * ==================================================
 *
 * Este serviço demonstra como:
 * 1. Usar HttpClient para fazer requisições HTTP
 * 2. Retornar Observables (lazy evaluation)
 * 3. Tratar erros com catchError
 * 4. Usar operadores RxJS
 * 5. Implementar retry automático
 *
 * FLUXO DE DADOS:
 *
 * Componente
 *    │
 *    ▼
 * (chama) apiService.getUsers()
 *    │
 *    ▼
 * Observable é criado (não executa!)
 *    │
 *    ▼
 * Componente faz .subscribe()
 *    │
 *    ▼
 * HttpClient faz requisição HTTP
 *    │
 *    ▼
 * Resposta retorna do servidor
 *    │
 *    ▼
 * Operadores processam os dados (map, filter, etc)
 *    │
 *    ▼
 * catchError trata erros se houver
 *    │
 *    ▼
 * .next() emite para subscribers
 *    │
 *    ▼
 * Componente recebe no callback de subscribe()
 *    │
 *    ▼
 * Componente atualiza a UI
 */

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Api {

  // URL base da API
  // Em produção, viria de um arquivo de configuração
  private readonly API_BASE_URL = 'https://jsonplaceholder.typicode.com';

  // Injetar HttpClient para fazer requisições
  constructor(private http: HttpClient) {}

  /**
   * MÉTODO: Obter lista de usuários
   * ================================
   *
   * Retorna um Observable que emite um array de usuários
   * A requisição não é feita até alguém fazer .subscribe()
   *
   * @returns Observable<User[]>
   */
  getUsers(): Observable<User[]> {
    // 1. HttpClient.get() retorna um Observable
    // Ainda não fez a requisição (lazy evaluation)
    return this.http.get<User[]>(`${this.API_BASE_URL}/users`)
      .pipe(
        // 2. retry(1): Se falhar, tenta 1 vez novamente
        // Útil para falhas de rede temporárias
        retry(1),

        // 3. map(): Transforma os dados recebidos
        // Aqui poderíamos filtrar, processar, etc
        map(users => {
          // Exemplo: adicionar lógica de processamento
          return users.map(user => ({
            ...user,
            email: user.email.toLowerCase()
          }));
        }),

        // 4. catchError(): Trata erros
        // Se houver erro após o retry, chega aqui
        catchError(error => this.handleError(error))
      );
  }

  /**
   * MÉTODO: Obter um usuário específico
   * ===================================
   */
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.API_BASE_URL}/users/${id}`)
      .pipe(
        retry(1),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * MÉTODO: Criar novo usuário
   * ==========================
   *
   * POST request: envia dados para o servidor
   */
  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.API_BASE_URL}/users`, user)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  /**
   * MÉTODO: Atualizar usuário
   * =========================
   *
   * PUT request: substitui recursos
   */
  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API_BASE_URL}/users/${id}`, user)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  /**
   * MÉTODO: Deletar usuário
   * =======================
   *
   * DELETE request: remove recurso
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE_URL}/users/${id}`)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  /**
   * TRATAMENTO DE ERROS
   * ===================
   *
   * Centraliza a lógica de tratamento de erros
   * Oferece mensagens amigáveis ao usuário
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocorreu um erro na requisição';

    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
      console.error('Erro de cliente:', errorMessage);
    } else {
      // Erro do servidor
      errorMessage = `Erro ${error.status}: ${error.statusText}`;

      // Tratar erros específicos
      switch (error.status) {
        case 400:
          errorMessage = 'Requisição inválida';
          break;
        case 401:
          errorMessage = 'Não autenticado';
          break;
        case 403:
          errorMessage = 'Acesso negado';
          break;
        case 404:
          errorMessage = 'Recurso não encontrado';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor';
          break;
      }

      console.error('Erro de servidor:', error);
    }

    // throwError() cria um Observable que emite um erro
    // O subscriber receberá no callback de error()
    return throwError(() => new Error(errorMessage));
  }
}
