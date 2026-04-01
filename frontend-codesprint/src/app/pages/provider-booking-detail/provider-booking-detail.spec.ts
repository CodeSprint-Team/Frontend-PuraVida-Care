import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderBookingDetail } from './provider-booking-detail';

describe('ProviderBookingDetail', () => {
  let component: ProviderBookingDetail;
  let fixture: ComponentFixture<ProviderBookingDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProviderBookingDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(ProviderBookingDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
