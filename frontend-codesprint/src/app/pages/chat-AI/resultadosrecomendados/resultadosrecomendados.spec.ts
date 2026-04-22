import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Resultadosrecomendados } from './resultadosrecomendados';

describe('Resultadosrecomendados', () => {
  let component: Resultadosrecomendados;
  let fixture: ComponentFixture<Resultadosrecomendados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Resultadosrecomendados],
    }).compileComponents();

    fixture = TestBed.createComponent(Resultadosrecomendados);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
