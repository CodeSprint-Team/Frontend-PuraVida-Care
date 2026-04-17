import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Module } from './module';

describe('Module', () => {
  let component: Module;
  let fixture: ComponentFixture<Module>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Module],
    }).compileComponents();

    fixture = TestBed.createComponent(Module);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
