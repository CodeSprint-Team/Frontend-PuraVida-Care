import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmBooking } from './confirm-booking';

describe('ConfirmBooking', () => {
  let component: ConfirmBooking;
  let fixture: ComponentFixture<ConfirmBooking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmBooking],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmBooking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
