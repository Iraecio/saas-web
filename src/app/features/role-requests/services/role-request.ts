import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateRoleRequestDto,
  RoleRequest,
  RoleRequestStatus,
  RoleRequestsListResponse,
} from '../../../core/models/role-request.model';

@Injectable({ providedIn: 'root' })
export class RoleRequestService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/role-requests`;

  listMine(): Observable<RoleRequest[]> {
    return this.http.get<RoleRequest[]>(`${this.baseUrl}/my`);
  }

  create(dto: CreateRoleRequestDto): Observable<RoleRequest> {
    return this.http.post<RoleRequest>(this.baseUrl, dto);
  }

  listAll(params?: {
    status?: RoleRequestStatus;
    page?: number;
    pageSize?: number;
  }): Observable<RoleRequestsListResponse> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.page) httpParams = httpParams.set('page', String(params.page));
    if (params?.pageSize) httpParams = httpParams.set('pageSize', String(params.pageSize));
    return this.http.get<RoleRequestsListResponse>(this.baseUrl, { params: httpParams });
  }

  findOne(id: string): Observable<RoleRequest> {
    return this.http.get<RoleRequest>(`${this.baseUrl}/${id}`);
  }

  approve(id: string): Observable<RoleRequest> {
    return this.http.patch<RoleRequest>(`${this.baseUrl}/${id}/approve`, {});
  }

  reject(id: string, reason?: string): Observable<RoleRequest> {
    return this.http.patch<RoleRequest>(`${this.baseUrl}/${id}/reject`, { reason });
  }
}
