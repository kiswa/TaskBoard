import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';

import { DashboardComponent } from './dashboard.component';
import { CalendarComponent } from './calendar/calendar.component';
import { ChartsComponent } from './charts/charts.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [
    DashboardComponent,
    CalendarComponent,
    ChartsComponent
  ],
  exports: [
    DashboardComponent,
    CalendarComponent,
    ChartsComponent
  ]
})
export class DashboardModule { }
