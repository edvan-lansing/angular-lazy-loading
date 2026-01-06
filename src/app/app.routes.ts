import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

/**
 * =========================================
 * CONFIGURAÇÃO DE ROTAS COM LAZY LOADING
 * =========================================
 *
 * Este arquivo define todas as rotas da aplicação SPA.
 *
 * CONCEITOS IMPORTANTES:
 *
 * 1. EAGER LOADING (Carregamento Imediato):
 *    - Componentes importados diretamente no topo do arquivo
 *    - Fazem parte do bundle principal (main.js)
 *    - Carregados quando a aplicação inicia
 *    - Usados para: Home, Login, páginas críticas
 *
 * 2. LAZY LOADING (Carregamento Sob Demanda):
 *    - Componentes NÃO importados no topo
 *    - Usam a função loadComponent() ou loadChildren()
 *    - Criam bundles separados (chunks)
 *    - Só são baixados quando a rota é acessada
 *    - Usados para: Áreas administrativas, módulos grandes
 *
 * BENEFÍCIOS DO LAZY LOADING:
 * ✅ Reduz o tamanho do bundle inicial
 * ✅ Melhora o tempo de carregamento inicial (TTI - Time To Interactive)
 * ✅ Economiza banda - usuário só baixa o que precisa
 * ✅ Melhora métricas Core Web Vitals (FCP, LCP)
 * ✅ Permite que a aplicação cresça sem impactar performance inicial
 */

export const routes: Routes = [
  // ==========================================
  // ROTAS PÚBLICAS (EAGER LOADING)
  // ==========================================
  // Estas rotas são carregadas imediatamente porque
  // fazem parte da primeira experiência do usuário

  {
    path: '', // Rota raiz da aplicação
    loadComponent: () => import('./pages/public-home/public-home').then(m => m.PublicHome),
    title: 'Home - Demonstração Lazy Loading'
  },

  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login),
    title: 'Login'
  },

  {
    path: 'users',
    loadComponent: () => import('./pages/users-list/users-list').then(m => m.UsersListComponent),
    title: 'Lista de Usuários - Service REST'
  },

  // ==========================================
  // ROTAS PROTEGIDAS (LAZY LOADING)
  // ==========================================
  // Estas rotas usam LAZY LOADING e um GUARD
  //
  // O que acontece aqui:
  // 1. Usuário tenta acessar /admin/dashboard
  // 2. authGuard verifica se está autenticado
  // 3. Se NÃO estiver: redireciona para /login (sem carregar código)
  // 4. Se ESTIVER: Angular baixa o chunk do componente
  // 5. Componente é renderizado
  //
  // VANTAGEM: Código protegido só é baixado se o usuário
  // tiver permissão! Segurança + Performance!

  {
    path: 'admin',
    canActivate: [authGuard], // Guard protege todas as rotas filhas
    children: [
      {
        path: '', // /admin redireciona para /admin/dashboard
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        // loadComponent: carrega o componente dinamicamente
        // Isso cria um arquivo separado (ex: dashboard.chunk.js)
        // que só é baixado quando esta rota é acessada
        loadComponent: () =>
          import('./pages/admin/dashboard/dashboard').then(m => m.Dashboard),
        title: 'Dashboard Admin'
      },
      {
        path: 'profile',
        // Outro componente lazy loaded
        // Pode estar no mesmo chunk ou em chunk separado,
        // dependendo das configurações do build
        loadComponent: () =>
          import('./pages/admin/profile/profile').then(m => m.Profile),
        title: 'Perfil Admin'
      }
    ]
  },

  // ==========================================
  // ROTA WILDCARD (404)
  // ==========================================
  // Captura todas as rotas não definidas
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

/**
 * COMO FUNCIONA NA PRÁTICA:
 *
 * 1. Usuário acessa o site (/)
 *    → Carrega: main.js + home component
 *    → Total: ~200KB
 *
 * 2. Usuário clica em "Login"
 *    → Carrega: login component
 *    → Total adicional: ~30KB
 *
 * 3. Usuário faz login com sucesso
 *    → Navega para /admin/dashboard
 *    → authGuard permite passagem
 *    → Angular carrega: admin-dashboard.chunk.js
 *    → Total adicional: ~80KB
 *
 * 4. Usuário navega para /admin/profile
 *    → Se no mesmo chunk: navegação instantânea
 *    → Se chunk separado: carrega profile.chunk.js
 *
 * SEM LAZY LOADING:
 * - Bundle inicial: ~310KB (tudo junto)
 * - Tempo de carregamento: mais lento
 * - Usuário baixa código que pode nunca usar
 *
 * COM LAZY LOADING:
 * - Bundle inicial: ~200KB (só essencial)
 * - Tempo de carregamento: mais rápido
 * - Chunks adicionais sob demanda
 * - Melhor experiência do usuário
 */
