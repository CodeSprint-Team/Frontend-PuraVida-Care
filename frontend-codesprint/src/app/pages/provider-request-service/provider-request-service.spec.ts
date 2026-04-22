import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderRequestsComponent } from './provider-request-service';

describe('ProviderRequestService', () => {
  let component: ProviderRequestsComponent;
  let fixture: ComponentFixture<ProviderRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProviderRequestsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProviderRequestsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
