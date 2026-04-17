import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroArrowLeft, heroPaperAirplane } from '@ng-icons/heroicons/outline';
import { Subscription } from 'rxjs';
import { ChatService, ChatMessageDTO, SendMessageRequest } from '../chat.service/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NgIconComponent,
  ],
  viewProviders: [
    provideIcons({ heroArrowLeft, heroPaperAirplane })
  ]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageContainer') private msgContainer!: ElementRef;

  conversationId!: number;
  currentUserId = 1; 
  messages: ChatMessageDTO[] = [];
  newMessage = '';
  providerName = '';
  providerAvatar = '';
  private sub!: Subscription;

  constructor(private route: ActivatedRoute, private chatService: ChatService) {}

  ngOnInit(): void {
    this.conversationId = Number(this.route.snapshot.paramMap.get('id'));
    const nav = history.state?.conversation;
    if (nav) {
      this.providerName = nav.providerName;
      this.providerAvatar = nav.providerAvatar;
    }

    this.chatService.loadHistory(this.conversationId).subscribe(history => {
      this.messages = history;
    });

    this.sub = this.chatService.connect(this.conversationId).subscribe(msg => {
      this.messages.push(msg);
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  sendMessage(): void {
    const text = this.newMessage.trim();
    if (!text) return;

    const req: SendMessageRequest = {
      conversationId: this.conversationId,
      senderUserId: this.currentUserId,
      content: text,
    };
    this.chatService.sendMessage(req);
    this.newMessage = '';
  }

  isOwn(msg: ChatMessageDTO): boolean {
    return msg.senderUserId === this.currentUserId;
  }

  private scrollToBottom(): void {
    try {
      this.msgContainer.nativeElement.scrollTop =
        this.msgContainer.nativeElement.scrollHeight;
    } catch {}
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.chatService.disconnect();
  }
}