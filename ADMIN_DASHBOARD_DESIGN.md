# Painel Administrativo Angular - Documento de Projeto

**Versão:** Angular 19+  
**Data:** 2026-04-19  
**Status:** Especificação de Arquitetura

---

## 1. Visão Geral

Painel administrativo moderno em Angular com SSR, Signals, Tailwind CSS (Clean Preflight), Jest e boas práticas atualizadas. Interface limpa, performática e escalável para gerenciamento de recursos.

---

## 2. Arquitetura & Stack

### Tech Stack
```
Angular 19+ (latest standalone components)
TypeScript 5.5+
Signals API (reactivity)
SSR (Angular Universal)
RxJS 7.8+ (complementar)
Tailwind CSS 4 (Clean Preflight)
Jest 29+ (testing)
Nx/Monorepo (opcional, recomendado)
```

### Conceitos Chave
- **Signals**: State management local, granular reactivity
- **SSR**: Server-side rendering com ng serve --ssr
- **Standalone**: Sem NgModules (componentes declarativos)
- **Lazy Loading**: Rotas por feature
- **OnPush Strategy**: Change detection otimizado

---

## 3. Estrutura de Pastas

```
painel/
├── src/
│   ├── app/
│   │   ├── app.config.ts                    # Configuração global (providers)
│   │   ├── app.routes.ts                    # Rotas da aplicação
│   │   ├── app.component.ts                 # Root component (layout)
│   │   │
│   │   ├── core/                            # Singleton services, guards
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts          # Autenticação
│   │   │   │   ├── api.service.ts           # HTTP client wrapper
│   │   │   │   ├── notification.service.ts  # Toast/alertas
│   │   │   │   └── theme.service.ts         # Gerenciamento de tema
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── role.guard.ts
│   │   │   └── interceptors/
│   │   │       ├── auth.interceptor.ts
│   │   │       └── error.interceptor.ts
│   │   │
│   │   ├── shared/                          # Componentes, pipes, directives reutilizáveis
│   │   │   ├── components/
│   │   │   │   ├── header/
│   │   │   │   ├── sidebar/
│   │   │   │   ├── footer/
│   │   │   │   ├── button/
│   │   │   │   ├── modal/
│   │   │   │   ├── table/
│   │   │   │   ├── form/
│   │   │   │   ├── card/
│   │   │   │   └── pagination/
│   │   │   ├── directives/
│   │   │   │   ├── debounce.directive.ts
│   │   │   │   └── permission.directive.ts
│   │   │   ├── pipes/
│   │   │   │   ├── currency.pipe.ts
│   │   │   │   └── date-format.pipe.ts
│   │   │   └── models/
│   │   │       └── common.models.ts
│   │   │
│   │   ├── features/                        # Módulos de feature (lazy-loaded)
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard.routes.ts
│   │   │   │   ├── pages/
│   │   │   │   │   ├── overview/
│   │   │   │   │   │   ├── overview.component.ts
│   │   │   │   │   │   ├── overview.component.html
│   │   │   │   │   │   ├── overview.component.spec.ts
│   │   │   │   │   │   └── overview.component.css
│   │   │   │   │   └── analytics/
│   │   │   │   └── components/
│   │   │   │       ├── stats-card/
│   │   │   │       ├── chart/
│   │   │   │       └── activity-feed/
│   │   │   │
│   │   │   ├── users/
│   │   │   │   ├── users.routes.ts
│   │   │   │   ├── pages/
│   │   │   │   │   ├── list/
│   │   │   │   │   ├── detail/
│   │   │   │   │   └── form/
│   │   │   │   ├── services/
│   │   │   │   │   └── user.service.ts
│   │   │   │   └── models/
│   │   │   │       └── user.models.ts
│   │   │   │
│   │   │   ├── settings/
│   │   │   │   ├── settings.routes.ts
│   │   │   │   ├── pages/
│   │   │   │   │   ├── general/
│   │   │   │   │   ├── security/
│   │   │   │   │   └── appearance/
│   │   │   │   └── services/
│   │   │   │       └── settings.service.ts
│   │   │   │
│   │   │   └── reports/
│   │   │       ├── reports.routes.ts
│   │   │       ├── pages/
│   │   │       └── services/
│   │   │
│   │   ├── layouts/
│   │   │   ├── admin-layout/
│   │   │   └── auth-layout/
│   │   │
│   │   └── utils/
│   │       ├── constants.ts
│   │       ├── helpers.ts
│   │       └── validators.ts
│   │
│   ├── styles/
│   │   ├── globals.css              # Tailwind + Custom utilities
│   │   ├── themes.css               # Dark/Light mode
│   │   └── animations.css           # Transitions personalizadas
│   │
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   │
│   ├── main.ts                      # Bootstrap (SSR-aware)
│   ├── main.server.ts               # SSR entry point
│   └── index.html
│
├── .angular/                        # Config do Angular CLI (gerado)
├── angular.json                     # Configuração do workspace
├── tailwind.config.ts               # Tailwind com Clean Preflight
├── jest.config.js                   # Jest configuration
├── jest.preset.js                   # Jest preset
├── tsconfig.json                    # TypeScript config
├── package.json
└── server.ts                        # Express server (SSR)
```

