import {
  APP_INITIALIZER,
  ApplicationConfig,
  LOCALE_ID,
  PLATFORM_ID,
  inject,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { isPlatformBrowser, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { responseTransformInterceptor } from './core/interceptors/response-transform.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AuthService } from './core/services/auth';

registerLocaleData(localePt, 'pt-BR');

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(
      withFetch(),
      withInterceptors([responseTransformInterceptor, authInterceptor, errorInterceptor]),
    ),
    provideClientHydration(withEventReplay()),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const auth = inject(AuthService);
        const platformId = inject(PLATFORM_ID);
        return () => {
          if (!isPlatformBrowser(platformId)) return Promise.resolve();
          return firstValueFrom(auth.bootstrap()).then(() => void 0);
        };
      },
    },
  ],
};
