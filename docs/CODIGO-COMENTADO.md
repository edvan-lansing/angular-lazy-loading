# 📝 Código Comentado Linha por Linha

Este documento explica cada parte importante do código com comentários detalhados em português.

---

## 📄 app.routes.ts - Configuração de Rotas

```typescript
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

/**
 * CONFIGURAÇÃO DE ROTAS
 * =====================
 * 
 * Este arquivo define como a aplicação responde a diferentes URLs.
 * É o coração do sistema de navegação da SPA.
 */

export const routes: Routes = [
  
  // ==========================================
  // ROTA RAIZ - HOME PÚBLICA
  // ==========================================
  {
    // path: '' significa a raiz da aplicação (http://localhost:4200/)
    path: '',
    
    // loadComponent: usa dynamic import do ES6
    // Isso cria um chunk separado que pode ser carregado sob demanda
    // Mas neste caso, como é a rota raiz, geralmente é carregado imediatamente
    loadComponent: () => 
      // import() retorna uma Promise do módulo
      import('./pages/public-home/public-home')
        // .then() extrai o componente exportado do módulo
        .then(m => m.PublicHome),
    
    // title: Define o título da aba do browser
    title: 'Home - Demonstração Lazy Loading'
  },
  
  // ==========================================
  // ROTA DE LOGIN
  // ==========================================
  {
    path: 'login',  // http://localhost:4200/login
    
    // Mesmo padrão de carregamento
    loadComponent: () => 
      import('./pages/login/login').then(m => m.Login),
    
    title: 'Login'
  },

  // ==========================================
  // ROTAS PROTEGIDAS - ÁREA ADMINISTRATIVA
  // ==========================================
  {
    path: 'admin',  // http://localhost:4200/admin/*
    
    // canActivate: Array de guards que são executados ANTES da rota carregar
    // Se qualquer guard retornar false, a rota não é carregada
    // BENEFÍCIO: Não desperdiça banda carregando código proibido!
    canActivate: [authGuard],
    
    // children: Rotas filhas que herdam o guard do pai
    children: [
      {
        // path: '' com redirectTo cria um redirecionamento
        path: '',
        redirectTo: 'dashboard',
        // pathMatch: 'full' significa que precisa ser exatamente '/admin'
        // Sem 'full', /admin/qualquercoisa também redirecionaria
        pathMatch: 'full'
      },
      
      // ==========================================
      // DASHBOARD - LAZY LOADED!
      // ==========================================
      {
        path: 'dashboard',  // http://localhost:4200/admin/dashboard
        
        // 🎯 AQUI ACONTECE A MÁGICA DO LAZY LOADING!
        //
        // Quando esta rota é acessada:
        // 1. authGuard valida se o usuário está autenticado
        // 2. Se SIM: Angular executa o import() abaixo
        // 3. import() faz uma requisição HTTP para buscar o chunk
        // 4. Chunk é baixado (ex: chunk-XXXXX.js)
        // 5. Componente é instanciado e renderizado
        // 6. Tudo isso SEM recarregar a página!
        //
        // IMPORTANTE:
        // - Este código NÃO está no bundle inicial
        // - Só é baixado quando necessário
        // - Se usuário não fizer login, nunca é baixado
        loadComponent: () => 
          import('./pages/admin/dashboard/dashboard')
            .then(m => m.Dashboard),
        
        title: 'Dashboard Admin'
      },
      
      // ==========================================
      // PROFILE - TAMBÉM LAZY LOADED!
      // ==========================================
      {
        path: 'profile',  // http://localhost:4200/admin/profile
        
        // Mesmo conceito do Dashboard
        // Pode estar no mesmo chunk ou em chunk separado
        // Depende das configurações de build do Angular
        loadComponent: () => 
          import('./pages/admin/profile/profile')
            .then(m => m.Profile),
        
        title: 'Perfil Admin'
      }
    ]
  },

  // ==========================================
  // WILDCARD - ROTA 404
  // ==========================================
  {
    // path: '**' captura QUALQUER rota não definida acima
    // Deve sempre ser a última rota!
    path: '**',
    
    // Redireciona para a home
    redirectTo: '',
    pathMatch: 'full'
  }
];
```

