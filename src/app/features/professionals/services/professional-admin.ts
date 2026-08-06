import { Injectable, inject } from '@angular/core';
import { expand, forkJoin, map, Observable, reduce, switchMap } from 'rxjs';
import { ApiService } from '../../../core/services/api';
import {
  InspectionSession,
  ProfessionalAdminDetail,
  ProfessionalAdminFilters,
  ProfessionalAdminItem,
  ProfessionalAdminPage,
} from '../../../core/models/professional-admin.model';
import { User } from '../../../core/models/user.model';
import { Professional } from '../../../core/models/professional.model';
import { ProfessionalService } from './professional';

@Injectable({ providedIn: 'root' })
export class ProfessionalAdminService {
  private readonly api = inject(ApiService);
  private readonly professionals = inject(ProfessionalService);

  list(filters: ProfessionalAdminFilters): Observable<ProfessionalAdminPage> {
    return forkJoin({
      voices: this.professionals.listVoiceActors({ scope: filters.scope || undefined, limit: 100 }),
      producers: this.professionals.listProducers({
        scope: filters.scope || undefined,
        limit: 100,
      }),
    }).pipe(
      map(({ voices, producers }) => {
        let items: ProfessionalAdminItem[] = [
          ...voices.professionals.map((item) => this.toAdminItem(item, 'VOICE_ACTOR')),
          ...producers.professionals.map((item) => this.toAdminItem(item, 'PRODUCER')),
        ];
        const all = items;
        if (filters.role) items = items.filter((item) => item.role === filters.role);
        if (filters.accountStatus)
          items = items.filter((item) => item.accountStatus === filters.accountStatus);
        if (filters.verificationStatus)
          items = items.filter((item) => item.verificationStatus === filters.verificationStatus);
        const query = filters.query.trim().toLocaleLowerCase('pt-BR');
        if (query)
          items = items.filter((item) =>
            [item.name, item.email, item.id].some((value) =>
              value?.toLocaleLowerCase('pt-BR').includes(query),
            ),
          );
        items.sort((a, b) => this.compare(a, b, filters.sort));
        const total = items.length;
        const start = (filters.page - 1) * filters.pageSize;
        return {
          items: items.slice(start, start + filters.pageSize),
          total,
          totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
          counters: {
            total: all.length,
            voiceActors: all.filter((item) => item.role === 'VOICE_ACTOR').length,
            producers: all.filter((item) => item.role === 'PRODUCER').length,
            global: all.filter((item) => item.scope === 'GLOBAL').length,
            blocked: all.filter((item) => item.accountStatus === 'BLOCKED').length,
          },
        };
      }),
    );
  }

  getDetail(userId: string, profile: ProfessionalAdminItem): Observable<ProfessionalAdminDetail> {
    return this.api.get<User>(`/users/${userId}`).pipe(
      switchMap((user) =>
        this.professionals.listOfferings(profile.userId).pipe(
          map(
            (offerings): ProfessionalAdminDetail => ({
              professional: {
                ...profile,
                email: user.email,
                accountStatus: user.isActive === false ? ('BLOCKED' as const) : ('ACTIVE' as const),
                lastLoginAt: user.lastLoginAt,
              },
              user,
              offerings,
            }),
          ),
        ),
      ),
    );
  }

  findByUserId(userId: string): Observable<ProfessionalAdminItem | undefined> {
    return forkJoin({
      voices: this.listAll('VOICE_ACTOR'),
      producers: this.listAll('PRODUCER'),
    }).pipe(
      map(({ voices, producers }) => {
        return [...voices, ...producers].find(
          (item) => item.userId === userId || item.id === userId,
        );
      }),
    );
  }

  updateUser(userId: string, input: Partial<User>): Observable<User> {
    return this.api.put<User>(`/users/${userId}`, input);
  }

  block(userId: string): Observable<void> {
    return this.api.delete<void>(`/users/${userId}`);
  }

  reactivate(userId: string): Observable<User> {
    return this.api.put<User>(`/users/${userId}`, { isActive: true });
  }

  sendPasswordReset(email: string): Observable<void> {
    return this.api.post<void>('/auth/forgot-password', { email });
  }

  startInspection(targetUserId: string, reason: string): Observable<InspectionSession> {
    return this.api.post<InspectionSession>('/admin/impersonation-sessions', {
      targetUserId,
      reason,
    });
  }

  private toAdminItem(
    item: Professional &
      Partial<
        Pick<
          ProfessionalAdminItem,
          'accountStatus' | 'activeOrders' | 'walletBalanceCents' | 'email' | 'lastLoginAt'
        >
      >,
    role: ProfessionalAdminItem['role'],
  ): ProfessionalAdminItem {
    return {
      ...item,
      role,
      accountStatus: item.accountStatus ?? 'ACTIVE',
      activeOrders: item.activeOrders ?? 0,
      walletBalanceCents: item.walletBalanceCents ?? 0,
    };
  }

  private compare(
    a: ProfessionalAdminItem,
    b: ProfessionalAdminItem,
    sort: ProfessionalAdminFilters['sort'],
  ): number {
    if (sort === 'orders') return (b.activeOrders ?? 0) - (a.activeOrders ?? 0);
    if (sort === 'wallet') return (b.walletBalanceCents ?? 0) - (a.walletBalanceCents ?? 0);
    if (sort === 'lastLoginAt') return (b.lastLoginAt ?? '').localeCompare(a.lastLoginAt ?? '');
    return a.name.localeCompare(b.name, 'pt-BR');
  }

  private listAll(role: ProfessionalAdminItem['role']): Observable<ProfessionalAdminItem[]> {
    const load = (page: number) =>
      (role === 'VOICE_ACTOR'
        ? this.professionals.listVoiceActors({ page, limit: 100 })
        : this.professionals.listProducers({ page, limit: 100 })
      ).pipe(map((response) => ({ response, page })));

    return load(1).pipe(
      expand(({ response, page }) => {
        const total = response.pagination?.total ?? response.professionals.length;
        return page * 100 < total ? load(page + 1) : [];
      }),
      map(({ response }) => response.professionals.map((item) => this.toAdminItem(item, role))),
      reduce((all, page) => [...all, ...page], [] as ProfessionalAdminItem[]),
    );
  }
}
