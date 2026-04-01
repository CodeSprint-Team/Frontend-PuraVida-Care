import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceCardClient } from './service-card-client';

describe('ServiceCardClient', () => {
  let component: ServiceCardClient;
  let fixture: ComponentFixture<ServiceCardClient>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceCardClient],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceCardClient);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