---

## 🛡️ auth-guard.ts - Guard de Autenticação

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

/**
 * GUARD DE AUTENTICAÇÃO
 * =====================
 * 
 * Guards são funções que o Angular executa ANTES de carregar uma rota.
 * Eles decidem se a rota pode ser ativada ou não.
 */

// CanActivateFn é um tipo de função guard funcional (nova API do Angular)
export const authGuard: CanActivateFn = (route, state) => {
  
  // inject() permite injetar serviços em funções standalone
  // É a forma funcional de injeção de dependências
  const authService = inject(Auth);
  const router = inject(Router);
  
  // Verifica se o usuário está autenticado
  // isAuthenticated() retorna um signal (valor reativo)
  if (authService.isAuthenticated()) {
    // return true: Permite que a rota seja carregada
    // O Angular vai prosseguir com o loadComponent()
    return true;
  }
  
  // Se não estiver autenticado:
  
  // 1. Redireciona para a página de login
  router.navigate(['/login'], {
    // queryParams: Salva a URL que o usuário tentou acessar
    // Depois do login, pode redirecionar de volta para lá
    // state.url contém a URL completa que foi bloqueada
    queryParams: { returnUrl: state.url }
  });
  
  // 2. return false: BLOQUEIA o carregamento da rota
  // IMPORTANTE: O loadComponent() NÃO é executado!
  // O chunk lazy loaded NÃO é baixado!
  // Segurança + Performance!
  return false;
};
```

---

## 🔑 auth.service.ts - Serviço de Autenticação

```typescript
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

/**
 * SERVIÇO DE AUTENTICAÇÃO
 * ========================
 * 
 * Gerencia o estado de autenticação do usuário.
 */

// @Injectable indica que esta classe pode ser injetada em outros componentes
@Injectable({
  // providedIn: 'root' cria uma única instância (singleton) para toda a app
  // Benefício: Todos os componentes compartilham o mesmo estado
  providedIn: 'root',
})
export class Auth {
  
  // ==========================================
  // SIGNAL - REATIVIDADE
  // ==========================================
  
  // signal() cria um valor reativo
  // Quando o valor muda, componentes que o observam são notificados automaticamente
  // É a forma moderna de gerenciar estado no Angular
  private isAuthenticatedSignal = signal<boolean>(false);
  
  // asReadonly() impede que componentes modifiquem o signal diretamente
  // Só este serviço pode mudar o valor
  readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();

  // Constructor é executado quando o serviço é instanciado
  constructor(private router: Router) {
    
    // Verifica se há uma sessão salva no localStorage
    // localStorage persiste dados mesmo após fechar o browser
    const savedAuth = localStorage.getItem('isAuthenticated');
    
    // Se encontrou uma sessão salva, restaura o estado
    if (savedAuth === 'true') {
      // .set() atualiza o valor do signal
      this.isAuthenticatedSignal.set(true);
    }
  }

  /**
   * MÉTODO DE LOGIN
   * ===============
   * 
   * Simula um login de usuário.
   * Em uma aplicação real, aqui seria feita uma chamada HTTP para uma API.
   */
  login(username: string, password: string): boolean {
    
    // Validação simples - aceita qualquer usuário/senha não vazios
    // Em produção, aqui você faria:
    // return this.http.post('/api/login', { username, password })
    if (username && password) {
      
      // 1. Atualiza o signal de autenticação
      this.isAuthenticatedSignal.set(true);
      
      // 2. Persiste no localStorage para manter sessão
      localStorage.setItem('isAuthenticated', 'true');
      
      // 3. Retorna sucesso
      return true;
    }
    
    // Credenciais inválidas
    return false;
  }