---

## 4. Configuração do Projeto

### 4.1 Criar Projeto com SSR

```bash
# Angular 19+
ng new . --routing --style=css --skip-git

# Adicionar SSR
ng add @angular/ssr

# Dependências principais
npm install -D tailwindcss postcss autoprefixer
npm install -D @testing-library/angular @testing-library/jest-dom jest jest-preset-angular
npm install -D axios chart.js ng-apexcharts
```

### 4.2 angular.json (SSR configuration)

```json
{
  "projects": {
    "painel": {
      "architect": {
        "build": {
          "configurations": {
            "development": {
              "optimization": false,
              "sourceMap": true,
              "namedChunks": true
            },
            "production": {
              "optimization": true,
              "sourceMap": false,
              "outputHashing": "all"
            }
          }
        },
        "serve": {
          "configurations": {
            "development": {
              "browserTarget": "painel:build:development",
              "serverTarget": "painel:server:development"
            },
            "production": {
              "browserTarget": "painel:build:production",
              "serverTarget": "painel:server:production"
            }
          }
        },
        "server": {
          "builder": "@angular/build:server",
          "options": {
            "outputPath": "dist/painel/server",
            "main": "src/main.server.ts"
          }
        }
      }
    }
  }
}
```

### 4.3 tailwind.config.ts (Clean Preflight)

```typescript
import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          900: '#0c2d4a',
        },
        secondary: {
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        neutral: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          50: '#f8fafc',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      spacing: {
        gutter: '1.5rem',
        'sidebar-width': '16rem',
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
  corePlugins: {
    // Preflight limpo - remover o que não usar
    preflight: true,
  },
} satisfies Config;
```

### 4.4 globals.css (Tailwind + Custom)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom utilities */
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-secondary {
    @apply px-4 py-2 bg-neutral-200 text-neutral-900 rounded-lg hover:bg-neutral-300 transition-colors;
  }

  .card {
    @apply bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 transition-all;
  }

  .form-input {
    @apply w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white;
  }

  .table-cell {
    @apply px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300;
  }

  .badge {
    @apply inline-block px-2 py-1 text-xs font-semibold rounded-full;
  }

  .sidebar-item {
    @apply flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
  }
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}
```

### 4.5 jest.config.js

```javascript
module.exports = {
  displayName: 'painel',
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
  ],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$',
    },
  },
  coverageDirectory: 'coverage/painel',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/main.ts',
    '!src/main.server.ts',
    '!src/environments/**',
  ],
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@core/(.*)$': '<rootDir>/src/app/core/$1',
    '^@shared/(.*)$': '<rootDir>/src/app/shared/$1',
  },
  transform: {
    '^.+\\.(ts|mjs|js|html)$': 'jest-preset-angular',
  },
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
```

### 4.6 setup-jest.ts

```typescript
import 'jest-preset-angular/setup-jest';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

global.localStorage = localStorageMock as any;

// Suppress console errors in tests (optional)
beforeEach(() => {
  jest.clearAllMocks();
});
```

---

## 5. Core Services & State Management

### 5.1 State Management com Signals

```typescript
// src/app/core/services/app-state.service.ts
import { Injectable } from '@angular/core';
import { signal, computed, effect } from '@angular/core';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface AppState {
  user: User | null;
  isLoading: boolean;
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
}

