import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FamilyProfileComponent } from './family-profile';

describe('FamilyProfile', () => {
  let component: FamilyProfileComponent;
  let fixture: ComponentFixture<FamilyProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FamilyProfileComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FamilyProfileComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
