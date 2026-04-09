import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivedSupportProductOffers } from './received-support-product-offers';

describe('ReceivedSupportProductOffers', () => {
  let component: ReceivedSupportProductOffers;
  let fixture: ComponentFixture<ReceivedSupportProductOffers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceivedSupportProductOffers],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceivedSupportProductOffers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
