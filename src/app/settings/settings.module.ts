import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DragulaModule } from 'ng2-dragula/ng2-dragula';
import { SharedModule } from '../shared/shared.module';

import { AutoActions } from './auto-actions/auto-actions.component';
import { BoardAdmin } from './board-admin/board-admin.component';
import { Settings } from './settings.component';
import { UserAdmin } from './user-admin/user-admin.component';
import { UserSettings } from './user-settings/user-settings.component';

import { AutoActionsService } from './auto-actions/auto-actions.service';
import { BoardAdminService } from './board-admin/board-admin.service';
import { SettingsService } from './settings.service';
import { UserAdminService } from './user-admin/user-admin.service';
import { UserSettingsService } from './user-settings/user-settings.service';

@NgModule({
  imports: [
    CommonModule,
    DragulaModule,
    FormsModule,
    RouterModule,
    SharedModule
  ],
  declarations: [
    AutoActions,
    BoardAdmin,
    Settings,
    UserAdmin,
    UserSettings
  ],
  providers: [
    AutoActionsService,
    BoardAdminService,
    SettingsService,
    UserAdminService,
    UserSettingsService
  ],
  exports: [
    AutoActions,
    BoardAdmin,
    Settings,
    UserAdmin,
    UserSettings
  ]
})
export class SettingsModule { }
