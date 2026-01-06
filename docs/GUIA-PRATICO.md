# 📖 Guia Prático: Componentes e Services REST

Exemplos passo a passo com código completo e explicações detalhadas.

---

## 🎯 Caso de Uso Real

Você precisa criar:
1. **Componente Button** reutilizável (Design System)
2. **Service** que consome API REST
3. **Página** que lista usuários com os componentes

---

## 📝 Passo 1: Criar Componente Button Reutilizável

### Código Completo

```typescript
// components/button/button.component.ts

import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css'
})
export class ButtonComponent {
  
  // ========================================
  // INPUTS: Dados que recebe do pai
  // ========================================
  
  @Input() label: string = 'Clique aqui';
  @Input() type: 'primary' | 'secondary' | 'danger' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() icon: string = '';
  
  // ========================================
  // OUTPUTS: Eventos que emite para o pai
  // ========================================
  
  @Output() buttonClick = new EventEmitter<void>();
  
  // ========================================
  // MÉTODOS
  // ========================================
  
  onClick(): void {
    if (this.disabled || this.loading) return;
    this.buttonClick.emit();
  }
  
  get buttonClass(): string {
    return `btn-${this.type} btn-${this.size}`;
  }
}
```

```html
<!-- components/button/button.component.html -->

<button 
  [class]="buttonClass"
  [disabled]="disabled || loading"
  (click)="onClick()"
  type="button"
>
  @if (icon) {
    <span class="btn-icon">{{ icon }}</span>
  }
  <span class="btn-text">{{ label }}</span>
  @if (loading) {
    <span class="btn-spinner">⏳</span>
  }
</button>
```

```css
/* components/button/button.component.css */

button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #2196F3;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1976D2;
}

.btn-danger {
  background: #f44336;
  color: white;
}

.btn-medium {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

### Como Usar

```html
<!-- Uso simples -->
<app-button 
  label="Clique aqui" 
  (buttonClick)="onButtonClick()"
></app-button>

<!-- Customização completa -->
<app-button 
  label="Deletar"
  type="danger"
  size="large"
  icon="🗑️"
  [loading]="isDeleting"
  [disabled]="isDeleting"
  (buttonClick)="onDelete()"
></app-button>

<!-- Múltiplas instâncias -->
<app-button label="Salvar" type="primary" (buttonClick)="onSave()"></app-button>
<app-button label="Cancelar" type="secondary" (buttonClick)="onCancel()"></app-button>
<app-button label="Deletar" type="danger" (buttonClick)="onDelete()"></app-button>
```

---

## 🔌 Passo 2: Criar Service REST com HttpClient

### Pré-requisitos

```typescript
// app.config.ts - Providenciar HttpClientModule

import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),  // ← Necessário para usar HttpClient
    // ... outros providers
  ]
};
```

### Código Completo do Service

```typescript
// services/api.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';

// ========================================
// TIPOS/INTERFACES
// ========================================

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

// ========================================
// SERVICE
// ========================================

@Injectable({
  providedIn: 'root'  // ← Singleton disponível globalmente
})
export class ApiService {
  
  // URL base da API
  private readonly API_URL = 'https://jsonplaceholder.typicode.com';
  
  constructor(private http: HttpClient) {}
  
  /**
   * OBTER LISTA DE USUÁRIOS
   * 
   * Fluxo:
   * 1. http.get() cria Observable
   * 2. retry(1) tenta 1 vez em caso de erro
   * 3. map() transforma dados
   * 4. catchError() trata erros
   * 5. Retorna Observable<User[]>
   */
  getUsers(): Observable<User[]> {
    return this.http
      .get<User[]>(`${this.API_URL}/users`)
      .pipe(
        // Tenta 1 vez novamente em caso de erro
        retry(1),
        
        // Transforma os dados
        map(users => {
          return users.map(user => ({
            ...user,
            email: user.email.toLowerCase()
          }));
        }),
        
        // Trata erros
        catchError(error => this.handleError(error))
      );
  }
  
  /**
   * OBTER UM USUÁRIO ESPECÍFICO
   */
  getUser(id: number): Observable<User> {
    return this.http
      .get<User>(`${this.API_URL}/users/${id}`)
      .pipe(
        retry(1),
        catchError(error => this.handleError(error))
      );
  }
  
  /**
   * CRIAR NOVO USUÁRIO (POST)
   */
  createUser(user: Partial<User>): Observable<User> {
    return this.http
      .post<User>(`${this.API_URL}/users`, user)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }
  
