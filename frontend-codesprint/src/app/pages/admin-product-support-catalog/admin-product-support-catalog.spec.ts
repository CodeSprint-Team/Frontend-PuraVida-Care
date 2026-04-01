import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProductSupportCatalog } from './admin-product-support-catalog';

describe('AdminProductSupportCatalog', () => {
  let component: AdminProductSupportCatalog;
  let fixture: ComponentFixture<AdminProductSupportCatalog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProductSupportCatalog],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminProductSupportCatalog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
