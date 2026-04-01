import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarioCliente } from './calendario-cliente';

describe('CalendarioCliente', () => {
  let component: CalendarioCliente;
  let fixture: ComponentFixture<CalendarioCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarioCliente],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarioCliente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
