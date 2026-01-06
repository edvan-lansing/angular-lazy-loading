# 🏗️ Arquitetura Orientada a Componentes Angular

Guia completo de como criar componentes reutilizáveis e services REST profissionais em Angular.

---

## 📚 Índice

1. [Componentes Reutilizáveis](#componentes-reutilizáveis)
2. [Input e Output](#input-e-output)
3. [Design System](#design-system)
4. [Services REST](#services-rest)
5. [Observables e RxJS](#observables-e-rxjs)
6. [Tratamento de Erros](#tratamento-de-erros)
7. [Fluxo de Dados](#fluxo-de-dados)
8. [Exemplos Práticos](#exemplos-práticos)

---

## 🎨 Componentes Reutilizáveis

### O que é um Componente Reutilizável?

Um componente reutilizável é um **componente independente** que:

✅ Não depende de contexto específico  
✅ Pode ser usado em múltiplos lugares  
✅ É fácil de manter e testar  
✅ Tem responsabilidade única  
✅ Comunica com pai/filho via @Input/@Output  

### Exemplo: Componente Button

```typescript
// button.ts - O componente tem UMA responsabilidade: renderizar um botão

@Component({
  selector: 'app-button',
  template: `<button [class]="buttonClass">{{ label }}</button>`,
  styles: [`/* estilos encapsulados */`]
})
export class ButtonComponent {
  // Recebe dados do pai
  @Input() label: string = 'Clique';
  @Input() type: 'primary' | 'danger' = 'primary';
  
  // Comunica com pai
  @Output() buttonClick = new EventEmitter<void>();
}
```

### Por que Reutilizável?

```typescript
// Pode ser usado em qualquer lugar!

// Home - botão de ação
<app-button label="Login" (buttonClick)="login()"></app-button>

// Admin - botão de deletar
<app-button label="Deletar" type="danger" (buttonClick)="delete()"></app-button>

// Form - botão de submit
<app-button label="Enviar" type="primary" (buttonClick)="submit()"></app-button>
```

**Benefício:** Mesmo componente, múltiplos usos, código DRY (Don't Repeat Yourself)

---

## 📤 Input e Output

### @Input: Dados do Pai → Filho

```typescript
// Componente pai envia dados para o filho

// card.component.ts
@Component({
  selector: 'app-card',
  template: `<div><h3>{{ title }}</h3><ng-content></ng-content></div>`
})
export class CardComponent {
  @Input() title: string;     // Recebe do pai
  @Input() subtitle: string;  // Recebe do pai
}

// app.html - Uso
<app-card 
  title="Título Dinâmico" 
  subtitle="Subtítulo"
></app-card>
```

**Fluxo:**
```
Pai (app.component)
  │
  ├─► title = "Novo Título"
  │
  └──► Filho recebe via @Input
       └─► Renderiza: <h3>Novo Título</h3>
```

### @Output: Eventos do Filho → Pai

```typescript
// Componente filho emite eventos para o pai

// button.component.ts
@Component({
  selector: 'app-button'
})
export class ButtonComponent {
  @Output() buttonClick = new EventEmitter<void>();
  
  onClick(): void {
    this.buttonClick.emit();  // Emite para o pai
  }
}

// app.html - Uso
<app-button (buttonClick)="meuMetodo()"></app-button>
```

**Fluxo:**
```
Pai (app.component)
  │
  └─► (buttonClick)="meuMetodo()"
      │
      └──► Escuta o evento
           │
           └─► Filho clica no botão
               │
               └─► @Output emite
                   │
                   └─► Pai executa meuMetodo()
```

### Comunicação Bidirecional

```typescript
// Pai envia dados E recebe eventos

<app-card 
  [title]="cardTitle"          // Dados → Filho
  (buttonClick)="onCardClick()" // Evento ← Filho
>
  Conteúdo
</app-card>
```

---

## 🎨 Design System

### O que é um Design System?

Um **Design System** é um conjunto de componentes padronizados e reutilizáveis que mantêm consistência visual em toda a aplicação.

### Componentes do Design System

```
design-system/
├── button/              # Botão (primary, secondary, danger)
├── card/               # Card com elevação
├── input/              # Campo de texto
├── checkbox/           # Checkbox customizado
├── dropdown/           # Dropdown/Select
├── modal/              # Modal
└── toast/              # Notificações
```

### Exemplo de Design System

```typescript
// styles/colors.ts
export const COLORS = {
  primary: '#2196F3',
  danger: '#f44336',
  success: '#4CAF50'
};

// styles/typography.ts
export const TYPOGRAPHY = {
  h1: { size: '2rem', weight: 600 },
  h2: { size: '1.5rem', weight: 600 },
  body: { size: '1rem', weight: 400 }
};

// components/button/button.css
button.btn-primary {
  background: var(--color-primary);
  padding: var(--spacing-md);
  font-size: var(--font-body);
}
```

### Benefícios do Design System

✅ **Consistência Visual:** Mesmo look & feel em toda a app  
✅ **Manutenção:** Mudança em um lugar afeta tudo  
✅ **Performance:** Componentes já otimizados  
✅ **Produtividade:** Develop mais rápido  
✅ **Escalabilidade:** Fácil adicionar novos componentes  

---

## 🔌 Services REST

### O que é um Service?

Um **Service** é uma classe que encapsula lógica de negócio e reutilizável:

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  // Lógica para trabalhar com usuários
  // Separado dos componentes
  // Pode ser injetado em qualquer lugar
}
```

### Benefícios de Services

✅ **Separação de Responsabilidades:** Componentes focam em UI  
✅ **Reutilização:** Mesma lógica em múltiplos componentes  
✅ **Testabilidade:** Fácil de fazer unit tests  
✅ **Manutenção:** Mudanças centralizadas  

### Estrutura de um Service REST

```typescript
@Injectable({ providedIn: 'root' })
export class ApiService {
  
  private API_URL = 'https://api.example.com';
  
  constructor(private http: HttpClient) {}
  
  // GET - Obter dados
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/users`);
  }
  
  // POST - Criar
  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/users`, user);
  }
  
  // PUT - Atualizar
  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/users/${id}`, user);
  }
  
  // DELETE - Deletar
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/users/${id}`);
  }
}
```

---

## 🔄 Observables e RxJS

### O que é um Observable?

Um **Observable** é um objeto que representa um **fluxo de dados ao longo do tempo**.

```typescript
// Observable: não executa imediatamente
const observable$ = this.http.get('/api/users');

// Só executa quando alguém faz subscribe()
observable$.subscribe(data => {
  console.log(data); // Aqui sim executa!
});
```

### Comparação: Promise vs Observable

```typescript
// Promise - Executa imediatamente
const promise = fetch('/api/users');
// Já está buscando!

// Observable - Não executa até subscribe()
const observable$ = this.http.get('/api/users');
// Ainda não buscou!

// Só agora busca
observable$.subscribe(data => {
  console.log(data);
});
```

### Operadores RxJS

Operadores transformam e manipulam fluxos de dados:

```typescript
// map: Transforma cada valor
this.http.get('/api/users')
  .pipe(
    map(users => users.map(u => u.name))  // Extrai nomes
  );

// filter: Filtra valores
this.http.get('/api/users')
  .pipe(
    filter(users => users.length > 0)  // Só se tiver usuários
  );

// retry: Tenta novamente em caso de erro
this.http.get('/api/users')
  .pipe(
    retry(3)  // Tenta 3 vezes
  );

// catchError: Trata erros
this.http.get('/api/users')
  .pipe(
    catchError(error => {
      console.error(error);
      return of([]);  // Retorna array vazio
    })
  );
```

### Pipe: Encadeando Operadores

```typescript
// pipe() encadeia múltiplos operadores
this.http.get<User[]>('/api/users')
  .pipe(
    retry(1),                          // 1º: Retry
    map(users => users.sort(...)),     // 2º: Ordenar
    filter(users => users.length > 0), // 3º: Filtrar
    catchError(error => ...)           // 4º: Tratar erro
  )
  .subscribe(data => {
    // 5º: Dados processados chegam aqui
  });
```

---

## 🚨 Tratamento de Erros

### Tipos de Erros HTTP

```typescript
// 400: Bad Request - Dados inválidos
// 401: Unauthorized - Não autenticado
// 403: Forbidden - Sem permissão
// 404: Not Found - Recurso não existe
// 500: Internal Server Error - Erro do servidor
```

### catchError em Detalhes

```typescript
private handleError(error: HttpErrorResponse): Observable<never> {
  let errorMessage = '';

  if (error.error instanceof ErrorEvent) {
    // Erro do cliente (ex: sem internet)
    errorMessage = `Erro: ${error.error.message}`;
  } else {
    // Erro do servidor
    switch (error.status) {
      case 400:
        errorMessage = 'Dados inválidos';
        break;
      case 401:
        errorMessage = 'Não autenticado';
        break;
      case 404:
        errorMessage = 'Não encontrado';
        break;
      default:
        errorMessage = `Erro ${error.status}`;
    }
  }

  // Retorna erro para o subscriber
  return throwError(() => new Error(errorMessage));
}

// Usar em qualquer requisição
getUsers(): Observable<User[]> {
  return this.http.get<User[]>('/api/users')
    .pipe(
      catchError(error => this.handleError(error))
    );
}
```

### No Componente

```typescript
loadUsers(): void {
  this.apiService.getUsers().subscribe({
    next: (users) => {
      this.users = users;  // Sucesso
    },
    error: (error) => {
      this.errorMessage = error.message;  // Erro
    },
    complete: () => {
      console.log('Completo');
    }
  });
}
```

---

## 📊 Fluxo de Dados

### Fluxo Completo: Componente → Service → API → Componente

```
┌─────────────────────────────────────────────────────────┐
│ 1. COMPONENTE INICIA                                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  constructor(private api: ApiService) {}              │
│  ngOnInit(): void {                                    │
│    this.loadUsers();  // Chama o serviço              │
│  }                                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ 2. SERVICE CRIA OBSERVABLE                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  getUsers(): Observable<User[]> {                      │
│    return this.http.get('/api/users')  // Observable!  │
│      .pipe(                                            │
│        retry(1),                                       │
│        catchError(...)                                 │
│      );                                                │
│  }                                                      │
│                                                         │
│  ⚠️ AINDA NÃO FEZ REQUISIÇÃO!                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ 3. COMPONENTE FAZ SUBSCRIBE()                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  this.api.getUsers().subscribe({                       │
│    next: (users) => { ... },                           │
│    error: (error) => { ... },                          │
│    complete: () => { ... }                             │
│  });                                                    │
│                                                         │
│  ✅ AGORA SIM, REQUISIÇÃO COMEÇA!                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ 4. HttpClient FAZ REQUISIÇÃO HTTP                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  GET https://api.example.com/users                     │
│                                                         │
│  Aguardando resposta do servidor...                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ 5. SERVIDOR RESPONDE                                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  HTTP 200 OK                                           │
│  [{id: 1, name: 'João'}, {id: 2, name: 'Maria'}]     │
│                                                         │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ 6. OPERADORES PROCESSAM DADOS                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  retry(1)        ✓ Passou (sem erro)                  │
│  map(...)        ✓ Transformou dados                  │
│  catchError(...) ✓ Não precisa (sem erro)             │
│                                                         │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ 7. COMPONENTE RECEBE DADOS                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  next: (users) => {                                    │
│    this.users = users;  // Dados chegam aqui!          │
│    this.isLoading = false;                             │
│  }                                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ 8. COMPONENTE ATUALIZA UI                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Template re-renderiza com novo estado                 │
│  *ngFor com this.users mostra lista                    │
│                                                         │
│  Usuário vê: ✅ Lista carregada!                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Fluxo em Caso de Erro

```
Servidor responde com erro (404, 500, etc)
            │
            ▼
catchError intercepta
            │
            ▼
handleError processa
            │
            ▼
throwError emite erro
            │
            ▼
error callback do subscribe() recebe
            │
            ▼
this.errorMessage = error.message
            │
            ▼
Template mostra mensagem de erro
            │
            ▼
Usuário vê: ⚠️ Erro ao carregar dados
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Componente Button Reutilizável

```typescript
// button.component.ts
@Component({
  selector: 'app-button',
  template: `
    <button [class]="buttonClass" (click)="onClick()">
      {{ label }}
    </button>
  `,
  styles: [`
    .btn-primary { background: #2196F3; }
    .btn-danger { background: #f44336; }
  `]
})
export class ButtonComponent {
  @Input() label: string;
  @Input() type: 'primary' | 'danger' = 'primary';
  @Output() buttonClick = new EventEmitter<void>();
  
  get buttonClass(): string {
    return `btn-${this.type}`;
  }
  
  onClick(): void {
    this.buttonClick.emit();
  }
}

// app.component.html
<app-button 
  label="Deletar" 
  type="danger" 
  (buttonClick)="onDelete()"
></app-button>

<app-button 
  label="Salvar" 
  type="primary" 
  (buttonClick)="onSave()"
></app-button>
```

### Exemplo 2: Service REST com Tratamento de Erro

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}
  
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users')
      .pipe(
        retry(1),
        catchError(error => {
          console.error('Erro ao carregar usuários:', error);
          return throwError(() => 
            new Error('Não foi possível carregar usuários')
          );
        })
      );
  }
}

// user-list.component.ts
export class UserListComponent implements OnInit {
  users$ = signal<User[]>([]);
  error$ = signal<string>('');
  loading$ = signal<boolean>(false);
  
  constructor(private userService: UserService) {}
  
  ngOnInit(): void {
    this.loadUsers();
  }
  
  loadUsers(): void {
    this.loading$.set(true);
    
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users$.set(users);
        this.loading$.set(false);
      },
      error: (error) => {
        this.error$.set(error.message);
        this.loading$.set(false);
      }
    });
  }
}
```

---

## 🎯 Resumo das Melhores Práticas

### Componentes Reutilizáveis

✅ Uma responsabilidade por componente  
✅ Use @Input para dados  
✅ Use @Output para eventos  
✅ Estilos encapsulados  
✅ Nomes descritivos  

### Services

✅ Encapsule lógica de negócio  
✅ Retorne Observables  
✅ Trate erros centralmente  
✅ Injete com `providedIn: 'root'`  
✅ Faça unit tests  

### Observables

✅ Use pipe() para encadear operadores  
✅ Sempre se unscriba (ou use async pipe)  
✅ Trate erros com catchError  
✅ Use retry para resiliência  
✅ Tipifique corretamente  

### Estrutura de Projeto

```
src/app/
├── components/           # Componentes reutilizáveis
│   ├── button/
│   ├── card/
│   └── input/
├── services/            # Services com lógica de negócio
│   ├── api.service.ts
│   ├── auth.service.ts
│   └── user.service.ts
└── pages/              # Componentes de página
    ├── home/
    ├── users-list/
    └── dashboard/
```

---

**Conclusão:** Uma arquitetura bem estruturada com componentes reutilizáveis e services profissionais é fundamental para aplicações Angular escaláveis e mantíveis!
