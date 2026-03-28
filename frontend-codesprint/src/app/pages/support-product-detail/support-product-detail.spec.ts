import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportProductDetail } from './support-product-detail';

describe('SupportProductDetail', () => {
  let component: SupportProductDetail;
  let fixture: ComponentFixture<SupportProductDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportProductDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(SupportProductDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
