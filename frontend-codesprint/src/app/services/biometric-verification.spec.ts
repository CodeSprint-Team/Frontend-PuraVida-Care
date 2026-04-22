import { TestBed } from '@angular/core/testing';

import { BiometricVerification } from './biometric-verification';

describe('BiometricVerification', () => {
  let service: BiometricVerification;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BiometricVerification);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
