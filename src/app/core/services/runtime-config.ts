import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { RuntimeConfig } from '../config/runtime-config';

const DEFAULT_CONFIG: RuntimeConfig = {
  features: {
    devQuickAccess: false,
  },
};

@Injectable({ providedIn: 'root' })
export class RuntimeConfigService {
  private readonly http = inject(HttpClient);

  load(): Observable<RuntimeConfig> {
    return this.http
      .get<RuntimeConfig>('/runtime-config', {
        headers: { Accept: 'application/json' },
      })
      .pipe(catchError(() => of(DEFAULT_CONFIG)));
  }
}
