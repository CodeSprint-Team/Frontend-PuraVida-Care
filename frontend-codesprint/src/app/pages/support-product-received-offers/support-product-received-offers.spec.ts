import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportProductReceivedOffers } from './support-product-received-offers';

describe('SupportProductReceivedOffers', () => {
  let component: SupportProductReceivedOffers;
  let fixture: ComponentFixture<SupportProductReceivedOffers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportProductReceivedOffers],
    }).compileComponents();

    fixture = TestBed.createComponent(SupportProductReceivedOffers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
