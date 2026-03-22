import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FamilyTracking } from './family-tracking';

describe('FamilyTracking', () => {
  let component: FamilyTracking;
  let fixture: ComponentFixture<FamilyTracking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FamilyTracking],
    }).compileComponents();

    fixture = TestBed.createComponent(FamilyTracking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
