import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorarServiciosComponent } from './explore-services';

describe('ExploreServices', () => {
  let component: ExplorarServiciosComponent;
  let fixture: ComponentFixture<ExplorarServiciosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorarServiciosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorarServiciosComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
