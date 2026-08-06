import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiService } from '../../../core/services/api';
import { ProfessionalService } from './professional';

describe('ProfessionalService pricing flow', () => {
  const api = {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
  };
  let service: ProfessionalService;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({ providers: [{ provide: ApiService, useValue: api }] });
    service = TestBed.inject(ProfessionalService);
  });

  it('lists the authenticated professional offerings', () => {
    api.get.mockReturnValue(of([]));

    service.listOfferings('voice-1').subscribe();

    expect(api.get).toHaveBeenCalledWith('/professionals/voice-1/services');
  });

  it('activates and deactivates an offering', () => {
    api.patch.mockReturnValue(of({}));

    service.setOfferingActive('voice-1', 'service-1', true).subscribe();
    service.setOfferingActive('voice-1', 'service-1', false).subscribe();

    expect(api.patch).toHaveBeenNthCalledWith(
      1,
      '/professionals/voice-1/services/service-1/activate',
      {},
    );
    expect(api.patch).toHaveBeenNthCalledWith(
      2,
      '/professionals/voice-1/services/service-1/deactivate',
      {},
    );
  });

  it('submits and lists price negotiations', () => {
    api.post.mockReturnValue(of({}));
    api.get.mockReturnValue(of([]));

    service
      .proposePrice('voice-1', 'service-1', {
        proposedPriceCents: 350,
        notes: 'Reajuste',
      })
      .subscribe();
    service.listNegotiations('voice-1', 'service-1').subscribe();

    expect(api.post).toHaveBeenCalledWith(
      '/professionals/voice-1/services/service-1/negotiations',
      { proposedPriceCents: 350, notes: 'Reajuste' },
    );
    expect(api.get).toHaveBeenCalledWith('/professionals/voice-1/services/service-1/negotiations');
  });

  it('allows the professional to accept a manager counteroffer', () => {
    api.post.mockReturnValue(of({}));

    service.decideNegotiation('voice-1', 'service-1', 'negotiation-1', 'accept').subscribe();

    expect(api.post).toHaveBeenCalledWith(
      '/professionals/voice-1/services/service-1/negotiations/negotiation-1/accept',
      {},
    );
  });
});
