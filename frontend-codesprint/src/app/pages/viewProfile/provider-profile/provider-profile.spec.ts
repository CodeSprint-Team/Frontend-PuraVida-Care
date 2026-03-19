import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderProfileComponent } from './provider-profile';

describe('ProviderProfile', () => {
  let component: ProviderProfileComponent;
  let fixture: ComponentFixture<ProviderProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProviderProfileComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProviderProfileComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
