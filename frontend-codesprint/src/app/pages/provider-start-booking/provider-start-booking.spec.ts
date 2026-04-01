import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderStartBooking } from './provider-start-booking';

describe('ProviderStartBooking', () => {
  let component: ProviderStartBooking;
  let fixture: ComponentFixture<ProviderStartBooking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProviderStartBooking],
    }).compileComponents();

    fixture = TestBed.createComponent(ProviderStartBooking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
