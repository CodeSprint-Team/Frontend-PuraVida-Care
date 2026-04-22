import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportProductMadeOffers } from './support-product-made-offers';

describe('SupportProductMadeOffers', () => {
  let component: SupportProductMadeOffers;
  let fixture: ComponentFixture<SupportProductMadeOffers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportProductMadeOffers],
    }).compileComponents();

    fixture = TestBed.createComponent(SupportProductMadeOffers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
