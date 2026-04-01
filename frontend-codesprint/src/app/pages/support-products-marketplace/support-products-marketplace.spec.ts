import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportProductsMarketplace } from './support-products-marketplace';

describe('SupportProductsMarketplace', () => {
  let component: SupportProductsMarketplace;
  let fixture: ComponentFixture<SupportProductsMarketplace>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportProductsMarketplace],
    }).compileComponents();

    fixture = TestBed.createComponent(SupportProductsMarketplace);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
