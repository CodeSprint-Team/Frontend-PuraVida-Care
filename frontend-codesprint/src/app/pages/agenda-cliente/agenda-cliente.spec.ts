import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaCliente } from './agenda-cliente';

describe('AgendaCliente', () => {
  let component: AgendaCliente;
  let fixture: ComponentFixture<AgendaCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendaCliente],
    }).compileComponents();

    fixture = TestBed.createComponent(AgendaCliente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
