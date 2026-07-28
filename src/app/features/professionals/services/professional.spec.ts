import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../../core/services/api';
import { ProfessionalService } from './professional';

describe('ProfessionalService', () => {
  let service: ProfessionalService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ApiService, ProfessionalService],
    });
    service = TestBed.inject(ProfessionalService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('normalizes the official items response for voice actors', () => {
    let resultName = '';
    let avatarUrl: string | null | undefined;
    let demoUrl: string | null | undefined;
    service.listVoiceActors().subscribe((result) => {
      resultName = result.professionals[0]?.name ?? '';
      avatarUrl = result.professionals[0]?.avatarUrl;
      demoUrl = result.professionals[0]?.demoUrl;
      expect(result.pagination?.total).toBe(1);
    });

    http.expectOne(`${environment.apiUrl}/professionals/voice-actors`).flush({
      items: [
        {
          id: 'voice-profile-1',
          userId: 'user-1',
          scope: 'GLOBAL',
          resellerId: null,
          voiceSamplesUrls: ['https://cdn.example.com/maria-demo.mp3'],
          user: {
            name: 'Maria Locutora',
            email: 'maria@example.com',
            avatarUrl: 'https://cdn.example.com/maria.jpg',
            resellerId: null,
          },
        },
      ],
      total: 1,
    });

    expect(resultName).toBe('Maria Locutora');
    expect(avatarUrl).toBe('https://cdn.example.com/maria.jpg');
    expect(demoUrl).toBe('https://cdn.example.com/maria-demo.mp3');
  });

  it('normalizes the official items response for producers', () => {
    let professionalsCount = 0;
    service.listProducers().subscribe((result) => {
      professionalsCount = result.professionals.length;
    });

    http.expectOne(`${environment.apiUrl}/professionals/producers`).flush({
      items: [
        {
          id: 'producer-profile-1',
          userId: 'user-2',
          scope: 'PARTICULAR',
          resellerId: 'reseller-1',
          user: { name: 'Estúdio Alfa', email: 'alfa@example.com', resellerId: 'reseller-1' },
        },
      ],
      total: 1,
    });

    expect(professionalsCount).toBe(1);
  });
});
