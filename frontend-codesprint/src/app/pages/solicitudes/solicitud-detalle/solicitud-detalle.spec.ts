import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudDetalleComponent } from './solicitud-detalle';

describe('SolicitudDetalle', () => {
  let component: SolicitudDetalleComponent;
  let fixture: ComponentFixture<SolicitudDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudDetalleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitudDetalleComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
