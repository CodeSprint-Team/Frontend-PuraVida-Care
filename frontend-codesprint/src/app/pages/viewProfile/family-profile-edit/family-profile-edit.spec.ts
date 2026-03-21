import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FamilyProfileEdit } from './family-profile-edit';

describe('FamilyProfileEdit', () => {
  let component: FamilyProfileEdit;
  let fixture: ComponentFixture<FamilyProfileEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FamilyProfileEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(FamilyProfileEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
