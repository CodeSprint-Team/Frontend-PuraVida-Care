import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterSenior } from './register-senior';

describe('RegisterSenior', () => {
  let component: RegisterSenior;
  let fixture: ComponentFixture<RegisterSenior>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterSenior],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterSenior);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
