import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCompletedServices } from './my-completed-services';

describe('MyCompletedServices', () => {
  let component: MyCompletedServices;
  let fixture: ComponentFixture<MyCompletedServices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyCompletedServices],
    }).compileComponents();

    fixture = TestBed.createComponent(MyCompletedServices);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