  /**
   * ATUALIZAR USUÁRIO (PUT)
   */
  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http
      .put<User>(`${this.API_URL}/users/${id}`, user)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }
  
  /**
   * DELETAR USUÁRIO (DELETE)
   */
  deleteUser(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.API_URL}/users/${id}`)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }
  
  /**
   * TRATAMENTO CENTRALIZADO DE ERROS
   * 
   * Centralizar tratamento de erros:
   * 1. Código DRY (não repete em cada método)
   * 2. Lógica consistente
   * 3. Fácil de manter
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage: string;
    
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente (sem internet, etc)
      errorMessage = `Erro: ${error.error.message}`;
      console.error('Erro de cliente:', errorMessage);
    } else {
      // Erro do lado do servidor
      
      // Customizar mensagem por código HTTP
      switch (error.status) {
        case 400:
          errorMessage = 'Requisição inválida';
          break;
        case 401:
          errorMessage = 'Não autenticado. Faça login novamente.';
          break;
        case 403:
          errorMessage = 'Você não tem permissão para isso';
          break;
        case 404:
          errorMessage = 'Recurso não encontrado';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor';
          break;
        default:
          errorMessage = `Erro ${error.status}: ${error.statusText}`;
      }
      
      console.error('Erro de servidor:', error);
    }
    
    // Retorna um Observable que emite um erro
    // O subscriber receberá no callback error()
    return throwError(() => new Error(errorMessage));
  }
}
```

---

## 📊 Passo 3: Usar o Service em um Componente

### Código Completo

```typescript
// pages/users-list/users-list.component.ts

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api, User } from '../../services/api';
import { ButtonComponent } from '../../components/button/button';
import { CardComponent } from '../../components/card/card';

@Component({
  selector: 'app-users-list',
  imports: [CommonModule, ButtonComponent, CardComponent],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css'
})
export class UsersListComponent implements OnInit {
  
  // ========================================
  // ESTADO (Signals - valores reativos)
  // ========================================
  
  // Lista de usuários carregados
  users = signal<User[]>([]);
  
  // Está carregando?
  isLoading = signal<boolean>(false);
  
  // Mensagem de erro
  errorMessage = signal<string>('');
  
  // Usuário selecionado
  selectedUser = signal<User | null>(null);
  
  // ========================================
  // CONSTRUCTOR
  // ========================================
  
  constructor(private apiService: Api) {}
  
  // ========================================
  // LIFECYCLE HOOKS
  // ========================================
  
  /**
   * ngOnInit: Executado após o componente ser inicializado
   * Lugar perfeito para carregar dados
   */
  ngOnInit(): void {
    this.loadUsers();
  }
  
  // ========================================
  // MÉTODOS
  // ========================================
  
  /**
   * CARREGAR USUÁRIOS
   * 
   * Demonstra o fluxo completo:
   * 1. Service retorna Observable
   * 2. Component faz subscribe()
   * 3. Operadores processam dados
   * 4. Errors são tratados
   * 5. UI é atualizada
   */
  loadUsers(): void {
    // 1. Mostrar loading
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    // 2. Chamar service
    this.apiService.getUsers().subscribe({
      
      // 3. Sucesso: Dados chegaram
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
        console.log('✓ Usuários carregados:', users);
      },
      
      // 4. Erro: Algo deu errado
      error: (error) => {
        this.errorMessage.set(error.message);
        this.isLoading.set(false);
        console.error('✗ Erro ao carregar:', error);
      },
      
      // 5. Completo: Observable terminou
      complete: () => {
        console.log('✓ Observable completado');
      }
    });
  }
  
  /**
   * SELECIONAR USUÁRIO
   * 
   * Demonstra captura de @Output do componente Button
   */
  onSelectUser(user: User): void {
    this.selectedUser.set(user);
  }
  
  /**
   * DELETAR USUÁRIO
   * 
   * Demonstra DELETE request
   */
  onDeleteUser(user: User): void {
    if (!confirm(`Deletar ${user.name}?`)) return;
    
    this.apiService.deleteUser(user.id).subscribe({
      next: () => {
        // Remove da lista
        const updated = this.users().filter(u => u.id !== user.id);
        this.users.set(updated);
      },
      error: (error) => {
        this.errorMessage.set(`Erro: ${error.message}`);
      }
    });
  }
  
  /**
   * RECARREGAR
   */
  onReload(): void {
    this.loadUsers();
  }
}
```

### Template (HTML)