@Injectable({ providedIn: 'root' })
export class AppStateService {
  // Signals primitivos
  private userSignal = signal<User | null>(null);
  private isLoadingSignal = signal(false);
  private themeSignal = signal<'light' | 'dark'>('light');
  private sidebarOpenSignal = signal(true);

  // Signals derivados (computed)
  user = this.userSignal.asReadonly();
  isLoading = this.isLoadingSignal.asReadonly();
  theme = this.themeSignal.asReadonly();
  sidebarOpen = this.sidebarOpenSignal.asReadonly();

  isAdmin = computed(() => this.userSignal()?.role === 'admin');
  isAuthenticated = computed(() => !!this.userSignal());

  constructor() {
    // Efeitos colaterais
    effect(() => {
      const theme = this.themeSignal();
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('theme', theme);
    });
  }

  // Mutations (setters com validação)
  setUser(user: User | null) {
    this.userSignal.set(user);
  }

  setLoading(loading: boolean) {
    this.isLoadingSignal.set(loading);
  }

  toggleTheme() {
    this.themeSignal.update(t => t === 'light' ? 'dark' : 'light');
  }

  toggleSidebar() {
    this.sidebarOpenSignal.update(open => !open);
  }

  // Obter estado completo
  getState() {
    return {
      user: this.userSignal(),
      isLoading: this.isLoadingSignal(),
      theme: this.themeSignal(),
      sidebarOpen: this.sidebarOpenSignal(),
    };
  }
}
```

### 5.2 Auth Service

```typescript
// src/app/core/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { AppStateService } from './app-state.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private appState = inject(AppStateService);

  private tokenSignal = signal<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('token') : null
  );

  token = this.tokenSignal.asReadonly();

  login(email: string, password: string) {
    this.appState.setLoading(true);
    return this.http.post<{ token: string; user: any }>('/api/auth/login', {
      email,
      password,
    }).pipe(
      // Usar finalize() ou tap para atualizar state
    );
  }

  logout() {
    this.tokenSignal.set(null);
    this.appState.setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  isAuthenticated() {
    return !!this.tokenSignal();
  }
}
```

### 5.3 API Service (Wrapper)

```typescript
// src/app/core/services/api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = '/api/v1';

  get<T>(endpoint: string) {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`).pipe(
      catchError(this.handleError),
    );
  }

  post<T>(endpoint: string, data: any) {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data).pipe(
      catchError(this.handleError),
    );
  }

  put<T>(endpoint: string, data: any) {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data).pipe(
      catchError(this.handleError),
    );
  }

  delete<T>(endpoint: string) {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`).pipe(
      catchError(this.handleError),
    );
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'Erro desconhecido';
    if (error.error instanceof ErrorEvent) {
      message = error.error.message;
    } else {
      message = error.error?.message || error.message;
    }
    return throwError(() => new Error(message));
  }
}
```

---

## 6. Componentes Base

### 6.1 Button Component

```typescript
// src/app/shared/components/button/button.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type ButtonVariant = 'primary' | 'secondary' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class.btn-primary]="variant === 'primary'"
      [class.btn-secondary]="variant === 'secondary'"
      [class.btn-danger]="variant === 'danger'"
      [class.px-2]="size === 'sm'"
      [class.px-4]="size === 'md'"
      [class.px-6]="size === 'lg'"
      [disabled]="disabled"
      (click)="onClick()"
      class="font-semibold transition-all duration-200"
    >
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    .btn-danger {
      @apply bg-danger text-white hover:bg-red-600;
    }
  `],
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;

  onClick() {
    // Emit event se necessário
  }
}
```

### 6.2 Card Component

