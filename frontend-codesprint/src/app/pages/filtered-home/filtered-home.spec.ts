import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilteredHome } from './filtered-home';

describe('FilteredHome', () => {
  let component: FilteredHome;
  let fixture: ComponentFixture<FilteredHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilteredHome],
    }).compileComponents();

    fixture = TestBed.createComponent(FilteredHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