```html
<!-- pages/users-list/users-list.component.html -->

<div class="users-container">
  <h1>👥 Lista de Usuários</h1>
  
  <!-- Botão de recarregar usando componente reutilizável -->
  <app-button
    label="🔄 Recarregar"
    type="primary"
    [loading]="isLoading()"
    (buttonClick)="onReload()"
  ></app-button>

  <!-- Estado de carregamento -->
  @if (isLoading()) {
    <p>⏳ Carregando...</p>
  }

  <!-- Estado de erro -->
  @if (errorMessage()) {
    <div class="error">
      <p>⚠️ {{ errorMessage() }}</p>
      <app-button label="Tentar Novamente" (buttonClick)="onReload()"></app-button>
    </div>
  }

  <!-- Lista de usuários -->
  @if (!isLoading() && !errorMessage()) {
    <div class="users-grid">
      @for (user of users(); track user.id) {
        <!-- Card reutilizável -->
        <app-card [title]="user.name" [subtitle]="user.email">
          <p>{{ user.email }}</p>
          
          <!-- Botões usando componente reutilizável -->
          <app-button
            label="Selecionar"
            type="primary"
            size="small"
            (buttonClick)="onSelectUser(user)"
          ></app-button>
          
          <app-button
            label="Deletar"
            type="danger"
            size="small"
            (buttonClick)="onDeleteUser(user)"
          ></app-button>
        </app-card>
      }
    </div>
  }

  <!-- Detalhes do usuário selecionado -->
  @if (selectedUser(); as user) {
    <app-card [title]="'Detalhes: ' + user.name">
      <p><strong>ID:</strong> {{ user.id }}</p>
      <p><strong>Email:</strong> {{ user.email }}</p>
      <p><strong>Telefone:</strong> {{ user.phone }}</p>
      
      <app-button
        label="Fechar"
        (buttonClick)="selectedUser.set(null)"
      ></app-button>
    </app-card>
  }
</div>
```

---

## 🎓 Fluxo Visual Completo

### 1. Componente Inicia (ngOnInit)

```
┌──────────────────────┐
│ users-list.component │
│    ngOnInit()        │
│   loadUsers()        │ ← Chamado automaticamente
└──────────────────────┘
```

### 2. Service é Chamado

```
┌──────────────────────┐
│ users-list.component │
└──────────────────────┘
           │
           │ this.apiService.getUsers()
           ▼
┌──────────────────────┐
│   api.service.ts     │
│  getUsers() { ... }  │ ← Observable criado, mas...
└──────────────────────┘
           │
           │ ⚠️ AINDA NÃO EXECUTOU!
           │
           ▼
┌──────────────────────┐
│ Observable criado    │
│ Aguardando subscribe │
└──────────────────────┘
```

### 3. Subscribe é Feito

```
┌──────────────────────┐
│.subscribe({          │
│  next: (users) => {},│ ← Agora executa!
│  error: (e) => {},   │
│})                    │
└──────────────────────┘
           │
           ▼
┌──────────────────────┐
│  HttpClient faz      │
│  GET /api/users      │
└──────────────────────┘
           │
           ▼
┌──────────────────────┐
│  Servidor responde   │
│  HTTP 200 OK         │
│  [{...}, {...}]      │
└──────────────────────┘
```

### 4. Operadores Processam

```
┌──────────────────────┐
│  Dados chegam        │
├──────────────────────┤
│  retry(1) ✓          │ (sem erro)
│  map(...) ✓          │ (transforma)
│  catchError(...) ✓   │ (sem erro)
└──────────────────────┘
           │
           ▼
┌──────────────────────┐
│  next(users)         │ ← Emite para subscriber
└──────────────────────┘
```

### 5. Componente Atualiza

```
┌──────────────────────┐
│ next: (users) => {   │
│   this.users.set()   │
│   this.isLoading.set │
│ }                    │
└──────────────────────┘
           │
           ▼
┌──────────────────────┐
│ Signal updated       │
│ Template re-renders  │
└──────────────────────┘
```

---

## 🧪 Como Testar

### 1. Verificar no DevTools

```javascript
// Network tab
GET https://jsonplaceholder.typicode.com/users
Status: 200
Response: [{id: 1, name: '...', email: '...'}, ...]
```

### 2. Verificar Console

```javascript
✓ Usuários carregados: Array(10)
✓ Observable completado
```

### 3. Testar Erro (Desconectar Internet)

```javascript
✗ Erro ao carregar: Error: Failed to fetch
```

---

## 📋 Checklist de Implementação

- [ ] Componente Button criado com @Input/@Output
- [ ] Service Api criado com HttpClient
- [ ] Métodos CRUD (GET, POST, PUT, DELETE)
- [ ] Tratamento de erros centralizado
- [ ] Página de usuários usando service
- [ ] Loading state implementado
- [ ] Error state implementado
- [ ] Componentes reutilizáveis na página
- [ ] HttpClient providenciado em app.config
- [ ] Signals para estado reativo

---

**Conclusão:** Este guia demonstra os padrões mais importantes para aplicações Angular profissionais!
