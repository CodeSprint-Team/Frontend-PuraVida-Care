import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSupportProductPostComponent } from './create-support-product-post';

describe('CreateSupportProductPost', () => {
  let component: CreateSupportProductPostComponent;
  let fixture: ComponentFixture<CreateSupportProductPostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSupportProductPostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateSupportProductPostComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
