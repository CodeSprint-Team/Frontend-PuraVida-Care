import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatModel } from './chat-model';

describe('ChatModel', () => {
  let component: ChatModel;
  let fixture: ComponentFixture<ChatModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatModel],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatModel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
