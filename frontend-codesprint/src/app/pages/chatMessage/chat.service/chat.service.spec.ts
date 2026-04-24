import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatService } from './chat.service';

describe('ChatService', () => {
  let component: ChatService;
  let fixture: ComponentFixture<ChatService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatService],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatService);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
