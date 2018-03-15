import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthGuard } from './auth/auth.guard';
import { AuthService } from './auth/auth.service';
import { CompileDirective } from './compile/compile.directive';
import { ContextMenu } from './context-menu/context-menu.component';
import { ContextMenuService } from './context-menu/context-menu.service';
import { InlineEdit } from './inline-edit/inline-edit.component';
import { Modal } from './modal/modal.component';
import { ModalService } from './modal/modal.service';
import { Activity, ActivitySimple } from './models/activity.model';
import { ApiResponse } from './models/api-response.model';
import { Attachment } from './models/attachment.model';
import { AutoAction, ActionType, ActionTrigger } from './models/auto-actions.model';
import { Board } from './models/board.model.ts';
import { Category } from './models/category.model';
import { Column } from './models/column.model';
import { Comment } from './models/comment.model';
import { IssueTracker } from './models/issue-tracker.model';
import { Notification } from './models/notification.model';
import { Task } from './models/task.model';
import { User } from './models/user.model';
import { UserOptions } from './models/user-options.model';
import { Notifications } from './notifications/notifications.component';
import { NotificationsService } from './notifications/notifications.service';
import { StringsService } from './strings/strings.service';
import { TopNav } from './top-nav/top-nav.component';
import { Constants } from './constants';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    AuthGuard,
    CompileDirective,
    ContextMenu,
    InlineEdit,
    Modal,
    Activity,
    ActivitySimple,
    ApiResponse,
    Attachment,
    AutoAction,
    ActionType,
    ActionTrigger,
    Board,
    Category,
    Column,
    Comment,
    IssueTracker,
    Notification,
    Task,
    User,
    UserOptions,
    Notifications,
    TopNav,
    Constants
  ],
  providers: [
    AuthService,
    ContextMenuService,
    ModalService,
    NotificationsService,
    StringsService
  ]
})
export class SharedModule { }
