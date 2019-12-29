import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DragulaModule } from 'ng2-dragula/dist';
import { SharedModule } from '../shared/shared.module';

import { SettingsService } from 'src/app/settings/settings.service';
import { AutoActionsService } from 'src/app/settings/auto-actions/auto-actions.service';
import { BoardAdminService } from 'src/app/settings/board-admin/board-admin.service';
import { UserAdminService } from 'src/app/settings/user-admin/user-admin.service';
import { UserSettingsService } from 'src/app/settings/user-settings/user-settings.service';

import { AutoActionsComponent } from './auto-actions/auto-actions.component';
import { BoardAdminComponent } from './board-admin/board-admin.component';
import { SettingsComponent } from './settings.component';
import { UserAdminComponent } from './user-admin/user-admin.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';

const declarationsAndExports = [
  AutoActionsComponent,
  BoardAdminComponent,
  SettingsComponent,
  UserAdminComponent,
  UserSettingsComponent
];

@NgModule({
  imports: [
    CommonModule,
    DragulaModule.forRoot(),
    FormsModule,
    RouterModule,
    SharedModule
  ],

  providers: [
    AutoActionsService,
    BoardAdminService,
    SettingsService,
    UserAdminService,
    UserSettingsService
  ],

  declarations: declarationsAndExports,

  exports: declarationsAndExports
})
export class SettingsModule { }
