import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleCitaCliente } from './detalle-cita-cliente';

describe('DetalleCitaCliente', () => {
  let component: DetalleCitaCliente;
  let fixture: ComponentFixture<DetalleCitaCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleCitaCliente],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleCitaCliente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
