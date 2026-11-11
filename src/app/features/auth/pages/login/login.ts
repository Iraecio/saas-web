import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService, DevLoginUser } from '../../../../core/services/auth';
import { AppStateService } from '../../../../core/services/app-state';
import { UserRole } from '../../../../core/models/user.model';
import { RuntimeConfigService } from '../../../../core/services/runtime-config';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div
      class="relative flex min-h-dvh w-full items-center justify-center overflow-hidden p-4 sm:p-6"
    >
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgb(255_255_255/70%),transparent_32%),radial-gradient(circle_at_85%_80%,rgb(0_92_187/13%),transparent_34%)]"
      ></div>

      <div
        class="relative z-10 w-full max-w-[540px] overflow-hidden rounded-[24px] border border-white/60 bg-surface shadow-[0_24px_60px_rgb(58_74_96/20%)]"
      >
        <section class="p-6 sm:p-10 lg:p-12">
          <div class="mx-auto w-full max-w-[420px]">
            <div class="mb-8">
              <h2 class="text-[28px] font-semibold tracking-tight text-foreground">Entrar</h2>
              <p class="mt-2 text-sm text-muted">Informe suas credenciais para acessar o painel.</p>
            </div>

            <!-- Formulário -->
            <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
              <!-- Email Input -->
              <div class="group">
                <label class="mb-2 block text-sm font-medium text-foreground"> Email </label>
                <div class="relative">
                  <input
                    type="email"
                    formControlName="email"
                    autocomplete="email"
                    placeholder="seu@email.com"
                    class="form-input h-12 px-4"
                    required
                  />
                  @if (form.get('email')?.valid && form.get('email')?.touched) {
                    <span class="absolute right-3 top-3 text-green-500">✓</span>
                  }
                </div>
                @if (form.get('email')?.invalid && form.get('email')?.touched) {
                  <p class="text-xs text-red-500 mt-1">
                    {{
                      form.get('email')?.errors?.['required']
                        ? 'Email é obrigatório'
                        : 'Email inválido'
                    }}
                  </p>
                }
              </div>

              <!-- Senha Input -->
              <div class="group">
                <div class="mb-2 flex items-center justify-between">
                  <label class="block text-sm font-medium text-foreground"> Senha </label>
                  <a
                    routerLink="/auth/forgot-password"
                    class="text-sm font-medium text-brand transition-colors hover:text-brand-hover hover:underline"
                  >
                    Esqueceu?
                  </a>
                </div>
                <div class="relative">
                  <input
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="password"
                    autocomplete="current-password"
                    placeholder="••••••••"
                    class="form-input h-12 px-4 pr-12"
                    required
                  />
                  <button
                    type="button"
                    (click)="togglePassword()"
                    [attr.aria-label]="showPassword() ? 'Ocultar senha' : 'Mostrar senha'"
                    class="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted transition-colors hover:bg-surface-subtle hover:text-brand"
                  >
                    @if (showPassword()) {
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-5 h-5"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.244 7.244 3.228 3.228m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    } @else {
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-5 h-5"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    }
                  </button>
                </div>
                @if (form.get('password')?.invalid && form.get('password')?.touched) {
                  <p class="text-xs text-red-500 mt-1">Mínimo 8 caracteres</p>
                }
              </div>

              <!-- Mensagem de Erro -->
              @if (error()) {
                <div
                  class="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg text-sm text-red-700 dark:text-red-400 flex items-start gap-3"
                >
                  <span class="text-lg flex-shrink-0">⚠️</span>
                  <span>{{ error() }}</span>
                </div>
              }

              <!-- Checkbox Lembrar -->
              <div class="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  class="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                />
                <label for="remember" class="ml-2 text-sm text-neutral-600 dark:text-neutral-400">
                  Manter-me conectado
                </label>
              </div>

              <!-- Botão Entrar -->
              <button
                type="submit"
                [disabled]="form.invalid || loading()"
                class="btn-primary h-12 w-full text-[15px]"
              >
                @if (loading()) {
                  <div
                    class="w-4 h-4 border-2 border-white dark:border-neutral-900 border-t-transparent rounded-full animate-spin"
                  ></div>
                  <span>Entrando...</span>
                } @else {
                  <span>Entrar</span>
                  <span>→</span>
                }
              </button>
            </form>

            @if (devQuickAccessEnabled()) {
              <!-- Divisor -->
              <div class="relative my-8">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-neutral-200 dark:border-neutral-800"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="bg-surface px-2 text-muted">Ou</span>
                </div>
              </div>

              <!-- Acesso Rápido (DEV) -->
              <div
                class="rounded-lg border border-dashed border-border-strong bg-surface-subtle/70 p-4"
              >
                <p
                  class="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-neutral-500"
                >
                  Acesso rápido · dev
                </p>
                @if (devUsersLoading()) {
                  <p class="py-3 text-center text-xs text-neutral-500">Carregando usuários...</p>
                } @else if (devUsersError()) {
                  <p class="py-3 text-center text-xs text-neutral-500">{{ devUsersError() }}</p>
                } @else {
                  <div class="space-y-4">
                    @for (group of devUserGroups(); track group.role) {
                      <section>
                        <p
                          class="mb-2 text-[10px] font-semibold uppercase tracking-widest"
                          [class]="roleColor(group.role)"
                        >
                          {{ roleLabel(group.role) }} · {{ group.users.length }}
                        </p>
                        <div class="grid grid-cols-2 gap-2">
                          @for (u of group.users; track u.email) {
                            <button
                              type="button"
                              (click)="quickLogin(u.email)"
                              [disabled]="loading()"
                              class="flex min-w-0 flex-col items-start rounded-md border border-border bg-surface px-3 py-2 text-left transition-colors hover:border-brand/40 hover:bg-brand/5 disabled:opacity-40"
                            >
                              <span
                                class="text-[10px] font-semibold uppercase tracking-wide"
                                [class]="roleColor(u.role)"
                                >{{ roleLabel(u.role) }}</span
                              >
                              <span class="mt-0.5 w-full truncate text-xs text-foreground">{{
                                u.name || u.email
                              }}</span>
                              <span class="w-full truncate text-[10px] text-muted">{{
                                u.email
                              }}</span>
                            </button>
                          }
                        </div>
                      </section>
                    } @empty {
                      <p class="py-3 text-center text-xs text-neutral-500">
                        Nenhum usuário disponível.
                      </p>
                    }
                  </div>
                }
              </div>
            }

            <!-- Link Registrar -->
            <div class="mt-6 text-center">
              <p class="text-neutral-600 dark:text-neutral-400">
                Não tem uma conta?
                <a
                  routerLink="/auth/register"
                  class="font-semibold text-brand transition-colors hover:text-brand-hover hover:underline"
                >
                  Criar agora
                </a>
              </p>
            </div>

            <!-- Footer -->
            <div class="mt-8 space-y-2 border-t border-border pt-6 text-center text-xs text-muted">
              <p>Ao entrar, você concorda com nossos Termos de Serviço</p>
              <div class="flex items-center justify-center gap-4">
                <a href="#" class="transition-colors hover:text-brand">Privacidade</a>
                <span>•</span>
                <a href="#" class="transition-colors hover:text-brand">Termos</a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly appState = inject(AppStateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly runtimeConfig = inject(RuntimeConfigService);

  readonly loading = signal(false);
  readonly error = signal<string | undefined>(undefined);
  readonly showPassword = signal(false);
  readonly devQuickAccessEnabled = signal(false);
  readonly devUsers = signal<DevLoginUser[]>([]);
  readonly devUsersLoading = signal(false);
  readonly devUsersError = signal<string | undefined>(undefined);
  readonly devUserGroups = computed(() => {
    const roleOrder: UserRole[] = [
      'SUPER_ADMIN',
      'ADMIN',
      'RESELLER',
      'RESELLER_MANAGER',
      'VOICE_ACTOR',
      'PRODUCER',
      'CLIENT',
    ];
    return roleOrder
      .map((role) => ({ role, users: this.devUsers().filter((user) => user.role === role) }))
      .filter((group) => group.users.length > 0);
  });

  private readonly roleDashboardMap: Record<UserRole, string> = {
    SUPER_ADMIN: 'admin',
    ADMIN: 'admin',
    RESELLER: 'reseller',
    RESELLER_MANAGER: 'reseller',
    VOICE_ACTOR: 'voice-actor',
    PRODUCER: 'producer',
    CLIENT: 'client',
  };

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.runtimeConfig
      .load()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((config) => {
        this.devQuickAccessEnabled.set(config.features.devQuickAccess);
        if (config.features.devQuickAccess) this.loadDevUsers();
      });
    // Supabase redireciona para a URL base com o token no hash fragment
    // ex: /auth/login#access_token=...&type=recovery
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const params = new URLSearchParams(hash);
    if (params.get('type') === 'recovery') {
      const token = params.get('access_token') ?? '';
      this.router.navigate(['/auth/reset-password'], {
        queryParams: { token },
        replaceUrl: true,
      });
    }
  }

  roleLabel(role: UserRole): string {
    return {
      SUPER_ADMIN: 'Super Admin',
      ADMIN: 'Admin',
      RESELLER: 'Revendedor',
      RESELLER_MANAGER: 'Gestor',
      VOICE_ACTOR: 'Locutor',
      PRODUCER: 'Produtor',
      CLIENT: 'Cliente',
    }[role];
  }

  roleColor(role: UserRole): string {
    return {
      SUPER_ADMIN: 'text-red-400',
      ADMIN: 'text-orange-400',
      RESELLER: 'text-blue-400',
      RESELLER_MANAGER: 'text-cyan-400',
      VOICE_ACTOR: 'text-purple-400',
      PRODUCER: 'text-pink-400',
      CLIENT: 'text-green-400',
    }[role];
  }

  private loadDevUsers(): void {
    this.devUsersLoading.set(true);
    this.auth
      .listDevUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (users) => {
          this.devUsers.set(users);
          this.devUsersLoading.set(false);
        },
        error: () => {
          this.devUsersError.set('Acesso rápido indisponível neste ambiente.');
          this.devUsersLoading.set(false);
        },
      });
  }

  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  quickLogin(email: string): void {
    this.form.setValue({ email, password: 'Test@1234' });
    this.submit();
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(undefined);

    const { email, password } = this.form.getRawValue();
    this.auth
      .login({ email, password })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.loading.set(false);
          // Usar role da resposta, não do AppState (para evitar timing issues)
          const role = response.user.role;
          const dashboardPath = this.roleDashboardMap[role] || 'client';
          this.router.navigate(['/admin/dashboard', dashboardPath]).catch((err) => {
            console.error('[LoginComponent] Erro ao navegar:', err);
            this.error.set('Erro ao redirecionar. Tente novamente.');
          });
        },
        error: (err: HttpErrorResponse | Error) => {
          this.loading.set(false);
          this.error.set(this.extractMessage(err));
        },
      });
  }

  private extractMessage(err: HttpErrorResponse | Error): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 401) return 'Email ou senha incorretos.';
      if (err.status === 429) return 'Muitas tentativas. Aguarde um minuto.';
      if (err.status === 0) return 'Sem conexão com o servidor.';
      const body = err.error as { message?: string; errors?: string[] } | null;
      if (body?.errors?.length) return body.errors.join(' · ');
      if (body?.message) return body.message;
      return `Erro ${err.status}`;
    }
    return err.message ?? 'Falha no login';
  }
}
