import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderInService } from './provider-in-service';

describe('ProviderInService', () => {
  let component: ProviderInService;
  let fixture: ComponentFixture<ProviderInService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProviderInService],
    }).compileComponents();

    fixture = TestBed.createComponent(ProviderInService);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
