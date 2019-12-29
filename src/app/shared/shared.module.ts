import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthGuard } from './auth/auth.guard';
import { AuthService } from './auth/auth.service';
import { ContextMenuComponent } from './context-menu/context-menu.component';
import { ContextMenuItemComponent } from './context-menu/context-menu-item.component';
import { ContextMenuService } from './context-menu/context-menu.service';
import { InlineEditComponent } from './inline-edit/inline-edit.component';
import { ModalComponent } from './modal/modal.component';
import { ModalService } from './modal/modal.service';
import { NotificationsComponent } from './notifications/notifications.component';
import { NotificationsService } from './notifications/notifications.service';
import { StringsService } from './strings/strings.service';
import { TopNavComponent } from './top-nav/top-nav.component';
import { Constants } from './constants';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ContextMenuComponent,
    ContextMenuItemComponent,
    InlineEditComponent,
    ModalComponent,
    NotificationsComponent,
    TopNavComponent
  ],
  providers: [
    AuthGuard,
    AuthService,
    Constants,
    ContextMenuService,
    ModalService,
    NotificationsService,
    StringsService
  ],
  exports: [
    ContextMenuComponent,
    ContextMenuItemComponent,
    InlineEditComponent,
    ModalComponent,
    NotificationsComponent,
    TopNavComponent
  ]
})
export class SharedModule {}
