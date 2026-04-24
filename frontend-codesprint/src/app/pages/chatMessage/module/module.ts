import { NgModule } from '@angular/core';
import { NgIconsModule } from '@ng-icons/core';
import {
  heroMagnifyingGlass,
  heroChatBubbleLeftRight,
  heroCheck,
  heroArrowLeft,
  heroPaperAirplane
} from '@ng-icons/heroicons/outline';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    HttpClientModule,
    FormsModule,
    NgIconsModule.withIcons({
      heroMagnifyingGlass,
      heroChatBubbleLeftRight,
      heroCheck,
      heroArrowLeft,
      heroPaperAirplane,
    }),
  ],
  exports: [
    NgIconsModule,
    HttpClientModule,
    FormsModule
  ]
})
export class SharedModule {}