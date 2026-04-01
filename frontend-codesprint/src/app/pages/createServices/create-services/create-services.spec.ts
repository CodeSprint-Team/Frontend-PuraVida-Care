import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateServices } from './create-services';

describe('CreateServices', () => {
  let component: CreateServices;
  let fixture: ComponentFixture<CreateServices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateServices],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateServices);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
