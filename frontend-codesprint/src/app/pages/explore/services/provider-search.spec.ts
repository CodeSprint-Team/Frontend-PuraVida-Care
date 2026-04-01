import { TestBed } from '@angular/core/testing';

import { ProviderSearchService } from './provider-search';

describe('ProviderSearch', () => {
  let service: ProviderSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProviderSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
