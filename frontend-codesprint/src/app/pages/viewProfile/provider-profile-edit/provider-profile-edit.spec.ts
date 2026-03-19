import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderProfileEditComponent } from './provider-profile-edit';

describe('ProviderProfileEdit', () => {
  let component: ProviderProfileEditComponent;
  let fixture: ComponentFixture<ProviderProfileEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProviderProfileEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProviderProfileEditComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
