import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';

import { CalendarComponent } from './calendar/calendar.component';
import { ChartsComponent } from './charts/charts.component';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from './dashboard.service';
import { MyItemsComponent } from './my-items/my-items.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule
  ],
  declarations: [
    CalendarComponent,
    ChartsComponent,
    DashboardComponent,
    MyItemsComponent
  ],
  providers: [
    DashboardService
  ],
  exports: [
    CalendarComponent,
    ChartsComponent,
    DashboardComponent,
    MyItemsComponent
  ]
})
export class DashboardModule { }
