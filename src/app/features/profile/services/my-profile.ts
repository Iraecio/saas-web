import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api';
import {
  VoiceProfile,
  UpdateVoiceProfileDto,
  ProducerProfile,
  UpdateProducerProfileDto,
  ClientProfile,
  UpdateClientProfileDto,
} from '../../../core/models/profile.model';
import { User } from '../../../core/models/user.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly api = inject(ApiService);

  getMe(): Observable<User> {
    return this.api.get<User>('/users/me');
  }

  updateMe(dto: Partial<Pick<User, 'name' | 'avatarUrl' | 'department' | 'jobTitle'>>): Observable<User> {
    return this.api.put<User>('/users/me', dto);
  }

  getVoiceProfile(userId: string): Observable<VoiceProfile> {
    return this.api.get<VoiceProfile>(`/users/${userId}/voice-profile`);
  }

  updateVoiceProfile(userId: string, dto: UpdateVoiceProfileDto): Observable<VoiceProfile> {
    return this.api.patch<VoiceProfile>(`/users/${userId}/voice-profile`, dto);
  }

  getProducerProfile(userId: string): Observable<ProducerProfile> {
    return this.api.get<ProducerProfile>(`/users/${userId}/producer-profile`);
  }

  updateProducerProfile(userId: string, dto: UpdateProducerProfileDto): Observable<ProducerProfile> {
    return this.api.patch<ProducerProfile>(`/users/${userId}/producer-profile`, dto);
  }

  getClientProfile(userId: string): Observable<ClientProfile> {
    return this.api.get<ClientProfile>(`/users/${userId}/client-profile`);
  }

  updateClientProfile(userId: string, dto: UpdateClientProfileDto): Observable<ClientProfile> {
    return this.api.patch<ClientProfile>(`/users/${userId}/client-profile`, dto);
  }
}
