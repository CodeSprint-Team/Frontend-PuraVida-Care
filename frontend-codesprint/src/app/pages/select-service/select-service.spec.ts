import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectService } from './select-service';

describe('SelectService', () => {
  let component: SelectService;
  let fixture: ComponentFixture<SelectService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectService],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectService);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