```typescript
// src/app/shared/components/card/card.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div class="card">
      <ng-content></ng-content>
    </div>
  `,
})
export class CardComponent {}
```

### 6.3 Table Component (com Signals)

```typescript
// src/app/shared/components/table/table.component.ts
import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-neutral-100 dark:bg-neutral-700">
          <tr>
            <th *ngFor="let col of columns" class="table-cell text-left font-semibold">
              {{ col.label }}
              <span *ngIf="col.sortable" class="cursor-pointer ml-2">⬍</span>
            </th>
            <th class="table-cell">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of paginatedData()" class="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800">
            <td *ngFor="let col of columns" class="table-cell">
              {{ row[col.key] }}
            </td>
            <td class="table-cell">
              <button class="text-primary-600 hover:underline">Editar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class TableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() pageSize = 10;

  private pageSignal = signal(1);
  page = this.pageSignal.asReadonly();

  paginatedData = computed(() => {
    const start = (this.pageSignal() - 1) * this.pageSize;
    return this.data.slice(start, start + this.pageSize);
  });

  goToPage(page: number) {
    this.pageSignal.set(page);
  }
}
```

---

## 7. Feature Modules

### 7.1 Users Feature

```typescript
// src/app/features/users/pages/list/users-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableComponent } from '@shared/components/table/table.component';
import { CardComponent } from '@shared/components/card/card.component';
import { UserService } from '../../services/user.service';
import { TableColumn } from '@shared/components/table/table.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableComponent, CardComponent],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Usuários</h1>
        <a routerLink="./new" class="btn-primary">Novo Usuário</a>
      </div>

      <app-card>
        <div class="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Buscar..."
            class="form-input"
            (input)="onSearch($event)"
          />
          <select class="form-input w-32">
            <option>Todos</option>
            <option>Admin</option>
            <option>User</option>
          </select>
        </div>

        <app-table
          [columns]="columns"
          [data]="filteredUsers()"
          pageSize="20"
        ></app-table>
      </app-card>
    </div>
  `,
})
export class UsersListComponent implements OnInit {
  private userService = inject(UserService);

  private usersSignal = signal<any[]>([]);
  private searchSignal = signal('');

  users = this.usersSignal.asReadonly();
  filteredUsers = computed(() => {
    const search = this.searchSignal().toLowerCase();
    return this.usersSignal().filter(u =>
      u.name.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search)
    );
  });

  columns: TableColumn[] = [
    { key: 'name', label: 'Nome', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Função' },
    { key: 'createdAt', label: 'Criado em' },
  ];

  ngOnInit() {
    this.loadUsers();
  }

  private loadUsers() {
    this.userService.getUsers().subscribe(
      (users) => this.usersSignal.set(users),
      (error) => console.error('Erro ao carregar usuários', error),
    );
  }

  onSearch(event: any) {
    this.searchSignal.set(event.target.value);
  }
}
```

### 7.2 Users Routes

```typescript
// src/app/features/users/users.routes.ts
import { Routes } from '@angular/router';
import { UsersListComponent } from './pages/list/users-list.component';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    component: UsersListComponent,
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/form/users-form.component').then(m => m.UsersFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/detail/users-detail.component').then(m => m.UsersDetailComponent),
  },
];
```

### 7.3 User Service

```typescript
// src/app/features/users/services/user.service.ts
import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = inject(ApiService);

  getUsers() {
    return this.api.get('/users');
  }

  getUser(id: string) {
    return this.api.get(`/users/${id}`);
  }

  createUser(data: any) {
    return this.api.post('/users', data);
  }

  updateUser(id: string, data: any) {
    return this.api.put(`/users/${id}`, data);
  }

  deleteUser(id: string) {
    return this.api.delete(`/users/${id}`);
  }
}
```

---

## 8. Rotas da Aplicação

### 8.1 app.routes.ts

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const APP_ROUTES: Routes = [
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/pages/login/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/pages/register/register.component').then(m => m.RegisterComponent),
      },
    ],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/overview/overview.component').then(m => m.OverviewComponent),
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./features/users/users.routes').then(r => r.USERS_ROUTES),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/settings/settings.routes').then(r => r.SETTINGS_ROUTES),
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./features/reports/reports.routes').then(r => r.REPORTS_ROUTES),
      },
    ],
  },
  {
    path: '',
    redirectTo: '/admin/dashboard',
    pathMatch: 'full',
  },
];
```

---

## 9. Layouts

### 9.1 Admin Layout

```typescript
// src/app/layouts/admin-layout/admin-layout.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '@shared/components/header/header.component';
import { SidebarComponent } from '@shared/components/sidebar/sidebar.component';
import { AppStateService } from '@core/services/app-state.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent],
  template: `
    <div class="flex h-screen bg-neutral-50 dark:bg-neutral-900">
      <!-- Sidebar -->
      <app-sidebar 
        [open]="appState.sidebarOpen()"
      ></app-sidebar>

      <!-- Main content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <app-header
          (toggleSidebar)="appState.toggleSidebar()"
        ></app-header>

        <main class="flex-1 overflow-y-auto">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent {
  appState = inject(AppStateService);
}
```

