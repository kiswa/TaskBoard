import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';

import { Dashboard } from './dashboard.component';
import { Calendar } from './calendar/calendar.component';
import { Charts } from './charts/charts.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [
    Dashboard,
    Calendar,
    Charts
  ],
  exports: [
    Dashboard,
    Calendar,
    Charts
  ]
})
export class DashboardModule { }