  /**
   * MÉTODO DE LOGOUT
   * ================
   * 
   * Desloga o usuário e limpa a sessão.
   */
  logout(): void {
    
    // 1. Atualiza o signal para false
    this.isAuthenticatedSignal.set(false);
    
    // 2. Remove do localStorage
    localStorage.removeItem('isAuthenticated');
    
    // 3. Redireciona para a home
    this.router.navigate(['/']);
  }
}
```

---

## 🏠 app.ts - Componente Raiz

```typescript
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from './services/auth';

/**
 * COMPONENTE RAIZ DA APLICAÇÃO
 * =============================
 * 
 * Este é o "shell" da aplicação que permanece sempre na tela.
 */

@Component({
  // selector: Como o componente é usado no HTML
  // <app-root></app-root>
  selector: 'app-root',
  
  // imports: Componentes/Diretivas standalone que este componente usa
  // Angular 15+ usa standalone components, então não precisa de módulos
  imports: [
    // RouterOutlet: Renderiza o componente da rota atual
    RouterOutlet,
    
    // RouterLink: Diretiva para navegação declarativa [routerLink]="/path"
    RouterLink,
    
    // RouterLinkActive: Adiciona classe CSS quando link está ativo
    RouterLinkActive
  ],
  
  // templateUrl: Caminho para o template HTML
  templateUrl: './app.html',
  
  // styleUrl: Caminho para os estilos CSS (nova propriedade do Angular 17+)
  styleUrl: './app.css'
})
export class App {
  
  title = 'principais-funcionalidades';
  
  // Constructor com injeção de dependências
  // public: Permite usar authService no template
  constructor(public authService: Auth) {}

  /**
   * Método chamado quando usuário clica em "Sair"
   */
  logout(): void {
    // Delega a lógica para o serviço
    this.authService.logout();
  }
}
```

---

## 📊 dashboard.ts - Componente Lazy Loaded

```typescript
import { Component, signal } from '@angular/core';

/**
 * COMPONENTE DASHBOARD
 * ====================
 * 
 * ⚡ ESTE É UM COMPONENTE LAZY LOADED!
 * 
 * Características:
 * - NÃO é importado diretamente em nenhum lugar
 * - É carregado via import() dinâmico em app.routes.ts
 * - Cria um chunk separado no build
 * - Só é baixado quando necessário
 */

