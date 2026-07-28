import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ClientPronunciation,
  PronunciationAudio,
  PronunciationAudioAccess,
  PronunciationPolicy,
} from '../../../core/models/pronunciation.model';
import { ApiService } from '../../../core/services/api';

@Injectable({ providedIn: 'root' })
export class PronunciationService {
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);

  list(q = ''): Observable<ClientPronunciation[]> {
    return this.api
      .get<
        ClientPronunciation[] | { items: PrivatePronunciationApiItem[] }
      >('/pronunciations', { q, page: 1, limit: 100 })
      .pipe(
        map((response) => (Array.isArray(response) ? response : response.items)),
        map((items) => items.map((item) => this.normalizePrivatePronunciation(item))),
      );
  }

  getPolicy(): Observable<PronunciationPolicy> {
    return this.api.get<PronunciationPolicy>('/pronunciations/policy');
  }

  create(term: string, pronunciationText: string): Observable<ClientPronunciation> {
    return this.api
      .post<ClientPronunciation | PrivatePronunciationApiItem>('/pronunciations', {
        term,
        pronunciationText,
      })
      .pipe(map((item) => this.normalizePrivatePronunciation(item)));
  }

  remove(id: string): Observable<void> {
    return this.api.delete<void>(`/pronunciations/${id}`);
  }

  uploadAudio(id: string, file: File): Observable<PronunciationAudio> {
    const body = new FormData();
    body.append('file', file);
    return this.http.post<PronunciationAudio>(
      `${environment.apiUrl}/pronunciations/${id}/audios`,
      body,
    );
  }

  audioAccess(id: string, audioId: string): Observable<PronunciationAudioAccess> {
    return this.api.get<PronunciationAudioAccess>(`/pronunciations/${id}/audios/${audioId}/access`);
  }

  removeAudio(id: string, audioId: string): Observable<void> {
    return this.api.delete<void>(`/pronunciations/${id}/audios/${audioId}`);
  }

  private normalizePrivatePronunciation(
    item: ClientPronunciation | PrivatePronunciationApiItem,
  ): ClientPronunciation {
    if (!('pronunciation' in item)) return item;
    return {
      id: item.id,
      pronunciationId: item.pronunciation.id,
      term: item.pronunciation.term,
      pronunciationText: item.pronunciation.pronunciationText,
      audios: item.audios,
    };
  }
}

interface PrivatePronunciationApiItem {
  id: string;
  pronunciation: { id: string; term: string; pronunciationText: string };
  audios?: PronunciationAudio[];
}