### 9.2 Sidebar Component

```typescript
// src/app/shared/components/sidebar/sidebar.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface SidebarItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside
      class="w-sidebar-width bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 overflow-y-auto transition-all duration-300"
      [class.-translate-x-full]="!open"
    >
      <nav class="p-6">
        <h2 class="text-xl font-bold mb-8 text-neutral-900 dark:text-white">
          Admin
        </h2>

        <div class="space-y-2">
          <a
            *ngFor="let item of menuItems"
            [routerLink]="item.route"
            routerLinkActive="bg-primary-50 dark:bg-primary-900"
            class="sidebar-item group"
          >
            <span class="text-xl">{{ item.icon }}</span>
            <span class="text-sm font-medium">{{ item.label }}</span>
            <span
              *ngIf="item.badge"
              class="ml-auto bg-danger text-white text-xs rounded-full px-2 py-1"
            >
              {{ item.badge }}
            </span>
          </a>
        </div>
      </nav>
    </aside>
  `,
})
export class SidebarComponent {
  @Input() open = true;

  menuItems: SidebarItem[] = [
    { icon: '📊', label: 'Dashboard', route: '/admin/dashboard' },
    { icon: '👥', label: 'Usuários', route: '/admin/users' },
    { icon: '📈', label: 'Relatórios', route: '/admin/reports' },
    { icon: '⚙️', label: 'Configurações', route: '/admin/settings' },
  ];
}
```

---

## 10. Guards & Interceptors

### 10.1 Auth Guard

```typescript
// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/auth/login']);
  return false;
};
```

### 10.2 Auth Interceptor

```typescript
// src/app/core/interceptors/auth.interceptor.ts
import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const token = this.authService.token();

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(req);
  }
}
```

---

## 11. Testing com Jest

### 11.1 Button Component Test

```typescript
// src/app/shared/components/button/button.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render with primary variant', () => {
    component.variant = 'primary';
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.classList.contains('btn-primary')).toBeTruthy();
  });

  it('should be disabled when disabled input is true', () => {
    component.disabled = true;
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBeTruthy();
  });

  it('should render content via ng-content', () => {
    const text = 'Click me';
    fixture.nativeElement.innerHTML = `<app-button>${text}</app-button>`;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(text);
  });
});
```

### 11.2 Users List Component Test

```typescript
// src/app/features/users/pages/list/users-list.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersListComponent } from './users-list.component';
import { UserService } from '../../services/user.service';
import { of } from 'rxjs';

describe('UsersListComponent', () => {
  let component: UsersListComponent;
  let fixture: ComponentFixture<UsersListComponent>;
  let userService: jasmine.SpyObj<UserService>;

  const mockUsers = [
    { id: '1', name: 'João', email: 'joao@example.com', role: 'admin' },
    { id: '2', name: 'Maria', email: 'maria@example.com', role: 'user' },
  ];

  beforeEach(async () => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getUsers']);

    await TestBed.configureTestingModule({
      imports: [UsersListComponent],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
      ],
    }).compileComponents();

    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    userService.getUsers.and.returnValue(of(mockUsers));

    fixture = TestBed.createComponent(UsersListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    fixture.detectChanges();
    expect(userService.getUsers).toHaveBeenCalled();
    expect(component.users().length).toBe(2);
  });

  it('should filter users by search term', () => {
    fixture.detectChanges();

    component.onSearch({ target: { value: 'joão' } });
    fixture.detectChanges();

    expect(component.filteredUsers().length).toBe(1);
    expect(component.filteredUsers()[0].name).toBe('João');
  });
});
```

### 11.3 App State Service Test

```typescript
// src/app/core/services/app-state.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { AppStateService } from './app-state.service';

