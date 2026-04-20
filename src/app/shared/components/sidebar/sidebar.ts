import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside
      class="flex h-full flex-col border-r border-neutral-200 bg-white transition-all duration-300 dark:border-neutral-700 dark:bg-neutral-800"
      [class]="widthClasses()"
    >
      <div class="flex h-16 items-center justify-center border-b border-neutral-200 px-6 dark:border-neutral-700">
        <h2 class="text-xl font-bold text-neutral-900 dark:text-white">
          @if (open()) {
            <span>SaaS Web</span>
          } @else {
            <span>SW</span>
          }
        </h2>
      </div>

      <nav class="flex-1 space-y-1 overflow-y-auto p-4">
        @for (item of menu; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="sidebar-item-active"
            class="sidebar-item"
          >
            <span class="text-xl">{{ item.icon }}</span>
            @if (open()) {
              <span class="text-sm font-medium">{{ item.label }}</span>
              @if (item.badge) {
                <span class="ml-auto rounded-full bg-danger px-2 py-0.5 text-xs font-bold text-white">
                  {{ item.badge }}
                </span>
              }
            }
          </a>
        }
      </nav>

      <div class="border-t border-neutral-200 p-4 text-xs text-neutral-500 dark:border-neutral-700">
        @if (open()) {
          <span>v0.1.0</span>
        }
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  readonly open = input(true);

  readonly widthClasses = computed(() => (this.open() ? 'w-64' : 'w-20'));

  protected readonly menu: MenuItem[] = [
    { icon: '📊', label: 'Dashboard', route: '/admin/dashboard' },
    { icon: '👥', label: 'Usuários', route: '/admin/users' },
    { icon: '📈', label: 'Relatórios', route: '/admin/reports' },
    { icon: '⚙️', label: 'Configurações', route: '/admin/settings' },
  ];
}