@Component({
  selector: 'app-dashboard',
  
  // imports: [] vazio porque este componente não usa outros componentes
  // Se precisasse de pipes, diretivas, etc., listaria aqui
  imports: [],
  
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  
  // Signal para armazenar o nome do usuário
  // Em uma aplicação real, viria do AuthService
  username = signal<string>('Admin');
  
  // OBSERVAÇÃO:
  // Este código todo (TypeScript, HTML, CSS) está em um chunk separado.
  // Quando o build roda, Angular cria algo como:
  // - main.js (200KB) - código principal
  // - chunk-ADMIN-xyz123.js (80KB) - este componente + profile
  //
  // O chunk só é baixado quando:
  // 1. Usuário está autenticado
  // 2. Navega para /admin/dashboard
}
```

---

## 🎨 app.html - Template do Componente Raiz

```html
<!-- 
  TEMPLATE DO COMPONENTE RAIZ
  ===========================
  
  Este HTML permanece sempre na tela.
  Os componentes das rotas são injetados no <router-outlet>.
-->

<div class="app-container">
  
  <!-- ========================================= -->
  <!-- NAVEGAÇÃO PRINCIPAL                       -->
  <!-- ========================================= -->
  <nav class="main-nav">
    <div class="nav-brand">
      <span class="logo">🚀</span>
      <span class="brand-text">Angular Lazy Loading</span>
    </div>
    
    <div class="nav-links">
      
      <!-- ========================================= -->
      <!-- CONTROLE FLOW: @if (Angular 17+)         -->
      <!-- ========================================= -->
      <!-- Substitui *ngIf com sintaxe mais limpa   -->
      
      <!-- Menu para usuários NÃO autenticados -->
      @if (!authService.isAuthenticated()) {
        
        <!-- 
          routerLink: Navega sem recarregar a página
          routerLinkActive: Adiciona classe 'active' quando rota está ativa
          [routerLinkActiveOptions]: Configurações do routerLinkActive
        -->
        <a 
          routerLink="/" 
          routerLinkActive="active" 
          [routerLinkActiveOptions]="{exact: true}"
          class="nav-link"
        >
          🏠 Home
        </a>
        
        <a 
          routerLink="/login" 
          routerLinkActive="active" 
          class="nav-link"
        >
          🔐 Login
        </a>
        
      } @else {
        <!-- Menu para usuários autenticados -->
        
        <a 
          routerLink="/admin/dashboard" 
          routerLinkActive="active" 
          class="nav-link"
        >
          📊 Dashboard
        </a>
        
        <a 
          routerLink="/admin/profile" 
          routerLinkActive="active" 
          class="nav-link"
        >
          👤 Perfil
        </a>
        
        <!-- 
          (click): Event binding - chama método do componente
        -->
        <button 
          (click)="logout()" 
          class="nav-link btn-logout"
        >
          🚪 Sair
        </button>
      }
    </div>
  </nav>

  <!-- ========================================= -->
  <!-- ROUTER OUTLET - O CORAÇÃO DA SPA!        -->
  <!-- ========================================= -->
  <main class="main-content">
    
    <!-- 
      ROUTER OUTLET
      =============
      
      Aqui é onde os componentes das rotas são renderizados.
      
      Funcionamento:
      1. Usuário navega para uma rota (ex: /admin/dashboard)
      2. Angular verifica as rotas em app.routes.ts
      3. Encontra a rota correspondente
      4. Se há guard, executa e valida
      5. Se há loadComponent, baixa o chunk (lazy loading)
      6. Instancia o componente
      7. Injeta o componente AQUI no router-outlet
      8. Componente anterior é destruído
      
      TUDO SEM RECARREGAR A PÁGINA!
    -->
    <router-outlet></router-outlet>
    
  </main>

  <!-- ========================================= -->
  <!-- RODAPÉ COM STATUS                         -->
  <!-- ========================================= -->
  <footer class="app-footer">
    <div class="footer-content">
      <p>
        <strong>Status:</strong> 
        
        <!-- Mostra status de autenticação -->
        @if (authService.isAuthenticated()) {
          <span class="status-badge authenticated">
            ✓ Autenticado
          </span>
          <span class="tech-info">
            | Módulo Admin: Lazy Loaded
          </span>
        } @else {
          <span class="status-badge public">
            🌐 Área Pública
          </span>
          <span class="tech-info">
            | Bundle: Eager Loaded
          </span>
        }
      </p>
      
      <!-- Dica para o desenvolvedor -->
      <p class="footer-note">
        💡 Abra o DevTools (Network) para ver os chunks 
           sendo carregados sob demanda!
      </p>
    </div>
  </footer>
  
</div>
```

---

## 🎯 Pontos-Chave

### Dynamic Import
```typescript
// Import estático (tradicional)
import { Component } from './component';  // ❌ No bundle principal

// Import dinâmico (lazy loading)
import('./component')  // ✅ Chunk separado
  .then(m => m.Component)
```

### Signals
```typescript
// Cria signal
const count = signal(0);

// Lê valor
console.log(count());  // 0

// Atualiza valor
count.set(1);

// Atualiza baseado no valor anterior
count.update(n => n + 1);
```

### Guards
```typescript
// Guard permite acesso
return true;   // Rota carrega

// Guard bloqueia acesso
return false;  // Rota NÃO carrega (lazy load não acontece!)
```

---

## 📚 Referências

- [TypeScript Dynamic Imports](https://www.typescriptlang.org/docs/handbook/modules.html#dynamic-imports)
- [Angular Signals](https://angular.dev/guide/signals)
- [Angular Guards](https://angular.dev/guide/routing/guards)
- [Angular Router](https://angular.dev/guide/routing)

---

**Este código demonstra as melhores práticas de Angular moderno com comentários educacionais!**
