import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BiometricVerification } from './biometric-verification';

describe('BiometricVerification', () => {
  let component: BiometricVerification;
  let fixture: ComponentFixture<BiometricVerification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BiometricVerification],
    }).compileComponents();

    fixture = TestBed.createComponent(BiometricVerification);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
