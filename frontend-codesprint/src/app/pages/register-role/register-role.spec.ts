import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterRole } from './register-role';

describe('RegisterRole', () => {
  let component: RegisterRole;
  let fixture: ComponentFixture<RegisterRole>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterRole],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterRole);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