describe('AppStateService', () => {
  let service: AppStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with null user', () => {
    expect(service.user()).toBeNull();
  });

  it('should set user correctly', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin' as const,
    };

    service.setUser(mockUser);
    expect(service.user()).toEqual(mockUser);
  });

  it('should compute isAdmin correctly', () => {
    const adminUser = {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin',
      role: 'admin' as const,
    };

    service.setUser(adminUser);
    expect(service.isAdmin()).toBe(true);

    const normalUser = {
      ...adminUser,
      role: 'user' as const,
    };
    service.setUser(normalUser);
    expect(service.isAdmin()).toBe(false);
  });

  it('should toggle theme', () => {
    expect(service.theme()).toBe('light');
    service.toggleTheme();
    expect(service.theme()).toBe('dark');
    service.toggleTheme();
    expect(service.theme()).toBe('light');
  });

  it('should toggle sidebar', () => {
    expect(service.sidebarOpen()).toBe(true);
    service.toggleSidebar();
    expect(service.sidebarOpen()).toBe(false);
  });
});
```

---

## 12. App Config & Providers

### 12.1 app.config.ts

```typescript
// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withDebugTracing } from '@angular/router';
import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { APP_ROUTES } from './app.routes';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(APP_ROUTES),
    provideHttpClient(
      withInterceptors([]),
    ),
    provideAnimations(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
};
```

### 12.2 main.ts (SSR-aware)

```typescript
// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err),
);
```

### 12.3 main.server.ts

```typescript
// src/main.server.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

export default bootstrapApplication(AppComponent, appConfig);
```

---

## 13. npm Scripts

### 13.1 package.json scripts

```json
{
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "start:ssr": "ng serve --ssr",
    "build": "ng build",
    "build:ssr": "ng build && ng run painel:server",
    "serve:ssr": "node dist/painel/server/main.js",
    "lint": "ng lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "format": "prettier --write \"src/**/*.{ts,html,css}\"",
    "format:check": "prettier --check \"src/**/*.{ts,html,css}\"",
    "dev": "concurrently \"npm run start\" \"npm run test:watch\""
  }
}
```

---

## 14. Boas Práticas Aplicadas

### ✅ Arquitetura
- **Standalone Components**: Sem NgModules, configuração simplificada
- **Feature-based Structure**: Organização por features, não por tipo
- **Lazy Loading**: Rotas carregam sob demanda
- **OnPush Change Detection**: Otimização de performance

### ✅ State Management
- **Signals**: Reatividade granular sem RxJS overhead
- **Computed**: Derivação automática de estado
- **Effect**: Colaterais bem definidos
- **Single Source of Truth**: AppStateService centralizado

### ✅ Styling
- **Tailwind CSS**: Utility-first, evita CSS customizado desnecessário
- **Clean Preflight**: Seleção consciente de reset de estilos
- **Dark Mode**: `@media (prefers-color-scheme: dark)` nativo
- **Custom Utilities**: `@layer components` para abstrações comuns

### ✅ Testing
- **Jest**: Rápido, sem Karma
- **Standalone Testing**: Sem módulos em testes
- **Mock Factories**: Spy objects para services
- **Coverage Reporting**: Métricas automatizadas

### ✅ Performance
- **Code Splitting**: Lazy loading de routes e components
- **SSR**: Renderização no servidor, SEO-friendly
- **Tree Shaking**: Dead code elimination automática
- **No Polyfills**: Angular 19+ nativo em browsers modernos

### ✅ Developer Experience
- **Type Safety**: TypeScript strict mode
- **ESLint + Prettier**: Lint e formatação automática
- **Consistent File Structure**: Fácil localizar código
- **Documentation**: CLAUDE.md com referências

---

## 15. Checklist de Implementação

- [ ] Criar projeto com `ng new`
- [ ] Adicionar `@angular/ssr`
- [ ] Configurar Tailwind com preflight customizado
- [ ] Configurar Jest com presets
- [ ] Criar estrutura de pastas base
- [ ] Implementar AppStateService com Signals
- [ ] Criar serviços core (Auth, API, Theme)
- [ ] Implementar componentes base (Button, Card, Table)
- [ ] Criar guards e interceptors
- [ ] Estruturar rotas com lazy loading
- [ ] Implementar layouts (Admin, Auth)
- [ ] Adicionar features (Users, Settings, Reports)
- [ ] Cobertura de testes (80%+)
- [ ] Build e deploy com SSR
- [ ] Documentação de componentes

---

## 16. Referências

- [Angular 19 Docs](https://angular.io)
- [Signals API](https://angular.io/guide/signals)
- [Angular SSR](https://angular.io/guide/ssr)
- [Tailwind CSS](https://tailwindcss.com)
- [Jest with Angular](https://angular.io/guide/testing)
- [TypeScript 5.5](https://www.typescriptlang.org)

---

**Documento criado em:** 2026-04-19  
**Responsável:** Araecio Carvalho  
**Status:** Pronto para implementação
