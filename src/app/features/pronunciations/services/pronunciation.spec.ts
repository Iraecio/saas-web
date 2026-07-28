import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../../core/services/api';
import { PronunciationService } from './pronunciation';

describe('PronunciationService', () => {
  let service: PronunciationService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ApiService,
        PronunciationService,
      ],
    });
    service = TestBed.inject(PronunciationService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('lists the private library with pagination', () => {
    let result: unknown;
    service.list('nike').subscribe((items) => (result = items));
    const request = http.expectOne((req) => req.url === `${environment.apiUrl}/pronunciations`);
    expect(request.request.params.get('q')).toBe('nike');
    expect(request.request.params.get('limit')).toBe('100');
    request.flush({
      items: [
        {
          id: 'cp1',
          pronunciation: { id: 'p1', term: 'Nike', pronunciationText: 'naike' },
          audios: [],
        },
      ],
      total: 1,
      page: 1,
      limit: 100,
    });
    expect(result).toEqual([
      {
        id: 'cp1',
        pronunciationId: 'p1',
        term: 'Nike',
        pronunciationText: 'naike',
        audios: [],
      },
    ]);
  });

  it('uploads audio using the private pronunciation endpoint', () => {
    const file = new File(['audio'], 'sample.mp3', { type: 'audio/mpeg' });
    service.uploadAudio('p1', file).subscribe();
    const request = http.expectOne(`${environment.apiUrl}/pronunciations/p1/audios`);
    expect(request.request.body).toBeInstanceOf(FormData);
    request.flush({});
  });
});
