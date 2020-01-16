import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

// import { Charts } from './charts/charts.component';
// import { Calendar } from './calendar/calendar.component';

/* istanbul ignore next */
@Component({
  selector: 'tb-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  constructor(public title: Title) {
    title.setTitle('TaskBoard - Dashboard');
  }
}

