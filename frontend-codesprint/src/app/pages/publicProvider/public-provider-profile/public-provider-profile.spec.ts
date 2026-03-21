import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicProviderProfileComponent } from './public-provider-profile';

describe('PublicProviderProfile', () => {
  let component: PublicProviderProfileComponent;
  let fixture: ComponentFixture<PublicProviderProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicProviderProfileComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicProviderProfileComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
