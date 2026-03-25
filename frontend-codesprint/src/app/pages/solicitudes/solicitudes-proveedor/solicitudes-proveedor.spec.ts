import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudesProveedorComponent } from './solicitudes-proveedor';

describe('SolicitudesProveedor', () => {
  let component: SolicitudesProveedorComponent;
  let fixture: ComponentFixture<SolicitudesProveedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudesProveedorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitudesProveedorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
