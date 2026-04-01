import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminServiceCategory } from './admin-service-category';

describe('AdminServiceCategory', () => {
  let component: AdminServiceCategory;
  let fixture: ComponentFixture<AdminServiceCategory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminServiceCategory],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminServiceCategory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
